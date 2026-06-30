import React, { useEffect, useState } from 'react';
import { Brain, Activity, Cpu, BookOpen, LayoutDashboard, Radio, Eye, Sun, Moon } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, theme, toggleTheme }) {
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'brain', label: '3D Brain Explorer', icon: Brain },
    { id: 'simulator', label: 'Biosignal Simulator', icon: Activity },
    { id: 'gaze', label: 'Eye Tracking', icon: Eye },
    { id: 'equipment', label: 'Equipment Room', icon: Cpu },
    { id: 'publications', label: 'Research Portal', icon: BookOpen }
  ];

  return (
    <header className="navbar-container">
      <div className="nav-brand">
        <Brain className="brand-logo" />
        <div className="brand-text">
          <span className="brand-title">CUK</span>
          <span className="brand-subtitle">PSYCHOPHYSIOLOGY LAB</span>
        </div>
      </div>

      <nav className="nav-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item-btn ${activeTab === item.id ? 'active' : ''}`}
            >
              <Icon size={16} className="nav-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="navbar-controls">
        <div className="nav-status-panel">
          <Radio size={14} className={`status-signal-icon ${apiStatus}`} />
          <span className="status-text">
            API: {apiStatus === 'connected' ? 'ONLINE' : apiStatus === 'connecting' ? 'SYNCING' : 'OFFLINE'}
          </span>
          <span className={`status-dot ${apiStatus}`} />
        </div>

        <button 
          onClick={toggleTheme} 
          className="theme-toggle-btn"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Bright'} Contrast`}
          aria-label="Toggle theme contrast"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      <style>{`
        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 32px;
          background: var(--bg-dark);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-logo {
          color: var(--accent-cyan);
          transition: transform 0.3s ease;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-family: var(--font-tech);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--accent-cyan);
          letter-spacing: 1px;
        }

        .brand-subtitle {
          font-family: var(--font-body);
          font-size: 0.68rem;
          font-weight: 600;
          color: var(--accent-pink);
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .nav-links {
          display: flex;
          gap: 4px;
        }

        .nav-item-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-muted);
          padding: 8px 14px;
          border-radius: 4px;
          cursor: pointer;
          font-family: var(--font-body);
          font-weight: 500;
          font-size: 0.85rem;
          transition: all 0.2s ease-in-out;
        }

        .nav-item-btn:hover {
          color: var(--accent-cyan);
          background: rgba(11, 34, 64, 0.04);
        }

        .nav-item-btn.active {
          color: var(--accent-cyan);
          border-color: rgba(11, 34, 64, 0.1);
          background: rgba(11, 34, 64, 0.05);
        }

        .nav-icon {
          transition: transform 0.2s ease;
        }

        .nav-item-btn:hover .nav-icon {
          transform: translateY(-1px);
        }

        .navbar-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .theme-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--accent-cyan);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .theme-toggle-btn:hover {
          background: rgba(182, 146, 96, 0.08);
          border-color: var(--accent-pink);
          color: var(--accent-pink);
        }

        .nav-status-panel {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-darker);
          border: 1px solid var(--border-color);
          padding: 6px 12px;
          border-radius: 4px;
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
          font-size: 0.72rem;
          font-family: var(--font-body);
          font-weight: 600;
          color: var(--text-muted);
        }

        .status-dot {
          width: 6px;
          height: 6px;
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
          .navbar-container {
            flex-direction: column;
            gap: 16px;
            padding: 16px;
          }
          .nav-links {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </header>
  );
}
