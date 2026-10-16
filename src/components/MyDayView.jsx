import React, { useState } from 'react';
import {
  Sun,
  Play,
  Pause,
  RotateCcw,
  VolumeX,
  CloudRain,
  Radio,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  Plus,
  Calendar,
  AlertCircle,
  Folder
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';

export default function MyDayView() {
  const {
    tasks,
    todayStr,
    projects,
    activeProject,
    pomodoro,
    setPomodoro,
    setPomodoroAmbient,
    toggleTaskStatus,
    addTaskToMyDay,
    updateTask,
    setIsAiAssistantOpen
  } = usePlanner();

  // Quick add form state for My Day
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newProjectId, setNewProjectId] = useState(activeProject ? activeProject.id : '');
  const [showTaskPicker, setShowTaskPicker] = useState(false);

  // Filter tasks for My Day: tasks due today OR marked done today
  const todayTasks = tasks.filter(t => t.dueDate === todayStr || (t.tags && t.tags.includes('My Day')));
  const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'Done');
  const otherUnscheduledTasks = tasks.filter(t => t.status !== 'Done' && t.dueDate !== todayStr);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const setTimerMode = (mode, durationMins) => {
    setPomodoro(prev => ({
      ...prev,
      mode,
      duration: durationMins * 60,
      timeLeft: durationMins * 60,
      isRunning: false
    }));
  };

  const handleStartTaskFocus = (task) => {
    setPomodoro(prev => ({
      ...prev,
      activeTaskId: task.id,
      isRunning: true
    }));
  };

  const handleAddSubmit = (e) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;

    addTaskToMyDay(newTitle, newPriority, newProjectId || (activeProject ? activeProject.id : undefined));
    setNewTitle('');
  };

  const handleAddExistingToToday = (taskId) => {
    updateTask(taskId, { dueDate: todayStr });
    setShowTaskPicker(false);
  };

  const activeFocusTask = tasks.find(t => t.id === pomodoro.activeTaskId);

  // Formatted date string for today
  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="view-container">
      <div className="myday-content-wrapper">
        {/* Header Banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sun size={28} color="#f59e0b" />
              <span>My Day &amp; Productivity Focus</span>
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
              {formattedToday} • Deep work timer and daily prioritized execution
            </p>
          </div>

          <button
            className="hero-btn-primary"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              color: '#ffffff',
              borderRadius: '9999px',
              padding: '9px 18px',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)'
            }}
            onClick={() => setIsAiAssistantOpen(true)}
          >
            <Sparkles size={16} />
            <span>AI Schedule Optimizer</span>
          </button>
        </div>

        {/* Big Pomodoro Deep Work Focus Hero Card */}
        <div className="pomodoro-hero-card">
          <div style={{ flex: 1 }}>
            {/* Mode Selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[
                { label: 'Deep Focus (25m)', mode: 'work', time: 25 },
                { label: 'Short Break (5m)', mode: 'shortBreak', time: 5 },
                { label: 'Long Break (15m)', mode: 'longBreak', time: 15 }
              ].map(item => (
                <button
                  key={item.mode}
                  style={{
                    background: pomodoro.mode === item.mode ? '#2563eb' : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '9999px',
                    color: '#ffffff',
                    padding: '6px 16px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => setTimerMode(item.mode, item.time)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Big Timer */}
            <div className="pomodoro-timer-display">
              {formatTimer(pomodoro.timeLeft)}
            </div>

            {/* Currently Active Task */}
            <div style={{ marginTop: 8, fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#93c5fd' }}>Target:</span>
              <strong>{activeFocusTask ? activeFocusTask.title : 'General Deep Work Session'}</strong>
            </div>

            {/* Timer Controls */}
            <div className="pomodoro-controls-row">
              <button
                className="pomodoro-btn-primary"
                onClick={() => setPomodoro(prev => ({ ...prev, isRunning: !prev.isRunning }))}
              >
                {pomodoro.isRunning ? <Pause size={18} /> : <Play size={18} />}
                <span>{pomodoro.isRunning ? 'Pause' : 'Start Focus'}</span>
              </button>

              <button
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '9999px',
                  color: '#ffffff',
                  padding: '10px 18px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
                onClick={() => setPomodoro(prev => ({ ...prev, isRunning: false, timeLeft: prev.duration }))}
              >
                <RotateCcw size={15} />
                <span>Reset</span>
              </button>
            </div>

            {/* Ambient Soundscape Generator */}
            <div className="ambient-sound-chips">
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                Concentration Audio:
              </span>
              {[
                { id: 'none', label: 'Muted', icon: VolumeX },
                { id: 'rain', label: 'Rain Drops', icon: CloudRain },
                { id: 'whitenoise', label: 'White Noise', icon: Radio },
                { id: 'binaural40hz', label: '40Hz Gamma Focus', icon: Zap }
              ].map(sound => {
                const Icon = sound.icon;
                const isActive = pomodoro.ambientSound === sound.id;
                return (
                  <button
                    key={sound.id}
                    className={`sound-chip ${isActive ? 'active' : ''}`}
                    onClick={() => setPomodoroAmbient(sound.id)}
                  >
                    <Icon size={12} />
                    <span>{sound.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Focus Stats */}
          <div
            style={{
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 'var(--radius-lg)',
              padding: 24,
              minWidth: 200,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Today's Streak</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Flame size={22} color="#f59e0b" />
                <span>{todayTasks.filter(t => t.status === 'Done').length > 0 ? 'Active' : 'Start Today'}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Completed Today</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>
                {todayTasks.filter(t => t.status === 'Done').length}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Completed Sessions</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8' }}>
                {pomodoro.completedSessions}
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Schedule: My Day Tasks + Overdue Urgent Tasks */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
          {/* Main Card: Tasks Due Today with Inline Task Creator */}
          <div className="dash-panel-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={18} color="#2563eb" />
                <span className="dash-panel-title">Tasks for Today</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb' }}>
                  {todayTasks.filter(t => t.status === 'Done').length} / {todayTasks.length} Done
                </span>
                {otherUnscheduledTasks.length > 0 && (
                  <button
                    className="top-action-btn"
                    style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                    onClick={() => setShowTaskPicker(!showTaskPicker)}
                  >
                    + Pick from projects
                  </button>
                )}
              </div>
            </div>

            {/* Quick Add To My Day Form */}
            <form
              onSubmit={handleAddSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 12,
                padding: '6px 12px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <Plus size={18} color="#2563eb" />
              <input
                type="text"
                placeholder="Add a task to My Day and press Enter..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.88rem',
                  color: '#1e293b'
                }}
              />

              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="filter-select"
                style={{ padding: '4px 8px', fontSize: '0.78rem' }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>

              {projects.length > 1 && (
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="filter-select"
                  style={{ padding: '4px 8px', fontSize: '0.78rem', maxWidth: 120 }}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}

              <button
                type="submit"
                className="quick-add-btn"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                Add
              </button>
            </form>

            {/* Task Picker Dropdown if user clicked "Pick from projects" */}
            {showTaskPicker && otherUnscheduledTasks.length > 0 && (
              <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 8, padding: 12, marginTop: 8 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                  Click any task to schedule it for My Day:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 160, overflowY: 'auto' }}>
                  {otherUnscheduledTasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() => handleAddExistingToToday(t.id)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 6,
                        padding: '6px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        fontSize: '0.82rem'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                      <span style={{ fontWeight: 500 }}>{t.title}</span>
                      <span style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.75rem' }}>+ Add to Today</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List of Tasks for Today */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
              {todayTasks.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8' }}>
                  <Sun size={32} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>
                    Your day is clear!
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Use the bar above to add your first task and stay productive.
                  </div>
                </div>
              ) : (
                todayTasks.map(task => (
                  <div
                    key={task.id}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                      <input
                        type="checkbox"
                        checked={task.status === 'Done'}
                        onChange={() => toggleTaskStatus(task.id)}
                        style={{ accentColor: '#2563eb', cursor: 'pointer', width: 16, height: 16 }}
                      />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, textDecoration: task.status === 'Done' ? 'line-through' : 'none', color: task.status === 'Done' ? '#94a3b8' : '#1e293b' }}>
                          {task.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {task.priority} priority • {task.status}
                        </div>
                      </div>
                    </div>

                    <button
                      style={{
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        borderRadius: 'var(--radius-md)',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={() => handleStartTaskFocus(task)}
                    >
                      Focus
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Overdue Urgent Catch-up Panel */}
          <div className="dash-panel-card" style={{ borderColor: overdueTasks.length > 0 ? '#fca5a5' : '#e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: overdueTasks.length > 0 ? '#ef4444' : '#10b981' }} />
                <span className="dash-panel-title" style={{ color: overdueTasks.length > 0 ? '#ef4444' : '#1e293b' }}>
                  {overdueTasks.length > 0 ? 'Urgent Catch-up' : 'No Overdue Tasks'}
                </span>
              </div>
              {overdueTasks.length > 0 && (
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ef4444' }}>
                  {overdueTasks.length} Overdue
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
              {overdueTasks.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                  <CheckCircle2 size={24} color="#10b981" style={{ margin: '0 auto 6px' }} />
                  <div>All tasks are on track. Great job!</div>
                </div>
              ) : (
                overdueTasks.map(task => (
                  <div
                    key={task.id}
                    style={{
                      background: '#fff1f2',
                      border: '1px solid #fecdd3',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                      <input
                        type="checkbox"
                        checked={task.status === 'Done'}
                        onChange={() => toggleTaskStatus(task.id)}
                        style={{ accentColor: '#ef4444', cursor: 'pointer', width: 16, height: 16 }}
                      />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#9f1239' }}>
                          {task.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#be123c', fontWeight: 600 }}>
                          Due: {task.formattedDue}
                        </div>
                      </div>
                    </div>

                    <button
                      style={{
                        background: '#be123c',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={() => handleStartTaskFocus(task)}
                    >
                      Tackle Now
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
