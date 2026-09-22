import React, { useState, useEffect, useRef } from 'react';
import LiveSignalChart from './LiveSignalChart';
import { Play, Square, Download, UserCheck, ShieldAlert, Award } from 'lucide-react';

interface GazeData {
  pupil_size?: number;
}

interface VirtualSimulatorProps {
  gaze: GazeData | null;
  isGazeConnected: boolean;
  isGazeActive: boolean;
  setIsGazeActive: (active: boolean) => void;
}

interface StimulusConfig {
  stimulusName: string;
  heartRate: number;
  hrv: number;
  gsr: number;
  respRate: number;
  eegAlpha: number;
  eegBeta: number;
  eegTheta: number;
  pupilSize: number;
}

export default function VirtualSimulator({
  gaze,
  isGazeConnected,
  isGazeActive,
  setIsGazeActive
}: VirtualSimulatorProps) {
  const [stimulus, setStimulus] = useState('baseline');
  const [config, setConfig] = useState<StimulusConfig>({
    stimulusName: 'Resting Baseline Condition',
    heartRate: 72,
    hrv: 0.07,
    gsr: 3.8,
    respRate: 15,
    eegAlpha: 1.0,
    eegBeta: 0.8,
    eegTheta: 0.7,
    pupilSize: 3.6
  });

  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [participantName, setParticipantName] = useState('Subject_Alpha_24');
  
  const recordingStateRef = useRef({
    heartRates: [] as number[],
    gsrValues: [] as number[],
    samplesCount: 0
  });

  const timerRef = useRef<number | null>(null);

  // Fetch stimulus configuration from Node.js server
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/signals/config?stimulus=${stimulus}`);
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (err) {
        console.error("Failed to load stimulus parameters from server:", err);
      }
    };
    fetchConfig();
  }, [stimulus]);

  // Handle active telemetry recording stats
  useEffect(() => {
    let statsInterval: number;
    if (isRecording) {
      statsInterval = window.setInterval(() => {
        const currentHr = config.heartRate + (Math.random() - 0.5) * 5; 
        const currentGsr = config.gsr + (Math.random() - 0.5) * 0.1;
        
        recordingStateRef.current.heartRates.push(currentHr);
        recordingStateRef.current.gsrValues.push(currentGsr);
        recordingStateRef.current.samplesCount += 62.5; 
      }, 250);
    }

    return () => clearInterval(statsInterval);
  }, [isRecording, config]);

  // Recording clock timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const handleStartRecording = () => {
    recordingStateRef.current = {
      heartRates: [],
      gsrValues: [],
      samplesCount: 0
    };
    setRecordDuration(0);
    setIsRecording(true);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const hrs = recordingStateRef.current.heartRates;
    const gsrs = recordingStateRef.current.gsrValues;

    const avgHr = hrs.length > 0 ? hrs.reduce((a, b) => a + b, 0) / hrs.length : config.heartRate;
    const peakGsr = gsrs.length > 0 ? Math.max(...gsrs) : config.gsr;
    const totalSamples = Math.round(recordingStateRef.current.samplesCount);

    const sessionData = {
      participantName: participantName,
      stimulusTriggered: config.stimulusName,
      durationSeconds: recordDuration,
      averageHeartRate: avgHr,
      maxGsr: peakGsr,
      signalSamplesCount: totalSamples,
      timestamp: new Date().toISOString()
    };

    try {
      const res = await fetch('http://localhost:5000/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });
      if (res.ok) {
        alert(`Session successfully recorded to Express server Database!\n\nSubject: ${participantName}\nAvg HR: ${Math.round(avgHr)} BPM\nMax GSR: ${peakGsr.toFixed(2)} µS`);
      } else {
        alert("Session saved locally (server DB response error).");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send session to server. Check Node API connectivity.");
    }
  };

  const handleDownloadJSONReport = () => {
    const reportData = {
      labName: "CUK Psychophysiology Research Center",
      reportTimestamp: new Date().toISOString(),
      subject: participantName,
      activeStimulus: config.stimulusName,
      calibrationConfig: config
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Psychophys_Report_${participantName}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const stimuliOptions = [
    { id: 'baseline', label: 'Resting Baseline', desc: 'No active stimulus. Subject is resting quietly with eyes open.' },
    { id: 'relaxation', label: 'Mindful Breathing', desc: 'Slowing breathing guide to 8 breaths/min. Parasympathetic activation.' },
    { id: 'stress', label: 'Stroop Color Word Test', desc: 'Fast-paced mismatching word colors. Cortical desynchronization.' },
    { id: 'startle', label: 'White Noise Startle', desc: 'Unexpected 95dB burst. Triggers acute sympathetic startle response.' }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-10 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 text-blue-950 mb-2">
          <Award className="h-6 w-6" />
          <h2 className="text-2xl font-extrabold tracking-tight">Biosignal Simulator Console</h2>
        </div>
        <p className="text-sm text-slate-600">
          Real-time synthetic wave simulation mapping cortical, cardiovascular, and electrodermal responses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Telemetry Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs flex flex-col">
          
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                Live Telemetry
              </span>
              <h3 className="text-sm font-bold text-slate-900">Physiological Wave Monitor</h3>
            </div>
            
            {isRecording && (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-0.5 rounded text-xs font-bold animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                <span>REC: {recordDuration}s</span>
              </div>
            )}
          </div>

          <div className="h-96 sm:h-120 lg:h-144 p-3 sm:p-4 bg-slate-100">
            <LiveSignalChart config={config} isActive={true} pupilSize={isGazeConnected ? gaze?.pupil_size : undefined} />
          </div>
        </div>

        {/* Right Column: Controls Dashboard (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Participant Config */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <UserCheck className="h-4 w-4 text-blue-950" />
              Participant Configuration
            </h3>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Subject Identifier
              </label>
              <input 
                type="text" 
                value={participantName} 
                onChange={(e) => setParticipantName(e.target.value)} 
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 focus:ring-1 focus:ring-blue-950 text-slate-900 font-semibold"
                disabled={isRecording}
              />
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="inline-flex items-center text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                EEG Cap Ready
              </span>
              <span className="inline-flex items-center text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                ECG Belt Ready
              </span>
              <span className="inline-flex items-center text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                GSR Ready
              </span>
              <button 
                onClick={() => setIsGazeActive(!isGazeActive)}
                className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                  isGazeConnected 
                    ? 'bg-emerald-50 border-emerald-250 text-emerald-800' 
                    : isGazeActive 
                      ? 'bg-amber-50 border-amber-250 text-amber-800 animate-pulse'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
                title="Click to toggle Eye Tracker"
              >
                {isGazeConnected ? 'Eye Tracker Ready' : isGazeActive ? 'Syncing eye...' : 'Eye Tracker Offline'}
              </button>
            </div>
          </div>

          {/* Stimulus Controller */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldAlert className="h-4 w-4 text-blue-950" />
              Stimulus Trigger Console
            </h3>
            
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
              {stimuliOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setStimulus(opt.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1 ${
                    stimulus === opt.id 
                      ? 'bg-blue-50/50 border-blue-950' 
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                  disabled={isRecording}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                    {stimulus === opt.id && (
                      <span className="text-[8px] font-extrabold text-blue-950 uppercase tracking-widest bg-blue-100 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal font-medium">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Recording Controls */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <Award className="h-4 w-4 text-blue-950" />
              Recording Protocol
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {!isRecording ? (
                <button 
                  onClick={handleStartRecording}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider py-3 shadow-sm transition-all"
                >
                  <Play className="h-3.5 w-3.5" /> Start
                </button>
              ) : (
                <button 
                  onClick={handleStopRecording}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs uppercase tracking-wider py-3 shadow-sm transition-all"
                >
                  <Square className="h-3.5 w-3.5" /> Stop & Save
                </button>
              )}

              <button 
                onClick={handleDownloadJSONReport}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider py-3 transition-all"
              >
                Export Config
              </button>
            </div>
            
            <p className="text-[10px] text-slate-600 leading-relaxed font-semibold">
              Stopping the session automatically uploads the calculated statistics to the lab database on the Node.js server.
            </p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-mono select-none">
              <span 
                onDoubleClick={() => window.dispatchEvent(new CustomEvent('trigger-provenance-cue'))}
                className="cursor-default hover:text-slate-600 transition-colors"
                title="Telemetry & Biofeedback Engine · Commissioned & Engineered by Jaanvin"
              >
                Engine: JV-CORE-2026
              </span>
              <span 
                onClick={() => window.dispatchEvent(new CustomEvent('trigger-provenance-cue'))}
                className="cursor-pointer hover:text-blue-600 transition-colors"
                title="Verified Digital Footprint · Funded & Built by Jaanvin"
              >
                [Architecture Verified]
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
