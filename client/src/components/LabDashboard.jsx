import React from 'react';
import { Target, Eye, Compass, Shield, Award, Users, Brain, Move, Image as ImageIcon } from 'lucide-react';
import InfiniteCanvas from './InfiniteCanvas';

export default function LabDashboard() {
  const researchGlimpses = [
    {
      title: 'Central Nervous System Dynamics',
      desc: 'Investigating EEG spectral densities, event-related potentials (ERPs), and inter-hemispheric coherence to map cognitive states and neuronal signaling pathways.',
      icon: Shield,
      color: 'var(--accent-cyan)'
    },
    {
      title: 'Autonomic System Integration',
      desc: 'Decoding sympathetic arousal and parasympathetic tone through advanced HRV (Heart Rate Variability) analysis and galvanic skin response (GSR) telemetry.',
      icon: Compass,
      color: 'var(--accent-pink)'
    },
    {
      title: 'Cognitive & Affective Regulation',
      desc: 'Developing closed-loop biofeedback systems and gaze-contingent paradigms to study attention, emotional regulation, and human-computer interactions.',
      icon: Users,
      color: 'var(--accent-green)'
    }
  ];

  const galleryImages = [
    { id: 1, path: '/src/assets/photo1.jpg', label: 'Primary EEG Biosensing Bay', left: '50px', top: '40px' },
    { id: 2, path: '/src/assets/photo2.jpg', label: 'Virtual Reality Suite', left: '440px', top: '100px' },
    { id: 3, path: '/src/assets/photo3.jpg', label: 'Computing Cluster', left: '120px', top: '270px' },
    { id: 4, path: '/src/assets/photo4.jpg', label: 'EEG Preparation Room', left: '520px', top: '290px' },
    { id: 5, path: '/src/assets/photo5.jpg', label: 'Eye-Tracking Calibration Bay', left: '850px', top: '50px' },
    { id: 6, path: '/src/assets/photo6.jpg', label: 'Autonomic Sensor Bay', left: '900px', top: '260px' }
  ];

  // Helper component to display a stylish fallback if the image is missing
  const ImageWithFallback = ({ src, alt, label }) => {
    const [hasError, setHasError] = React.useState(false);

    return (
      <div className="gallery-item-wrapper glass-panel">
        {hasError ? (
          <div className="image-placeholder-fallback">
            <div className="fallback-glow-ring"></div>
            <ImageIcon size={32} className="fallback-icon" />
            <span className="fallback-text">Photo Slot: {label}</span>
            <span className="fallback-sub">Drop image at "{src}"</span>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            className="gallery-image"
            onError={() => setHasError(true)}
          />
        )}
        <div className="gallery-overlay">
          <span className="gallery-label">{label}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Hero Welcome / About Section */}
      <section className="about-hero glass-panel pulse-card">
        <div className="about-content">
          <div className="tag-badge">Research Center</div>
          <h1 className="about-title glow-text-cyan">CUK PSYCHOPHYSIOLOGY RESEARCH LABORATORY</h1>
          <p className="about-text">
            The CUK Psychophysiology Research Laboratory is a state-of-the-art facility dedicated to unraveling the intricate connections between psychological processes and physiological responses. By leveraging high-density electroencephalography (EEG), electrocardiography (ECG), galvanic skin response (GSR), and eye-tracking interfaces, we observe the human mind and body in real-time. Our interdisciplinary team integrates neuroscience, cognitive psychology, and computer science to pioneer new pathways in human performance, emotional regulation, and neuro-engineering.
          </p>
        </div>
        <div className="about-visual">
          <div className="academic-emblem">
            <Brain size={56} className="emblem-icon" />
            <div className="emblem-ring-1"></div>
            <div className="emblem-ring-2"></div>
          </div>
        </div>
      </section>

      {/* Vision and Mission */}
      <div className="vision-mission-grid">
        <div className="vision-card glass-panel">
          <div className="card-header">
            <Eye size={24} className="glow-text-cyan" />
            <h2>Laboratory Vision</h2>
          </div>
          <p>
            To become a global beacon of neuro-cognitive research, bridging the gap between physiological signals and mental states to create intelligent, empathetic human-machine interfaces that improve human well-being and unlock hidden cognitive potentials.
          </p>
        </div>

        <div className="mission-card glass-panel">
          <div className="card-header">
            <Target size={24} className="glow-text-pink" />
            <h2>Laboratory Mission</h2>
          </div>
          <p>
            To conduct rigorous empirical research on central and autonomic nervous system dynamics; to train the next generation of psychophysiologists using modern sensing tools; and to engineer translation-ready technologies that optimize mental health, attention, and cognitive efficiency.
          </p>
        </div>
      </div>

      {/* Research Glimpses / Focus Groups */}
      <section className="research-section">
        <h2 className="section-header-title glow-text-cyan">Research Glimpses</h2>
        <p className="section-subtitle">Core experimental domains and investigations active within the laboratory.</p>
        
        <div className="research-glimpse-grid">
          {researchGlimpses.map((group, idx) => {
            const Icon = group.icon;
            return (
              <div key={idx} className="research-card glass-panel" style={{ '--accent-local': group.color }}>
                <div className="card-glow-border"></div>
                <div className="research-icon-wrapper" style={{ color: group.color, border: `1px solid ${group.color}33` }}>
                  <Icon size={24} />
                </div>
                <h3>{group.title}</h3>
                <p>{group.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Photos / Gallery */}
      <section className="gallery-section">
        <div className="gallery-header-row">
          <div>
            <h2 className="section-header-title glow-text-pink">Laboratory Gallery</h2>
            <p className="section-subtitle">Visual impressions of our experimental bays, sensory equipment, and computing clusters.</p>
          </div>
          <div className="gallery-instruction-tag">
            <Move size={14} /> Drag canvas or scroll to explore
          </div>
        </div>

        <div className="infinite-gallery-viewport">
          {galleryImages.map((image) => (
            <div 
              key={image.id} 
              className="gallery-canvas-card" 
              style={{ position: 'absolute', left: image.left, top: image.top, width: '320px', height: '210px' }}
            >
              <ImageWithFallback
                src={image.path}
                alt={image.label}
                label={image.label}
              />
            </div>
          ))}
          <div className="canvas-control-overlay">
            <InfiniteCanvas />
          </div>
        </div>
      </section>

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 40px;
          padding-bottom: 60px;
        }

        .tag-badge {
          display: inline-block;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 0.72rem;
          color: var(--accent-pink);
          border: 1px solid rgba(182, 146, 96, 0.3);
          background: rgba(182, 146, 96, 0.05);
          padding: 4px 10px;
          border-radius: 4px;
          width: fit-content;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .about-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          padding: 32px;
        }

        .about-content {
          flex: 2;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .about-title {
          font-size: 1.9rem;
          font-weight: 700;
          line-height: 1.25;
        }

        .about-text {
          font-size: 0.98rem;
          line-height: 1.7;
          color: var(--text-muted);
        }

        .about-visual {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* Academic Emblem */
        .academic-emblem {
          position: relative;
          width: 150px;
          height: 150px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid rgba(182, 146, 96, 0.3);
          border-radius: 50%;
          background: rgba(182, 146, 96, 0.05);
          box-shadow: 0 4px 12px rgba(11, 34, 64, 0.03);
        }

        .emblem-icon {
          color: var(--accent-cyan);
          z-index: 2;
        }

        .emblem-ring-1 {
          position: absolute;
          width: 132px;
          height: 132px;
          border-radius: 50%;
          border: 1px dashed rgba(182, 146, 96, 0.3);
          animation: spin-emblem 45s linear infinite;
        }

        .emblem-ring-2 {
          position: absolute;
          width: 114px;
          height: 114px;
          border-radius: 50%;
          border: 1px double rgba(11, 34, 64, 0.1);
        }

        @keyframes spin-emblem {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Vision & Mission Grid */
        .vision-mission-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .vision-card, .mission-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 28px;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .card-header h2 {
          font-size: 1.3rem;
          color: var(--text-main);
        }

        .vision-card p, .mission-card p {
          font-size: 0.95rem;
          line-height: 1.65;
          color: var(--text-muted);
        }

        /* Sections headers */
        .section-header-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .section-subtitle {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-bottom: 24px;
        }

        /* Research glimpse cards */
        .research-glimpse-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .research-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 24px;
          overflow: hidden;
        }

        .card-glow-border {
          position: absolute;
          top: 0;
          left: 0;
          width: 3px;
          height: 100%;
          background: var(--accent-local);
          box-shadow: 0 0 10px var(--accent-local);
        }

        .research-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          border-radius: 10px;
          background: rgba(13, 13, 30, 0.4);
        }

        .research-card h3 {
          font-size: 1.1rem;
          color: var(--text-main);
        }

        .research-card p {
          font-size: 0.88rem;
          line-height: 1.6;
          color: var(--text-muted);
        }

        /* Photo Gallery Grid */
        .gallery-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .gallery-instruction-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-muted);
          background: var(--bg-darker);
          border: 1px solid var(--border-color);
          padding: 6px 12px;
          border-radius: 4px;
        }

        .infinite-gallery-viewport {
          position: relative;
          width: 100%;
          height: 480px;
          overflow: hidden;
          background: var(--bg-darker);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          cursor: grab;
          user-select: none;
          box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.03);
        }

        .infinite-gallery-viewport:active {
          cursor: grabbing;
        }

        .gallery-canvas-card {
          box-shadow: 0 4px 14px rgba(11, 34, 64, 0.05);
          border-radius: 8px;
          overflow: hidden;
          transition: box-shadow 0.3s ease;
        }

        .gallery-canvas-card:hover {
          box-shadow: 0 10px 25px rgba(11, 34, 64, 0.1);
        }

        .gallery-item-wrapper {
          position: relative;
          padding: 0;
          overflow: hidden;
          height: 100%;
          border-radius: 8px;
          cursor: pointer;
        }

        .gallery-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .gallery-item-wrapper:hover .gallery-image {
          transform: scale(1.08);
        }

        .gallery-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(to top, rgba(11, 34, 64, 0.95) 0%, rgba(11, 34, 64, 0.3) 70%, transparent 100%);
          padding: 16px 20px;
          transition: all 0.3s ease;
        }

        .gallery-label {
          font-family: var(--font-body);
          font-size: 0.8rem;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        /* Fallback placeholder visual when image doesn't exist */
        .image-placeholder-fallback {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, var(--bg-darker) 0%, var(--border-color) 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
          padding: 20px;
          text-align: center;
          gap: 8px;
        }

        .fallback-glow-ring {
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 1px dashed rgba(182, 146, 96, 0.2);
          animation: spin-emblem 30s linear infinite;
        }

        .fallback-icon {
          color: var(--accent-pink);
          z-index: 1;
        }

        .fallback-text {
          font-family: var(--font-tech);
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-main);
          z-index: 1;
          margin-top: 4px;
        }

        .fallback-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
          z-index: 1;
          font-family: monospace;
          background: var(--bg-dark);
          padding: 3px 8px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
        }

        @media (max-width: 900px) {
          .about-hero {
            flex-direction: column;
            text-align: center;
          }
          .about-visual {
            margin-top: 16px;
          }
          .vision-mission-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
