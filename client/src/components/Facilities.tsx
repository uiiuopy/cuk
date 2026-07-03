import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, Cpu, Tag, Settings, Brain, Activity, Waves, Eye, Hammer } from 'lucide-react';
import { fetchSheetData } from '../utils/googleSheets';
import fallbackEquipment from '../data/equipment.json';

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  model: string;
  specs: Record<string, string> | string;
  status: string;
  description: string;
  utility?: string;
  paradigms?: string;
}

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('eeg') || cat.includes('neuroimaging')) {
    return <Brain className="h-8 w-8 text-blue-900" />;
  }
  if (cat.includes('hrv') || cat.includes('cardio') || cat.includes('ecg') || cat.includes('signal') || cat.includes('physio')) {
    return <Activity className="h-8 w-8 text-blue-900" />;
  }
  if (cat.includes('gsr') || cat.includes('skin') || cat.includes('autonomic')) {
    return <Waves className="h-8 w-8 text-blue-900" />;
  }
  if (cat.includes('eye') || cat.includes('gaze') || cat.includes('oculomotor')) {
    return <Eye className="h-8 w-8 text-blue-900" />;
  }
  return <Cpu className="h-8 w-8 text-blue-900" />;
};

export default function Facilities() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const data = await fetchSheetData('Equipment');
        const normalized = data.map((row, idx) => {
          // Parse specs safely
          let rawSpecs: Record<string, string> | string = '';
          try {
            if (row.Specs) {
              if (row.Specs.trim().startsWith('{')) {
                rawSpecs = JSON.parse(row.Specs);
              } else {
                rawSpecs = row.Specs;
              }
            }
          } catch {
            rawSpecs = row.Specs || '';
          }

          // Fallback manufacturer/model mapping if sheet doesn't specify
          let mfg = row.Manufacturer || '';
          let mdl = row.Model || '';
          if (!mfg) {
            if (row.Name?.includes('Products')) mfg = 'Brain Products';
            else if (row.Name?.includes('Biopac')) mfg = 'Biopac Systems';
            else if (row.Name?.includes('Tobii')) mfg = 'Tobii Pro';
            else if (row.Name?.includes('EyeLoop')) mfg = 'OpenSource (Python)';
            else mfg = 'Academic Research Grade';
          }
          if (!mdl) {
            if (row.Name?.includes('128')) mdl = 'ActiCHamp 128';
            else if (row.Name?.includes('Spectrum')) mdl = 'Spectrum 1200';
            else mdl = 'v1.4';
          }

          // Paradigms mapping
          let paradigms = row.Paradigms || '';
          if (!paradigms) {
            if (row.Category?.toLowerCase().includes('neuro')) {
              paradigms = 'Oddball paradigms, P300 evoking, visual/auditory sensory gating.';
            } else if (row.Category?.toLowerCase().includes('cardio') || row.Category?.toLowerCase().includes('autonomic')) {
              paradigms = 'Stroop color-word stress test, cold pressor stress induction, resting-state vagal tone baseline.';
            } else {
              paradigms = 'Gaze-contingent visual searches, psycholinguistic reading trackers, visual attention mapping.';
            }
          }

          return {
            id: row.id || `equip_${idx}`,
            name: row.Name || '',
            category: row.Category || 'Neuroscience',
            manufacturer: mfg,
            model: mdl,
            specs: rawSpecs || row.Specs || '',
            status: row.Status || 'Active',
            description: row.Description || '',
            utility: row.Utility || row.utility || '',
            paradigms: paradigms
          };
        });
        
        setEquipment(data && data.length > 0 ? normalized : (fallbackEquipment as unknown as EquipmentItem[]));
      } catch (err) {
        console.warn("Failed to load equipment from Google Sheets, using fallback:", err);
        
        // Map fallback equipment structure to model structure
        const mappedFallback = (fallbackEquipment as any[]).map(item => {
          let mfg = item.manufacturer || 'Academic Research';
          let mdl = item.model || 'v1.0';
          if (item.name.includes('Brain Products')) mfg = 'Brain Products';
          if (item.name.includes('Biopac')) mfg = 'Biopac Systems';
          if (item.name.includes('Tobii')) mfg = 'Tobii Pro';
          
          let paradigms = 'Resting-state physiological monitoring and task-evoked reactivity.';
          if (item.category.toLowerCase().includes('neuro')) {
            paradigms = 'Oddball paradigms, ERP P300 mapping, resting-state spectral density.';
          } else if (item.category.toLowerCase().includes('cardio') || item.category.toLowerCase().includes('autonomic')) {
            paradigms = 'Stroop color-word stress test, cold pressor test, respiratory sinus arrhythmia (RSA).';
          } else if (item.category.toLowerCase().includes('oculomotor')) {
            paradigms = 'Gaze-contingent search grids, visual search paths, reading fixation maps.';
          }

          return {
            id: item.id || '',
            name: item.name || '',
            category: item.category || '',
            manufacturer: mfg,
            model: mdl,
            specs: item.specs || '',
            status: item.status || 'Active',
            description: item.description || '',
            utility: item.utility || '',
            paradigms: paradigms
          };
        });

        setEquipment(mappedFallback);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  const categories = ['All', ...new Set(equipment.map((item) => item.category))];

  const filteredGear = filter === 'All' 
    ? equipment 
    : equipment.filter((item) => item.category === filter);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header and Filter Controls */}
      <div className="mb-10 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 text-blue-950 mb-2">
            <Cpu className="h-6 w-6 text-blue-950" />
            <h2 className="text-2xl font-extrabold tracking-tight">Research Facilities & Systems</h2>
          </div>
          <p className="text-sm text-slate-600">
            High-fidelity physiological acquisition systems deployed in our experiments.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                filter === cat
                  ? 'bg-blue-950 border-blue-950 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500 font-semibold text-sm">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-950 mr-2" />
          Syncing lab inventory...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredGear.map((item) => (
            <div 
              key={item.id} 
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all"
            >
              <div>
                {/* Visual Header/Placeholder Box */}
                <div className="relative h-44 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 flex items-center justify-center overflow-hidden border-b border-slate-200">
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  <div className="z-10 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-sm text-white flex items-center justify-center">
                    {getCategoryIcon(item.category)}
                  </div>
                  
                  {/* Absolute badging inside header */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white bg-slate-900/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-slate-500/40">
                      <Tag className="h-2.5 w-2.5" />
                      {item.category}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      item.status === 'Available' || item.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-250'
                        : 'bg-rose-50 text-rose-800 border-rose-250'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${item.status === 'Available' || item.status === 'Active' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                      {item.status === 'Available' || item.status === 'Active' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Name and Header Group */}
                  <h3 className="text-xl font-extrabold text-blue-950 tracking-tight mb-1">
                    {item.name}
                  </h3>
                  
                  {/* Structured Manufacturer & Model */}
                  <div className="flex gap-4 text-xs font-semibold text-slate-500 mb-4 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Manufacturer</span>
                      <span className="text-slate-700">{item.manufacturer}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Model</span>
                      <span className="text-slate-700">{item.model}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Structured Applications */}
                  {item.utility && (
                    <div className="mb-4 bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                      <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Applications</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {item.utility}
                      </p>
                    </div>
                  )}

                  {/* Structured Research Uses & Paradigms */}
                  {item.paradigms && (
                    <div className="mb-4 bg-blue-50/40 border border-blue-100 p-3.5 rounded-xl">
                      <h4 className="text-[10px] uppercase font-bold text-blue-950/80 tracking-wider mb-1">Research Uses & Paradigms</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {item.paradigms}
                      </p>
                    </div>
                  )}

                  {/* Specifications list */}
                  {item.specs && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                        <Settings className="h-3.5 w-3.5 text-blue-950" />
                        System Specifications
                      </h4>
                      <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
                        {typeof item.specs === 'object' ? (
                          Object.entries(item.specs).map(([key, val]) => (
                            <li key={key}>
                              <strong className="text-slate-800 capitalize font-semibold">{key.replace(/([A-Z])/g, ' $1')}:</strong> {val}
                            </li>
                          ))
                        ) : (
                          item.specs.split(',').map((spec, i) => (
                            <li key={i}>{spec.trim()}</li>
                          ))
                        )}
                      </ul>
                    </div>
                  )}

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
