import React from 'react';
import { Eye, Target, BookOpen, Brain, Activity, Shield, Users, Compass, Cpu, Landmark } from 'lucide-react';

export default function About() {
  const subDisciplines = [
    { title: 'Cognitive Neuroscience', desc: 'Investigating neural substrates of mental processes, memory representation, and cognitive control mechanisms.', icon: Brain },
    { title: 'Psychophysiology', desc: 'Mapping the relationships between physiological activity and psychological processes (e.g., EEG, skin conductance, heart rate).', icon: Activity },
    { title: 'Biofeedback & Neurofeedback', desc: 'Developing self-regulation training protocols utilizing real-time autonomic and central nervous system feedback.', icon: Compass },
    { title: 'Neuropsychology', desc: 'Assessing brain-behavior relationships and cognitive deficits in clinical and healthy cohorts.', icon: Shield },
    { title: 'Emotion Regulation', desc: 'Studying cognitive reappraisal, affective states, and autonomic integration during emotional tasks.', icon: Users },
    { title: 'EEG & ERP Research', desc: 'Analyzing electroencephalographic microstates, spectral power, and event-related potentials.', icon: Cpu },
  ];

  return (
    <div className="w-full">
      {/* Header Banner with generated clinical lab backdrop */}
      <div className="relative w-full h-80 overflow-hidden flex items-center justify-center bg-slate-900">
        <img
          src="/clinical_lab_bg.png"
          alt="Clinical Laboratory Backdrop"
          className="absolute inset-0 w-full h-full object-cover opacity-45 blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/50 to-transparent" />
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <span className="text-xs uppercase tracking-widest text-slate-300 font-bold mb-3 block">
            Department of Psychology, Central University of Karnataka
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
            Biofeedback and Cognitive Neuroscience Laboratory
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Core Introductory Stack */}
        <div className="space-y-12">
          
          {/* Main Lab Overview / Our Foundations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
            <h2 className="text-2xl font-extrabold text-blue-950 tracking-tight border-b border-slate-200 pb-3 flex items-center gap-3">
              <Landmark className="h-6 w-6 text-blue-950" />
              Our Foundations
            </h2>
            
            <p className="text-base leading-relaxed text-slate-700 font-sans">
              The Biofeedback Lab, Department of Psychology, Central University of Karnataka, has evolved from the Department's long-standing emphasis on psychophysiological research and training. Its foundations can be traced to 2015–16, when the University initiated the procurement and installation of a multi-channel biofeedback system for the Psychophysiological Laboratory.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-950 mb-1">
                <span className="h-2 w-2 rounded-full bg-blue-950" />
                Key Milestone · Formal Inauguration
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-slate-700">
                A significant milestone in this journey was the formal inauguration of the Biofeedback Lab on <strong>21 February 2025</strong> by the Hon’ble Vice-Chancellor of the Central University of Karnataka, <strong>Prof. Battu Satyanarayana</strong>. The expanded facility strengthened the Department's capacity for advanced psychophysiological and neuroelectrical research, with facilities for 64-channel EEG/ERP and physiological measures including GSR/EDA, HRV, EMG, EOG, BVP, respiration, and peripheral temperature.
              </p>
            </div>

            <p className="text-base leading-relaxed text-slate-700 font-sans">
              Today, the Biofeedback Lab supports faculty and doctoral research, postgraduate dissertations, hands-on student training, and interdisciplinary research exploring the relationships among brain, behaviour, cognition, emotion, and physiological processes.
            </p>
          </div>

          {/* Sequential Stack: Vision, Mission, Objectives */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
            
            {/* Vision */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-300">
              <div>
                <div className="rounded-lg bg-blue-50 w-12 h-12 flex items-center justify-center text-blue-900 mb-6">
                  <Eye className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Vision</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  To become a leading centre for translational cognitive neuroscience and biofeedback research in India.
                </p>
              </div>
            </div>

            {/* Mission */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-300">
              <div>
                <div className="rounded-lg bg-blue-50 w-12 h-12 flex items-center justify-center text-blue-900 mb-6">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Mission</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Advance scientific understanding of cognition, emotion and behaviour through rigorous psychophysiological research and training.
                </p>
              </div>
            </div>

            {/* Objectives */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-300">
              <div>
                <div className="rounded-lg bg-blue-50 w-12 h-12 flex items-center justify-center text-blue-900 mb-6">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Objectives</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  To facilitate interdisciplinary research, provide hands-on training in psychophysiological methods, and support high-quality student and faculty research.
                </p>
              </div>
            </div>

          </div>

          {/* Sub-Disciplines Grid */}
          <div className="pt-8">
            <h2 className="text-2xl font-extrabold text-blue-950 mb-2 tracking-tight border-b border-slate-200 pb-2">
              Supported Sub-Disciplines
            </h2>
            <p className="text-sm text-slate-500 mb-8">
              Key domains of academic and translational inquiry active in the BCNL environment.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subDisciplines.map((sub, idx) => {
                const Icon = sub.icon;
                return (
                  <div key={idx} className="flex gap-4 p-5 bg-white rounded-xl border border-slate-200 transition-all hover:shadow-sm">
                    <div className="text-blue-900 shrink-0 bg-slate-50 p-2.5 rounded-lg h-11 w-11 flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 tracking-tight mb-1">
                        {sub.title}
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-600">
                        {sub.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
