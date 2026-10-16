import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  RefreshCw,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';

export default function TopBar() {
  const {
    setIsCommandPaletteOpen,
    setIsAiAssistantOpen,
    notificationCount,
    setNotificationCount,
    soundEnabled,
    setSoundEnabled,
    pomodoro,
    setPomodoro,
    activeView
  } = usePlanner();

  const [timeStr, setTimeStr] = useState('20:36');

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatPomodoroTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <div className="window-title">
          <span>TodoPlanner</span>
        </div>

        {/* Global Quick Search / Command Palette Trigger */}
        <button
          className="command-palette-trigger"
          onClick={() => setIsCommandPaletteOpen(true)}
          title="Open Command Palette (Ctrl + K)"
        >
          <Search size={14} />
          <span>Quick actions & search...</span>
          <span className="kbd-badge">Ctrl K</span>
        </button>
      </div>

      <div className="top-bar-right">
        {/* Floating Mini Pomodoro Status if active or hovered */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: pomodoro.isRunning ? '#eff6ff' : '#f8fafc',
            border: pomodoro.isRunning ? '1px solid #93c5fd' : '1px solid #e2e8f0',
            borderRadius: '9999px',
            padding: '4px 12px',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: pomodoro.isRunning ? '#2563eb' : '#64748b'
          }}
        >
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: pomodoro.isRunning ? '#10b981' : '#cbd5e1',
            display: 'inline-block'
          }} />
          <span>Focus {formatPomodoroTime(pomodoro.timeLeft)}</span>
          <button
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: pomodoro.isRunning ? '#2563eb' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              padding: 0
            }}
            onClick={() => setPomodoro(prev => ({ ...prev, isRunning: !prev.isRunning }))}
            title={pomodoro.isRunning ? "Pause Focus Timer" : "Start Focus Timer"}
          >
            {pomodoro.isRunning ? <Pause size={13} /> : <Play size={13} />}
          </button>
        </div>

        {/* AI Productivity Copilot */}
        <button
          className="top-action-btn"
          style={{ background: '#f5f3ff', borderColor: '#ddd6fe', color: '#7c3aed' }}
          onClick={() => setIsAiAssistantOpen(true)}
          title="Open AI Productivity Copilot"
        >
          <Sparkles size={14} color="#7c3aed" />
          <span>AI Copilot</span>
        </button>

        {/* Sound toggle */}
        <button
          className="top-action-btn"
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? "Mute sounds" : "Enable sounds"}
        >
          {soundEnabled ? <Volume2 size={15} color="#2563eb" /> : <VolumeX size={15} color="#94a3b8" />}
        </button>

        {/* Live Clock matching screenshot */}
        <span className="live-clock">{timeStr}</span>

        {/* Refresh button matching screenshot */}
        <button
          className="top-action-btn"
          onClick={() => window.location.reload()}
          title="Refresh view"
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>

        {/* Notification Bell matching screenshot */}
        <button
          className="notification-bell-btn"
          onClick={() => {
            if (notificationCount > 0) {
              alert(`You have ${notificationCount} productivity updates: 3 tasks are late, 4 are due today! Check "My Day" to conquer them.`);
              setNotificationCount(0);
            } else {
              setNotificationCount(7);
            }
          }}
          title="Notifications"
        >
          <Bell size={18} />
          {notificationCount > 0 && (
            <span className="notification-badge">{notificationCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}
