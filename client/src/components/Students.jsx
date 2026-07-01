import React, { useState, useEffect } from 'react';
import { GraduationCap, Mail, ChevronRight } from 'lucide-react';
import { fetchSheetData } from '../utils/googleSheets';
import fallbackStudents from '../data/students.json';

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSheetData('Students');
        setStudents(data && data.length > 0 ? data : fallbackStudents);
      } catch (err) {
        console.warn('Failed to load students data, falling back:', err);
        setStudents(fallbackStudents);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="students-page-container page-layout">
      <div className="page-header glass-panel">
        <h2 className="page-title glow-text-pink"><GraduationCap size={22} /> Research Scholars & Students</h2>
        <p className="page-subtitle">Graduate and doctoral fellows conducting core psychophysiological experiments</p>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading research scholars...</div>
      ) : (
        <div className="scholars-grid">
          {students.map((student, idx) => (
            <div key={idx} className="student-card glass-panel">
              <div className="student-header">
                {student['Photo URL'] ? (
                  <img src={student['Photo URL']} alt={student.Name} className="student-photo" />
                ) : (
                  <div className="avatar-initials student-avatar">
                    {getInitials(student.Name || 'N A')}
                  </div>
                )}
                <div className="student-meta">
                  <h4 className="student-name">{student.Name}</h4>
                  <span className="student-role">{student.Role}</span>
                </div>
              </div>
              <div className="student-details">
                {student['Research Area'] && (
                  <span className="student-research">
                    <ChevronRight size={12} /> {student['Research Area']}
                  </span>
                )}
                {student.Year && (
                  <span className="student-year">Joining Batch: {student.Year}</span>
                )}
                {student.Email && (
                  <a href={`mailto:${student.Email}`} className="student-email">
                    <Mail size={11} /> {student.Email}
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
        .scholars-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }
        .student-card {
          padding: 20px;
          transition: border-color 0.2s ease, transform 0.15s ease;
        }
        .student-card:hover {
          border-color: var(--accent-pink);
          transform: translateY(-2px);
        }
        .student-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 12px;
        }
        .student-photo {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid var(--border-color);
        }
        .avatar-initials {
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-tech);
          font-weight: 700;
          letter-spacing: 0.5px;
          border-radius: 50%;
        }
        .student-avatar {
          width: 48px;
          height: 48px;
          font-size: 0.85rem;
          background: linear-gradient(135deg, rgba(182, 146, 96, 0.15), rgba(182, 146, 96, 0.06));
          color: var(--accent-pink);
          border: 1.5px solid rgba(182, 146, 96, 0.25);
        }
        .student-meta {
          display: flex;
          flex-direction: column;
        }
        .student-name {
          font-family: var(--font-tech);
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .student-role {
          font-family: var(--font-body);
          font-size: 0.72rem;
          color: var(--accent-pink);
          font-weight: 600;
        }
        .student-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-top: 12px;
          border-top: 1px solid var(--border-color);
        }
        .student-research {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-body);
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .student-year {
          font-family: var(--font-tech);
          font-size: 0.68rem;
          color: var(--text-muted);
          opacity: 0.7;
        }
        .student-email {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: var(--font-body);
          font-size: 0.7rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .student-email:hover {
          color: var(--accent-pink);
        }
        @media (max-width: 600px) {
          .scholars-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
