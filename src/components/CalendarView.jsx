import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';

export default function CalendarView() {
  const { tasks, activeProject, addTask, toggleTaskStatus } = usePlanner();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.toISOString().slice(0, 10));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days in month calculation
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Format date key: YYYY-MM-DD
  const formatDateKey = (dayNum) => {
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    return `${currentYear}-${mm}-${dd}`;
  };

  // Tasks for selected day
  const selectedDayTasks = tasks.filter(t => t.dueDate === selectedDay);

  return (
    <div className="view-container">
      <div className="calendar-wrapper">
        {/* Calendar Navigation Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700 }}>
              {monthNames[currentMonth]} {currentYear}
            </h1>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="top-action-btn" onClick={handlePrevMonth}>
                <ChevronLeft size={16} />
              </button>
              <button className="top-action-btn" onClick={handleNextMonth}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>
              Showing all scheduled deadlines
            </span>
          </div>
        </div>

        {/* 2-Column Layout: Month Grid + Day Agenda Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          {/* Month Grid */}
          <div className="calendar-grid">
            {/* Days of week header */}
            {daysOfWeek.map((day, idx) => (
              <div key={idx} className="calendar-day-header">
                {day}
              </div>
            ))}

            {/* Empty slots for start offset */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`empty-${idx}`} className="calendar-day-cell" style={{ background: '#f8fafc', opacity: 0.5 }} />
            ))}

            {/* Days in month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateKey = formatDateKey(dayNum);
              const dayTasks = tasks.filter(t => t.dueDate === dateKey);
              const isToday = dateKey === '2026-09-05';
              const isSelected = selectedDay === dateKey;

              return (
                <div
                  key={dayNum}
                  className={`calendar-day-cell ${isToday ? 'is-today' : ''}`}
                  style={{
                    cursor: 'pointer',
                    outline: isSelected ? '2px solid #2563eb' : 'none',
                    background: isSelected ? '#eff6ff' : undefined
                  }}
                  onClick={() => setSelectedDay(dateKey)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="day-number" style={{ color: isToday ? '#2563eb' : '#334155' }}>
                      {dayNum}
                    </span>
                    {dayTasks.length > 0 && (
                      <span style={{ fontSize: '0.65rem', background: '#e2e8f0', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task Chips */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4, overflow: 'hidden' }}>
                    {dayTasks.slice(0, 3).map(task => (
                      <div
                        key={task.id}
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 6px',
                          borderRadius: 4,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontWeight: 600,
                          backgroundColor: task.status === 'Done' ? '#d1fae5' : task.status === 'In progress' ? '#dbeafe' : '#f1f5f9',
                          color: task.status === 'Done' ? '#065f46' : task.status === 'In progress' ? '#1d4ed8' : '#475569'
                        }}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>
                        +{dayTasks.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Selected Day Agenda Panel */}
          <div className="dash-panel-card" style={{ height: 'fit-content' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Agenda for</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b' }}>
                  {selectedDay}
                </div>
              </div>
              <button
                className="hero-btn-primary"
                style={{ background: '#2563eb', color: '#ffffff', padding: '6px 12px', fontSize: '0.78rem' }}
                onClick={() => {
                  const title = prompt("New task for " + selectedDay);
                  if (title) addTask({ title, dueDate: selectedDay });
                }}
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              {selectedDayTasks.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  No tasks scheduled for this day. Click Add to schedule one!
                </div>
              ) : (
                selectedDayTasks.map(task => (
                  <div
                    key={task.id}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 'var(--radius-md)',
                      padding: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={task.status === 'Done'}
                        onChange={() => toggleTaskStatus(task.id)}
                        style={{ accentColor: '#2563eb', cursor: 'pointer' }}
                      />
                      <span
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 500,
                          textDecoration: task.status === 'Done' ? 'line-through' : 'none',
                          color: task.status === 'Done' ? '#94a3b8' : '#1e293b'
                        }}
                      >
                        {task.title}
                      </span>
                    </div>
                    <span className={`priority-pill ${task.priority}`} style={{ fontSize: '0.65rem' }}>
                      {task.priority}
                    </span>
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
