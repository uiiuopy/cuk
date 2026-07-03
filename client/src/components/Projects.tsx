import React, { useState, useEffect } from 'react';
import { Layers, ShieldCheck, Clock } from 'lucide-react';
import { fetchSheetData } from '../utils/googleSheets';
import fallbackProjects from '../data/projects.json';

interface Project {
  Title: string;
  Description: string;
  PI: string;
  Status: string;
  Funding?: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSheetData('Projects');
        if (data && data.length > 0) {
          const normalized = data.map(item => ({
            Title: item.Title || item.title || '',
            Description: item.Description || item.description || '',
            PI: item.PI || item.pi || '',
            Status: item.Status || item.status || 'Active',
            Funding: item.Funding || item.funding || ''
          }));
          setProjects(normalized);
        } else {
          setProjects(fallbackProjects as Project[]);
        }
      } catch (err) {
        console.warn('Failed to load projects data, falling back:', err);
        setProjects(fallbackProjects as Project[]);
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
          <Layers className="h-6 w-6" />
          <h2 className="text-2xl font-extrabold tracking-tight">Research Projects</h2>
        </div>
        <p className="text-sm text-slate-600">
          Sponsored and institutional research initiatives currently in progress.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500 font-semibold text-sm">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-950 mr-2" />
          Loading research projects...
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((project, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-950">
                  Principal Investigator: <span className="text-slate-800 font-extrabold">{project.PI}</span>
                </span>
                
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  project.Status === 'Active'
                    ? 'bg-amber-50 text-amber-800 border-amber-250'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-250'
                }`}>
                  {project.Status === 'Active' ? (
                    <>
                      <Clock className="h-3.5 w-3.5" /> Ongoing
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5" /> Completed
                    </>
                  )}
                </span>
              </div>

              <h3 className="text-lg font-extrabold text-blue-950 tracking-tight mb-2">
                {project.Title}
              </h3>
              
              <p className="text-sm text-slate-600 leading-relaxed mb-6 font-sans">
                {project.Description}
              </p>

              {project.Funding && (
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200 w-fit">
                  <span className="font-bold text-slate-500 uppercase tracking-wider">Supporting Agency:</span>
                  <span className="text-slate-850 font-bold">{project.Funding}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
