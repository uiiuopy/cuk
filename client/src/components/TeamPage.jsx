import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, Mail, BookOpen, Award, ChevronRight } from 'lucide-react';
import { fetchSheetData } from '../utils/googleSheets';
import fallbackFaculty from '../data/faculty.json';
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

export default function TeamPage() {
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [facultyData, studentData] = await Promise.all([
          fetchSheetData('Faculty'),
          fetchSheetData('Students')
        ]);
        setFaculty(facultyData && facultyData.length > 0 ? facultyData : fallbackFaculty);
        setStudents(studentData && studentData.length > 0 ? studentData : fallbackStudents);
      } catch (err) {
        console.warn('Failed to load team data from Google Sheets, falling back to local data:', err);
        setFaculty(fallbackFaculty);
        setStudents(fallbackStudents);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="team-container">
        <div className="loading-spinner">Loading team data from Google Sheets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="team-container">
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{error}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '12px', opacity: 0.6 }}>
            Ensure the Google Sheet is published to the web and the Sheet ID is configured in <code>src/utils/googleSheets.js</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="team-container">
      {/* ─── Faculty Section ─── */}
      <section className="team-section">
        <div className="section-header glass-panel">
          <div className="section-title-row">
            <Award size={22} className="section-icon faculty-icon" />
            <div>
              <h2 className="section-title glow-text-cyan">Faculty & Lab Director</h2>
              <p className="section-subtitle">Facilitators and principal investigators leading the research</p>
            </div>
          </div>
          <span className="member-count">{faculty.length} member{faculty.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="faculty-grid">
          {faculty.map((person, idx) => (
            <div key={idx} className="faculty-card glass-panel">
              <div className="faculty-photo-col">
                {person['Photo URL'] ? (
                  <img src={person['Photo URL']} alt={person.Name} className="faculty-photo" />
                ) : (
                  <div className="avatar-initials faculty-avatar">
                    {getInitials(person.Name || 'N A')}
                  </div>
                )}
              </div>
              <div className="faculty-info-col">
                <h3 className="faculty-name">{person.Name}</h3>
                <span className="faculty-designation">{person.Designation}</span>
                <span className="faculty-specialization">
                  <BookOpen size={12} /> {person.Specialization}
                </span>
                {person.Bio && (
                  <p className="faculty-bio">{person.Bio}</p>
                )}
                {person.Email && (
                  <a href={`mailto:${person.Email}`} className="faculty-email">
                    <Mail size={12} /> {person.Email}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {faculty.length === 0 && (
          <div className="empty-state glass-panel">
            <p>No faculty data available. Add entries to the "Faculty" tab in the Google Sheet.</p>
          </div>
        )}
      </section>

      {/* ─── Students Section ─── */}
      <section className="team-section">
        <div className="section-header glass-panel">
          <div className="section-title-row">
            <GraduationCap size={22} className="section-icon student-icon" />
            <div>
              <h2 className="section-title glow-text-pink">Research Scholars & Students</h2>
              <p className="section-subtitle">Graduate and doctoral researchers contributing to ongoing projects</p>
            </div>
          </div>
          <span className="member-count">{students.length} member{students.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="students-grid">
          {students.map((student, idx) => (
            <div key={idx} className="student-card glass-panel">
              <div className="student-top">
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
                  <span className="student-year">Batch {student.Year}</span>
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

        {students.length === 0 && (
          <div className="empty-state glass-panel">
            <p>No student data available. Add entries to the "Students" tab in the Google Sheet.</p>
          </div>
        )}
      </section>

      <style>{`
        .team-container {
          padding: 24px;
          max-width: 1440px;
          margin: 0 auto;
        }

        .team-section {
          margin-bottom: 48px;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          margin-bottom: 24px;
        }

        .section-title-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .section-icon {
          flex-shrink: 0;
        }

        .faculty-icon {
          color: var(--accent-cyan);
        }

        .student-icon {
          color: var(--accent-pink);
        }

        .section-title {
          font-family: var(--font-tech);
          font-size: 1.15rem;
          font-weight: 700;
          margin: 0;
          letter-spacing: 0.3px;
        }

        .section-subtitle {
          font-family: var(--font-body);
          font-size: 0.72rem;
          color: var(--text-muted);
          margin: 4px 0 0 0;
          letter-spacing: 0.2px;
        }

        .member-count {
          font-family: var(--font-tech);
          font-size: 0.72rem;
          color: var(--text-muted);
          background: var(--bg-darker);
          padding: 4px 12px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          white-space: nowrap;
        }

        /* ─── Faculty Cards ─── */
        .faculty-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .faculty-card {
          display: flex;
          gap: 24px;
          padding: 24px;
          transition: border-color 0.2s ease, transform 0.15s ease;
        }

        .faculty-card:hover {
          border-color: var(--accent-cyan);
          transform: translateY(-2px);
        }

        .faculty-photo-col {
          flex-shrink: 0;
        }

        .faculty-photo {
          width: 100px;
          height: 100px;
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
          width: 100px;
          height: 100px;
          font-size: 1.6rem;
          background: linear-gradient(135deg, rgba(0, 240, 255, 0.12), rgba(0, 160, 255, 0.06));
          color: var(--accent-cyan);
          border: 2px solid rgba(0, 240, 255, 0.2);
        }

        .student-avatar {
          width: 44px;
          height: 44px;
          font-size: 0.8rem;
          background: linear-gradient(135deg, rgba(182, 146, 96, 0.15), rgba(182, 146, 96, 0.06));
          color: var(--accent-pink);
          border: 1.5px solid rgba(182, 146, 96, 0.25);
        }

        .faculty-info-col {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .faculty-name {
          font-family: var(--font-tech);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .faculty-designation {
          font-family: var(--font-body);
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--accent-cyan);
        }

        .faculty-specialization {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-body);
          font-size: 0.75rem;
          color: var(--accent-pink);
        }

        .faculty-bio {
          font-family: var(--font-body);
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin: 4px 0 0 0;
          max-width: 640px;
        }

        .faculty-email {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-body);
          font-size: 0.72rem;
          color: var(--text-muted);
          text-decoration: none;
          margin-top: 4px;
          transition: color 0.2s ease;
        }

        .faculty-email:hover {
          color: var(--accent-cyan);
        }

        /* ─── Student Cards ─── */
        .students-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 14px;
        }

        .student-card {
          padding: 18px;
          transition: border-color 0.2s ease, transform 0.15s ease;
        }

        .student-card:hover {
          border-color: var(--accent-pink);
          transform: translateY(-2px);
        }

        .student-top {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 12px;
        }

        .student-photo {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid var(--border-color);
        }

        .student-meta {
          display: flex;
          flex-direction: column;
        }

        .student-name {
          font-family: var(--font-tech);
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .student-role {
          font-family: var(--font-body);
          font-size: 0.7rem;
          color: var(--accent-pink);
          font-weight: 600;
        }

        .student-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-top: 10px;
          border-top: 1px solid var(--border-color);
        }

        .student-research {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-body);
          font-size: 0.73rem;
          color: var(--text-muted);
        }

        .student-year {
          font-family: var(--font-tech);
          font-size: 0.65rem;
          color: var(--text-muted);
          opacity: 0.7;
          letter-spacing: 0.3px;
        }

        .student-email {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: var(--font-body);
          font-size: 0.68rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .student-email:hover {
          color: var(--accent-pink);
        }

        .empty-state {
          padding: 40px;
          text-align: center;
          font-family: var(--font-body);
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .glow-text-pink {
          color: var(--accent-pink);
        }

        @media (max-width: 600px) {
          .faculty-card {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .section-header {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
          .section-title-row {
            flex-direction: column;
          }
          .students-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
