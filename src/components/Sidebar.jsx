import React, { useState } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Sun,
  CalendarDays,
  ListTodo,
  FileText,
  Files,
  GitCommitHorizontal,
  Network,
  BarChart2,
  Settings,
  ChevronDown,
  ChevronRight,
  Minimize2,
  Maximize2,
  Folder
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';

export default function Sidebar() {
  const {
    activeView,
    setActiveView,
    activeProject,
    projects,
    activeProjectId,
    setActiveProjectId,
    isCompactMode,
    setIsCompactMode,
    stats
  } = usePlanner();

  const [isProjectAccordionOpen, setIsProjectAccordionOpen] = useState(true);

  const handleNavClick = (view) => {
    setActiveView(view);
  };

  const handleProjectSubItemClick = (view) => {
    setActiveView(view);
  };

  // Truncate active project name for accordion header
  const truncatedProjectName = activeProject ? activeProject.name : 'Project';

  return (
    <aside className={`sidebar ${isCompactMode ? 'compact' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-icon">
          <ListTodo size={22} strokeWidth={2.5} />
        </div>
        {!isCompactMode && (
          <div className="brand-text">
            <div className="brand-title">
              ToDo <span>Planner</span>
            </div>
            <div className="brand-subtitle">Project & task planner</div>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <div className="sidebar-content">
        {/* Main Sections */}
        <button
          className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleNavClick('dashboard')}
          title="Dashboard"
        >
          <div className="nav-item-icon">
            <LayoutDashboard size={18} />
          </div>
          {!isCompactMode && <span>Dashboard</span>}
        </button>

        <button
          className={`nav-item ${activeView === 'projects' ? 'active' : ''}`}
          onClick={() => handleNavClick('projects')}
          title="Projects"
        >
          <div className="nav-item-icon">
            <FolderKanban size={18} />
          </div>
          {!isCompactMode && <span>Projects</span>}
          {!isCompactMode && stats.totalProjects > 0 && (
            <span className="nav-badge">{stats.totalProjects}</span>
          )}
        </button>

        <button
          className={`nav-item ${activeView === 'my-day' ? 'active' : ''}`}
          onClick={() => handleNavClick('my-day')}
          title="My day & Focus"
        >
          <div className="nav-item-icon">
            <Sun size={18} />
          </div>
          {!isCompactMode && <span>My day</span>}
          {!isCompactMode && stats.dueToday > 0 && (
            <span className="nav-badge" style={{ background: '#f59e0b' }}>{stats.dueToday}</span>
          )}
        </button>

        <button
          className={`nav-item ${activeView === 'calendar' ? 'active' : ''}`}
          onClick={() => handleNavClick('calendar')}
          title="Calendar"
        >
          <div className="nav-item-icon">
            <CalendarDays size={18} />
          </div>
          {!isCompactMode && <span>Calendar</span>}
        </button>

        {/* Active Project Sub-navigation (matching Screenshots) */}
        {!isCompactMode ? (
          <div className="project-submenu">
            <div
              className="project-accordion-header"
              onClick={() => setIsProjectAccordionOpen(!isProjectAccordionOpen)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Folder size={16} color="#60a5fa" />
                <span className="project-name-truncated" title={activeProject.name}>
                  {truncatedProjectName}
                </span>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
              </div>
              {isProjectAccordionOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>

            {isProjectAccordionOpen && (
              <div className="project-subitems">
                <div
                  className={`sub-item ${activeView === 'tasks' ? 'active' : ''}`}
                  onClick={() => handleProjectSubItemClick('tasks')}
                >
                  <ListTodo size={15} />
                  <span>Tasks</span>
                </div>

                <div
                  className={`sub-item ${activeView === 'notes' ? 'active' : ''}`}
                  onClick={() => handleProjectSubItemClick('notes')}
                >
                  <FileText size={15} />
                  <span>Notes</span>
                </div>

                <div
                  className={`sub-item ${activeView === 'files' ? 'active' : ''}`}
                  onClick={() => handleProjectSubItemClick('files')}
                >
                  <Files size={15} />
                  <span>Files</span>
                </div>

                <div
                  className={`sub-item ${activeView === 'timeline' ? 'active' : ''}`}
                  onClick={() => handleProjectSubItemClick('timeline')}
                >
                  <GitCommitHorizontal size={15} />
                  <span>Timeline</span>
                </div>

                <div
                  className={`sub-item ${activeView === 'mindmap' ? 'active' : ''}`}
                  onClick={() => handleProjectSubItemClick('mindmap')}
                >
                  <Network size={15} />
                  <span>Mind map</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <button
              className={`nav-item ${activeView === 'tasks' ? 'active' : ''}`}
              onClick={() => handleProjectSubItemClick('tasks')}
              title="Tasks"
            >
              <div className="nav-item-icon"><ListTodo size={18} /></div>
            </button>
            <button
              className={`nav-item ${activeView === 'files' ? 'active' : ''}`}
              onClick={() => handleProjectSubItemClick('files')}
              title="Files"
            >
              <div className="nav-item-icon"><Files size={18} /></div>
            </button>
            <button
              className={`nav-item ${activeView === 'notes' ? 'active' : ''}`}
              onClick={() => handleProjectSubItemClick('notes')}
              title="Notes"
            >
              <div className="nav-item-icon"><FileText size={18} /></div>
            </button>
            <button
              className={`nav-item ${activeView === 'timeline' ? 'active' : ''}`}
              onClick={() => handleProjectSubItemClick('timeline')}
              title="Timeline"
            >
              <div className="nav-item-icon"><GitCommitHorizontal size={18} /></div>
            </button>
            <button
              className={`nav-item ${activeView === 'mindmap' ? 'active' : ''}`}
              onClick={() => handleProjectSubItemClick('mindmap')}
              title="Mind map"
            >
              <div className="nav-item-icon"><Network size={18} /></div>
            </button>
          </>
        )}

        {/* System Section */}
        {!isCompactMode && <div className="sidebar-section-title">SYSTEM</div>}

        <button
          className={`nav-item ${activeView === 'statistics' ? 'active' : ''}`}
          onClick={() => handleNavClick('statistics')}
          title="Statistics"
        >
          <div className="nav-item-icon">
            <BarChart2 size={18} />
          </div>
          {!isCompactMode && <span>Statistics</span>}
        </button>

        <button
          className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
          onClick={() => handleNavClick('settings')}
          title="Settings"
        >
          <div className="nav-item-icon">
            <Settings size={18} />
          </div>
          {!isCompactMode && <span>Settings</span>}
        </button>
      </div>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <button
          className="compact-toggle-btn"
          onClick={() => setIsCompactMode(!isCompactMode)}
          title={isCompactMode ? "Expand sidebar" : "Compact mode"}
        >
          {isCompactMode ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          {!isCompactMode && <span>Compact mode</span>}
        </button>

        {!isCompactMode && (
          <div className="app-meta-info">
            <div><strong>Version 3.0.0</strong></div>
            <div>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div>{new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
            <div style={{ marginTop: 4, color: '#475569' }}>© CoreFlow</div>
          </div>
        )}
      </div>
    </aside>
  );
}
