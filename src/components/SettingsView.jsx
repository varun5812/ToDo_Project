import React from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  Minimize2,
  RotateCcw,
  Download,
  Upload,
  ShieldCheck,
  Check
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';

export default function SettingsView() {
  const {
    soundEnabled,
    setSoundEnabled,
    isCompactMode,
    setIsCompactMode,
    resetToDefaultData,
    projects,
    tasks,
    files,
    notes
  } = usePlanner();

  const handleExportBackup = () => {
    const backupData = {
      version: '3.0.0',
      exportedAt: new Date().toISOString(),
      projects,
      tasks,
      files,
      notes
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todoplanner_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.projects && parsed.tasks) {
          localStorage.setItem('todoplanner_projects', JSON.stringify(parsed.projects));
          localStorage.setItem('todoplanner_tasks', JSON.stringify(parsed.tasks));
          if (parsed.files) localStorage.setItem('todoplanner_files', JSON.stringify(parsed.files));
          if (parsed.notes) localStorage.setItem('todoplanner_notes', JSON.stringify(parsed.notes));
          window.location.reload();
        } else {
          alert("Invalid backup file format.");
        }
      } catch (err) {
        alert("Failed to parse backup JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="view-container">
      <div className="dashboard-content-wrapper" style={{ maxWidth: 800 }}>
        <div className="dashboard-header-row">
          <div className="dashboard-title-group">
            <h1>Settings &amp; Preferences</h1>
            <p>Customize your workspace, audio feedback, and data backup</p>
          </div>
        </div>

        {/* Preferences Cards */}
        <div className="dash-panel-card">
          <div className="dash-panel-title">Interface &amp; Audio</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Audio Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Audio Chimes &amp; Feedback</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Play celebration sound effects on task completion and button interactions</div>
              </div>
              <button
                className="top-action-btn"
                style={{ background: soundEnabled ? '#eff6ff' : '#f8fafc', borderColor: soundEnabled ? '#93c5fd' : '#cbd5e1' }}
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? <Volume2 size={16} color="#2563eb" /> : <VolumeX size={16} color="#94a3b8" />}
                <span style={{ fontWeight: 600, color: soundEnabled ? '#2563eb' : '#64748b' }}>
                  {soundEnabled ? 'Enabled' : 'Muted'}
                </span>
              </button>
            </div>

            {/* Compact Mode Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Compact Sidebar Mode</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Collapse navigation sidebar into icon-only mode for extra screen estate</div>
              </div>
              <button
                className="top-action-btn"
                onClick={() => setIsCompactMode(!isCompactMode)}
              >
                <Minimize2 size={16} />
                <span style={{ fontWeight: 600 }}>
                  {isCompactMode ? 'Compact' : 'Expanded'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Persistence & Backups */}
        <div className="dash-panel-card">
          <div className="dash-panel-title">Data Backup &amp; Storage</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Export Workspace Backup</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Download all projects, tasks, files, and notes as a local JSON file</div>
              </div>
              <button className="top-action-btn" onClick={handleExportBackup}>
                <Download size={15} />
                <span>Export JSON</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Import Workspace Backup</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Restore workspace data from a previously downloaded JSON backup</div>
              </div>
              <label className="top-action-btn" style={{ cursor: 'pointer' }}>
                <Upload size={15} />
                <span>Import JSON</span>
                <input type="file" accept=".json" onChange={handleImportBackup} style={{ display: 'none' }} />
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ef4444' }}>Restore Sample Screenshots State</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Reset to the original 3 projects, 28 tasks, and 9 files from the showcase</div>
              </div>
              <button
                className="top-action-btn"
                style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                onClick={resetToDefaultData}
              >
                <RotateCcw size={15} />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* About App */}
        <div className="dash-panel-card" style={{ background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={20} color="#2563eb" />
            <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>About ToDo Planner</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6 }}>
            Version 3.0.0 Pro • Windows Desktop Experience • Powered by high-efficiency local state with Zero-latency offline caching.
          </div>
        </div>
      </div>
    </div>
  );
}
