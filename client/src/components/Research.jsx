import React, { useState, useEffect } from 'react';
import { BookOpen, HelpCircle } from 'lucide-react';
import { fetchSheetData } from '../utils/googleSheets';
import fallbackResearch from '../data/research.json';

export default function Research() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSheetData('Research');
        setThemes(data && data.length > 0 ? data : fallbackResearch);
      } catch (err) {
        console.warn('Failed to load research data, falling back:', err);
        setThemes(fallbackResearch);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="research-page-container page-layout">
      <div className="page-header glass-panel">
        <h2 className="page-title glow-text-cyan"><BookOpen size={22} /> Research Themes & Scope</h2>
        <p className="page-subtitle">Core physiological and neuroscientific themes investigated in our lab</p>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading research themes...</div>
      ) : (
        <div className="themes-grid">
          {themes.map((theme, idx) => (
            <div key={idx} className="theme-card glass-panel">
              <h3 className="theme-title">{theme.Theme}</h3>
              <p className="theme-description">{theme.Description}</p>
              {theme.KeyMetrics && (
                <div className="theme-metrics">
                  <span className="metrics-label"><HelpCircle size={11} /> Primary Biomarkers & Metrics:</span>
                  <p className="metrics-value">{theme.KeyMetrics}</p>
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
        .themes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
          gap: 20px;
        }
        .theme-card {
          padding: 24px;
          transition: border-color 0.2s ease, transform 0.15s ease;
        }
        .theme-card:hover {
          border-color: var(--accent-cyan);
          transform: translateY(-2px);
        }
        .theme-title {
          font-family: var(--font-tech);
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 12px 0;
          color: var(--accent-cyan);
        }
        .theme-description {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 16px;
        }
        .theme-metrics {
          border-top: 1px solid var(--border-color);
          padding-top: 12px;
        }
        .metrics-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .metrics-value {
          font-size: 0.75rem;
          color: var(--accent-pink);
          margin: 0;
          font-weight: 500;
        }
        @media (max-width: 600px) {
          .themes-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
