import React, { useState } from 'react';
import { X, Folder, Palette } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';

export default function NewProjectModal() {
  const { isNewProjectModalOpen, setIsNewProjectModalOpen, addProject } = usePlanner();

  const [name, setName] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Folder');

  if (!isNewProjectModalOpen) return null;

  const colorOptions = [
    { label: 'Royal Blue', color: '#1d4ed8' },
    { label: 'Crimson Berry', color: '#be123c' },
    { label: 'Emerald Teal', color: '#059669' },
    { label: 'Purple Indigo', color: '#7c3aed' },
    { label: 'Amber Orange', color: '#ea580c' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    addProject({
      name,
      color,
      icon,
      description
    });

    setName('');
    setDescription('');
    setIsNewProjectModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsNewProjectModalOpen(false)}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Create New Project</h2>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setIsNewProjectModalOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                Project Name
              </label>
              <input
                type="text"
                className="search-input"
                placeholder="e.g. Supply Chain Digitalization..."
                autoFocus
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                Theme Color
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                {colorOptions.map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: c.color,
                      border: color === c.color ? '3px solid #0f172a' : '2px solid transparent',
                      cursor: 'pointer'
                    }}
                    title={c.label}
                    onClick={() => setColor(c.color)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                Description &amp; Objectives
              </label>
              <textarea
                className="search-input"
                placeholder="Briefly describe the deliverables..."
                style={{ minHeight: 80, resize: 'vertical' }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="reset-filter-btn" onClick={() => setIsNewProjectModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="quick-add-btn">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
