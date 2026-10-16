import React, { useState } from 'react';
import {
  Folder,
  Plus,
  Search,
  Eye,
  Download,
  Trash2,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';

export default function FilesView() {
  const {
    activeProject,
    files,
    deleteFile,
    setIsAddFilesModalOpen,
    setSelectedFileForPreview
  } = usePlanner();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Filter files for current project
  const projectFiles = files.filter(f => f.projectId === activeProject.id);

  const filteredFiles = projectFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCategory === 'All' ? true : file.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const projectCategoryCount = projectFiles.filter(f => f.category === 'Project').length;
  const tasksCategoryCount = projectFiles.filter(f => f.category === 'Tasks').length;

  const handleDownload = (file) => {
    // Mock download generator
    const blob = new Blob([`File: ${file.name}\nProject: ${activeProject.name}\nDate: ${file.date}\nSize: ${file.size}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="view-container">
      {/* Blue Hero Banner matching Screenshot 3 */}
      <div className="project-hero-banner">
        <div className="project-hero-top">
          <div className="project-hero-title-group">
            <div className="project-hero-icon-box">
              <Folder size={24} color="#ffffff" />
            </div>
            <div>
              <div className="project-hero-subtitle">
                <span>📁 Files</span>
                <span>Everything attached to this project</span>
              </div>
              <h1 className="project-hero-title">{activeProject.name}</h1>
            </div>
          </div>

          <div className="project-hero-right">
            {/* 3 Stats: 9 files, 9 project, 0 tasks */}
            <div className="hero-stats-row">
              <div className="hero-stat-pill">
                <span className="hero-stat-pill-val">{projectFiles.length}</span>
                <span className="hero-stat-pill-lbl">files</span>
              </div>
              <div className="hero-stat-pill">
                <span className="hero-stat-pill-val">{projectCategoryCount}</span>
                <span className="hero-stat-pill-lbl">project</span>
              </div>
              <div className="hero-stat-pill">
                <span className="hero-stat-pill-val">{tasksCategoryCount}</span>
                <span className="hero-stat-pill-lbl">tasks</span>
              </div>
            </div>

            {/* + Add files button matching Screenshot 3 */}
            <div className="hero-actions-row">
              <button
                className="hero-btn-primary"
                onClick={() => setIsAddFilesModalOpen(true)}
              >
                <Plus size={16} />
                <span>Add files</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter toolbar matching Screenshot 3 */}
      <div className="filter-toolbar">
        <div className="search-input-wrapper">
          <Search size={15} className="search-input-icon" />
          <input
            type="text"
            placeholder="Search a file..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter tabs: All, Project, Tasks */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {['All', 'Project', 'Tasks'].map(cat => (
            <button
              key={cat}
              className={`top-action-btn ${activeCategory === cat ? 'active' : ''}`}
              style={{
                background: activeCategory === cat ? '#2563eb' : '#ffffff',
                color: activeCategory === cat ? '#ffffff' : '#475569',
                borderColor: activeCategory === cat ? '#2563eb' : '#cbd5e1',
                padding: '6px 16px',
                borderRadius: '9999px',
                fontWeight: 600
              }}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Files Grid matching Screenshot 3 */}
      <div className="files-content-wrapper">
        <div className="files-grid">
          {filteredFiles.map((file) => (
            <div key={file.id} className="file-card">
              {/* File Icon Badge: Red for PDF, Orange/Green for Image */}
              {file.type === 'pdf' ? (
                <div className="file-icon-badge pdf">
                  <FileText size={18} />
                  <span>PDF</span>
                </div>
              ) : (
                <div className="file-icon-badge image">
                  <ImageIcon size={18} />
                  <span>IMG</span>
                </div>
              )}

              {/* File Info */}
              <div className="file-info">
                <span className="file-name" title={file.name}>
                  {file.name}
                </span>
                <span className="file-meta">
                  {file.date} • {file.size}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: 2 }}>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: file.type === 'pdf' ? '#ef4444' : '#f59e0b',
                      textTransform: 'uppercase'
                    }}
                  >
                    {file.type === 'pdf' ? 'PDF' : 'Image'}
                  </span>
                  <span className="file-tag">{file.tag}</span>
                </div>
              </div>

              {/* Actions: View, Download, Delete */}
              <div className="file-actions">
                <button
                  className="row-action-btn"
                  onClick={() => setSelectedFileForPreview(file)}
                  title="Preview file"
                >
                  <Eye size={14} />
                </button>
                <button
                  className="row-action-btn"
                  onClick={() => handleDownload(file)}
                  title="Download file"
                >
                  <Download size={14} />
                </button>
                <button
                  className="row-action-btn delete-hover"
                  onClick={() => deleteFile(file.id)}
                  title="Delete file"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
