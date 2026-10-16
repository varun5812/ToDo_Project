import React, { useState, useEffect } from 'react';
import {
  Search,
  Folder,
  ListTodo,
  FileText,
  Calendar,
  LayoutDashboard,
  Sun,
  X,
  Plus
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';

export default function CommandPaletteModal() {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    projects,
    tasks,
    setActiveView,
    setActiveProjectId,
    setIsNewTaskModalOpen,
    setIsNewProjectModalOpen
  } = usePlanner();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  // Filter tasks & projects
  const matchedTasks = tasks
    .filter(t => t.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  const matchedProjects = projects
    .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3);

  const navigateTo = (view, projectId = null) => {
    if (projectId) setActiveProjectId(projectId);
    setActiveView(view);
    setIsCommandPaletteOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsCommandPaletteOpen(false)}>
      <div
        className="modal-dialog"
        style={{ maxWidth: 600 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #e2e8f0', gap: 10 }}>
          <Search size={18} color="#64748b" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, task title, or project name..."
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.95rem', color: '#1e293b' }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            onClick={() => setIsCommandPaletteOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ maxHeight: 360, overflowY: 'auto', padding: '8px' }}>
          {/* Quick Actions */}
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '6px 12px' }}>
            Quick Actions
          </div>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            onClick={() => {
              setIsCommandPaletteOpen(false);
              setIsNewTaskModalOpen(true);
            }}
          >
            <Plus size={16} color="#2563eb" />
            <span>Create new task</span>
          </div>

          <div
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            onClick={() => {
              setIsCommandPaletteOpen(false);
              setIsNewProjectModalOpen(true);
            }}
          >
            <Plus size={16} color="#10b981" />
            <span>Create new project</span>
          </div>

          {/* Views */}
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '10px 12px 6px' }}>
            Navigation
          </div>
          {[
            { label: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
            { label: 'My Day (Focus Mode)', view: 'my-day', icon: Sun },
            { label: 'Projects List', view: 'projects', icon: Folder },
            { label: 'Calendar Planner', view: 'calendar', icon: Calendar }
          ].map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.view}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={() => navigateTo(item.view)}
              >
                <Icon size={15} color="#64748b" />
                <span>Jump to {item.label}</span>
              </div>
            );
          })}

          {/* Matched Projects */}
          {matchedProjects.length > 0 && (
            <>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '10px 12px 6px' }}>
                Projects
              </div>
              {matchedProjects.map(p => (
                <div
                  key={p.id}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  onClick={() => navigateTo('tasks', p.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: p.color }} />
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Open tasks</span>
                </div>
              ))}
            </>
          )}

          {/* Matched Tasks */}
          {matchedTasks.length > 0 && (
            <>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '10px 12px 6px' }}>
                Tasks
              </div>
              {matchedTasks.map(t => (
                <div
                  key={t.id}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  onClick={() => navigateTo('tasks', t.projectId)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ListTodo size={14} color="#2563eb" />
                    <span>{t.title}</span>
                  </div>
                  <span className={`priority-pill ${t.priority}`} style={{ fontSize: '0.65rem' }}>
                    {t.priority}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
