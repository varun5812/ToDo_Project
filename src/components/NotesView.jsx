import React, { useState } from 'react';
import {
  Folder,
  Plus,
  Search,
  Pin,
  Trash2,
  Calendar,
  Sparkles,
  Edit3
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';

export default function NotesView() {
  const {
    activeProject,
    notes,
    addNote,
    updateNote,
    deleteNote,
    togglePinNote
  } = usePlanner();

  const [searchTerm, setSearchTerm] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [currentNote, setCurrentNote] = useState({ title: '', content: '', color: '#fef08a', tags: ['General'] });

  const projectNotes = notes.filter(n => n.projectId === activeProject.id);

  const filteredNotes = projectNotes.filter(n =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveNote = () => {
    if (!currentNote.title.trim()) return;
    if (currentNote.id) {
      updateNote(currentNote.id, currentNote);
    } else {
      addNote(currentNote);
    }
    setIsEditingNote(false);
    setCurrentNote({ title: '', content: '', color: '#fef08a', tags: ['General'] });
  };

  const openNewNoteModal = () => {
    setCurrentNote({ title: '', content: '', color: '#fef08a', tags: ['General'] });
    setIsEditingNote(true);
  };

  const openEditNote = (note) => {
    setCurrentNote(note);
    setIsEditingNote(true);
  };

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
                <span>📝 Notes</span>
                <span>Ideas, meeting minutes, and project logs</span>
              </div>
              <h1 className="project-hero-title">{activeProject.name}</h1>
            </div>
          </div>

          <div className="project-hero-right">
            <div className="hero-stats-row">
              <div className="hero-stat-pill">
                <span className="hero-stat-pill-val">{projectNotes.length}</span>
                <span className="hero-stat-pill-lbl">notes</span>
              </div>
            </div>

            <div className="hero-actions-row">
              <button
                className="hero-btn-primary"
                onClick={openNewNoteModal}
              >
                <Plus size={16} />
                <span>New note</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="filter-toolbar">
        <div className="search-input-wrapper">
          <Search size={15} className="search-input-icon" />
          <input
            type="text"
            placeholder="Search notes..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Notes Grid matching Screenshot 1 */}
      <div className="notes-grid">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="note-card"
            style={{ backgroundColor: note.color }}
          >
            {/* Header: Pin and Delete */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {(note.tags || []).map((t, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      background: 'rgba(0,0,0,0.08)',
                      padding: '2px 8px',
                      borderRadius: '9999px'
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  className="row-action-btn"
                  onClick={() => togglePinNote(note.id)}
                  title={note.isPinned ? "Unpin" : "Pin"}
                >
                  <Pin size={14} style={{ fill: note.isPinned ? '#1e293b' : 'none' }} />
                </button>
                <button
                  className="row-action-btn"
                  onClick={() => openEditNote(note)}
                  title="Edit note"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  className="row-action-btn delete-hover"
                  onClick={() => deleteNote(note.id)}
                  title="Delete note"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Note Title */}
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
              {note.title}
            </h3>

            {/* Note Content */}
            <p style={{ fontSize: '0.85rem', color: '#334155', whiteSpace: 'pre-wrap', flex: 1 }}>
              {note.content}
            </p>

            {/* Note Footer: Updated timestamp */}
            <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 'auto', paddingTop: 8 }}>
              <Calendar size={12} />
              <span>{note.updatedAt}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Note Modal */}
      {isEditingNote && (
        <div className="modal-overlay" onClick={() => setIsEditingNote(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                {currentNote.id ? 'Edit Note' : 'Create New Note'}
              </h2>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Note Title"
                className="search-input"
                value={currentNote.title}
                onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
              />

              <textarea
                placeholder="Write your note content..."
                className="search-input"
                style={{ minHeight: 140, resize: 'vertical' }}
                value={currentNote.content}
                onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
              />

              {/* Color selector */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                  Card Color
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['#fef08a', '#bae6fd', '#bbf7d0', '#fed7aa', '#e9d5ff'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: c,
                        border: currentNote.color === c ? '3px solid #2563eb' : '1px solid rgba(0,0,0,0.1)',
                        cursor: 'pointer'
                      }}
                      onClick={() => setCurrentNote({ ...currentNote, color: c })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="reset-filter-btn" onClick={() => setIsEditingNote(false)}>
                Cancel
              </button>
              <button className="quick-add-btn" onClick={handleSaveNote}>
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
