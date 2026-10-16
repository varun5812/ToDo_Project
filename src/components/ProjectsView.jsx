import React, { useState } from 'react';
import {
  Folder,
  ClipboardCheck,
  GraduationCap,
  Pin,
  Edit2,
  Copy,
  Trash2,
  Calendar,
  Search,
  Archive,
  Plus,
  Lightbulb,
  X,
  Sparkles
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';

export default function ProjectsView() {
  const {
    projects,
    tasks,
    notes,
    setActiveProjectId,
    setActiveView,
    togglePinProject,
    toggleArchiveProject,
    deleteProject,
    setIsNewProjectModalOpen
  } = usePlanner();

  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showTip, setShowTip] = useState(true);

  // Filter projects
  const filteredProjects = projects.filter(p => {
    const matchesArchived = showArchived ? p.isArchived : !p.isArchived;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesArchived && matchesSearch;
  });

  const openProjectsCount = projects.filter(p => !p.isArchived).length;
  const archivedProjectsCount = projects.filter(p => p.isArchived).length;

  const handleOpenProject = (id) => {
    setActiveProjectId(id);
    setActiveView('tasks');
  };

  // Render project icon
  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'ClipboardCheck':
        return <ClipboardCheck size={22} color="#ffffff" />;
      case 'GraduationCap':
        return <GraduationCap size={22} color="#ffffff" />;
      default:
        return <Folder size={22} color="#ffffff" />;
    }
  };

  return (
    <div className="view-container">
      <div className="projects-content-wrapper">
        {/* Top Header Row matching Screenshot 2 */}
        <div className="projects-header-row">
          <div className="projects-title-group">
            <h1>Projects</h1>
            <p>Every project you are working on</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <span className="pill-count-badge">
                <Folder size={13} />
                <span>{openProjectsCount} open</span>
              </span>
              <span className="pill-count-badge">
                <Archive size={13} />
                <span>{archivedProjectsCount} archived</span>
              </span>
            </div>
          </div>

          <div className="projects-top-actions">
            {/* Search Box */}
            <div className="search-input-wrapper" style={{ maxWidth: 280 }}>
              <Search size={15} className="search-input-icon" />
              <input
                type="text"
                placeholder="Search a project..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Archived Filter Button */}
            <button
              className={`top-action-btn ${showArchived ? 'active' : ''}`}
              style={{
                background: showArchived ? '#e2e8f0' : '#ffffff',
                fontWeight: 600,
                padding: '8px 14px'
              }}
              onClick={() => setShowArchived(!showArchived)}
            >
              <Archive size={15} />
              <span>Archived</span>
            </button>

            {/* + New Project Button */}
            <button
              className="hero-btn-primary"
              style={{
                background: '#2563eb',
                color: '#ffffff',
                padding: '8px 18px',
                borderRadius: 'var(--radius-md)'
              }}
              onClick={() => setIsNewProjectModalOpen(true)}
            >
              <Plus size={16} />
              <span>New project</span>
            </button>
          </div>
        </div>

        {/* Cyan Tip Alert Banner matching Screenshot 2 */}
        {showTip && (
          <div className="tip-banner">
            <div className="tip-banner-left">
              <div className="tip-banner-icon">
                <Lightbulb size={16} />
              </div>
              <div>
                <strong>Projects</strong> — Each card is a project. Open one to work on its tasks, notes, timeline and mind map. Archive the ones you are done with instead of deleting them.
              </div>
            </div>
            <button
              style={{ background: 'transparent', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 4 }}
              onClick={() => setShowTip(false)}
              title="Dismiss tip"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Project Cards Grid matching Screenshot 2 */}
        <div className="projects-grid">
          {filteredProjects.map((project) => {
            const pTasks = tasks.filter(t => t.projectId === project.id);
            const pDone = pTasks.filter(t => t.status === 'Done').length;
            const pOpen = pTasks.filter(t => t.status !== 'Done').length;
            const pNotes = notes.filter(n => n.projectId === project.id).length;
            const pProgress = pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0;

            return (
              <div
                key={project.id}
                className="project-card"
                style={{ background: project.gradient || project.color }}
              >
                {/* Header: Icon + Action Buttons */}
                <div className="project-card-header">
                  <div className="project-card-icon-box">
                    {renderIcon(project.icon)}
                  </div>

                  <div className="project-card-actions">
                    <button
                      className="project-icon-btn"
                      onClick={() => togglePinProject(project.id)}
                      title={project.isPinned ? "Unpin project" : "Pin project"}
                      style={{ opacity: project.isPinned ? 1 : 0.7 }}
                    >
                      <Pin size={15} style={{ fill: project.isPinned ? '#ffffff' : 'none' }} />
                    </button>

                    <button
                      className="project-icon-btn"
                      onClick={() => toggleArchiveProject(project.id)}
                      title={project.isArchived ? "Unarchive project" : "Archive project"}
                    >
                      <Archive size={15} />
                    </button>

                    <button
                      className="project-icon-btn"
                      onClick={() => deleteProject(project.id)}
                      title="Delete project"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Project Title */}
                <div
                  className="project-card-name"
                  onClick={() => handleOpenProject(project.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {project.name}
                </div>

                {/* Stats Row: 28 tasks, 19 open, 0 notes */}
                <div className="project-card-stats">
                  <div className="project-stat-pill">
                    <span className="project-stat-pill-num">{pTasks.length}</span>
                    <span className="project-stat-pill-lbl">tasks</span>
                  </div>

                  <div className="project-stat-pill">
                    <span className="project-stat-pill-num">{pOpen}</span>
                    <span className="project-stat-pill-lbl">open</span>
                  </div>

                  <div className="project-stat-pill">
                    <span className="project-stat-pill-num">{pNotes}</span>
                    <span className="project-stat-pill-lbl">notes</span>
                  </div>
                </div>

                {/* Progress bar matching Screenshot 2 */}
                <div className="project-card-progress">
                  <div className="project-card-progress-labels">
                    <span>Progress</span>
                    <span>{pProgress}%</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${pProgress}%` }}
                    />
                  </div>
                </div>

                {/* Footer: Date + OPEN button */}
                <div className="project-card-footer">
                  <div className="project-card-date">
                    <Calendar size={14} />
                    <span>{project.createdDate || '05 sept.'}</span>
                  </div>

                  <button
                    className="project-open-btn"
                    onClick={() => handleOpenProject(project.id)}
                  >
                    OPEN
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
