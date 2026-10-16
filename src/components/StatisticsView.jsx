import React from 'react';
import {
  BarChart2,
  TrendingUp,
  CheckCircle2,
  Clock,
  Target,
  Award
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';

export default function StatisticsView() {
  const { tasks, projects, finishedThisWeekData, stats } = usePlanner();

  const priorities = ['Low', 'Medium', 'High', 'Urgent'];
  const priorityCounts = priorities.map(p => ({
    priority: p,
    count: tasks.filter(t => t.priority === p).length,
    done: tasks.filter(t => t.priority === p && t.status === 'Done').length
  }));

  return (
    <div className="view-container">
      <div className="dashboard-content-wrapper">
        <div className="dashboard-header-row">
          <div className="dashboard-title-group">
            <h1>Statistics &amp; Productivity Metrics</h1>
            <p>Quantitative analysis of execution velocity and team throughput</p>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div className="kpi-card">
            <span className="kpi-label">Completion Velocity</span>
            <span className="kpi-value green">2.8 / day</span>
            <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>+18% from last sprint</span>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">On-Time Delivery Rate</span>
            <span className="kpi-value">84.2%</span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Benchmark: 80%</span>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Total Completed Tasks</span>
            <span className="kpi-value green">{stats.doneTasks}</span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Across 3 active projects</span>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Productivity Index</span>
            <span className="kpi-value purple">94 / 100</span>
            <span style={{ fontSize: '0.72rem', color: '#8b5cf6', fontWeight: 600 }}>Top Tier Flow</span>
          </div>
        </div>

        {/* Priority Breakdown Matrix */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="dash-panel-card">
            <div className="dash-panel-title">Priority Breakdown</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {priorityCounts.map(item => {
                const pct = item.count > 0 ? Math.round((item.done / item.count) * 100) : 0;
                return (
                  <div key={item.priority}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                      <span className={`priority-pill ${item.priority}`}>
                        {item.priority}
                      </span>
                      <span style={{ fontWeight: 600, color: '#334155' }}>
                        {item.done} / {item.count} done ({pct}%)
                      </span>
                    </div>
                    <div className="progress-track" style={{ height: 6, background: '#f1f5f9' }}>
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: item.priority === 'Urgent' ? '#be185d' : item.priority === 'High' ? '#ef4444' : item.priority === 'Medium' ? '#f59e0b' : '#10b981'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="dash-panel-card">
            <div className="dash-panel-title">Weekly Output Rhythm</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Completed 11 mission-critical tasks during Week 35–Week 36. Peak output observed on Saturday with 3 major deliverables closed.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginTop: 16 }}>
                {finishedThisWeekData.map((d, i) => (
                  <div key={i} style={{ textAlign: 'center', background: '#f8fafc', padding: 8, borderRadius: 8 }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{d.day}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>{d.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
