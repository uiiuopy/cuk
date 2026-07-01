import React, { useEffect, useState } from 'react';
import { Brain, Activity, Cpu, BookOpen, LayoutDashboard, Radio, Eye, Users } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const [apiStatus, setApiStatus] = useState('connecting');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/health');
        if (res.ok) {
          setApiStatus('connected');
        } else {
          setApiStatus('error');
        }
      } catch (err) {
        setApiStatus('offline');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'team', label: 'Lab Coordinator & Students', icon: Users },
    { id: 'equipment', label: 'Facilities', icon: Cpu },
    { id: 'publications', label: 'Publications & Research', icon: BookOpen },
    { id: 'brain', label: '3D Brain Explorer', icon: Brain },
    { id: 'simulator', label: 'Biosignal Simulator', icon: Activity },
    { id: 'gaze', label: 'Eye Tracking', icon: Eye }
  ];

  return (
    <aside className="sidebar-container glass-panel">
      <div className="sidebar-brand">
        <div className="brand-logo-wrapper">
          <Brain className="brand-logo" size={28} />
        </div>
        <div className="brand-text">
          <span className="brand-title">BCNL</span>
        </div>
      </div>

      <nav className="sidebar-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-item-btn ${activeTab === item.id ? 'active' : ''}`}
            >
              <Icon size={18} className="sidebar-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="nav-status-panel">
          <Radio size={14} className={`status-signal-icon ${apiStatus}`} />
          <span className="status-text">
            API: {apiStatus === 'connected' ? 'ONLINE' : apiStatus === 'connecting' ? 'SYNCING' : 'OFFLINE'}
          </span>
          <span className={`status-dot ${apiStatus}`} />
        </div>
      </div>

      <style>{`
        .sidebar-container {
          width: 280px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border-color);
          background: var(--bg-card);
          position: sticky;
          top: 0;
          flex-shrink: 0;
          z-index: 100;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .brand-logo-wrapper {
          background: rgba(11, 34, 64, 0.05);
          padding: 8px;
          border-radius: 8px;
          border: 1px solid rgba(11, 34, 64, 0.1);
        }

        .brand-logo {
          color: var(--accent-cyan);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-family: var(--font-tech);
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: 0.5px;
        }

        .sidebar-links {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 24px 16px;
          flex-grow: 1;
          overflow-y: auto;
        }

        .sidebar-item-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 12px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-family: var(--font-body);
          font-weight: 500;
          font-size: 0.95rem;
          text-align: left;
          transition: all 0.2s ease-in-out;
        }

        .sidebar-item-btn:hover {
          color: var(--text-main);
          background: rgba(11, 34, 64, 0.04);
        }

        .sidebar-item-btn.active {
          color: var(--accent-cyan);
          background: rgba(11, 34, 64, 0.08);
          font-weight: 600;
        }

        .sidebar-icon {
          transition: transform 0.2s ease;
        }

        .sidebar-item-btn:hover .sidebar-icon {
          transform: scale(1.1);
        }

        .sidebar-footer {
          padding: 24px;
          border-top: 1px solid var(--border-color);
        }

        .nav-status-panel {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-darker);
          border: 1px solid var(--border-color);
          padding: 8px 12px;
          border-radius: 6px;
        }

        .status-signal-icon {
          color: var(--text-muted);
        }

        .status-signal-icon.connected {
          color: var(--accent-green);
          animation: beacon 2s infinite;
        }

        .status-signal-icon.offline, .status-signal-icon.error {
          color: #ef4444;
        }

        @keyframes beacon {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }

        .status-text {
          font-size: 0.75rem;
          font-family: var(--font-body);
          font-weight: 600;
          color: var(--text-muted);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #94a3b8;
        }

        .status-dot.connected {
          background: #10b981;
        }

        .status-dot.connecting {
          background: var(--accent-pink);
        }

        .status-dot.offline, .status-dot.error {
          background: #ef4444;
        }

        @media (max-width: 900px) {
          .sidebar-container {
            width: 100%;
            height: auto;
            position: relative;
            border-right: none;
            border-bottom: 1px solid var(--border-color);
          }
          .sidebar-brand {
            justify-content: center;
          }
          .sidebar-links {
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
            padding: 16px;
          }
          .sidebar-footer {
            display: none; /* Hide on mobile to save space */
          }
        }
      `}</style>
    </aside>
  );
}
