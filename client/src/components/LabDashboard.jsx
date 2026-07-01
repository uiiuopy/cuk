import React, { useState } from 'react';
import { Target, Eye, Compass, Shield, Award, Users, Brain, Move, Image as ImageIcon, BookOpen, Cpu, Activity, CheckCircle, MessageSquare, MapPin, Phone, Mail } from 'lucide-react';
import InfiniteCanvas from './InfiniteCanvas';
import InteractiveBrainSVG from './InteractiveBrainSVG';

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

  const equipmentList = [
    {
      name: 'Brain Products 64-Channel EEG',
      desc: 'High-density electroencephalography system featuring active wet gel electrodes to record electrical brain activity with millisecond temporal resolution.',
      icon: Brain
    },
    {
      name: 'EMG (Electromyography)',
      desc: 'Muscle electrical potential sensors measuring muscle contraction dynamics, motor unit recruitment, and physiological stress responses.',
      icon: Activity
    },
    {
      name: 'HRV (Heart Rate Variability)',
      desc: 'Autonomic cardiac regulation index extracted from high-resolution electrocardiograms to evaluate sympathetic-parasympathetic balance.',
      icon: Target
    },
    {
      name: 'GSR (Galvanic Skin Response)',
      desc: 'Electrodermal activity measurement reflecting sympathetic nervous system arousal and sweat gland activation during emotional response.',
      icon: Cpu
    },
    {
      name: 'EOG (Electrooculography)',
      desc: 'Electrode system measuring the resting potential of the retina to track vertical/horizontal eye movements and blink rates.',
      icon: Eye
    },
    {
      name: 'BVP (Blood Volume Pulse)',
      desc: 'Photoplethysmography sensor capturing vascular blood flow fluctuations to determine heart rate and peripheral vasoconstriction.',
      icon: Shield
    }
  ];

  const inquiryAreas = [
    'Cognitive Neuroscience',
    'Psychophysiology',
    'Biofeedback',
    'Neuropsychology',
    'Emotion Regulation',
    'Attention & Memory',
    'Executive Functions',
    'Stress & Resilience',
    'EEG & ERP Research',
    'Brain-Behaviour Relationships'
  ];

  const collaborations = [
    'EEG recording services',
    'HRV and psychophysiological assessments',
    'Research collaborations',
    'Student training',
    'Workshops',
    'Consultancy (if applicable)'
  ];

  // Helper component to display a stylish fallback if the image is missing
  const ImageWithFallback = ({ src, alt, label }) => {
    const [hasError, setHasError] = useState(false);

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
          <h1 className="about-title glow-text-cyan">Biofeedback and Cognitive Neuroscience Laboratory</h1>
          <p className="about-text lead-text">
            The Biofeedback and Cognitive Neuroscience Laboratory is dedicated to research, teaching, and training in cognitive neuroscience, psychophysiology, and biofeedback. The laboratory supports interdisciplinary research using state-of-the-art physiological recording systems for understanding human cognition, emotion, and behaviour.
          </p>
        </div>
        <div className="about-visual">
          <InteractiveBrainSVG />
        </div>
      </section>

      {/* Vision, Mission, Objectives */}
      <div className="vision-mission-grid">
        <div className="vision-card glass-panel text-center-card">
          <div className="card-icon-wrapper vision-icon-wrap">
            <Eye size={32} strokeWidth={2.5} className="vision-icon" />
          </div>
          <h2>Vision</h2>
          <p>
            To become a leading centre for translational cognitive neuroscience and biofeedback research in India.
          </p>
        </div>

        <div className="mission-card glass-panel text-center-card">
          <div className="card-icon-wrapper mission-icon-wrap">
            <Target size={32} strokeWidth={2.5} className="mission-icon" />
          </div>
          <h2>Mission</h2>
          <p>
            Advance scientific understanding of cognition, emotion and behaviour through rigorous psychophysiological research and training.
          </p>
        </div>

        <div className="objectives-card glass-panel text-center-card">
          <div className="card-icon-wrapper objectives-icon-wrap">
            <BookOpen size={32} strokeWidth={2.5} className="objectives-icon" />
          </div>
          <h2>Objectives</h2>
          <p>
            Foster interdisciplinary research, train next-generation scientists, and produce open, reproducible findings.
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

      {/* State of the Art Equipment */}
      <section className="equipment-showcase-section">
        <h2 className="section-header-title glow-text-pink">State-of-the-Art Equipment</h2>
        <p className="section-subtitle">High-fidelity physiological acquisition systems deployed in our experiments.</p>
        <div className="equipments-grid">
          {equipmentList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="equip-item-card glass-panel">
                <div className="equip-icon-wrapper">
                  <Icon size={20} className="glow-text-cyan" />
                </div>
                <div>
                  <h3 className="equip-title">{item.name}</h3>
                  <p className="equip-desc">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Areas of Inquiry */}
      <section className="inquiry-section">
        <h2 className="section-header-title glow-text-cyan">Areas of Inquiry</h2>
        <p className="section-subtitle">Key scientific domains and clinical questions investigated by our scholars.</p>
        <div className="inquiry-badges-container">
          {inquiryAreas.map((area, idx) => (
            <span key={idx} className="inquiry-badge glass-panel">
              <Compass size={12} className="badge-bullet" />
              {area}
            </span>
          ))}
        </div>
      </section>

      {/* Collaborate with Us */}
      <section className="collaborate-section">
        <h2 className="section-header-title glow-text-pink">Collaborate with Us</h2>
        <p className="section-subtitle">Avenues for partnership, student development, and consultancy services.</p>
        <div className="collab-grid">
          {collaborations.map((collab, idx) => (
            <div key={idx} className="collab-card glass-panel">
              <CheckCircle size={18} className="collab-check-icon" />
              <span className="collab-text">{collab}</span>
            </div>
          ))}
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

      {/* Contact Info Footer Card */}
      <footer className="lab-contact-footer glass-panel">
        <div className="footer-cols">
          <div className="footer-col brand-col">
            <Brain className="footer-logo" size={32} />
            <h3 className="footer-title">BCNL CUK</h3>
            <p className="footer-desc">Biofeedback and Cognitive Neuroscience Laboratory at the Central University of Karnataka.</p>
          </div>
          <div className="footer-col">
            <h4 className="footer-heading">Address</h4>
            <div className="footer-item">
              <MapPin size={14} className="footer-icon" />
              <span>Aland Road, Kadaganchi, Kalaburagi, Karnataka 585311</span>
            </div>
          </div>
          <div className="footer-col">
            <h4 className="footer-heading">Contact</h4>
            <div className="footer-item">
              <Mail size={14} className="footer-icon" />
              <a href="mailto:sarah.lin@cuk.ac.in">sarah.lin@cuk.ac.in</a>
            </div>
            <div className="footer-item">
              <Phone size={14} className="footer-icon" />
              <span>+91 (08477) 226707 (Ext 432)</span>
            </div>
          </div>
        </div>
      </footer>

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
          width: 180px;
          height: 180px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1.5px solid rgba(87, 197, 182, 0.4);
          border-radius: 50%;
          background: rgba(87, 197, 182, 0.06);
          box-shadow: 0 8px 32px rgba(26, 95, 122, 0.05);
        }

        .emblem-icon {
          color: var(--accent-cyan);
          z-index: 2;
          filter: drop-shadow(0 4px 12px rgba(26, 95, 122, 0.15));
        }

        .emblem-ring-1 {
          position: absolute;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          border: 1px dashed rgba(87, 197, 182, 0.35);
          animation: spin-emblem 45s linear infinite;
        }

        .emblem-ring-2 {
          position: absolute;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: 1px double rgba(26, 95, 122, 0.15);
        }

        /* Distinct Scannable Card Icon Wrappers */
        .vision-icon-wrap {
          background: rgba(26, 95, 122, 0.08) !important;
          border: 1px solid rgba(26, 95, 122, 0.2) !important;
        }
        .vision-icon {
          color: #1a5f7a !important;
        }

        .mission-icon-wrap {
          background: rgba(45, 138, 107, 0.08) !important;
          border: 1px solid rgba(45, 138, 107, 0.2) !important;
        }
        .mission-icon {
          color: #2d8a6b !important;
        }

        .objectives-icon-wrap {
          background: rgba(87, 197, 182, 0.08) !important;
          border: 1px solid rgba(87, 197, 182, 0.2) !important;
        }
        .objectives-icon {
          color: #57c5b6 !important;
        }

        /* Dark Theme overrides for scannable icons */
        [data-theme="dark"] .vision-icon {
          color: #4fa0c0 !important;
        }
        [data-theme="dark"] .mission-icon {
          color: #5eead4 !important;
        }
        [data-theme="dark"] .objectives-icon {
          color: #7dd3fc !important;
        }


        @keyframes spin-emblem {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Vision, Mission, Objectives Grid */
        .vision-mission-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .text-center-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
          padding: 32px 24px;
        }

        .card-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(11, 34, 64, 0.05);
          margin-bottom: 8px;
        }

        .text-center-card h2 {
          font-size: 1.3rem;
          color: var(--text-main);
          margin: 0;
        }

        .text-center-card p {
          font-size: 0.95rem;
          line-height: 1.65;
          color: var(--text-muted);
          margin: 0;
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

        /* State of the Art Equipment Showcase */
        .equipments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .equip-item-card {
          display: flex;
          gap: 16px;
          padding: 20px;
          align-items: flex-start;
          transition: border-color 0.2s ease, transform 0.15s ease;
        }

        .equip-item-card:hover {
          border-color: var(--accent-pink);
          transform: translateY(-2px);
        }

        .equip-icon-wrapper {
          flex-shrink: 0;
          background: rgba(11, 34, 64, 0.04);
          padding: 8px;
          border-radius: 6px;
          border: 1px solid rgba(11, 34, 64, 0.08);
        }

        .equip-title {
          font-family: var(--font-tech);
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0 0 6px 0;
          color: var(--text-main);
        }

        .equip-desc {
          font-size: 0.76rem;
          color: var(--text-muted);
          line-height: 1.45;
          margin: 0;
        }

        /* Areas of Inquiry Tag Cloud */
        .inquiry-badges-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .inquiry-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-main);
          border-radius: 6px;
          transition: border-color 0.2s ease, transform 0.15s ease;
        }

        .inquiry-badge:hover {
          border-color: var(--accent-cyan);
          transform: translateY(-1px);
        }

        .badge-bullet {
          color: var(--accent-cyan);
        }

        /* Collaborate with Us Section */
        .collab-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .collab-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 20px;
          transition: border-color 0.2s ease, transform 0.15s ease;
        }

        .collab-card:hover {
          border-color: var(--accent-pink);
          transform: translateY(-1px);
        }

        .collab-check-icon {
          color: var(--accent-pink);
          flex-shrink: 0;
        }

        .collab-text {
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--text-main);
        }

        /* Front Page Contact Footer */
        .lab-contact-footer {
          margin-top: 20px;
          padding: 32px;
          border-top: 1px solid var(--border-color);
        }

        .footer-cols {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1.5fr;
          gap: 40px;
        }

        .brand-col {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-logo {
          color: var(--accent-cyan);
        }

        .footer-title {
          font-family: var(--font-tech);
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
        }

        .footer-desc {
          font-size: 0.76rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .footer-heading {
          font-family: var(--font-body);
          font-size: 0.78rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--accent-pink);
          margin-bottom: 12px;
        }

        .footer-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          font-size: 0.76rem;
          color: var(--text-muted);
          line-height: 1.4;
          margin-bottom: 8px;
        }

        .footer-item a {
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-item a:hover {
          color: var(--accent-cyan);
        }

        .footer-icon {
          color: var(--accent-cyan);
          flex-shrink: 0;
          margin-top: 2px;
        }

        @media (max-width: 768px) {
          .footer-cols {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>
    </div>
  );
}
