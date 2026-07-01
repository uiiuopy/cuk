import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, Cpu, Tag, Settings } from 'lucide-react';
import { fetchSheetData } from '../utils/googleSheets';

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
        setEquipment(normalized);
      } catch (err) {
        console.error("Failed to load equipment:", err);
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
              <div className="card-top-row">
                <span className="category-badge">
                  <Tag size={10} /> {item.category}
                </span>
                <span className={`status-badge ${item.status.toLowerCase()}`}>
                  {item.status === 'Available' ? (
                    <><ShieldCheck size={12} /> {item.status}</>
                  ) : (
                    <><AlertTriangle size={12} /> {item.status}</>
                  )}
                </span>
              </div>

              <h3 className="gear-name">{item.name}</h3>
              <p className="gear-desc">{item.description}</p>
              
              <div className="gear-utility-box">
                <span className="utility-label">Research Utility:</span>
                <p className="utility-text">{item.utility}</p>
              </div>

              <div className="divider" />

              <div className="specs-list flex-col">
                <span className="specs-title"><Settings size={12} /> Technical Specifications</span>
                {Object.entries(item.specs).map(([key, val]) => (
                  <div key={key} className="spec-row">
                    <span className="spec-key">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="spec-val">{val}</span>
                  </div>
                ))}
              </div>
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

        .utility-label {
          font-family: var(--font-tech);
          font-size: 0.62rem;
          text-transform: uppercase;
          color: var(--accent-pink);
          display: block;
          margin-bottom: 4px;
        }

        .utility-text {
          font-size: 0.8rem;
          line-height: 1.4;
          color: var(--text-main);
        }

        .divider {
          height: 1px;
          background: var(--border-color);
        }

        .specs-list {
          gap: 8px;
        }

        .specs-title {
          font-family: var(--font-tech);
          font-size: 0.65rem;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 4px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .spec-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          border-bottom: 1px dashed var(--border-color);
          padding-bottom: 4px;
        }

        .spec-key {
          color: var(--text-muted);
          text-transform: capitalize;
        }

        .spec-val {
          color: var(--text-main);
          font-weight: 500;
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
