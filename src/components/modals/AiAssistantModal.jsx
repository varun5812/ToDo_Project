import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  TrendingUp,
  Brain
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';

export default function AiAssistantModal() {
  const {
    isAiAssistantOpen,
    setIsAiAssistantOpen,
    activeProject,
    addTask,
    tasks
  } = usePlanner();

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  if (!isAiAssistantOpen) return null;

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    // Simulate smart breakdown reasoning
    setTimeout(() => {
      const p = prompt.toLowerCase();
      let suggestions = [];

      if (p.includes('robot') || p.includes('line') || p.includes('machine') || p.includes('production')) {
        suggestions = [
          { title: `Benchmark current baseline for "${prompt}"`, priority: 'High', est: 90, tag: 'Diagnostics' },
          { title: `Audit safety interlocks and emergency stop compliance`, priority: 'Urgent', est: 60, tag: 'Safety' },
          { title: `Program PLC logic controller and test cycle latency`, priority: 'High', est: 150, tag: 'Robotics' },
          { title: `Draft calibration handbook and operator SOP checklist`, priority: 'Medium', est: 80, tag: 'SOP' },
          { title: `Deploy pilot run with telemetry logging over 48 hours`, priority: 'Medium', est: 120, tag: 'Verification' }
        ];
      } else if (p.includes('launch') || p.includes('market') || p.includes('sales')) {
        suggestions = [
          { title: `Finalize core value proposition and pricing matrix for "${prompt}"`, priority: 'Urgent', est: 90, tag: 'Strategy' },
          { title: `Create high-converting landing page Figma prototypes`, priority: 'High', est: 120, tag: 'Design' },
          { title: `Set up automated drip email campaign for early waitlist`, priority: 'Medium', est: 90, tag: 'Growth' },
          { title: `Record 2-minute product walkthrough video demo`, priority: 'Medium', est: 150, tag: 'Content' },
          { title: `Conduct end-to-end checkout & payment gateway test`, priority: 'High', est: 60, tag: 'QA' }
        ];
      } else {
        suggestions = [
          { title: `Define scope, deliverables, and success metrics for "${prompt}"`, priority: 'High', est: 60, tag: 'Planning' },
          { title: `Identify critical path dependencies and resource bottlenecks`, priority: 'High', est: 45, tag: 'Analysis' },
          { title: `Execute core phase 1 prototype implementation`, priority: 'Medium', est: 180, tag: 'Execution' },
          { title: `Perform rigorous quality assurance and user feedback review`, priority: 'Medium', est: 90, tag: 'Review' },
          { title: `Deliver final sign-off documentation and retrospective`, priority: 'Low', est: 45, tag: 'Delivery' }
        ];
      }

      setGeneratedPlan({
        goal: prompt,
        tasks: suggestions
      });
      setIsGenerating(false);
    }, 700);
  };

  const handleApplyAll = () => {
    if (!generatedPlan) return;
    generatedPlan.tasks.forEach((item) => {
      addTask({
        title: item.title,
        priority: item.priority,
        estimatedMinutes: item.est,
        tags: [item.tag],
        status: 'To do',
        dueDate: '2026-09-08'
      });
    });
    alert(`Added ${generatedPlan.tasks.length} actionable tasks to "${activeProject.name}"!`);
    setIsAiAssistantOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsAiAssistantOpen(false)}>
      <div
        className="modal-dialog"
        style={{ maxWidth: 640 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={20} color="#a5b4fc" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                AI Productivity Copilot
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#c7d2fe' }}>
                Deconstruct complex goals into actionable work breakdowns
              </p>
            </div>
          </div>
          <button
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
            onClick={() => setIsAiAssistantOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
              What project goal or milestone do you want to break down?
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                className="search-input"
                placeholder="e.g. Automate pneumatic station changeover..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <button
                className="hero-btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  borderRadius: 'var(--radius-md)'
                }}
                disabled={isGenerating}
                onClick={handleGenerate}
              >
                <Sparkles size={15} />
                <span>{isGenerating ? 'Thinking...' : 'Break Down'}</span>
              </button>
            </div>
          </div>

          {/* Quick Prompts */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              "Reduce machine cycle times by 15%",
              "Prepare production safety audit",
              "Automate inventory tracking barcode scan"
            ].map((qp, idx) => (
              <button
                key={idx}
                type="button"
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '9999px',
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  color: '#475569',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setPrompt(qp);
                }}
              >
                + {qp}
              </button>
            ))}
          </div>

          {/* Result Card */}
          {generatedPlan && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-lg)', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                  Recommended Action Steps ({generatedPlan.tasks.length})
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Target: {activeProject.name}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {generatedPlan.tasks.map((task, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#e0e7ff', color: '#4338ca', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {i + 1}
                      </span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{task.title}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className={`priority-pill ${task.priority}`} style={{ fontSize: '0.65rem' }}>
                        {task.priority}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {task.est}m
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="reset-filter-btn" onClick={() => setIsAiAssistantOpen(false)}>
            Close
          </button>
          {generatedPlan && (
            <button
              className="quick-add-btn"
              style={{ background: '#4338ca' }}
              onClick={handleApplyAll}
            >
              Add All to {activeProject.name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
