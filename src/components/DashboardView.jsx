import React from 'react';
import {
  Folder,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Plus
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';

export default function DashboardView() {
  const {
    projects,
    tasks,
    notes,
    files,
    stats,
    todayStr,
    finishedThisWeekData,
    setActiveView,
    setActiveProjectId,
    setIsAiAssistantOpen,
    setIsNewTaskModalOpen,
    setIsNewProjectModalOpen
  } = usePlanner();

  // Find the primary open project
  const featuredProject = projects.find(p => !p.isArchived) || projects[0];
  const featuredTasks = featuredProject ? tasks.filter(t => t.projectId === featuredProject.id) : [];
  const featuredDone = featuredTasks.filter(t => t.status === 'Done').length;
  const featuredLate = featuredTasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'Done').length;
  const featuredOpen = featuredTasks.filter(t => t.status !== 'Done').length;
  const featuredPct = featuredTasks.length > 0 ? Math.round((featuredDone / featuredTasks.length) * 100) : 0;

  // Next up tasks (due soon, not done)
  const nextUpTasks = tasks
    .filter(t => t.status !== 'Done' && (!t.dueDate || t.dueDate >= todayStr))
    .slice(0, 6);

  // Late tasks (overdue, not done)
  const lateTasks = tasks
    .filter(t => t.status !== 'Done' && t.dueDate && t.dueDate < todayStr)
    .slice(0, 5);

  const overallPct = stats.totalTasks > 0 ? Math.round((stats.doneTasks / stats.totalTasks) * 100) : 0;

  const handleOpenProject = (projId) => {
    setActiveProjectId(projId);
    setActiveView('tasks');
  };

  return (
    <div className="view-container">
      <div className="dashboard-content-wrapper">
        {/* Header Title */}
        <div className="dashboard-header-row">
          <div className="dashboard-title-group">
            <h1>Dashboard</h1>
            <p>Where all your projects and deliverables stand</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="hero-btn-primary"
              style={{
                background: '#2563eb',
                color: '#ffffff',
                padding: '9px 18px',
                borderRadius: '9999px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
              }}
              onClick={() => setIsNewTaskModalOpen(true)}
            >
              <Plus size={16} />
              <span>New Task</span>
            </button>

            <button
              className="hero-btn-secondary"
              style={{
                background: '#eff6ff',
                borderColor: '#bfdbfe',
                color: '#1d4ed8',
                borderRadius: '9999px',
                padding: '9px 16px'
              }}
              onClick={() => setIsAiAssistantOpen(true)}
            >
              <Sparkles size={16} color="#2563eb" />
              <span>AI Insights</span>
            </button>
          </div>
        </div>

        {/* 6 Top KPI Metric Cards */}
        <div className="kpi-cards-grid">
          <div className="kpi-card" onClick={() => setActiveView('projects')} style={{ cursor: 'pointer' }}>
            <span className="kpi-label">Projects</span>
            <span className="kpi-value">{stats.totalProjects}</span>
          </div>

          <div className="kpi-card" onClick={() => setActiveView('tasks')} style={{ cursor: 'pointer' }}>
            <span className="kpi-label">Open tasks</span>
            <span className="kpi-value">{stats.openTasks}</span>
          </div>

          <div className="kpi-card" onClick={() => setActiveView('my-day')} style={{ cursor: 'pointer' }}>
            <span className="kpi-label">Due today</span>
            <span className="kpi-value amber">{stats.dueToday}</span>
          </div>

          <div className="kpi-card" onClick={() => setActiveView('tasks')} style={{ cursor: 'pointer' }}>
            <span className="kpi-label">Late</span>
            <span className="kpi-value red">{stats.lateTasks}</span>
          </div>

          <div className="kpi-card" onClick={() => setActiveView('statistics')} style={{ cursor: 'pointer' }}>
            <span className="kpi-label">Done this week</span>
            <span className="kpi-value green">{stats.doneThisWeek}</span>
          </div>

          <div className="kpi-card" onClick={() => setActiveView('notes')} style={{ cursor: 'pointer' }}>
            <span className="kpi-label">Notes</span>
            <span className="kpi-value purple">{stats.totalNotes}</span>
          </div>
        </div>

        {/* Overall Progress Banner */}
        <div className="overall-progress-card">
          <div className="overall-progress-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="overall-progress-title">Overall</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2563eb' }}>
                {overallPct}%
              </span>
            </div>
            <span className="overall-progress-fraction">
              {stats.doneTasks} / {stats.totalTasks}
            </span>
          </div>
          <div className="progress-track" style={{ height: 8, background: '#e2e8f0' }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${overallPct}%`,
                background: 'linear-gradient(90deg, #2563eb 0%, #38bdf8 100%)'
              }}
            />
          </div>
        </div>

        {/* Middle Row: Open Project Hero Card + 7-Day Completed Bar Chart */}
        <div className="dashboard-middle-grid">
          {/* Left Hero Card */}
          {featuredProject ? (
            <div className="dashboard-hero-project-card" style={{ background: featuredProject.gradient || '#1d4ed8' }}>
              <div>
                <div className="hero-project-top">
                  <div className="hero-project-title-area">
                    <div className="project-hero-icon-box" style={{ width: 40, height: 40 }}>
                      <Folder size={20} color="#ffffff" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)' }}>
                        Active project
                      </div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
                        {featuredProject.name}
                      </div>
                    </div>
                  </div>

                  <div className="hero-project-badge">
                    {featuredDone}/{featuredTasks.length} ({featuredPct}%)
                  </div>
                </div>

                {/* 4 Stat Tiles */}
                <div className="hero-project-tiles-grid">
                  <div className="hero-project-tile">
                    <span className="hero-tile-num">{featuredOpen}</span>
                    <span className="hero-tile-lbl">open</span>
                  </div>
                  <div className="hero-project-tile">
                    <span className="hero-tile-num" style={{ color: '#fca5a5' }}>{featuredLate}</span>
                    <span className="hero-tile-lbl">late</span>
                  </div>
                  <div className="hero-project-tile">
                    <span className="hero-tile-num">{notes.filter(n => n.projectId === featuredProject.id).length}</span>
                    <span className="hero-tile-lbl">notes</span>
                  </div>
                  <div className="hero-project-tile">
                    <span className="hero-tile-num">{files.filter(f => f.projectId === featuredProject.id).length}</span>
                    <span className="hero-tile-lbl">files</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button
                  className="hero-btn-primary"
                  onClick={() => handleOpenProject(featuredProject.id)}
                >
                  <span>Go to project</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="dashboard-hero-project-card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>No Projects Yet</div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 16 }}>Create your first project to organize your tasks, files, and mind maps.</p>
              <button className="hero-btn-primary" onClick={() => setIsNewProjectModalOpen(true)}>
                + Create Project
              </button>
            </div>
          )}

          {/* Right Chart Card: Finished this week */}
          <div className="dashboard-chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Finished this week</div>
                <div className="chart-subtitle">Tasks completed over the last 7 days</div>
              </div>
              <span className="chart-stat-big">{stats.doneThisWeek}</span>
            </div>

            {/* Custom Dynamic Bar Chart */}
            <div className="bar-chart-container">
              {finishedThisWeekData.map((d, i) => {
                const maxVal = Math.max(3, ...finishedThisWeekData.map(item => item.count));
                const fillHeight = d.count > 0 ? (d.count / maxVal) * 70 : 4;
                return (
                  <div key={i} className="bar-col">
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          height: `${fillHeight}px`,
                          backgroundColor: d.count > 0 ? '#10b981' : '#e2e8f0'
                        }}
                      />
                    </div>
                    <span className="bar-day-lbl">{d.day}</span>
                    <span className="bar-date-lbl">{d.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom 3 Columns: Project Progress, Next Up, Late */}
        <div className="dashboard-bottom-grid">
          {/* Card 1: Project Progress */}
          <div className="dash-panel-card">
            <div className="dash-panel-title">Project progress</div>
            {projects.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                No active projects.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {projects.map((proj) => {
                  const pTasks = tasks.filter(t => t.projectId === proj.id);
                  const pDone = pTasks.filter(t => t.status === 'Done').length;
                  const pLate = pTasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'Done').length;
                  const pPct = pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0;

                  return (
                    <div
                      key={proj.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleOpenProject(proj.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 600 }}>
                          <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: proj.color }} />
                          <span>{proj.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {pLate > 0 && (
                            <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '0.7rem', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                              {pLate} late
                            </span>
                          )}
                          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                            {pDone}/{pTasks.length} ({pPct}%)
                          </span>
                        </div>
                      </div>
                      <div className="progress-track" style={{ height: 6, background: '#f1f5f9' }}>
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${pPct}%`, backgroundColor: proj.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 2: Next Up */}
          <div className="dash-panel-card">
            <div className="dash-panel-title">Next up</div>
            {nextUpTasks.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                No upcoming tasks. Add a task to get started!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {nextUpTasks.map((task) => {
                  const proj = projects.find(p => p.id === task.projectId);
                  return (
                    <div key={task.id} className="dash-list-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2563eb', flexShrink: 0 }} />
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {task.title}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            {proj ? proj.name : 'General'}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600, flexShrink: 0, paddingLeft: 8 }}>
                        {task.formattedDue || 'Soon'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 3: Late */}
          <div className="dash-panel-card">
            <div className="dash-panel-title" style={{ color: lateTasks.length > 0 ? '#ef4444' : '#1e293b' }}>
              {lateTasks.length > 0 ? 'Late' : 'On Track'}
            </div>
            {lateTasks.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                <CheckCircle2 size={24} color="#10b981" style={{ margin: '0 auto 6px' }} />
                <div>Zero overdue tasks. Everything is clean!</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {lateTasks.map((task) => (
                  <div key={task.id} className="dash-list-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444', flexShrink: 0 }} />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {task.title}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                          Production
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, flexShrink: 0, paddingLeft: 8 }}>
                      {task.formattedDue}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
