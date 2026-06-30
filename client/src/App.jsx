import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LabDashboard from './components/LabDashboard';
import ThreeBrain from './components/ThreeBrain';
import VirtualSimulator from './components/VirtualSimulator';
import GearExplorer from './components/GearExplorer';
import Publications from './components/Publications';
import GazeVisualizer from './components/GazeVisualizer';
import InteractiveGrid from './components/InteractiveGrid';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentGaze, setCurrentGaze] = useState(null);
  const [isGazeActive, setIsGazeActive] = useState(false);
  const [isGazeConnected, setIsGazeConnected] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cuk-lab-theme');
      return saved === 'dark' ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cuk-lab-theme', theme);
  }, [theme]);


  const renderContent = () => {
    switch (activeTab) {
      case 'brain':
        return <ThreeBrain gaze={currentGaze} isGazeConnected={isGazeActive && isGazeConnected} />;
      case 'simulator':
        return (
          <VirtualSimulator 
            gaze={currentGaze} 
            isGazeConnected={isGazeActive && isGazeConnected} 
            isGazeActive={isGazeActive}
            setIsGazeActive={setIsGazeActive}
          />
        );
      case 'gaze':
        return (
          <GazeVisualizer 
            onGazeUpdate={setCurrentGaze} 
            isActive={isGazeActive} 
            setIsGazeConnected={setIsGazeConnected} 
            showOverlayOnly={false}
            setIsGazeActive={setIsGazeActive}
          />
        );
      case 'equipment':
        return <GearExplorer />;
      case 'publications':
        return <Publications />;
      case 'dashboard':
      default:
        return <LabDashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      <InteractiveGrid 
        gridColor={theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(11, 34, 64, 0.04)'}
        dotColor={theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(11, 34, 64, 0.07)'}
        hoverColor={theme === 'dark' ? '#dfb271' : '#b69260'}
        trailColor={theme === 'dark' ? '#dfb271' : '#b69260'}
      />
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        theme={theme}
        toggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
      />
      
      <main className="content-body">
        {renderContent()}
      </main>

      {activeTab !== 'gaze' && (
        <GazeVisualizer 
          onGazeUpdate={setCurrentGaze} 
          isActive={isGazeActive} 
          setIsGazeConnected={setIsGazeConnected} 
          showOverlayOnly={true}
          setIsGazeActive={setIsGazeActive}
        />
      )}

      <footer className="footer-panel">
        <div className="footer-content">
          <span className="footer-brand">CUK PSYCHOPHYSIOLOGY RESEARCH LABORATORY</span>
          <span className="footer-copyright">© {new Date().getFullYear()} CUK. All systems operational.</span>
        </div>
      </footer>

      <style>{`
        .footer-panel {
          border-top: 1px solid var(--border-color);
          background: rgba(4, 4, 10, 0.9);
          padding: 16px 24px;
          margin-top: 40px;
          font-family: var(--font-tech);
          font-size: 0.65rem;
          letter-spacing: 0.5px;
          color: var(--text-muted);
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          max-width: 1440px;
          margin: 0 auto;
          width: 100%;
        }

        .footer-brand {
          font-weight: 600;
        }

        @media (max-width: 600px) {
          .footer-content {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
