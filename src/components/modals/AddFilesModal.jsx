import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';

export default function AddFilesModal() {
  const { isAddFilesModalOpen, setIsAddFilesModalOpen, addFile, activeProject } = usePlanner();

  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('pdf');
  const [fileCategory, setFileCategory] = useState('Project');
  const [fileSize, setFileSize] = useState('85,4 KB');
  const [isDragging, setIsDragging] = useState(false);

  if (!isAddFilesModalOpen) return null;

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      setFileName(f.name);
      setFileType(f.type.includes('image') ? 'image' : 'pdf');
      setFileSize(`${Math.round(f.size / 1024)} KB`);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFileName(f.name);
      setFileType(f.type.includes('image') ? 'image' : 'pdf');
      setFileSize(`${Math.round(f.size / 1024)} KB`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    addFile({
      name: fileName.trim(),
      type: fileType,
      category: fileCategory,
      size: fileSize,
      sizeBytes: 85000
    });

    setFileName('');
    setIsAddFilesModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsAddFilesModalOpen(false)}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Upload File to {activeProject.name}</h2>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setIsAddFilesModalOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={{
                border: isDragging ? '2px dashed #2563eb' : '2px dashed #cbd5e1',
                borderRadius: 'var(--radius-lg)',
                padding: '28px 16px',
                textAlign: 'center',
                background: isDragging ? '#eff6ff' : '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onClick={() => document.getElementById('file-upload-input').click()}
            >
              <Upload size={32} color="#64748b" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
                Drag &amp; drop files here, or <span style={{ color: '#2563eb' }}>browse</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
                Supports PDF, DOCX, XLSX, PNG, JPG (up to 50MB)
              </div>
              <input
                id="file-upload-input"
                type="file"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                File Name
              </label>
              <input
                type="text"
                className="search-input"
                placeholder="e.g. equipment_calibration_manual.pdf"
                required
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Type
                </label>
                <select
                  className="filter-select"
                  style={{ width: '100%' }}
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                >
                  <option value="pdf">PDF Document</option>
                  <option value="image">Image (PNG/JPG)</option>
                  <option value="doc">Spreadsheet / Doc</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Category
                </label>
                <select
                  className="filter-select"
                  style={{ width: '100%' }}
                  value={fileCategory}
                  onChange={(e) => setFileCategory(e.target.value)}
                >
                  <option value="Project">Project File</option>
                  <option value="Tasks">Task Attachment</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="reset-filter-btn" onClick={() => setIsAddFilesModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="quick-add-btn">
              Attach File
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
