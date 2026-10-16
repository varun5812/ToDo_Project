import React, { useState } from 'react';
import {
  Folder,
  FileDown,
  FileSpreadsheet,
  Settings2,
  Plus,
  Search,
  Star,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';

export default function TasksView() {
  const {
    activeProject,
    projectTasks,
    addTask,
    updateTask,
    toggleTaskStatus,
    setTaskStatus,
    toggleStarTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    exportTasksToCSV,
    setIsPdfExportOpen,
    setIsNewTaskModalOpen,
    setIsAiAssistantOpen,
    todayStr
  } = usePlanner();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');
  const [starredOnly, setStarredOnly] = useState(false);

  // Quick Add State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickStatus, setQuickStatus] = useState('To do');
  const [quickPriority, setQuickPriority] = useState('Medium');
  const [quickTag, setQuickTag] = useState('');

  // Expanded subtasks state (taskId -> boolean)
  const [expandedTasks, setExpandedTasks] = useState({ 'task-1': true });

  // Compute stats for current project
  const totalCount = projectTasks.length;
  const todoCount = projectTasks.filter(t => t.status === 'To do').length;
  const inProgressCount = projectTasks.filter(t => t.status === 'In progress').length;
  const doneCount = projectTasks.filter(t => t.status === 'Done').length;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Extract unique tags across project tasks
  const allTags = Array.from(new Set(projectTasks.flatMap(t => t.tags || [])));

  // Filter tasks
  const filteredTasks = projectTasks.filter(task => {
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'All' && task.status !== statusFilter) {
      return false;
    }
    if (priorityFilter !== 'All' && task.priority !== priorityFilter) {
      return false;
    }
    if (tagFilter !== 'All' && !(task.tags || []).includes(tagFilter)) {
      return false;
    }
    if (starredOnly && !task.isStarred) {
      return false;
    }
    return true;
  });

  const handleQuickAddSubmit = (e) => {
    if (e) e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle,
      status: quickStatus,
      priority: quickPriority,
      tags: quickTag ? [quickTag] : ['General'],
      dueDate: todayStr
    });

    setQuickTitle('');
    setQuickTag('');
  };

  const toggleSubtaskAccordion = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setTagFilter('All');
    setStarredOnly(false);
  };

  return (
    <div className="view-container">
      {/* Top Hero Banner matching Screenshot 4 */}
      <div className="project-hero-banner">
        <div className="project-hero-top">
          <div className="project-hero-title-group">
            <div className="project-hero-icon-box">
              <Folder size={24} color="#ffffff" />
            </div>
            <div>
              <div className="project-hero-subtitle">
                <span>☑ Tasks</span>
                <span>Everything to do in this project</span>
              </div>
              <h1 className="project-hero-title">{activeProject.name}</h1>
            </div>
          </div>

          <div className="project-hero-right">
            {/* Stats row: 28 total, 7 To do, 12 in progress, 9 Done */}
            <div className="hero-stats-row">
              <div className="hero-stat-pill">
                <span className="hero-stat-pill-val">{totalCount}</span>
                <span className="hero-stat-pill-lbl">total</span>
              </div>
              <div className="hero-stat-pill">
                <span className="hero-stat-pill-val" style={{ color: '#cbd5e1' }}>{todoCount}</span>
                <span className="hero-stat-pill-lbl">To do</span>
              </div>
              <div className="hero-stat-pill">
                <span className="hero-stat-pill-val" style={{ color: '#60a5fa' }}>{inProgressCount}</span>
                <span className="hero-stat-pill-lbl">In progress</span>
              </div>
              <div className="hero-stat-pill">
                <span className="hero-stat-pill-val" style={{ color: '#34d399' }}>{doneCount}</span>
                <span className="hero-stat-pill-lbl">Done</span>
              </div>
            </div>

            {/* Action buttons matching Screenshot 4 */}
            <div className="hero-actions-row">
              <button
                className="hero-btn-secondary"
                onClick={() => setIsPdfExportOpen(true)}
                title="Export as PDF"
              >
                <FileDown size={15} />
                <span>Export as PDF</span>
              </button>

              <button
                className="hero-btn-secondary"
                onClick={exportTasksToCSV}
                title="Export as Excel / CSV"
              >
                <FileSpreadsheet size={15} />
                <span>Export as Excel</span>
              </button>

              <button
                className="hero-btn-secondary"
                onClick={() => setIsAiAssistantOpen(true)}
                title="AI Task Breakdown"
              >
                <Sparkles size={15} color="#60a5fa" />
                <span>AI Assist</span>
              </button>

              <button
                className="hero-btn-primary"
                onClick={() => setIsNewTaskModalOpen(true)}
                title="Add new task"
              >
                <Plus size={16} />
                <span>New task</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Bottom Progress Bar */}
        <div className="hero-progress-line">
          <div
            className="hero-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filter & Search Toolbar matching Screenshot 4 */}
      <div className="filter-toolbar">
        <div className="search-input-wrapper">
          <Search size={15} className="search-input-icon" />
          <input
            type="text"
            placeholder="Search a task..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls-group">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Status: All</option>
            <option value="To do">Status: To do</option>
            <option value="In progress">Status: In progress</option>
            <option value="Done">Status: Done</option>
          </select>

          <select
            className="filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="All">Priority: All</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>

          <select
            className="filter-select"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          >
            <option value="All">Tag: All</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          <button
            className={`star-filter-btn ${starredOnly ? 'active' : ''}`}
            onClick={() => setStarredOnly(!starredOnly)}
            title="Filter by favorite tasks"
          >
            <Star size={16} style={{ fill: starredOnly ? '#f59e0b' : 'none' }} />
          </button>

          <button
            className="reset-filter-btn"
            onClick={handleResetFilters}
            title="Reset filters"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Tasks Table List matching Screenshot 4 */}
      <div className="tasks-content-wrapper">
        <div className="tasks-table-card">
          <div className="tasks-table-header">
            <span style={{ textAlign: 'center' }}>•</span>
            <span>Task</span>
            <span>Tags</span>
            <span>Priority</span>
            <span>Due</span>
            <span>Status</span>
            <span style={{ textAlign: 'center' }}>★</span>
            <span style={{ textAlign: 'center' }}>🗑</span>
          </div>

          <div className="tasks-table-body">
            {filteredTasks.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                No tasks match your criteria. Use the bar below to add a new task!
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isDone = task.status === 'Done';
                const isInProgress = task.status === 'In progress';
                const isLate = task.dueDate && task.dueDate < '2026-09-05' && !isDone;
                const hasSubtasks = (task.subtasks || []).length > 0;
                const isExpanded = expandedTasks[task.id];

                return (
                  <React.Fragment key={task.id}>
                    <div className={`task-row ${isDone ? 'done-row' : ''}`}>
                      {/* Status Dot */}
                      <button
                        className="status-indicator-btn"
                        onClick={() => toggleTaskStatus(task.id)}
                        title={`Click to cycle status (current: ${task.status})`}
                      >
                        <div
                          className={`status-dot ${
                            isDone ? 'done' : isInProgress ? 'in-progress' : 'todo'
                          }`}
                        />
                      </button>

                      {/* Title & Subtasks trigger */}
                      <div className="task-title-cell">
                        {hasSubtasks ? (
                          <button
                            className="subtask-toggle-btn"
                            onClick={() => toggleSubtaskAccordion(task.id)}
                            title={isExpanded ? "Collapse subtasks" : "Expand subtasks"}
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                        ) : (
                          <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>&gt;</span>
                        )}
                        <span className="task-title-text" title={task.title}>
                          {task.title}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="task-tags-cell">
                        {(task.tags || []).slice(0, 2).map((t, idx) => (
                          <span key={idx} className="task-tag-badge">{t}</span>
                        ))}
                      </div>

                      {/* Priority */}
                      <div>
                        <span className={`priority-pill ${task.priority}`}>
                          — {task.priority}
                        </span>
                      </div>

                      {/* Due Date */}
                      <div className={`task-due-cell ${isLate ? 'is-late' : ''}`}>
                        {task.formattedDue || '—'}
                      </div>

                      {/* Status Pill */}
                      <div>
                        <select
                          className={`status-pill ${task.status.replace(/\s+/g, '-')}`}
                          value={task.status}
                          onChange={(e) => setTaskStatus(task.id, e.target.value)}
                        >
                          <option value="To do">To do</option>
                          <option value="In progress">In progress</option>
                          <option value="Done">Done</option>
                        </select>
                      </div>

                      {/* Star */}
                      <button
                        className={`row-action-btn ${task.isStarred ? 'starred' : ''}`}
                        onClick={() => toggleStarTask(task.id)}
                        title={task.isStarred ? "Remove from starred" : "Star task"}
                      >
                        <Star size={15} style={{ fill: task.isStarred ? '#f59e0b' : 'none' }} />
                      </button>

                      {/* Delete */}
                      <button
                        className="row-action-btn delete-hover"
                        onClick={() => deleteTask(task.id)}
                        title="Delete task"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Subtasks Accordion Row */}
                    {hasSubtasks && isExpanded && (
                      <div style={{ background: '#f8fafc', padding: '8px 16px 12px 64px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {task.subtasks.map((sub) => (
                            <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem' }}>
                              <input
                                type="checkbox"
                                checked={sub.completed}
                                onChange={() => toggleSubtask(task.id, sub.id)}
                                style={{ cursor: 'pointer', accentColor: '#2563eb' }}
                              />
                              <span style={{ textDecoration: sub.completed ? 'line-through' : 'none', color: sub.completed ? '#94a3b8' : '#334155' }}>
                                {sub.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Quick-Add Bar pinned to bottom matching Screenshot 4 */}
      <form className="quick-add-bar" onSubmit={handleQuickAddSubmit}>
        <div style={{ color: '#2563eb', display: 'flex', alignItems: 'center' }}>
          <Plus size={20} />
        </div>
        <input
          type="text"
          className="quick-add-input"
          placeholder="Add a task and press Enter..."
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
        />

        <select
          className="quick-add-select"
          value={quickStatus}
          onChange={(e) => setQuickStatus(e.target.value)}
        >
          <option value="To do">To do</option>
          <option value="In progress">In progress</option>
          <option value="Done">Done</option>
        </select>

        <select
          className="quick-add-select"
          value={quickPriority}
          onChange={(e) => setQuickPriority(e.target.value)}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>

        <input
          type="text"
          className="quick-add-select"
          style={{ width: 120 }}
          placeholder="+ Add a tag"
          value={quickTag}
          onChange={(e) => setQuickTag(e.target.value)}
        />

        <button type="submit" className="quick-add-btn">
          Add task
        </button>
      </form>
    </div>
  );
}
