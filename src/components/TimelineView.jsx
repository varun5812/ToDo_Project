import React, { useState } from 'react';
import {
  Folder,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Sparkles
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';

export default function TimelineView() {
  const { activeProject, projectTasks } = usePlanner();

  const [zoomLevel, setZoomLevel] = useState('days'); // 'days' | 'weeks'

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const monthShort = today.toLocaleDateString('en-US', { month: 'short' });
  const daysInCurMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Generate timeline columns for current month
  const days = Array.from({ length: Math.min(daysInCurMonth, 28) }).map((_, i) => {
    const day = i + 1;
    const dateObj = new Date(currentYear, currentMonth, day);
    const dateStr = dateObj.toISOString().slice(0, 10);
    const dayOfWeek = dateObj.getDay();
    return {
      day,
      dateStr,
      label: `${day} ${monthShort}`,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6
    };
  });

  return (
    <div className="view-container">
      {/* Blue Hero Banner */}
      <div className="project-hero-banner">
        <div className="project-hero-top">
          <div className="project-hero-title-group">
            <div className="project-hero-icon-box">
              <Folder size={24} color="#ffffff" />
            </div>
            <div>
              <div className="project-hero-subtitle">
                <span>📈 Timeline &amp; Gantt</span>
                <span>Project schedule and delivery milestones</span>
              </div>
              <h1 className="project-hero-title">{activeProject.name}</h1>
            </div>
          </div>

          <div className="project-hero-right">
            <div className="hero-actions-row">
              <button
                className="hero-btn-secondary"
                onClick={() => setZoomLevel(zoomLevel === 'days' ? 'weeks' : 'days')}
              >
                <span>Scale: {zoomLevel.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gantt / Timeline Matrix */}
      <div style={{ padding: '24px 32px 80px', flex: 1, overflowX: 'auto' }}>
        <div style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', boxShadow: var_shadow_sm, minWidth: 1000, overflow: 'hidden' }}>
          {/* Header Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '280px repeat(24, 1fr)', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <div style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.8rem', color: '#64748b' }}>
              Task
            </div>
            {days.map(d => (
              <div
                key={d.day}
                style={{
                  padding: '8px 2px',
                  textAlign: 'center',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  color: d.isWeekend ? '#94a3b8' : '#334155',
                  background: d.isWeekend ? '#f1f5f9' : 'transparent',
                  borderLeft: '1px solid #f1f5f9'
                }}
              >
                <div>{d.day}</div>
                <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Sep</div>
              </div>
            ))}
          </div>

          {/* Task Timeline Rows */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {projectTasks.slice(0, 14).map((task, idx) => {
              // Calculate rough Gantt bar start column & span based on task id & due date
              const dueDay = task.dueDate ? parseInt(task.dueDate.split('-')[2], 10) : (5 + (idx % 12));
              const startDay = Math.max(1, dueDay - (3 + (idx % 4)));
              const colSpan = Math.max(2, dueDay - startDay + 1);

              const barColor = task.status === 'Done'
                ? '#10b981'
                : task.status === 'In progress'
                ? '#2563eb'
                : '#94a3b8';

              return (
                <div
                  key={task.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '280px repeat(24, 1fr)',
                    borderBottom: '1px solid #f1f5f9',
                    height: 44,
                    alignItems: 'center'
                  }}
                >
                  {/* Task Title */}
                  <div style={{ padding: '0 16px', fontSize: '0.82rem', fontWeight: 500, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={task.title}>
                    {task.title}
                  </div>

                  {/* 24 Date Grid Cells with Relative Gantt Bar */}
                  <div style={{ gridColumn: '2 / span 24', position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
                    {/* Column guide lines */}
                    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', pointerEvents: 'none' }}>
                      {days.map(d => (
                        <div key={d.day} style={{ borderLeft: '1px solid #f8fafc', background: d.isWeekend ? 'rgba(241, 245, 249, 0.4)' : 'transparent' }} />
                      ))}
                    </div>

                    {/* Gantt Bar */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${((startDay - 1) / 24) * 100}%`,
                        width: `${(colSpan / 24) * 100}%`,
                        height: 24,
                        borderRadius: 6,
                        backgroundColor: barColor,
                        color: '#ffffff',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        zIndex: 2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={`${task.title} (${task.status})`}
                    >
                      {task.status} • {task.formattedDue}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const var_shadow_sm = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
