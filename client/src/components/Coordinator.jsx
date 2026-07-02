import React, { useState, useEffect } from 'react';
import { Mail, BookOpen, Award } from 'lucide-react';
import { fetchSheetData, getDirectDriveUrl } from '../utils/googleSheets';
import fallbackFaculty from '../data/faculty.json';

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Coordinator() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSheetData('Faculty');
        setFaculty(data && data.length > 0 ? data : fallbackFaculty);
      } catch (err) {
        console.warn('Failed to load coordinator data, falling back:', err);
        setFaculty(fallbackFaculty);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="coordinator-container page-layout">
      <div className="page-header glass-panel">
        <h2 className="page-title glow-text-cyan"><Award size={22} /> Faculty & Coordinators</h2>
        <p className="page-subtitle">Principal investigators and mentors leading the research programs</p>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading coordinator details...</div>
      ) : (
        <div className="coordinator-grid">
          {faculty.map((person, idx) => (
            <div key={idx} className="coordinator-card glass-panel flex-row">
              <div className="photo-col">
                {person['Photo URL'] ? (
                  <img src={getDirectDriveUrl(person['Photo URL'])} alt={person.Name} className="faculty-photo" />
                ) : (
                  <div className="avatar-initials faculty-avatar">
                    {getInitials(person.Name || 'N A')}
                  </div>
                )}
              </div>
              <div className="info-col">
                <h3 className="faculty-name">{person.Name}</h3>
                <span className="faculty-designation">{person.Designation}</span>
                <span className="faculty-specialization">
                  <BookOpen size={12} /> {person.Specialization}
                </span>
                {person.Bio && <p className="faculty-bio">{person.Bio}</p>}
                {person.Email && (
                  <a href={`mailto:${person.Email}`} className="faculty-email">
                    <Mail size={12} /> {person.Email}
                  </a>
                )}
              </div>
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
        .coordinator-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .coordinator-card {
          display: flex;
          gap: 24px;
          padding: 24px;
          transition: border-color 0.2s ease, transform 0.15s ease;
        }
        .coordinator-card:hover {
          border-color: var(--accent-cyan);
          transform: translateY(-2px);
        }
        .photo-col {
          flex-shrink: 0;
        }
        .faculty-photo {
          width: 110px;
          height: 110px;
          border-radius: 8px;
          object-fit: cover;
          border: 2px solid var(--border-color);
        }
        .avatar-initials {
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-tech);
          font-weight: 700;
          letter-spacing: 1px;
          border-radius: 8px;
        }
        .faculty-avatar {
          width: 110px;
          height: 110px;
          font-size: 1.8rem;
          background: linear-gradient(135deg, rgba(0, 240, 255, 0.12), rgba(0, 160, 255, 0.06));
          color: var(--accent-cyan);
          border: 2px solid rgba(0, 240, 255, 0.2);
        }
        .info-col {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .faculty-name {
          font-family: var(--font-tech);
          font-size: 1.15rem;
          font-weight: 700;
          margin: 0;
        }
        .faculty-designation {
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--accent-cyan);
        }
        .faculty-specialization {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-body);
          font-size: 0.78rem;
          color: var(--accent-pink);
        }
        .faculty-bio {
          font-family: var(--font-body);
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin: 4px 0 0 0;
          max-width: 800px;
        }
        .faculty-email {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-body);
          font-size: 0.75rem;
          color: var(--text-muted);
          text-decoration: none;
          margin-top: 4px;
          transition: color 0.2s ease;
        }
        .faculty-email:hover {
          color: var(--accent-cyan);
        }
        @media (max-width: 600px) {
          .coordinator-card {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
