import React from 'react';
import { X, Download, FileText, Calendar, HardDrive } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';

export default function FilePreviewModal() {
  const { selectedFileForPreview, setSelectedFileForPreview, activeProject } = usePlanner();

  if (!selectedFileForPreview) return null;

  return (
    <div className="modal-overlay" onClick={() => setSelectedFileForPreview(null)}>
      <div
        className="modal-dialog"
        style={{ maxWidth: 640 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={20} color="#dc2626" />
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{selectedFileForPreview.name}</h2>
              <p style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {selectedFileForPreview.date} • {selectedFileForPreview.size}
              </p>
            </div>
          </div>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setSelectedFileForPreview(null)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Simulated Document Viewer */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-lg)',
              minHeight: 280,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              textAlign: 'center'
            }}
          >
            {selectedFileForPreview.thumbnail ? (
              <img
                src={selectedFileForPreview.thumbnail}
                alt="Preview"
                style={{ maxWidth: 160, maxHeight: 160, borderRadius: 8, marginBottom: 12 }}
              />
            ) : (
              <div style={{ width: 64, height: 80, background: '#fee2e2', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #fca5a5', marginBottom: 12 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#dc2626' }}>PDF</span>
              </div>
            )}
            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>
              {selectedFileForPreview.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
              Attached to {activeProject.name}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="reset-filter-btn" onClick={() => setSelectedFileForPreview(null)}>
            Close
          </button>
          <button
            className="quick-add-btn"
            onClick={() => {
              alert(`Downloading ${selectedFileForPreview.name}`);
              setSelectedFileForPreview(null);
            }}
          >
            Download File
          </button>
        </div>
      </div>
    </div>
  );
}
