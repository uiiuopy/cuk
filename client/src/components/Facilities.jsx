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

export default function Facilities() {
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
        setEquipment(data && data.length > 0 ? normalized : fallbackEquipment);
      } catch (err) {
        console.warn("Failed to load equipment from Google Sheets, using fallback:", err);
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
    <div className="facilities-container page-layout">
      {/* Header filter bar */}
      <div className="glass-panel filter-bar">
        <h2 className="page-title glow-text-cyan"><Cpu size={20} /> Research Facilities & Systems</h2>
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
              <div className="card-top-row">
                <span className="category-badge">
                  <Tag size={10} /> {item.category}
                </span>
                <span className={`status-badge ${item.status?.toLowerCase()}`}>
                  {item.status === 'Available' || item.status === 'Active' ? (
                    <><ShieldCheck size={11} /> Ready</>
                  ) : (
                    <><AlertTriangle size={11} /> Offline</>
                  )}
                </span>
              </div>

              <div className="gear-visual-header">
                {getCategoryIcon(item.category)}
                <div className="gear-title-group">
                  <h3 className="gear-name">{item.name}</h3>
                  <span className="gear-model">{item.manufacturer} {item.model}</span>
                </div>
              </div>

              <p className="gear-description">{item.description}</p>

              {item.utility && (
                <div className="gear-utility-box">
                  <strong>Application Focus:</strong> {item.utility}
                </div>
              )}

              {item.specs && (
                <div className="specs-section">
                  <span className="specs-title"><Settings size={11} /> System Specifications</span>
                  <div className="specs-table">
                    {typeof item.specs === 'object' ? (
                      Object.entries(item.specs).map(([key, val]) => (
                        <div key={key} className="spec-row">
                          <span className="spec-key">{key}</span>
                          <span className="spec-val">{val}</span>
                        </div>
                      ))
                    ) : (
                      <div className="spec-row-text">{item.specs}</div>
                    )}
                  </div>
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
        .filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .page-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-tech);
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0;
        }
        .filter-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .btn-outline {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .btn-outline:hover {
          color: var(--accent-cyan);
          border-color: var(--accent-cyan);
          background: rgba(11, 34, 64, 0.02);
        }
        .btn-outline.active {
          color: var(--accent-cyan);
          border-color: var(--accent-cyan);
          background: rgba(11, 34, 64, 0.05);
        }
        .gear-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 20px;
        }
        .gear-card {
          padding: 24px;
          transition: border-color 0.2s ease, transform 0.15s ease;
        }
        .gear-card:hover {
          border-color: var(--accent-cyan);
          transform: translateY(-2px);
        }
        .card-top-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .category-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.65rem;
          color: var(--accent-pink);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }
        .status-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.65rem;
          font-weight: 600;
        }
        .status-badge.available, .status-badge.active {
          color: var(--accent-green);
        }
        .status-badge.maintenance, .status-badge.offline {
          color: var(--accent-yellow);
        }
        .gear-visual-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }
        .gear-main-icon {
          color: var(--accent-cyan);
          background: rgba(11, 34, 64, 0.04);
          padding: 10px;
          border-radius: 8px;
          border: 1px solid rgba(11, 34, 64, 0.08);
        }
        .gear-title-group {
          display: flex;
          flex-direction: column;
        }
        .gear-name {
          font-family: var(--font-tech);
          font-size: 1.05rem;
          font-weight: 700;
          margin: 0;
        }
        .gear-model {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-family: var(--font-body);
        }
        .gear-description {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 14px;
        }
        .gear-utility-box {
          background: rgba(182, 146, 96, 0.04);
          border: 1px dashed rgba(182, 146, 96, 0.2);
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 0.75rem;
          color: var(--text-main);
          margin-bottom: 16px;
          line-height: 1.4;
        }
        .specs-section {
          border-top: 1px solid var(--border-color);
          padding-top: 14px;
        }
        .specs-title {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .specs-table {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .spec-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.73rem;
          line-height: 1.4;
        }
        .spec-key {
          color: var(--text-muted);
          text-transform: capitalize;
        }
        .spec-val {
          font-weight: 500;
          color: var(--text-main);
        }
        .spec-row-text {
          font-size: 0.72rem;
          color: var(--text-muted);
          line-height: 1.4;
        }
        @media (max-width: 600px) {
          .filter-bar {
            flex-direction: column;
            align-items: flex-start;
          }
          .gear-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
