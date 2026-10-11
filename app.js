(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const store = {
    get(key, fallback) { try { const value = localStorage.getItem('orbit.' + key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem('orbit.' + key, JSON.stringify(value)); } catch {} }
  };
  const id = () => (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
  let tasks = store.get('tasks', [
    { id: id(), title: 'Review the most important task', priority: 'high', done: false },
    { id: id(), title: 'Capture ideas for the week', priority: 'medium', done: false },
    { id: id(), title: 'Take a short focus break', priority: 'low', done: false }
  ]);
  let notes = store.get('notes', [{ id: id(), title: 'Welcome to Orbit', content: 'This is your personal idea space. Add notes, plans, and meeting takeaways here. In this starter version, notes are stored in this browser.', date: new Date().toISOString() }]);
  let messages = store.get('messages', []);
  let filter = 'all', currentView = 'home', timerSeconds = 1500, timerInitial = 1500, timerInterval = null, focusSessions = Number(store.get('focusSessions', 0));
  let screenStream = null, recognition = null, isRecording = false, currentTranscript = '';
  const toast = (message) => { const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toast.timeout); toast.timeout = setTimeout(() => el.classList.remove('show'), 3000); };
  const saveTasks = () => store.set('tasks', tasks);
  const saveNotes = () => store.set('notes', notes);
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dateLabel = (iso) => { try { return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); } catch { return ''; } };
  function renderTasks() {
    const open = tasks.filter(t => !t.done);
    $('#taskCount').textContent = open.length;
    $('#openTaskStat').textContent = open.length;
    const home = $('#homeTaskList');
    home.innerHTML = open.slice(0, 4).map(taskRow).join('') || '<div class="empty-state">All caught up. Nice work ✨</div>';
    const visible = tasks.filter(t => filter === 'all' || (filter === 'open' && !t.done) || (filter === 'done' && t.done));
    $('#allTaskList').innerHTML = visible.length ? visible.map(taskRow).join('') : '<div class="empty-state">Nothing here yet. Add a task above.</div>';
    bindTaskRows();
  }
  function taskRow(t) { return '<div class="task-row '+(t.done?'done':'')+'" data-task="'+esc(t.id)+'"><input class="task-check" type="checkbox" aria-label="Mark task complete" '+(t.done?'checked':'')+'><div class="task-copy"><strong>'+esc(t.title)+'</strong><small>'+ (t.done?'Completed': 'Open task') +'</small></div><span class="priority '+esc(t.priority)+'">'+esc(t.priority)+'</span><button class="delete-task" aria-label="Delete task" title="Delete task">×</button></div>'; }
  function bindTaskRows() {
    $$('.task-row').forEach(row => {
      const taskId = row.dataset.task;
      $('.task-check', row).addEventListener('change', e => { tasks = tasks.map(t => t.id === taskId ? {...t, done: e.target.checked} : t); saveTasks(); renderTasks(); });
      $('.delete-task', row).addEventListener('click', () => { tasks = tasks.filter(t => t.id !== taskId); saveTasks(); renderTasks(); toast('Task removed'); });
    });
  }
  function renderNotes() {
    $('#noteStat').textContent = notes.length;
    $('#notesList').innerHTML = notes.length ? [...notes].reverse().map(n => '<article class="note-card"><h3>'+esc(n.title)+'</h3><p>'+esc(n.content || 'No content')+'</p><footer><span>Saved '+dateLabel(n.date)+'</span><button data-delete-note="'+esc(n.id)+'">Delete note ×</button></footer></article>').join('') : '<div class="empty-state">Your next idea can start here.</div>';
    $$('[data-delete-note]').forEach(b => b.addEventListener('click', () => { notes = notes.filter(n => n.id !== b.dataset.deleteNote); saveNotes(); renderNotes(); toast('Note deleted'); }));
  }
  function navigate(view) {
    currentView = view;
    $$('.view').forEach(v => v.classList.toggle('active-view', v.id === 'view-' + view));
    $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    const titles = {home:'Overview', assistant:'AI Assistant', tasks:'Tasks', notes:'Notes', email:'Email workspace', screen:'Screen context'};
    $('#crumbTitle').textContent = titles[view] || 'Overview';
    $('#sidebar').classList.remove('open');
    window.scrollTo({top:0,behavior:'smooth'});
    if (view === 'assistant') renderMessages();
  }
  $$('.nav-item').forEach(b => b.addEventListener('click', () => navigate(b.dataset.view)));
  $$('[data-go]').forEach(b => b.addEventListener('click', () => navigate(b.dataset.go)));
  $('#mobileMenu').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  $('#todayLabel').textContent = new Date().toLocaleDateString(undefined, {weekday:'short',month:'short',day:'numeric'});
  $('#taskForm').addEventListener('submit', e => { e.preventDefault(); const title = $('#taskInput').value.trim(); if (!title) return; tasks.unshift({id:id(),title,priority:$('#taskPriority').value,done:false}); saveTasks(); renderTasks(); $('#taskInput').value=''; toast('Task added to your list'); });
  $('#addTaskShortcut').addEventListener('click', () => { navigate('tasks'); $('#taskInput').focus(); });
  $$('.filter-button').forEach(b => b.addEventListener('click', () => { filter=b.dataset.filter; $$('.filter-button').forEach(x=>x.classList.toggle('active',x===b)); renderTasks(); }));
  $('#noteContent').addEventListener('input', () => $('#noteCharCount').textContent = $('#noteContent').value.length + ' characters');
  $('#noteForm').addEventListener('submit', e => { e.preventDefault(); const title=$('#noteTitle').value.trim(), content=$('#noteContent').value.trim(); if (!title && !content) return toast('Add a title or some note content first'); notes.push({id:id(),title:title||'Untitled note',content,date:new Date().toISOString()}); saveNotes(); renderNotes(); $('#noteTitle').value=''; $('#noteContent').value=''; $('#noteCharCount').textContent='0 characters'; toast('Note saved in this browser'); });
  const assistantResponses = [
    {match:/plan|today|priorit|day/i, answer:()=> 'Let’s keep today manageable.\n\n1. Choose one high-impact task.\n2. Give it a focused 25-minute block.\n3. Capture any follow-ups as tasks instead of keeping them in your head.\n4. Take a short break, then decide what comes next.\n\nYour open tasks are available in the Tasks tab. What is the one thing that would make today feel successful?'},
    {match:/email|reply|draft|message/i, answer:()=> 'Absolutely. I can help you draft a thoughtful email, but this demo is not connected to your mailbox.\n\nShare the recipient, goal, and any context (remove sensitive details if needed), and I can prepare a draft here. You can review and copy it into your mail app.'},
    {match:/focus|timer|distract|pomodoro/i, answer:()=> 'Try one small focus sprint: pick a single outcome, silence unrelated notifications, and work for 25 minutes. I’ve included a focus timer on the Overview page. When the timer ends, take a short break and note your next step.'},
    {match:/summari[sz]|key points|long text/i, answer:(q)=> { const pasted=q.replace(/summari[sz]e|this text|key points/ig,'').trim(); return pasted.length>30 ? 'Here is a quick structure for the content you shared:\n\n• Main idea: '+pasted.slice(0,180)+(pasted.length>180?'…':'')+'\n\n• Next step: identify the key decision, any deadline, and the action owner.\n\nFor an accurate full summary, connect a real model provider in the backend. This demo does not call an AI model.' : 'Paste the text you want summarized and I’ll help structure it. This starter uses local rules only; connect a model API for genuine AI summaries.'; }},
    {match:/hello|hi\b|hey/i, answer:()=> 'Hey! 👋 Good to see you. Want to plan your day, capture a thought, or tackle a task together?'},
    {match:/help|what can you do|features/i, answer:()=> 'Here’s what you can try in this workspace:\n\n• Chat and browser speech input/output\n• Share a screen or tab with your permission\n• Create and complete tasks\n• Save notes locally\n• Use a focus timer\n• Review the secure email integration setup\n\nReal AI reasoning and mailbox access need a configured backend; those are not enabled in this static starter.'}
  ];
  function getResponse(q) { const item=assistantResponses.find(x=>x.match.test(q)); if(item) return item.answer(q); return 'Thanks for sharing that. I can help you break it into a next step. What outcome are you aiming for, and is there a deadline?\n\nNote: this starter is running locally in your browser and does not yet call a real AI model. Add a backend/model integration for open-ended AI responses.'; }
  function appendMessage(role, text, persist=true) { const msg={id:id(),role,text,date:new Date().toISOString()}; messages.push(msg); if(persist) store.set('messages',messages.slice(-80)); renderMessages(); return msg; }
  function renderMessages() {
    const list=$('#chatMessages');
    const starter='<div class="message assistant-message"><div class="message-avatar">✳</div><div class="message-body"><span class="message-author">Orbit <small>just now</small></span><p>Hey! 👋 I\'m your workspace companion. I can help organize your thoughts, create tasks, and work with text you share here. What are we working on?</p><div class="message-chips"><button data-chat="Help me plan my day">Plan my day</button><button data-chat="Help me write an email">Write an email</button><button data-chat="Help me focus">Help me focus</button></div></div></div>';
    list.innerHTML=starter+messages.map(m=>'<div class="message '+(m.role==='user'?'user-message':'assistant-message')+'"><div class="message-avatar">'+(m.role==='user'?'V':'✳')+'</div><div class="message-body"><span class="message-author">'+(m.role==='user'?'You':'Orbit')+' <small>'+dateLabel(m.date)+'</small></span><p>'+esc(m.text)+'</p></div></div>').join('');
    list.scrollTop=list.scrollHeight;
    $$('[data-chat]').forEach(b=>b.addEventListener('click',()=>sendChat(b.dataset.chat)));
  }
  function sendChat(text) { const q=text.trim(); if(!q) return; appendMessage('user',q); $('#chatInput').value=''; setTimeout(()=>appendMessage('assistant',getResponse(q)),250); }
  $('#chatForm').addEventListener('submit',e=>{e.preventDefault();sendChat($('#chatInput').value);});
  $('#chatInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('#chatForm').requestSubmit();}});
  $('#clearChat').addEventListener('click',()=>{messages=[];store.set('messages',messages);renderMessages();toast('Conversation cleared');});
  $('#openChat').addEventListener('click',()=>navigate('assistant'));
  $$('[data-action]').forEach(b=>b.addEventListener('click',()=>{const action=b.dataset.action; navigate('assistant'); const prompts={summarize:'Help me summarize some text',draft:'Help me draft an email reply',plan:'Help me plan my day'}; $('#chatInput').value=prompts[action]; $('#chatInput').focus();}));
  $('#emailInfo').addEventListener('click',()=>{const info=$('#emailSetupInfo');info.hidden=!info.hidden;$('#emailInfo').innerHTML=info.hidden?'View setup requirements <span>↗</span>':'Hide setup requirements ↑';});
  let toastTimer;
  function timerRender(){const m=String(Math.floor(timerSeconds/60)).padStart(2,'0'),s=String(timerSeconds%60).padStart(2,'0');$('#timerDisplay').textContent=m+':'+s;$('#timerProgress').style.width=((timerInitial-timerSeconds)/timerInitial*100)+'%';}
  $('#timerStart').addEventListener('click',()=>{if(timerInterval){clearInterval(timerInterval);timerInterval=null;$('#timerStart').innerHTML='▶ Resume focus';return;}$('#timerStart').innerHTML='Ⅱ Pause';timerInterval=setInterval(()=>{timerSeconds--;timerRender();if(timerSeconds<=0){clearInterval(timerInterval);timerInterval=null;focusSessions++;store.set('focusSessions',focusSessions);$('#focusStat').textContent=focusSessions;$('#timerStart').innerHTML='▶ Start focus';toast('Focus session complete. Take a short break!');if('Notification'in window&&Notification.permission==='granted')new Notification('Orbit focus timer',{body:'Focus session complete. Take a short break!'});timerSeconds=timerInitial;timerRender();}},1000);});
  $('#timerReset').addEventListener('click',()=>{clearInterval(timerInterval);timerInterval=null;timerSeconds=timerInitial;timerRender();$('#timerStart').innerHTML='▶ Start focus';});
  $('#themeToggle').addEventListener('click',()=>{document.body.classList.toggle('light-theme');store.set('lightTheme',document.body.classList.contains('light-theme'));});
  if(store.get('lightTheme',false))document.body.classList.add('light-theme');
  $('#clearData').addEventListener('click',()=>{if(!confirm('Clear locally saved tasks, notes, and chat history? This cannot be undone.'))return;['tasks','notes','messages','focusSessions'].forEach(k=>localStorage.removeItem('orbit.'+k));tasks=[];notes=[];messages=[];focusSessions=0;$('#focusStat').textContent='0';renderTasks();renderNotes();renderMessages();toast('Local workspace data cleared');});
  $('#privacyOpen').addEventListener('click',()=>alert('Privacy & permissions\n\n• Microphone: used only after you start voice input.\n• Screen: shared only after you choose a browser sharing prompt.\n• Tasks, notes and chat: stored in this browser localStorage.\n• Email: not connected in this starter.\n• AI model: not connected in this starter.\n\nDo not store confidential work information in this demo. A production version needs secure authentication, backend storage policies and approved company integrations.'));
  function openVoice(){ $('#modalBackdrop').hidden=false; $('#voiceTitle').textContent='I’m listening when you’re ready.'; $('#voiceStatus').textContent='Tap the microphone to start a voice conversation.'; $('#voiceTranscript').textContent='Your conversation will appear here.'; }
  function closeVoice(){stopRecognition();speechSynthesis?.cancel();$('#modalBackdrop').hidden=true;}
  $('#startVoice').addEventListener('click',openVoice);$('#closeVoice').addEventListener('click',closeVoice);$('#modalBackdrop').addEventListener('click',e=>{if(e.target===$('#modalBackdrop'))closeVoice();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#modalBackdrop').hidden)closeVoice();});
  function startRecognition(target='modal') {
    const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SpeechRecognition){toast('Speech recognition is not supported in this browser. Try a Chromium browser.');return;}
    try{
      recognition=new SpeechRecognition();recognition.lang=navigator.language||'en-US';recognition.interimResults=true;recognition.continuous=false;isRecording=true;currentTranscript='';
      if(target==='modal'){$('#modalMic').classList.add('recording');$('#modalMic').textContent='■';$('#voiceStatus').textContent='Listening… speak naturally.';$('.modal-orb').classList.add('listening');}
      recognition.onresult=e=>{let final='';let interim='';for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)final+=e.results[i][0].transcript;else interim+=e.results[i][0].transcript;}currentTranscript+=final;const shown=(currentTranscript+' '+interim).trim();if(target==='modal')$('#voiceTranscript').textContent=shown||'Listening…';else $('#chatInput').value=shown;};
      recognition.onerror=e=>{isRecording=false;resetMic(target);toast(e.error==='not-allowed'?'Microphone permission was denied.':'Voice input stopped: '+e.error);};
      recognition.onend=()=>{isRecording=false;resetMic(target);const spoken=currentTranscript.trim();if(spoken){if(target==='modal'){ $('#voiceTranscript').textContent='You: '+spoken;const response=getResponse(spoken);setTimeout(()=>{$('#voiceTranscript').textContent='You: '+spoken+'\n\nOrbit: '+response;$('#voiceStatus').textContent='Response ready';speak(response);},350);}else sendChat(spoken);}};
      recognition.start();
    }catch(e){isRecording=false;resetMic(target);toast('Could not start voice input. Check microphone permission.');}
  }
  function resetMic(target){if(target==='modal'){$('#modalMic').classList.remove('recording');$('#modalMic').textContent='🎙';$('.modal-orb').classList.remove('listening');if(!$('#modalBackdrop').hidden)$('#voiceStatus').textContent='Tap the microphone to speak again.';}}
  function stopRecognition(){if(recognition){try{recognition.stop()}catch{}recognition=null;}isRecording=false;resetMic('modal');}
  function speak(text){if(!('speechSynthesis'in window)){toast('Spoken output is not supported in this browser.');return;}speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.rate=1;utterance.pitch=1; speechSynthesis.speak(utterance);}
  $('#modalMic').addEventListener('click',()=>{if(isRecording){stopRecognition();$('#voiceStatus').textContent='Voice input stopped.';}else startRecognition('modal');});
  $('#stopSpeaking').addEventListener('click',()=>{speechSynthesis?.cancel();stopRecognition();$('#voiceStatus').textContent='Audio stopped.';});
  $('#chatMic').addEventListener('click',()=>{if(isRecording){stopRecognition();}else startRecognition('chat');});
  async function shareScreen(){
    if(!navigator.mediaDevices?.getDisplayMedia){toast('Screen sharing is unavailable. Use a supported browser on HTTPS or localhost.');return;}
    try{screenStream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});const video=$('#screenVideo');video.srcObject=screenStream;video.hidden=false;$('#screenEmpty').hidden=true;$('#stopScreen').disabled=false;$('#screenStatus').textContent='Screen is being shared. The preview stays in this page.';$('.preview-lock').textContent='▣ Screen sharing active';$('.preview-lock').style.background='#163328dd';toast('Screen sharing started');screenStream.getVideoTracks()[0].addEventListener('ended',stopScreen);}
    catch(e){if(e.name!=='AbortError')toast('Screen sharing was cancelled or blocked by the browser.');}
  }
  function stopScreen(){if(screenStream){screenStream.getTracks().forEach(t=>t.stop());screenStream=null;}const video=$('#screenVideo');video.srcObject=null;video.hidden=true;$('#screenEmpty').hidden=false;$('#stopScreen').disabled=true;$('#screenStatus').textContent='Nothing is being shared.';$('.preview-lock').textContent='▣ No screen shared';$('.preview-lock').style.background='#0b0d12a8';}
  $('#shareScreen').addEventListener('click',()=>{navigate('screen');shareScreen();});$('#shareScreenPage').addEventListener('click',shareScreen);$('#stopScreen').addEventListener('click',stopScreen);
  $('#saveScreenPrompt').addEventListener('click',()=>{const value=$('#screenPrompt').value.trim();store.set('screenPrompt',value);$('#screenPromptSaved').textContent=value?'Context note saved in this browser.':'Context note cleared.';toast('Context note saved');});
  $('#screenPrompt').value=store.get('screenPrompt','');
  if($('#screenPrompt').value)$('#screenPromptSaved').textContent='Previously saved context note loaded.';
  // Lightweight client-side app only: no remote model or mailbox API is called.
  renderTasks();renderNotes();renderMessages();timerRender();$('#focusStat').textContent=focusSessions;
})();