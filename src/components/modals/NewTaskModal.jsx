import React, { useState } from 'react';
import { X, Plus, Calendar, Tag } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';

export default function NewTaskModal() {
  const { isNewTaskModalOpen, setIsNewTaskModalOpen, addTask, activeProject, projects, todayStr } = usePlanner();

  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(activeProject ? activeProject.id : '');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('To do');
  const [dueDate, setDueDate] = useState(todayStr);
  const [tagInput, setTagInput] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);

  if (!isNewTaskModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title,
      projectId,
      priority,
      status,
      dueDate,
      estimatedMinutes: Number(estimatedMinutes) || 60,
      tags: tagInput ? tagInput.split(',').map(t => t.trim()).filter(Boolean) : ['Task']
    });

    setTitle('');
    setTagInput('');
    setIsNewTaskModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsNewTaskModalOpen(false)}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Add New Task</h2>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setIsNewTaskModalOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                Task Title
              </label>
              <input
                type="text"
                className="search-input"
                placeholder="What needs to get done?"
                autoFocus
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Project
                </label>
                <select
                  className="filter-select"
                  style={{ width: '100%' }}
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Priority
                </label>
                <select
                  className="filter-select"
                  style={{ width: '100%' }}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Due Date
                </label>
                <input
                  type="date"
                  className="search-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Estimated Minutes
                </label>
                <input
                  type="number"
                  className="search-input"
                  min="5"
                  step="5"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                Tags (comma separated)
              </label>
              <input
                type="text"
                className="search-input"
                placeholder="e.g. Objectives, Robotics, Lean"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="reset-filter-btn" onClick={() => setIsNewTaskModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="quick-add-btn">
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
