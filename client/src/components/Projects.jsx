import React, { useState, useEffect } from 'react';
import { Layers, ShieldCheck, Clock } from 'lucide-react';
import { fetchSheetData } from '../utils/googleSheets';
import fallbackProjects from '../data/projects.json';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSheetData('Projects');
        setProjects(data && data.length > 0 ? data : fallbackProjects);
      } catch (err) {
        console.warn('Failed to load projects data, falling back:', err);
        setProjects(fallbackProjects);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="projects-page-container page-layout">
      <div className="page-header glass-panel">
        <h2 className="page-title glow-text-pink"><Layers size={22} /> Research Projects</h2>
        <p className="page-subtitle">Sponsored and institutional research initiatives currently in progress</p>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading research projects...</div>
      ) : (
        <div className="projects-grid">
          {projects.map((project, idx) => (
            <div key={idx} className="project-card glass-panel">
              <div className="project-top-row">
                <span className="project-pi">PI: {project.PI}</span>
                <span className={`status-badge ${project.Status?.toLowerCase()}`}>
                  {project.Status === 'Active' ? (
                    <><Clock size={11} /> Ongoing</>
                  ) : (
                    <><ShieldCheck size={11} /> Completed</>
                  )}
                </span>
              </div>
              <h3 className="project-title">{project.Title}</h3>
              <p className="project-description">{project.Description}</p>
              {project.Funding && (
                <div className="project-funding">
                  <span className="funding-label">Supporting Agency:</span>
                  <span className="funding-value">{project.Funding}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .page-layout {
          padding: 24px;
          max-width: 1440px;
          margin: 0 auto;
        }
        .page-header {
          margin-bottom: 24px;
          padding: 20px 24px;
        }
        .page-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-tech);
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
        }
        .page-subtitle {
          font-family: var(--font-body);
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 4px 0 0 0;
        }
        .projects-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .project-card {
          padding: 24px;
          transition: border-color 0.2s ease, transform 0.15s ease;
        }
        .project-card:hover {
          border-color: var(--accent-pink);
          transform: translateY(-2px);
        }
        .project-top-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          align-items: center;
        }
        .project-pi {
          font-size: 0.72rem;
          font-family: var(--font-body);
          font-weight: 600;
          color: var(--accent-cyan);
          text-transform: uppercase;
        }
        .status-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.65rem;
          font-weight: 600;
        }
        .status-badge.active {
          color: var(--accent-pink);
        }
        .status-badge.completed {
          color: var(--accent-green);
        }
        .project-title {
          font-family: var(--font-tech);
          font-size: 1.08rem;
          font-weight: 700;
          margin: 0 0 10px 0;
        }
        .project-description {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 14px;
        }
        .project-funding {
          display: flex;
          gap: 6px;
          font-size: 0.72rem;
          align-items: center;
        }
        .funding-label {
          color: var(--text-muted);
        }
        .funding-value {
          font-weight: 600;
          color: var(--text-main);
        }
      `}</style>
    </div>
  );
}
