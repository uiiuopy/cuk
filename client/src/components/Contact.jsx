import React from 'react';
import { Mail, MapPin, Phone, Globe, MessageSquare } from 'lucide-react';

export default function Contact() {
  return (
    <div className="contact-page-container page-layout">
      <div className="page-header glass-panel">
        <h2 className="page-title glow-text-cyan"><MessageSquare size={22} /> Contact Us</h2>
        <p className="page-subtitle">Get in touch with the Psychophysiology Lab at the Central University of Karnataka</p>
      </div>

      <div className="contact-grid">
        <div className="contact-info-panel glass-panel">
          <h3 className="panel-title">Lab Details</h3>
          
          <div className="info-list">
            <div className="info-item">
              <MapPin size={24} className="info-icon" />
              <div className="info-text">
                <strong>Address</strong>
                <p>Psychophysiology & Cognitive Neuroscience Lab,<br />
                Central University of Karnataka (CUK),<br />
                Aland Road, Kadaganchi, Kalaburagi,<br />
                Karnataka 585311, India</p>
              </div>
            </div>

            <div className="info-item">
              <Mail size={24} className="info-icon" />
              <div className="info-text">
                <strong>Email References</strong>
                <p>
                  Lab Admissions: <a href="mailto:sarah.lin@cuk.ac.in">sarah.lin@cuk.ac.in</a><br />
                  General Queries: <a href="mailto:info@cuk.ac.in">info@cuk.ac.in</a>
                </p>
              </div>
            </div>

            <div className="info-item">
              <Phone size={24} className="info-icon" />
              <div className="info-text">
                <strong>Office Phone</strong>
                <p>+91 (08477) 226707<br />
                Extension: 432 (Cognitive Lab)</p>
              </div>
            </div>

            <div className="info-item">
              <Globe size={24} className="info-icon" />
              <div className="info-text">
                <strong>University Portal</strong>
                <p>
                  Official CUK Site: <a href="https://www.cuk.ac.in" target="_blank" rel="noopener noreferrer">www.cuk.ac.in</a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="map-panel glass-panel">
          <h3 className="panel-title">Location Map</h3>
          <div className="map-placeholder">
            <MapPin size={48} className="map-marker" />
            <span>Kadaganchi Campus, Kalaburagi</span>
            <p className="map-coordinates">17.4475° N, 76.7118° E</p>
          </div>
        </div>
      </div>

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
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .contact-info-panel, .map-panel {
          padding: 24px;
          display: flex;
          flex-direction: column;
        }
        .panel-title {
          font-family: var(--font-tech);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--accent-cyan);
          margin: 0 0 20px 0;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 10px;
        }
        .info-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .info-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .info-icon {
          color: var(--accent-cyan);
          background: rgba(11, 34, 64, 0.04);
          padding: 5px;
          border-radius: 6px;
          flex-shrink: 0;
        }
        .info-text strong {
          display: block;
          font-size: 0.85rem;
          color: var(--text-main);
          margin-bottom: 4px;
          font-family: var(--font-body);
        }
        .info-text p, .info-text a {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.5;
          text-decoration: none;
        }
        .info-text a:hover {
          color: var(--accent-cyan);
          text-decoration: underline;
        }
        .map-placeholder {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--bg-darker);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 40px;
          text-align: center;
        }
        .map-marker {
          color: var(--accent-pink);
          margin-bottom: 12px;
          animation: bounce 2s infinite;
        }
        .map-placeholder span {
          font-family: var(--font-tech);
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .map-coordinates {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-family: var(--font-body);
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @media (max-width: 800px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
