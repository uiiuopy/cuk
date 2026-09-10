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
  Theme?: string;
  Description?: string;
  Tools?: string;
  Results?: string;
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
            'Photo URL': item['Photo URL'] || '',
            Theme: item.Theme || item.theme || item.theam || item['theam '] || '',
            Description: item.Description || item.description || '',
            Tools: item.Tools || item.tools || '',
            Results: item.Results || item.results || ''
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
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex gap-4 items-start mb-4">
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

                <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
                  {student['Research Area'] && (
                    <div className="flex items-start gap-1.5 text-slate-600">
                      <ChevronRight className="h-4 w-4 text-blue-950 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-800 font-semibold block">Focus Area</strong>
                        {student['Research Area']}
                      </span>
                    </div>
                  )}

                  {student.Theme && (
                    <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg text-slate-700">
                      <strong className="text-blue-950 font-semibold block mb-0.5">Research Theme</strong>
                      <p className="leading-snug text-[11px]">{student.Theme}</p>
                    </div>
                  )}

                  {student.Description && (
                    <div className="text-slate-600 leading-relaxed text-[11px]">
                      <strong className="text-slate-800 font-semibold block">Methodology</strong>
                      {student.Description}
                    </div>
                  )}

                  {student.Tools && (
                    <div className="text-slate-600 text-[11px]">
                      <strong className="text-slate-800 font-semibold block">Experimental Tools</strong>
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[10px] text-slate-700 inline-block mt-0.5">
                        {student.Tools}
                      </span>
                    </div>
                  )}

                  {student.Results && (
                    <div className="bg-emerald-50/60 border border-emerald-200/60 p-2.5 rounded-lg text-emerald-950 text-[11px]">
                      <strong className="font-bold block mb-0.5 text-emerald-900">Key Findings</strong>
                      <p className="leading-snug">{student.Results}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs space-y-1">
                {student.Year && (
                  <div className="text-slate-500 font-medium text-[11px]">
                    Batch Year: <span className="text-slate-800 font-semibold">{student.Year}</span>
                  </div>
                )}

                {student.Email && (
                  <div className="flex items-center gap-1.5 pt-0.5">
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
