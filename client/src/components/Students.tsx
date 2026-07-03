import React, { useState, useEffect } from 'react';
import { GraduationCap, Mail, ChevronRight } from 'lucide-react';
import { fetchSheetData, getDirectDriveUrl } from '../utils/googleSheets';
import fallbackStudents from '../data/students.json';

interface Student {
  Name: string;
  Role: string;
  'Research Area'?: string;
  Year?: string;
  Email?: string;
  'Photo URL'?: string;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSheetData('Students');
        if (data && data.length > 0) {
          const normalized = data.map(item => ({
            Name: item.Name || '',
            Role: item.Role || 'Research Scholar',
            'Research Area': item['Research Area'] || item.ResearchArea || '',
            Year: item.Year || '',
            Email: item.Email || '',
            'Photo URL': item['Photo URL'] || ''
          }));
          setStudents(normalized);
        } else {
          setStudents(fallbackStudents as Student[]);
        }
      } catch (err) {
        console.warn('Failed to load students data, falling back:', err);
        setStudents(fallbackStudents as Student[]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-10 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 text-blue-950 mb-2">
          <GraduationCap className="h-6 w-6" />
          <h2 className="text-2xl font-extrabold tracking-tight">Research Scholars & Students</h2>
        </div>
        <p className="text-sm text-slate-600">
          Graduate and doctoral fellows conducting core psychophysiological experiments.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500 font-semibold text-sm">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-950 mr-2" />
          Loading research scholars...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div className="flex gap-4 items-start">
                {student['Photo URL'] ? (
                  <img 
                    src={getDirectDriveUrl(student['Photo URL'])} 
                    alt={student.Name} 
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-blue-950 font-extrabold text-lg shrink-0">
                    {getInitials(student.Name)}
                  </div>
                )}
                
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                    {student.Name}
                  </h4>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-950 bg-blue-50 px-2 py-0.5 rounded-full">
                    {student.Role}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-xs">
                {student['Research Area'] && (
                  <div className="flex items-start gap-1.5 text-slate-600">
                    <ChevronRight className="h-4 w-4 text-blue-950 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-800 font-semibold block">Focus Area</strong>
                      {student['Research Area']}
                    </span>
                  </div>
                )}
                
                {student.Year && (
                  <div className="text-slate-500 font-medium">
                    Batch Year: <span className="text-slate-800 font-semibold">{student.Year}</span>
                  </div>
                )}

                {student.Email && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <Mail className="h-3.5 w-3.5 text-blue-950 shrink-0" />
                    <a href={`mailto:${student.Email}`} className="text-slate-600 hover:text-blue-950 hover:underline">
                      {student.Email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
