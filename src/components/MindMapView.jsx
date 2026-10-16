import React, { useState } from 'react';
import {
  Folder,
  Plus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Network
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';

export default function MindMapView() {
  const { activeProject, mindMap, updateMindMap } = usePlanner();

  const [zoom, setZoom] = useState(1);

  const handleAddChild = (parentId) => {
    const label = prompt("Enter new mind map idea or sub-branch:");
    if (!label) return;

    const addRecursively = (node) => {
      if (node.id === parentId) {
        const newChild = {
          id: `node-${Date.now()}`,
          label,
          color: '#3b82f6',
          children: []
        };
        return {
          ...node,
          children: [...(node.children || []), newChild]
        };
      }
      return {
        ...node,
        children: (node.children || []).map(addRecursively)
      };
    };

    const updated = addRecursively(mindMap);
    updateMindMap(updated);
  };

  return (
    <div className="view-container">
      {/* Blue Hero Banner */}
      <div className="project-hero-banner">
        <div className="project-hero-top">
          <div className="project-hero-title-group">
            <div className="project-hero-icon-box">
              <Network size={24} color="#ffffff" />
            </div>
            <div>
              <div className="project-hero-subtitle">
                <span>🧠 Mind Map</span>
                <span>Visual architecture and strategic brainstorming</span>
              </div>
              <h1 className="project-hero-title">{activeProject.name}</h1>
            </div>
          </div>

          <div className="project-hero-right">
            <div className="hero-actions-row">
              <button
                className="hero-btn-primary"
                onClick={() => handleAddChild('node-root')}
              >
                <Plus size={16} />
                <span>Add main branch</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mind Map Canvas Area */}
      <div className="mindmap-wrapper">
        {/* Floating Zoom Controls Bar matching screenshot */}
        <div className="mindmap-controls-bar">
          <button
            className="row-action-btn"
            onClick={() => setZoom(prev => Math.min(prev + 0.15, 1.8))}
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            className="row-action-btn"
            onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.5))}
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            className="row-action-btn"
            onClick={() => setZoom(1)}
            title="Reset Zoom"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {/* Interactive Mind Map Tree Visualization */}
        <div className="mindmap-canvas-container">
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 80,
              padding: 40
            }}
          >
            {/* Root Node */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                color: '#ffffff',
                padding: '18px 28px',
                borderRadius: 'var(--radius-xl)',
                boxShadow: '0 10px 25px rgba(29, 78, 216, 0.35)',
                fontWeight: 700,
                fontSize: '1.15rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                border: '2px solid rgba(255, 255, 255, 0.3)',
                minWidth: 220,
                textAlign: 'center'
              }}
            >
              <span>{activeProject.name}</span>
              <button
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '9999px',
                  color: '#ffffff',
                  padding: '3px 10px',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                onClick={() => handleAddChild('node-root')}
              >
                <Plus size={12} />
                <span>Add Branch</span>
              </button>
            </div>

            {/* Branch Level 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {(mindMap.children || []).map((branch) => (
                <div key={branch.id} style={{ display: 'flex', alignItems: 'center', gap: 60, position: 'relative' }}>
                  {/* Branch Node Card */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: `2px solid ${branch.color || '#2563eb'}`,
                      padding: '12px 20px',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      minWidth: 180,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
                      {branch.label}
                    </span>
                    <button
                      style={{
                        background: '#f1f5f9',
                        border: 'none',
                        borderRadius: 4,
                        color: '#64748b',
                        padding: '2px 8px',
                        fontSize: '0.68rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        width: 'fit-content'
                      }}
                      onClick={() => handleAddChild(branch.id)}
                    >
                      <Plus size={10} />
                      <span>Sub-item</span>
                    </button>
                  </div>

                  {/* Sub-children */}
                  {(branch.children || []).length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {branch.children.map((sub) => (
                        <div
                          key={sub.id}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            padding: '8px 14px',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            color: '#334155',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                          }}
                        >
                          {sub.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
