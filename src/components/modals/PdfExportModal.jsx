import React, { useRef } from 'react';
import { X, Printer, Download, FileText, CheckCircle2 } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';

export default function PdfExportModal() {
  const { isPdfExportOpen, setIsPdfExportOpen, activeProject, projectTasks } = usePlanner();

  const printRef = useRef(null);

  if (!isPdfExportOpen) return null;

  const total = projectTasks.length;
  const done = projectTasks.filter(t => t.status === 'Done').length;
  const inProgress = projectTasks.filter(t => t.status === 'In progress').length;
  const todo = projectTasks.filter(t => t.status === 'To do').length;
  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={() => setIsPdfExportOpen(false)}>
      <div
        className="modal-dialog"
        style={{ maxWidth: 840, maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={20} color="#2563eb" />
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Project PDF Export Preview</h2>
              <p style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Clean report formatted for printing, PDF generation, and executive stakeholder review
              </p>
            </div>
          </div>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setIsPdfExportOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Printable Document Sheet matching Screenshot 1 "PDF Export" */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: '#f1f5f9' }}>
          <div
            ref={printRef}
            style={{
              background: '#ffffff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              padding: 40,
              borderRadius: 8,
              minHeight: 600,
              color: '#0f172a',
              fontFamily: 'var(--font-sans)'
            }}
          >
            {/* Document Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #2563eb', paddingBottom: 16 }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  ToDo Planner • Project Report
                </div>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                  {activeProject.name}
                </h1>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>
                  Generated on {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • CoreFlow Enterprise Engine
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2563eb' }}>
                  {progressPct}%
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                  COMPLETION RATE
                </div>
              </div>
            </div>

            {/* Executive KPI Summary Boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, margin: '20px 0' }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>TOTAL TASKS</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{total}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>TO DO</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#64748b' }}>{todo}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>IN PROGRESS</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2563eb' }}>{inProgress}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>DONE</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>{done}</div>
              </div>
            </div>

            {/* Task Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginTop: 12 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b', fontSize: '0.75rem' }}>
                  <th style={{ padding: '8px 10px' }}>STATUS</th>
                  <th style={{ padding: '8px 10px' }}>TASK NAME</th>
                  <th style={{ padding: '8px 10px' }}>PRIORITY</th>
                  <th style={{ padding: '8px 10px' }}>DUE DATE</th>
                  <th style={{ padding: '8px 10px' }}>TAGS</th>
                </tr>
              </thead>
              <tbody>
                {projectTasks.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 10px' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: t.status === 'Done' ? '#d1fae5' : t.status === 'In progress' ? '#dbeafe' : '#f1f5f9',
                          color: t.status === 'Done' ? '#065f46' : t.status === 'In progress' ? '#1d4ed8' : '#475569'
                        }}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>{t.title}</td>
                    <td style={{ padding: '8px 10px' }}>{t.priority}</td>
                    <td style={{ padding: '8px 10px', color: '#64748b' }}>{t.formattedDue || '—'}</td>
                    <td style={{ padding: '8px 10px', color: '#94a3b8', fontSize: '0.75rem' }}>{(t.tags || []).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button className="reset-filter-btn" onClick={() => setIsPdfExportOpen(false)}>
            Close
          </button>
          <button className="quick-add-btn" onClick={handlePrint}>
            <Printer size={15} />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
