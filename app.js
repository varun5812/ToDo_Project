(() => {
  // ── Utilities ────────────────────────────────────────────────────────────────
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const store = {
    get(k, fb) { try { const v = localStorage.getItem('orbit.' + k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
    set(k, v)  { try { localStorage.setItem('orbit.' + k, JSON.stringify(v)); } catch {} }
  };
  const uid = () => crypto?.randomUUID ? crypto.randomUUID() : Date.now() + Math.random().toString(16).slice(2);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dateLabel = iso => { try { return new Date(iso).toLocaleTimeString(undefined, {hour:'2-digit',minute:'2-digit'}); } catch { return ''; } };
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // ── Backend ──────────────────────────────────────────────────────────────────
  const BACKEND = 'http://127.0.0.1:8000';
  let backendOnline = false;
  let aiSessionToken = null;

  async function checkBackend() {
    try {
      const r = await fetch(`${BACKEND}/health`, { signal: AbortSignal.timeout(3000) });
      if (r.ok) {
        const data = await r.json();
        backendOnline = true;
        aiSessionToken = data.session_token;
        updateBackendStatus(true, data);
        return data;
      }
    } catch {}
    backendOnline = false;
    updateBackendStatus(false);
    return null;
  }

  function updateBackendStatus(online, data = {}) {
    const dot = $('#backendDot');
    const label = $('#backendLabel');
    const aiTag = $('#aiProviderTag');
    if (!dot) return;
    dot.className = 'status-dot ' + (online ? 'online' : 'offline');
    if (label) label.textContent = online ? 'Backend connected' : 'Backend offline — demo mode';
    if (aiTag && online) {
      aiTag.textContent = `${(data.provider || 'ai').toUpperCase()} · ${data.model || ''}`;
      aiTag.style.display = 'inline-flex';
    } else if (aiTag) {
      aiTag.style.display = 'none';
    }
    const healthBar = $('#healthBar');
    if (healthBar) {
      healthBar.innerHTML = online
        ? `<span class="health-ok">✓ Backend online</span> &nbsp;·&nbsp; Provider: <b>${data.provider||'—'}</b> &nbsp;·&nbsp; Model: <b>${data.model||'—'}</b> &nbsp;·&nbsp; Desktop: <b>${data.desktop_enabled ? 'enabled' : 'disabled'}</b>`
        : `<span class="health-err">✗ Backend offline</span> &nbsp;·&nbsp; Run <code>py server.py</code> to enable AI features`;
    }
  }

  // ── State ────────────────────────────────────────────────────────────────────
  let tasks    = store.get('tasks', [
    { id: uid(), title: 'Review the most important task', priority: 'high',   done: false },
    { id: uid(), title: 'Capture ideas for the week',     priority: 'medium', done: false },
    { id: uid(), title: 'Take a short focus break',       priority: 'low',    done: false }
  ]);
  let notes    = store.get('notes', [{
    id: uid(), title: 'Welcome to Orbit',
    content: 'Your personal AI workspace is ready. Add notes, plans, and meeting takeaways here.',
    date: new Date().toISOString()
  }]);
  let chatHistory = store.get('chatHistory', []);
  let filter = 'all', currentView = 'home';
  let timerSeconds = 1500, timerInitial = 1500, timerInterval = null;
  let focusSessions = Number(store.get('focusSessions', 0));
  let screenStream = null, recognition = null, isRecording = false, currentTranscript = '';
  let selectedVoice = null, isSpeaking = false;
  let desktopEnabled = false, lastScreenshot = null;
  let pendingDesktopActions = [];

  // ── Toast ────────────────────────────────────────────────────────────────────
  const toast = msg => {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), 3500);
  };

  // ── Tasks ────────────────────────────────────────────────────────────────────
  const saveTasks = () => store.set('tasks', tasks);
  const saveNotes = () => store.set('notes', notes);

  function renderTasks() {
    const open = tasks.filter(t => !t.done);
    if ($('#taskCount'))   $('#taskCount').textContent   = open.length;
    if ($('#openTaskStat')) $('#openTaskStat').textContent = open.length;
    const home = $('#homeTaskList');
    if (home) home.innerHTML = open.slice(0,4).map(taskRow).join('') || '<div class="empty-state">All caught up ✨</div>';
    const visible = tasks.filter(t => filter === 'all' || (filter === 'open' && !t.done) || (filter === 'done' && t.done));
    const list = $('#allTaskList');
    if (list) list.innerHTML = visible.length ? visible.map(taskRow).join('') : '<div class="empty-state">Nothing here yet. Add a task above.</div>';
    bindTaskRows();
  }

  function taskRow(t) {
    return `<div class="task-row ${t.done?'done':''}" data-task="${esc(t.id)}">
      <input class="task-check" type="checkbox" aria-label="Mark task complete" ${t.done?'checked':''}>
      <div class="task-copy"><strong>${esc(t.title)}</strong><small>${t.done?'Completed':'Open task'}</small></div>
      <span class="priority ${esc(t.priority)}">${esc(t.priority)}</span>
      <button class="delete-task" aria-label="Delete task">×</button>
    </div>`;
  }

  function bindTaskRows() {
    $$('.task-row').forEach(row => {
      const tid = row.dataset.task;
      const chk = $('.task-check', row);
      if (chk) chk.addEventListener('change', e => {
        tasks = tasks.map(t => t.id === tid ? {...t, done: e.target.checked} : t);
        saveTasks(); renderTasks();
      });
      const del = $('.delete-task', row);
      if (del) del.addEventListener('click', () => {
        tasks = tasks.filter(t => t.id !== tid);
        saveTasks(); renderTasks(); toast('Task removed');
      });
    });
  }

  // ── Notes ────────────────────────────────────────────────────────────────────
  function renderNotes() {
    if ($('#noteStat')) $('#noteStat').textContent = notes.length;
    const list = $('#notesList');
    if (!list) return;
    list.innerHTML = notes.length
      ? [...notes].reverse().map(n => `<article class="note-card">
          <h3>${esc(n.title)}</h3><p>${esc(n.content||'No content')}</p>
          <footer><span>Saved ${dateLabel(n.date)}</span>
          <button data-delete-note="${esc(n.id)}">Delete ×</button></footer>
        </article>`).join('')
      : '<div class="empty-state">Your next idea can start here.</div>';
    $$('[data-delete-note]').forEach(b => b.addEventListener('click', () => {
      notes = notes.filter(n => n.id !== b.dataset.deleteNote);
      saveNotes(); renderNotes(); toast('Note deleted');
    }));
  }

  // ── Navigation ───────────────────────────────────────────────────────────────
  function navigate(view) {
    currentView = view;
    $$('.view').forEach(v => v.classList.toggle('active-view', v.id === 'view-'+view));
    $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    const titles = {home:'Overview', assistant:'AI Assistant', tasks:'Tasks', notes:'Notes',
                    email:'Email workspace', screen:'Screen context', agent:'Desktop Agent',
                    prompts:'Antigravity Prompts'};
    const crumb = $('#crumbTitle');
    if (crumb) crumb.textContent = titles[view] || 'Overview';
    const sb = $('#sidebar');
    if (sb) sb.classList.remove('open');
    window.scrollTo({top:0, behavior:'smooth'});
    if (view === 'assistant') renderMessages();
  }

  $$('.nav-item').forEach(b => b.addEventListener('click', () => navigate(b.dataset.view)));
  $$('[data-go]').forEach(b => b.addEventListener('click', () => navigate(b.dataset.go)));
  const mm = $('#mobileMenu');
  if (mm) mm.addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  const tl = $('#todayLabel');
  if (tl) tl.textContent = new Date().toLocaleDateString(undefined, {weekday:'short',month:'short',day:'numeric'});

  // ── AI Chat ──────────────────────────────────────────────────────────────────
  const SYSTEM_PROMPT = `You are Orbit, an intelligent personal AI workspace assistant and desktop agent. 
You help the user with tasks, productivity, code analysis, visual debugging, and more.
When asked to analyze code or screens, be specific and reference actual filenames.
When you cannot see something, say so honestly.
Keep responses concise but thorough. Use markdown formatting for code and lists.
You are running locally and can capture screenshots and analyze project files when the backend is connected.`;

  const LOCAL_RESPONSES = [
    {match:/plan|today|priorit|day/i, fn:()=>'Let\'s keep today manageable.\n\n1. Pick one high-impact task\n2. Give it a 25-minute focus block\n3. Capture follow-ups as tasks\n4. Take a short break, then decide next steps\n\nYour tasks are in the Tasks tab. *(Backend offline — connect server for real AI)*'},
    {match:/hello|hi\b|hey/i, fn:()=>'Hey! 👋 Good to see you. I\'m running in demo mode right now — start the backend (py server.py) for real AI responses.'},
    {match:/focus|timer|pomodoro/i, fn:()=>'Try a 25-minute focus sprint. I\'ve included a Pomodoro timer on the Overview page. *(Demo mode)*'},
    {match:/screen|screenshot|visual/i, fn:()=>'To analyze your screen, start the backend server and use the "Smart Analyze" button in the Screen Context view. *(Demo mode)*'},
    {match:/help|features|what can/i, fn:()=>'Orbit features:\n\n• **Real AI chat** (needs backend)\n• **Screen capture & vision analysis** (needs backend)\n• **Google Antigravity prompt generation** (needs backend)\n• **Desktop agent controls** (needs backend)\n• **Tasks, notes, focus timer** (always available)\n• **Voice input/output** (browser-based)\n\nStart the server: `py server.py`'}
  ];

  function getLocalResponse(q) {
    const item = LOCAL_RESPONSES.find(r => r.match.test(q));
    return item ? item.fn() : 'Thanks for that. Start the backend (`py server.py`) to get real AI responses, code analysis, and screen debugging. *(Demo mode — no AI model called)*';
  }

  async function callAI(userText, imageB64 = null) {
    if (!backendOnline) return getLocalResponse(userText);

    const messages = chatHistory.slice(-20).map(m => ({role: m.role, content: m.content}));
    messages.push({role: 'user', content: userText});

    try {
      const body = { messages, system: SYSTEM_PROMPT };
      if (imageB64) body.image_b64 = imageB64;

      const r = await fetch(`${BACKEND}/api/chat`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000)
      });

      if (!r.ok) {
        const err = await r.json().catch(() => ({detail: r.statusText}));
        throw new Error(err.detail || `HTTP ${r.status}`);
      }

      const data = await r.json();
      return data.reply;
    } catch(e) {
      if (e.name === 'TimeoutError') return 'Request timed out. The backend may be busy.';
      return `AI error: ${e.message}`;
    }
  }

  // ── Messages render ──────────────────────────────────────────────────────────
  function msgHTML(m) {
    const isUser = m.role === 'user';
    const avatar = isUser ? 'V' : '✳';
    const name   = isUser ? 'You' : 'Orbit';
    const cls    = isUser ? 'user-message' : 'assistant-message';
    const formatted = m.content
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    return `<div class="message ${cls}" id="msg-${esc(m.id)}">
      <div class="message-avatar">${avatar}</div>
      <div class="message-body">
        <span class="message-author">${name} <small>${dateLabel(m.date)}</small></span>
        <div class="message-content">${m.role==='user' ? esc(m.content) : formatted}</div>
        ${m.screenshot ? `<img class="msg-screenshot" src="data:image/png;base64,${m.screenshot}" alt="Screenshot">` : ''}
      </div>
    </div>`;
  }

  function renderMessages() {
    const list = $('#chatMessages');
    if (!list) return;
    const starter = `<div class="message assistant-message">
      <div class="message-avatar">✳</div>
      <div class="message-body">
        <span class="message-author">Orbit <small>just now</small></span>
        <div class="message-content">Hey! 👋 I'm your AI workspace companion.${backendOnline ? ' I\'m connected to a real AI model and ready to help.' : ' Start the backend server (<code>py server.py</code>) to enable real AI.'}
        <div class="message-chips">
          <button data-chat="Help me plan my day">Plan my day</button>
          <button data-chat="Analyze my screen for issues">Analyze screen</button>
          <button data-chat="Help me write an email">Write an email</button>
          <button data-chat="What files are in my project?">Inspect project</button>
        </div></div>
      </div>
    </div>`;

    list.innerHTML = starter + chatHistory.map(msgHTML).join('');
    list.scrollTop = list.scrollHeight;
    $$('[data-chat]').forEach(b => b.addEventListener('click', () => sendChat(b.dataset.chat)));
  }

  let isTyping = false;
  function showTypingIndicator() {
    if (isTyping) return;
    isTyping = true;
    const list = $('#chatMessages');
    if (!list) return;
    const el = document.createElement('div');
    el.id = 'typingIndicator';
    el.className = 'message assistant-message typing-msg';
    el.innerHTML = `<div class="message-avatar">✳</div><div class="message-body"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
    list.appendChild(el);
    list.scrollTop = list.scrollHeight;
  }
  function removeTypingIndicator() {
    isTyping = false;
    const el = $('#typingIndicator');
    if (el) el.remove();
  }

  async function sendChat(text, imageB64 = null) {
    const q = text.trim();
    if (!q) return;
    const userMsg = {id: uid(), role:'user', content: q, date: new Date().toISOString(), screenshot: imageB64};
    chatHistory.push(userMsg);
    store.set('chatHistory', chatHistory.slice(-80));
    renderMessages();
    const input = $('#chatInput');
    if (input) input.value = '';

    showTypingIndicator();
    const reply = await callAI(q, imageB64);
    removeTypingIndicator();

    const assistantMsg = {id: uid(), role:'assistant', content: reply, date: new Date().toISOString()};
    chatHistory.push(assistantMsg);
    store.set('chatHistory', chatHistory.slice(-80));
    renderMessages();

    if (isSpeaking || isRecording) speak(reply);
  }

  const chatForm = $('#chatForm');
  if (chatForm) chatForm.addEventListener('submit', e => { e.preventDefault(); sendChat($('#chatInput').value); });
  const chatInput = $('#chatInput');
  if (chatInput) chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); chatForm.requestSubmit(); }
  });
  const clearChat = $('#clearChat');
  if (clearChat) clearChat.addEventListener('click', () => {
    chatHistory = []; store.set('chatHistory', []); renderMessages(); toast('Conversation cleared');
  });
  const openChat = $('#openChat');
  if (openChat) openChat.addEventListener('click', () => navigate('assistant'));
  $$('[data-action]').forEach(b => b.addEventListener('click', () => {
    navigate('assistant');
    const prompts = {summarize:'Help me summarize some text', draft:'Help me draft an email reply', plan:'Help me plan my day'};
    if (chatInput) { chatInput.value = prompts[b.dataset.action] || ''; chatInput.focus(); }
  }));
  $$('[data-chat-action]').forEach(b => b.addEventListener('click', () => sendChat(b.dataset.chatAction)));

  // ── Voice ─────────────────────────────────────────────────────────────────────
  let voices = [];
  function loadVoices() {
    voices = speechSynthesis.getVoices ? speechSynthesis.getVoices() : [];
    populateVoiceList();
  }
  if (typeof speechSynthesis !== 'undefined') {
    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }

  function populateVoiceList() {
    const sel = $('#voiceSelect');
    if (!sel) return;
    sel.innerHTML = '';
    const femalePrefs = ['Samantha','Victoria','Karen','Fiona','Moira','Veena','Nicky','Ava','Siri','Cortana','Zira','Susan','Catherine','Julie'];
    const sorted = [...voices].sort((a,b) => {
      const aFem = femalePrefs.some(n => a.name.includes(n));
      const bFem = femalePrefs.some(n => b.name.includes(n));
      if (aFem && !bFem) return -1;
      if (!aFem && bFem) return 1;
      return a.name.localeCompare(b.name);
    });
    sorted.forEach((v, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${v.name} (${v.lang})`;
      if (!selectedVoice && femalePrefs.some(n => v.name.includes(n))) {
        opt.selected = true;
        selectedVoice = v;
      }
      sel.appendChild(opt);
    });
    if (!selectedVoice && sorted.length) selectedVoice = sorted[0];
    sel.addEventListener('change', () => {
      selectedVoice = sorted[parseInt(sel.value)];
      speak('Voice updated. I sound like this now.');
    });
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    isSpeaking = true;
    const u = new SpeechSynthesisUtterance(text.replace(/```[\s\S]*?```/g, '').replace(/[*_`#]/g, ''));
    u.rate = 1.05; u.pitch = 1.05; u.volume = 1;
    if (selectedVoice) u.voice = selectedVoice;
    u.onend = () => { isSpeaking = false; };
    u.onerror = () => { isSpeaking = false; };
    speechSynthesis.speak(u);
  }

  const stopSpeaking = $('#stopSpeaking');
  if (stopSpeaking) stopSpeaking.addEventListener('click', () => {
    speechSynthesis?.cancel(); isSpeaking = false;
    const vs = $('#voiceStatus');
    if (vs) vs.textContent = 'Audio stopped.';
  });

  function openVoice() {
    const mb = $('#modalBackdrop');
    if (mb) mb.hidden = false;
    const vt = $('#voiceTitle');
    if (vt) vt.textContent = 'I\'m listening when you\'re ready.';
    const vs = $('#voiceStatus');
    if (vs) vs.textContent = 'Tap the microphone to start voice conversation.';
    const vtr = $('#voiceTranscript');
    if (vtr) vtr.textContent = 'Your conversation will appear here.';
  }
  function closeVoice() {
    stopRecognition(); speechSynthesis?.cancel(); isSpeaking = false;
    const mb = $('#modalBackdrop');
    if (mb) mb.hidden = true;
  }

  const startVoice = $('#startVoice');
  if (startVoice) startVoice.addEventListener('click', openVoice);
  const closeVoiceBtn = $('#closeVoice');
  if (closeVoiceBtn) closeVoiceBtn.addEventListener('click', closeVoice);
  const mb = $('#modalBackdrop');
  if (mb) mb.addEventListener('click', e => { if (e.target === mb) closeVoice(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modalBackdrop')?.hidden) closeVoice(); });

  function startRecognition(target = 'modal') {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast('Speech recognition not supported. Try Chrome or Edge.'); return; }
    try {
      recognition = new SR();
      recognition.lang = navigator.language || 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;
      isRecording = true; currentTranscript = '';
      if (target === 'modal') {
        const mic = $('#modalMic');
        const orb = $('.modal-orb');
        const vs  = $('#voiceStatus');
        if (mic) { mic.classList.add('recording'); mic.textContent = '■'; }
        if (orb) orb.classList.add('listening');
        if (vs) vs.textContent = 'Listening… speak naturally.';
      } else {
        const cm = $('#chatMic');
        if (cm) cm.classList.add('recording');
      }
      recognition.onresult = e => {
        let final = '', interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) final += e.results[i][0].transcript;
          else interim += e.results[i][0].transcript;
        }
        currentTranscript += final;
        const shown = (currentTranscript + ' ' + interim).trim();
        if (target === 'modal') {
          const vtr = $('#voiceTranscript');
          if (vtr) vtr.textContent = shown || 'Listening…';
        } else {
          if (chatInput) chatInput.value = shown;
        }
      };
      recognition.onerror = e => {
        isRecording = false; resetMic(target);
        toast(e.error === 'not-allowed' ? 'Microphone permission denied.' : `Voice input stopped: ${e.error}`);
      };
      recognition.onend = async () => {
        isRecording = false; resetMic(target);
        const spoken = currentTranscript.trim();
        if (!spoken) return;
        if (target === 'modal') {
          const vtr = $('#voiceTranscript');
          const vs  = $('#voiceStatus');
          if (vtr) vtr.textContent = 'You: ' + spoken;
          if (vs) vs.textContent = 'Thinking…';
          const reply = await callAI(spoken);
          if (vtr) vtr.textContent = `You: ${spoken}\n\nOrbit: ${reply}`;
          if (vs) vs.textContent = 'Tap to speak again';
          speak(reply);
          const userMsg = {id:uid(), role:'user', content:spoken, date:new Date().toISOString()};
          const asstMsg = {id:uid(), role:'assistant', content:reply, date:new Date().toISOString()};
          chatHistory.push(userMsg, asstMsg);
          store.set('chatHistory', chatHistory.slice(-80));
        } else {
          sendChat(spoken);
        }
      };
      recognition.start();
    } catch(e) {
      isRecording = false; resetMic(target);
      toast('Could not start voice input. Check microphone permission.');
    }
  }

  function resetMic(target) {
    if (target === 'modal') {
      const mic = $('#modalMic'); const orb = $('.modal-orb'); const vs = $('#voiceStatus');
      if (mic) { mic.classList.remove('recording'); mic.textContent = '🎙'; }
      if (orb) orb.classList.remove('listening');
      if (!$('#modalBackdrop')?.hidden && vs) vs.textContent = 'Tap the microphone to speak again.';
    } else {
      const cm = $('#chatMic');
      if (cm) cm.classList.remove('recording');
    }
  }

  function stopRecognition() {
    if (recognition) { try { recognition.stop(); } catch {} recognition = null; }
    isRecording = false; resetMic('modal'); resetMic('chat');
  }

  const modalMic = $('#modalMic');
  if (modalMic) modalMic.addEventListener('click', () => { if (isRecording) stopRecognition(); else startRecognition('modal'); });
  const chatMic = $('#chatMic');
  if (chatMic) chatMic.addEventListener('click', () => { if (isRecording) stopRecognition(); else startRecognition('chat'); });

  // ── Screen capture ────────────────────────────────────────────────────────────
  async function shareScreen() {
    if (!navigator.mediaDevices?.getDisplayMedia) { toast('Screen sharing unavailable. Use HTTPS or localhost.'); return; }
    try {
      screenStream = await navigator.mediaDevices.getDisplayMedia({video: true, audio: false});
      const video = $('#screenVideo');
      if (video) { video.srcObject = screenStream; video.hidden = false; }
      const empty = $('#screenEmpty');
      if (empty) empty.hidden = true;
      const stopBtn = $('#stopScreen');
      if (stopBtn) stopBtn.disabled = false;
      const status = $('#screenStatus');
      if (status) status.textContent = 'Screen is being shared. Preview visible in this page.';
      const lock = $('.preview-lock');
      if (lock) { lock.textContent = '▣ Screen sharing active'; lock.style.background = '#163328dd'; }
      toast('Screen sharing started');
      screenStream.getVideoTracks()[0].addEventListener('ended', stopScreen);
    } catch(e) {
      if (e.name !== 'AbortError') toast('Screen sharing was cancelled or blocked by the browser.');
    }
  }

  function stopScreen() {
    if (screenStream) { screenStream.getTracks().forEach(t => t.stop()); screenStream = null; }
    const video = $('#screenVideo');
    if (video) { video.srcObject = null; video.hidden = true; }
    const empty = $('#screenEmpty');
    if (empty) empty.hidden = false;
    const stopBtn = $('#stopScreen');
    if (stopBtn) stopBtn.disabled = true;
    const status = $('#screenStatus');
    if (status) status.textContent = 'Nothing is being shared.';
    const lock = $('.preview-lock');
    if (lock) { lock.textContent = '▣ No screen shared'; lock.style.background = '#0b0d12a8'; }
  }

  const shareScreenBtn = $('#shareScreen');
  if (shareScreenBtn) shareScreenBtn.addEventListener('click', () => { navigate('screen'); shareScreen(); });
  const shareScreenPage = $('#shareScreenPage');
  if (shareScreenPage) shareScreenPage.addEventListener('click', shareScreen);
  const stopScreenBtn = $('#stopScreen');
  if (stopScreenBtn) stopScreenBtn.addEventListener('click', stopScreen);

  // ── Screenshot + AI Analysis ──────────────────────────────────────────────────
  async function captureAndAnalyze(query = null) {
    if (!backendOnline) { toast('Backend offline. Start server: py server.py'); return; }

    const q = query || $('#analyzePrompt')?.value?.trim() || 'What issues do you see on my screen?';
    const countdown = $('#screenshotCountdown');
    const resultPanel = $('#analysisResult');
    const screenshotPreview = $('#screenshotPreview');

    if (countdown) {
      for (let i = 3; i >= 1; i--) {
        countdown.textContent = `Taking screenshot in ${i}…`;
        await sleep(1000);
      }
      countdown.textContent = 'Capturing…';
    }

    try {
      // Get screenshot from backend (captures actual desktop)
      const shotResp = await fetch(`${BACKEND}/api/screenshot`, {method:'POST', signal: AbortSignal.timeout(10000)});
      if (!shotResp.ok) throw new Error('Screenshot failed');
      const shotData = await shotResp.json();
      lastScreenshot = shotData.image_b64;

      if (screenshotPreview) {
        screenshotPreview.src = `data:image/png;base64,${lastScreenshot}`;
        screenshotPreview.parentElement.hidden = false;
      }
      if (countdown) countdown.textContent = 'Analyzing…';

      // Smart analyze
      const analyzeResp = await fetch(`${BACKEND}/api/smart-analyze`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({query: q, take_screenshot: false}),
        signal: AbortSignal.timeout(60000)
      });
      const analyzeData = await analyzeResp.json();

      if (resultPanel) {
        resultPanel.hidden = false;
        const resultContent = $('#analysisContent');
        if (resultContent) {
          resultContent.innerHTML = formatAnalysis(analyzeData.analysis);
        }
        // Extract Antigravity prompt and populate prompt panel
        const match = analyzeData.analysis.match(/## Antigravity Prompt\n([\s\S]*?)(?=\n## |$)/);
        if (match) {
          const agPrompt = match[1].trim();
          addAntigravityPrompt(agPrompt, q, analyzeData.files_analyzed);
        }
      }
      if (countdown) countdown.textContent = 'Analysis complete ✓';
    } catch(e) {
      if (countdown) countdown.textContent = '';
      toast(`Analysis failed: ${e.message}`);
    }
  }

  function formatAnalysis(text) {
    return text
      .replace(/## (.*)/g, '<h3>$1</h3>')
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  const analyzeBtn = $('#analyzeScreenBtn');
  if (analyzeBtn) analyzeBtn.addEventListener('click', () => captureAndAnalyze());

  // ── Send screenshot to chat ───────────────────────────────────────────────────
  const sendScreenToChat = $('#sendScreenToChat');
  if (sendScreenToChat) sendScreenToChat.addEventListener('click', async () => {
    if (!backendOnline) { toast('Backend required. Run: py server.py'); return; }
    try {
      const r = await fetch(`${BACKEND}/api/screenshot`, {method:'POST'});
      const d = await r.json();
      navigate('assistant');
      await sendChat('Please analyze my current screen and tell me what you see.', d.image_b64);
    } catch(e) {
      toast('Could not capture screen: ' + e.message);
    }
  });

  // ── Antigravity Prompt Panel ──────────────────────────────────────────────────
  let savedPrompts = store.get('agPrompts', []);

  function addAntigravityPrompt(promptText, issue, files = []) {
    const entry = {
      id: uid(),
      prompt: promptText,
      issue,
      files,
      date: new Date().toISOString()
    };
    savedPrompts.unshift(entry);
    store.set('agPrompts', savedPrompts.slice(0, 20));
    renderPrompts();
    toast('Antigravity prompt saved ✓');
  }

  function renderPrompts() {
    const list = $('#promptsList');
    if (!list) return;
    list.innerHTML = savedPrompts.length
      ? savedPrompts.map(p => `<div class="prompt-card" id="pc-${esc(p.id)}">
          <div class="prompt-card-head">
            <div class="prompt-meta">
              <strong>${esc(p.issue || 'Analysis result')}</strong>
              <small>${dateLabel(p.date)}</small>
            </div>
            <button class="delete-prompt-btn" data-pid="${esc(p.id)}" title="Delete">×</button>
          </div>
          ${p.files?.length ? `<div class="prompt-files">${p.files.map(f=>`<code>${esc(f)}</code>`).join(' ')}</div>` : ''}
          <pre class="prompt-text">${esc(p.prompt)}</pre>
          <button class="copy-prompt-btn primary-button" data-pid="${esc(p.id)}"><span>📋</span> Copy Prompt</button>
        </div>`).join('')
      : '<div class="empty-state">No prompts yet. Use "Smart Analyze" on the Screen Context page to generate one.</div>';

    $$('.copy-prompt-btn').forEach(b => b.addEventListener('click', () => {
      const entry = savedPrompts.find(p => p.id === b.dataset.pid);
      if (entry) {
        navigator.clipboard.writeText(entry.prompt)
          .then(() => { b.textContent = '✓ Copied!'; setTimeout(() => { b.innerHTML='<span>📋</span> Copy Prompt'; }, 2000); })
          .catch(() => toast('Copy failed — select and copy manually'));
      }
    }));
    $$('.delete-prompt-btn').forEach(b => b.addEventListener('click', () => {
      savedPrompts = savedPrompts.filter(p => p.id !== b.dataset.pid);
      store.set('agPrompts', savedPrompts);
      renderPrompts();
    }));
  }

  // Manual generate prompt
  const genPromptBtn = $('#generatePromptBtn');
  if (genPromptBtn) genPromptBtn.addEventListener('click', async () => {
    if (!backendOnline) { toast('Backend required. Start: py server.py'); return; }
    const issue = $('#promptIssueInput')?.value?.trim();
    if (!issue) { toast('Describe the issue first'); return; }
    genPromptBtn.textContent = 'Generating…'; genPromptBtn.disabled = true;
    try {
      const r = await fetch(`${BACKEND}/api/generate-antigravity-prompt`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          issue_description: issue,
          screenshot_b64: lastScreenshot,
          relevant_files: ['index.html','styles.css','app.js','server.py']
        }),
        signal: AbortSignal.timeout(30000)
      });
      const d = await r.json();
      addAntigravityPrompt(d.antigravity_prompt, issue);
    } catch(e) {
      toast('Prompt generation failed: ' + e.message);
    } finally {
      genPromptBtn.textContent = 'Generate Prompt'; genPromptBtn.disabled = false;
    }
  });

  // ── Code Inspector ────────────────────────────────────────────────────────────
  const inspectBtn = $('#inspectCodeBtn');
  if (inspectBtn) inspectBtn.addEventListener('click', async () => {
    if (!backendOnline) { toast('Backend required. Start: py server.py'); return; }
    const query = $('#codeQuery')?.value?.trim() || 'chat voice AI';
    inspectBtn.textContent = 'Inspecting…'; inspectBtn.disabled = true;
    try {
      const r = await fetch(`${BACKEND}/api/inspect-code`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({query}),
        signal: AbortSignal.timeout(15000)
      });
      const d = await r.json();
      const res = $('#codeInspectResult');
      if (res) {
        res.hidden = false;
        const content = $('#codeInspectContent');
        if (content) content.innerHTML = d.files.map(f =>
          `<div class="file-inspect"><div class="file-path"><code>${esc(f.path)}</code> <small>${Math.round(f.size/1024*10)/10} KB</small></div>
           <pre class="code-block">${esc(f.excerpt.slice(0,800))}</pre></div>`
        ).join('');
      }
    } catch(e) {
      toast('Code inspect failed: ' + e.message);
    } finally {
      inspectBtn.textContent = 'Inspect Code'; inspectBtn.disabled = false;
    }
  });

  // ── Desktop Agent ────────────────────────────────────────────────────────────
  async function checkDesktopStatus() {
    if (!backendOnline) return;
    try {
      const r = await fetch(`${BACKEND}/api/desktop/status`);
      const d = await r.json();
      desktopEnabled = d.enabled;
      aiSessionToken = d.session_token_hint;
      const statusEl = $('#desktopStatus');
      if (statusEl) statusEl.textContent = d.enabled ? '✓ Desktop control enabled' : '✗ Desktop control disabled (set DESKTOP_CONTROL_ENABLED=true in .env)';
    } catch {}
  }

  const takeDesktopShot = $('#takeDesktopScreenshot');
  if (takeDesktopShot) takeDesktopShot.addEventListener('click', async () => {
    if (!backendOnline) { toast('Backend required. Start: py server.py'); return; }
    takeDesktopShot.textContent = 'Capturing…'; takeDesktopShot.disabled = true;
    try {
      const r = await fetch(`${BACKEND}/api/screenshot`, {method:'POST'});
      const d = await r.json();
      lastScreenshot = d.image_b64;
      const preview = $('#agentScreenPreview');
      if (preview) { preview.src = `data:image/png;base64,${d.image_b64}`; preview.parentElement.hidden = false; }
      toast('Screenshot captured');
    } catch(e) {
      toast('Screenshot failed: ' + e.message);
    } finally {
      takeDesktopShot.textContent = '📸 Capture Desktop'; takeDesktopShot.disabled = false;
    }
  });

  const openUrlBtn = $('#openUrlBtn');
  if (openUrlBtn) openUrlBtn.addEventListener('click', async () => {
    if (!desktopEnabled) { toast('Desktop control disabled. Set DESKTOP_CONTROL_ENABLED=true in .env'); return; }
    const url = prompt('Enter URL to open:');
    if (!url) return;
    try {
      const r = await fetch(`${BACKEND}/api/desktop/open-url`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({action:'open-url', params:{url}, session_token: aiSessionToken||''})
      });
      const d = await r.json();
      toast(d.status === 'opened' ? `Opened: ${url}` : 'Failed to open URL');
    } catch(e) { toast('Action failed: ' + e.message); }
  });

  // ── Tasks form ────────────────────────────────────────────────────────────────
  const taskForm = $('#taskForm');
  if (taskForm) taskForm.addEventListener('submit', e => {
    e.preventDefault();
    const title = $('#taskInput')?.value?.trim();
    if (!title) return;
    tasks.unshift({id:uid(), title, priority: $('#taskPriority')?.value || 'medium', done:false});
    saveTasks(); renderTasks();
    if ($('#taskInput')) $('#taskInput').value = '';
    toast('Task added');
  });
  const addShortcut = $('#addTaskShortcut');
  if (addShortcut) addShortcut.addEventListener('click', () => { navigate('tasks'); $('#taskInput')?.focus(); });
  $$('.filter-button').forEach(b => b.addEventListener('click', () => {
    filter = b.dataset.filter;
    $$('.filter-button').forEach(x => x.classList.toggle('active', x === b));
    renderTasks();
  }));

  // ── Notes form ────────────────────────────────────────────────────────────────
  const noteContent = $('#noteContent');
  if (noteContent) noteContent.addEventListener('input', () => {
    const cc = $('#noteCharCount');
    if (cc) cc.textContent = noteContent.value.length + ' characters';
  });
  const noteForm = $('#noteForm');
  if (noteForm) noteForm.addEventListener('submit', e => {
    e.preventDefault();
    const title   = $('#noteTitle')?.value?.trim();
    const content = $('#noteContent')?.value?.trim();
    if (!title && !content) return toast('Add a title or some content first');
    notes.push({id:uid(), title: title||'Untitled note', content, date: new Date().toISOString()});
    saveNotes(); renderNotes();
    if ($('#noteTitle'))   $('#noteTitle').value = '';
    if (noteContent)       noteContent.value = '';
    if ($('#noteCharCount')) $('#noteCharCount').textContent = '0 characters';
    toast('Note saved');
  });

  // ── Timer ─────────────────────────────────────────────────────────────────────
  function timerRender() {
    const m = String(Math.floor(timerSeconds/60)).padStart(2,'0');
    const s = String(timerSeconds % 60).padStart(2,'0');
    const d = $('#timerDisplay');
    if (d) d.textContent = m + ':' + s;
    const p = $('#timerProgress');
    if (p) p.style.width = ((timerInitial - timerSeconds) / timerInitial * 100) + '%';
  }
  const timerStart = $('#timerStart');
  if (timerStart) timerStart.addEventListener('click', () => {
    if (timerInterval) {
      clearInterval(timerInterval); timerInterval = null;
      timerStart.innerHTML = '▶ Resume focus'; return;
    }
    timerStart.innerHTML = 'Ⅱ Pause';
    timerInterval = setInterval(() => {
      timerSeconds--; timerRender();
      if (timerSeconds <= 0) {
        clearInterval(timerInterval); timerInterval = null;
        focusSessions++; store.set('focusSessions', focusSessions);
        const fs = $('#focusStat');
        if (fs) fs.textContent = focusSessions;
        timerStart.innerHTML = '▶ Start focus';
        toast('Focus session complete! Take a short break.');
        if ('Notification' in window && Notification.permission === 'granted')
          new Notification('Orbit', {body: 'Focus session complete! Take a short break.'});
        timerSeconds = timerInitial; timerRender();
      }
    }, 1000);
  });
  const timerReset = $('#timerReset');
  if (timerReset) timerReset.addEventListener('click', () => {
    clearInterval(timerInterval); timerInterval = null;
    timerSeconds = timerInitial; timerRender();
    if (timerStart) timerStart.innerHTML = '▶ Start focus';
  });

  // ── Theme ─────────────────────────────────────────────────────────────────────
  const themeToggle = $('#themeToggle');
  if (themeToggle) themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    store.set('lightTheme', document.body.classList.contains('light-theme'));
  });
  if (store.get('lightTheme', false)) document.body.classList.add('light-theme');

  // ── Clear data ────────────────────────────────────────────────────────────────
  const clearData = $('#clearData');
  if (clearData) clearData.addEventListener('click', () => {
    if (!confirm('Clear all local data (tasks, notes, chat)? Cannot be undone.')) return;
    ['tasks','notes','chatHistory','focusSessions','agPrompts'].forEach(k => localStorage.removeItem('orbit.'+k));
    tasks = []; notes = []; chatHistory = []; focusSessions = 0; savedPrompts = [];
    const fs = $('#focusStat');
    if (fs) fs.textContent = '0';
    renderTasks(); renderNotes(); renderMessages(); renderPrompts();
    toast('Local data cleared');
  });

  // ── Privacy ───────────────────────────────────────────────────────────────────
  const privacyOpen = $('#privacyOpen');
  if (privacyOpen) privacyOpen.addEventListener('click', () => {
    alert('Privacy & Permissions\n\n• Microphone: only when you start voice input\n• Screen: only after browser sharing prompt\n• Desktop control: disabled by default, opt-in via .env\n• Tasks/notes/chat: stored in browser localStorage only\n• Screenshots: sent to AI provider only with your awareness\n• API keys: stored only in local .env file, never in JS or Git\n\nDo not store confidential work data in this demo.');
  });

  // ── Email info ────────────────────────────────────────────────────────────────
  const emailInfo = $('#emailInfo');
  if (emailInfo) emailInfo.addEventListener('click', () => {
    const info = $('#emailSetupInfo');
    if (info) { info.hidden = !info.hidden; emailInfo.innerHTML = info.hidden ? 'View setup requirements <span>↗</span>' : 'Hide setup requirements ↑'; }
  });

  // ── Screen prompt save ────────────────────────────────────────────────────────
  const saveScreenPrompt = $('#saveScreenPrompt');
  const screenPromptEl = $('#screenPrompt');
  if (saveScreenPrompt && screenPromptEl) {
    saveScreenPrompt.addEventListener('click', () => {
      const value = screenPromptEl.value.trim();
      store.set('screenPrompt', value);
      const saved = $('#screenPromptSaved');
      if (saved) saved.textContent = value ? 'Context note saved.' : 'Context note cleared.';
      toast('Context note saved');
    });
    screenPromptEl.value = store.get('screenPrompt', '');
    const saved = $('#screenPromptSaved');
    if (screenPromptEl.value && saved) saved.textContent = 'Previously saved context note loaded.';
  }

  // ── Keyboard shortcuts ────────────────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey) {
      if (e.key === '1') { e.preventDefault(); navigate('home'); }
      if (e.key === '2') { e.preventDefault(); navigate('assistant'); }
      if (e.key === '3') { e.preventDefault(); navigate('tasks'); }
    }
  });

  // ── Assistant prompt rotation ─────────────────────────────────────────────────
  const prompts = [
    '"What should I focus on today?"',
    '"Analyze my screen for issues"',
    '"Help me draft a message"',
    '"Generate an Antigravity prompt"',
    '"What files are in my project?"'
  ];
  let pIdx = 0;
  setInterval(() => {
    pIdx = (pIdx + 1) % prompts.length;
    const el = $('#assistantPrompt');
    if (el) { el.style.opacity = 0; setTimeout(() => { el.textContent = prompts[pIdx]; el.style.opacity = 1; }, 350); }
  }, 4000);

  // ── Init ──────────────────────────────────────────────────────────────────────
  async function init() {
    renderTasks(); renderNotes(); renderMessages(); renderPrompts(); timerRender();
    const fs = $('#focusStat');
    if (fs) fs.textContent = focusSessions;

    const health = await checkBackend();
    if (health) {
      await checkDesktopStatus();
    }

    // Recheck backend every 30 seconds
    setInterval(() => checkBackend(), 30000);
  }

  init();
})();