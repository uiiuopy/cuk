import React, { useState, useEffect, useRef } from 'react';
import LiveSignalChart from './LiveSignalChart';
import { Play, Square, Download, CloudUpload, UserCheck, ShieldAlert, Award, FileSpreadsheet } from 'lucide-react';

export default function VirtualSimulator({ gaze, isGazeConnected, isGazeActive, setIsGazeActive }) {
  const [stimulus, setStimulus] = useState('baseline');
  const [config, setConfig] = useState({
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
  
  // Recording accumulators
  const recordingStateRef = useRef({
    heartRates: [],
    gsrValues: [],
    samplesCount: 0
  });

  const timerRef = useRef(null);

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
    let statsInterval;
    if (isRecording) {
      // Accumulate metrics every 250ms for session averaging
      statsInterval = setInterval(() => {
        const currentHr = config.heartRate + (Math.random() - 0.5) * 5; // add local pulse noise
        const currentGsr = config.gsr + (Math.random() - 0.5) * 0.1;
        
        recordingStateRef.current.heartRates.push(currentHr);
        recordingStateRef.current.gsrValues.push(currentGsr);
        recordingStateRef.current.samplesCount += 62.5; // Estimate samples (250Hz sampling)
      }, 250);
    }

    return () => clearInterval(statsInterval);
  }, [isRecording, config]);

  // Recording clock timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
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
    clearInterval(timerRef.current);

    const hrs = recordingStateRef.current.heartRates;
    const gsrs = recordingStateRef.current.gsrValues;

    const avgHr = hrs.length > 0 ? hrs.reduce((a, b) => a + b, 0) / hrs.length : config.heartRate;
    const peakGsr = gsrs.length > 0 ? Math.max(...gsrs) : config.gsr;
    const totalSamples = Math.round(recordingStateRef.current.samplesCount);

    // Prompt user to save session to Node.js backend
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
    <div className="simulator-grid">
      {/* Telemetry Monitor */}
      <div className="chart-panel-container glass-panel">
        <div className="monitor-header">
          <div className="monitor-title-row">
            <span className="live-badge">LIVE TELEMETRY</span>
            <h2>Biosignal Monitor</h2>
          </div>
          {isRecording && (
            <div className="recording-status">
              <span className="recording-dot"></span>
              <span className="recording-timer">REC: {recordDuration}s</span>
            </div>
          )}
        </div>
        <div className="canvas-wrapper">
          <LiveSignalChart config={config} isActive={true} pupilSize={isGazeConnected ? gaze?.pupil_size : undefined} />
        </div>
      </div>

      {/* Control Dashboard */}
      <div className="controls-panel-container flex-col">
        {/* Subject Config */}
        <div className="glass-panel sub-panel">
          <h3 className="panel-title-cyber"><UserCheck size={16} /> Participant Configuration</h3>
          <div className="input-group">
            <label className="input-label">Subject Identifier</label>
            <input 
              type="text" 
              value={participantName} 
              onChange={(e) => setParticipantName(e.target.value)} 
              className="cyber-input"
              disabled={isRecording}
            />
          </div>
          <div className="sensors-summary">
            <span className="sensor-tag active">EEG Cap (Ready)</span>
            <span className="sensor-tag active">ECG Belt (Ready)</span>
            <span className="sensor-tag active">GSR Electrodes (Ready)</span>
            <span 
              className={`sensor-tag clickable ${isGazeConnected ? 'active' : isGazeActive ? 'connecting' : 'disabled'}`}
              onClick={() => setIsGazeActive(!isGazeActive)}
              title="Click to toggle Gaze Tracking"
            >
              {isGazeConnected ? 'Eye Tracker (Ready)' : isGazeActive ? 'Eye Tracker (Syncing...)' : 'Eye Tracker (Offline - Click to Enable)'}
            </span>
          </div>
        </div>

        {/* Stimulus Controller */}
        <div className="glass-panel sub-panel stimulus-selector-panel">
          <h3 className="panel-title-cyber"><ShieldAlert size={16} /> Stimulus Trigger Console</h3>
          <div className="stimuli-vertical-list">
            {stimuliOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setStimulus(opt.id)}
                className={`stimulus-option-btn ${stimulus === opt.id ? 'active' : ''}`}
                disabled={isRecording}
              >
                <div className="stimulus-option-label-row">
                  <span className="stimulus-opt-title">{opt.label}</span>
                  {stimulus === opt.id && <span className="active-glow-tag">ACTIVE</span>}
                </div>
                <p className="stimulus-opt-desc">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Experiment Recording Controls */}
        <div className="glass-panel sub-panel recording-controls-panel">
          <h3 className="panel-title-cyber"><Award size={16} /> Recording Protocol</h3>
          <div className="action-buttons-grid">
            {!isRecording ? (
              <button className="btn-primary flex-center" onClick={handleStartRecording}>
                <Play size={14} /> Start Session
              </button>
            ) : (
              <button className="btn-primary active-rec flex-center" onClick={handleStopRecording}>
                <Square size={14} /> Stop & Save
              </button>
            )}

            <button className="btn-outline flex-center" onClick={handleDownloadJSONReport}>
              <Download size={14} /> Export Config
            </button>
          </div>
          <p className="rec-hint-text">Stopping the session automatically uploads the calculated statistics to the lab database on the Node.js server.</p>
        </div>
      </div>

      <style>{`
        .simulator-grid {
          display: grid;
          grid-template-columns: 8fr 4fr;
          gap: 24px;
          height: calc(100vh - 130px);
          min-height: 550px;
        }

        .chart-panel-container {
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow: hidden;
        }

        .monitor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          background: rgba(7, 7, 20, 0.4);
        }

        .monitor-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .monitor-title-row h2 {
          font-size: 1.05rem;
          font-weight: 700;
        }

        .live-badge {
          font-family: var(--font-tech);
          font-size: 0.6rem;
          font-weight: 900;
          color: var(--bg-darker);
          background-color: var(--accent-pink);
          padding: 3px 6px;
          border-radius: 4px;
          box-shadow: var(--glow-pink);
          letter-spacing: 1px;
        }

        .recording-status {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 0, 127, 0.05);
          border: 1px solid rgba(255, 0, 127, 0.2);
          padding: 4px 10px;
          border-radius: 4px;
        }

        .recording-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-pink);
          animation: beacon 1s infinite;
        }

        .recording-timer {
          font-family: var(--font-tech);
          font-size: 0.72rem;
          color: var(--accent-pink);
          font-weight: 600;
        }

        .canvas-wrapper {
          flex: 1;
          background: #030308;
          position: relative;
        }

        /* Controls Column */
        .controls-panel-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
        }

        .sub-panel {
          padding: 16px;
        }

        .panel-title-cyber {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-main);
          margin-bottom: 12px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 8px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-label {
          font-family: var(--font-tech);
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .cyber-input {
          background: #ffffff;
          border: 1px solid var(--border-color);
          color: var(--text-main);
          padding: 8px 12px;
          border-radius: 4px;
          font-family: var(--font-body);
          font-size: 0.88rem;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .cyber-input:focus {
          border-color: var(--accent-cyan);
          box-shadow: 0 0 0 2px rgba(11, 34, 64, 0.1);
        }

        .sensors-summary {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 12px;
        }

        .sensor-tag {
          font-family: var(--font-tech);
          font-size: 0.62rem;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .sensor-tag.active {
          background: rgba(0, 240, 255, 0.05);
          color: var(--accent-cyan);
          border: 1px solid rgba(0, 240, 255, 0.2);
        }

        .sensor-tag.connecting {
          background: rgba(255, 215, 0, 0.05);
          color: var(--accent-yellow);
          border: 1px solid rgba(255, 215, 0, 0.2);
          animation: beacon 1.5s infinite;
        }

        .sensor-tag.clickable {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sensor-tag.clickable:hover {
          border-color: var(--accent-pink);
          color: var(--accent-pink);
          background: rgba(255, 0, 127, 0.05);
          box-shadow: var(--glow-pink);
        }

        .sensor-tag.disabled {
          background: var(--bg-darker);
          color: var(--text-muted);
          border: 1px solid var(--border-color);
          opacity: 0.4;
        }

        /* Stimulus Console */
        .stimulus-selector-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .stimuli-vertical-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
          flex: 1;
        }

        .stimulus-option-btn {
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 10px 12px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
        }

        .stimulus-option-btn:hover:not(:disabled) {
          background: #f8fafc;
          border-color: var(--border-color-hover);
        }

        .stimulus-option-btn.active {
          background: rgba(11, 34, 64, 0.04);
          border-color: var(--accent-cyan);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .stimulus-option-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .stimulus-opt-title {
          font-family: var(--font-tech);
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .active-glow-tag {
          font-family: var(--font-tech);
          font-size: 0.55rem;
          font-weight: 900;
          color: var(--accent-cyan);
          text-shadow: 0 0 5px var(--accent-cyan);
        }

        .stimulus-opt-desc {
          font-size: 0.72rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        /* Recording Protocol */
        .action-buttons-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 12px;
        }

        .flex-center {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .active-rec {
          background-color: var(--accent-pink);
          border-color: var(--accent-pink);
          color: var(--text-main);
          box-shadow: var(--glow-pink);
        }

        .active-rec:hover {
          background-color: transparent;
          color: var(--accent-pink);
        }

        .rec-hint-text {
          font-size: 0.68rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        @media (max-width: 900px) {
          .simulator-grid {
            grid-template-columns: 1fr;
            height: auto;
          }
          .canvas-wrapper {
            height: 380px;
          }
        }
      `}</style>
    </div>
  );
}
