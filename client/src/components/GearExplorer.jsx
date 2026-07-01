import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, Cpu, Tag, Settings, Brain, Activity, Waves, Eye } from 'lucide-react';
import { fetchSheetData } from '../utils/googleSheets';
import fallbackEquipment from '../data/equipment.json';

const getCategoryIcon = (category) => {
  const cat = category.toLowerCase();
  if (cat.includes('eeg')) return <Brain size={48} className="gear-main-icon" />;
  if (cat.includes('hrv') || cat.includes('cardio') || cat.includes('ecg')) return <Activity size={48} className="gear-main-icon" />;
  if (cat.includes('gsr') || cat.includes('skin')) return <Waves size={48} className="gear-main-icon" />;
  if (cat.includes('eye') || cat.includes('gaze')) return <Eye size={48} className="gear-main-icon" />;
  return <Cpu size={48} className="gear-main-icon" />;
};

export default function GearExplorer() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const data = await fetchSheetData('Equipment');
        const normalized = data.map((row, idx) => ({
          id: `equip_${idx}`,
          name: row.Name || '',
          category: row.Category || '',
          manufacturer: row.Manufacturer || '',
          model: row.Model || '',
          specs: row.Specs || '',
          status: row.Status || 'Active',
          description: row.Description || ''
        }));
        setEquipment(normalized && normalized.length > 0 ? normalized : fallbackEquipment);
      } catch (err) {
        console.warn("Failed to load equipment from Google Sheets, falling back to local data:", err);
        setEquipment(fallbackEquipment);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  const categories = ['All', ...new Set(equipment.map((item) => item.category))];

  const filteredGear = filter === 'All' 
    ? equipment 
    : equipment.filter((item) => item.category === filter);

  return (
    <div className="gear-container">
      {/* Header filter bar */}
      <div className="glass-panel filter-bar">
        <h2 className="title glow-text-cyan"><Cpu size={20} /> Equipment Room</h2>
        <div className="filter-buttons">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`btn-outline btn-sm ${filter === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="loading-spinner">Syncing lab inventory...</div>
      ) : (
        <div className="gear-grid">
          {filteredGear.map((item) => (
            <div key={item.id} className="gear-card glass-panel flex-col">
              <div className="gear-card-header">
                {getCategoryIcon(item.category)}
              </div>

              <h3 className="gear-name">{item.name}</h3>
              <p className="gear-category">{item.category}</p>

              <div className="gear-meta">
                <div className="meta-col">
                  <span className="meta-label">MANUFACTURER</span>
                  <span className="meta-value">{item.manufacturer}</span>
                </div>
                <div className="meta-col">
                  <span className="meta-label">MODEL</span>
                  <span className="meta-value">{item.model}</span>
                </div>
              </div>

              <div className="divider" />

              <div className="specs-section">
                <span className="specs-title">TECHNICAL SPECIFICATIONS</span>
                <p className="specs-text">{item.specs}</p>
              </div>

              {item.description && (
                <div className="specs-section">
                  <span className="specs-title">APPLICATIONS</span>
                  <p className="specs-text">{item.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .gear-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
        }

        .filter-bar .title {
          font-size: 1.15rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .filter-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 0.72rem;
        }

        .loading-spinner {
          text-align: center;
          padding: 60px;
          color: var(--text-muted);
          font-family: var(--font-tech);
          font-size: 0.9rem;
        }

        .gear-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
        }

        .gear-card {
          gap: 14px;
          justify-content: space-between;
        }

        .card-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .category-badge {
          font-family: var(--font-tech);
          font-size: 0.62rem;
          color: var(--accent-cyan);
          background: rgba(0, 240, 255, 0.05);
          border: 1px solid rgba(0, 240, 255, 0.15);
          padding: 3px 8px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .status-badge {
          font-family: var(--font-tech);
          font-size: 0.62rem;
          padding: 3px 8px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .status-badge.available {
          background: rgba(57, 255, 20, 0.05);
          color: var(--accent-green);
          border: 1px solid rgba(57, 255, 20, 0.2);
        }

        .status-badge.maintenance {
          background: rgba(255, 215, 0, 0.05);
          color: var(--accent-yellow);
          border: 1px solid rgba(255, 215, 0, 0.2);
        }

        .gear-name {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .gear-desc {
          font-size: 0.85rem;
          line-height: 1.5;
        }

        .gear-utility-box {
          background: var(--bg-darker);
          border: 1px solid var(--border-color);
          padding: 10px 12px;
          border-radius: 6px;
        }

          border: 1px solid var(--border-color);
        }

        .meta-col {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .meta-label {
          font-family: var(--font-body);
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 0.5px;
        }

        .meta-value {
          font-family: var(--font-body);
          font-size: 0.8rem;
          color: var(--text-main);
          font-weight: 500;
        }

        .divider {
          height: 1px;
          background: var(--border-color);
          width: 100%;
          margin: 4px 0;
        }

        .specs-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .specs-title {
          font-family: var(--font-body);
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--accent-cyan);
          letter-spacing: 0.5px;
        }

        .specs-text {
          font-family: var(--font-body);
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.6;
          white-space: pre-line;
        }

        @media (max-width: 600px) {
          .filter-bar {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
