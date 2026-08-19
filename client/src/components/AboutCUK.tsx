import React from 'react';
import { Landmark, Users, Building2 } from 'lucide-react';

export default function AboutCUK() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-10 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 text-blue-950 mb-2">
          <Landmark className="h-6 w-6" />
          <h2 className="text-2xl font-extrabold tracking-tight">About Central University of Karnataka</h2>
        </div>
        <p className="text-sm text-slate-600">
          Established in 2009 by an act of the Indian Parliament, located in Kalaburagi district, Karnataka.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Overview Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs hover:border-slate-300 transition-all flex flex-col h-full">
          <div className="rounded-xl bg-slate-50 border border-slate-200 w-12 h-12 flex items-center justify-center text-blue-950 mb-6 shrink-0">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-extrabold text-blue-950 tracking-tight mb-4">University Overview</h3>
          <p className="text-sm leading-relaxed text-slate-600 font-sans mb-4">
            The Central University of Karnataka (CUK) is a public central university located in Kadaganchi village, Kalaburagi district, Karnataka, India. It is one of the central universities established by the Central Universities Act, 2009.
          </p>
          <p className="text-sm leading-relaxed text-slate-600 font-sans">
            CUK is committed to achieving academic excellence, promoting research, and empowering students through quality education and skill development across business studies, earth sciences, education, humanities, and languages.
          </p>
        </div>

        {/* Leadership Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs hover:border-slate-300 transition-all flex flex-col h-full">
          <div className="rounded-xl bg-slate-50 border border-slate-200 w-12 h-12 flex items-center justify-center text-blue-950 mb-6 shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-extrabold text-blue-950 tracking-tight mb-6">University Leadership</h3>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50">
              <div className="w-12 h-12 rounded-full bg-blue-950 text-white flex items-center justify-center font-bold shrink-0">
                BS
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 tracking-tight">Prof. Battu Satyanarayana</h4>
                <p className="text-xs text-blue-950 font-semibold uppercase tracking-wider mt-1">Vice-Chancellor</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50">
              <div className="w-12 h-12 rounded-full bg-blue-950 text-white flex items-center justify-center font-bold shrink-0">
                RB
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 tracking-tight">Prof. R. R. Biradar</h4>
                <p className="text-xs text-blue-950 font-semibold uppercase tracking-wider mt-1">Registrar</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
