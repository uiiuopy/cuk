import React, { useEffect, useState, useRef } from 'react';
import { Eye, HelpCircle, AlertCircle, RefreshCw, Compass, ShieldCheck } from 'lucide-react';

export default function GazeVisualizer({ onGazeUpdate, isActive, setIsGazeConnected, showOverlayOnly, setIsGazeActive }) {
  const [gazeData, setGazeData] = useState({ x: 0.5, y: 0.5, located: false, state: 'lost', pupil_size: 3.5 });
  const [status, setStatus] = useState('disconnected'); // disconnected, connecting, active, fallback
  const [fallbackReason, setFallbackReason] = useState('');
  const [calibrationPoints, setCalibrationPoints] = useState([
    { id: 1, label: 'Top Left', x: 0.15, y: 0.15, fixation: 0 },
    { id: 2, label: 'Top Center', x: 0.5, y: 0.15, fixation: 0 },
    { id: 3, label: 'Top Right', x: 0.85, y: 0.15, fixation: 0 },
    { id: 4, label: 'Mid Left', x: 0.15, y: 0.5, fixation: 0 },
    { id: 5, label: 'Center Target', x: 0.5, y: 0.5, fixation: 0 },
    { id: 6, label: 'Mid Right', x: 0.85, y: 0.5, fixation: 0 },
    { id: 7, label: 'Bottom Left', x: 0.15, y: 0.85, fixation: 0 },
    { id: 8, label: 'Bottom Center', x: 0.5, y: 0.85, fixation: 0 },
    { id: 9, label: 'Bottom Right', x: 0.85, y: 0.85, fixation: 0 },
  ]);

  const [trackingSource, setTrackingSource] = useState('browser'); // 'browser' (WebGazer), 'python' (dlib bridge), 'mouse' (simulator)
  const [webgazerLoaded, setWebgazerLoaded] = useState(false);
  const containerRef = useRef(null);

  // Hook 1: Dynamic CDN Loader for WebGazer.js
  useEffect(() => {
    if (isActive && trackingSource === 'browser' && !webgazerLoaded) {
      setStatus('connecting');
      console.log('[WebGazer Loader] Injecting WebGazer script from CDN...');
      let script = document.getElementById('webgazer-script');
      
      if (!script) {
        script = document.createElement('script');
        script.id = 'webgazer-script';
        script.src = 'https://webgazer.cs.brown.edu/webgazer.js';
        script.async = true;
        script.onload = () => {
          console.log('[WebGazer Loader] Script loaded successfully.');
          setWebgazerLoaded(true);
        };
        script.onerror = () => {
          console.error('[WebGazer Loader] Failed to load WebGazer from CDN.');
          setStatus('fallback');
          setFallbackReason("Failed to load browser webcam tracker from CDN. Falling back to mouse.");
          setTrackingSource('mouse');
        };
        document.body.appendChild(script);
      } else {
        setWebgazerLoaded(true);
      }
    }
  }, [isActive, trackingSource, webgazerLoaded]);

  // Hook 2: Browser webcam eye tracker (WebGazer) execution
  useEffect(() => {
    if (!isActive || trackingSource !== 'browser' || !webgazerLoaded || !window.webgazer) {
      // Ensure webgazer is closed on deactivate
      if (window.webgazer && (trackingSource !== 'browser' || !isActive)) {
        try {
          window.webgazer.end();
          cleanupWebGazerDOM();
        } catch (e) {}
      }
      return;
    }

    console.log('[Gaze WebGazer] Launching browser webcam eye tracker...');
    setStatus('active');
    setIsGazeConnected(true);

    try {
      window.webgazer.setGazeListener((data, elapsedTime) => {
        if (data == null) {
          setGazeData((prev) => ({ ...prev, located: false, state: 'lost' }));
          return;
        }
        
        // Convert screen coordinates (pixels) to relative bounds (0.0 to 1.0)
        const rx = data.x / window.innerWidth;
        const ry = data.y / window.innerHeight;

        const gazeUpdate = {
          located: true,
          state: 'center',
          x: parseFloat(Math.max(0, Math.min(1, rx)).toFixed(4)),
          y: parseFloat(Math.max(0, Math.min(1, ry)).toFixed(4)),
          pupil_size: parseFloat((3.4 + Math.sin(elapsedTime / 1000) * 0.15).toFixed(2)),
          mode: 'webgazer'
        };

        setGazeData(gazeUpdate);
        if (onGazeUpdate) onGazeUpdate(gazeUpdate);
        updateFixations(gazeUpdate.x, gazeUpdate.y);
      });

      window.webgazer.showVideoPreview(true)
        .showPredictionPoints(true)
        .applyKalmanFilter(true)
        .begin();

      // Style WebGazer video window to fit nicely in bottom-right corner instead of top-left blocking navbar
      setTimeout(() => {
        const videoFeed = document.getElementById('webgazerVideoFeed');
        const faceFeedback = document.getElementById('webgazerFaceFeedbackBox');
        if (videoFeed) {
          videoFeed.style.top = 'auto';
          videoFeed.style.bottom = '20px';
          videoFeed.style.left = '20px';
          videoFeed.style.width = '160px';
          videoFeed.style.height = '120px';
          videoFeed.style.borderRadius = '8px';
          videoFeed.style.border = '2px solid var(--accent-pink)';
          videoFeed.style.boxShadow = 'var(--glow-pink)';
          videoFeed.style.zIndex = '9999';
        }
        if (faceFeedback) {
          faceFeedback.style.top = 'auto';
          faceFeedback.style.bottom = '20px';
          faceFeedback.style.left = '20px';
          faceFeedback.style.width = '160px';
          faceFeedback.style.height = '120px';
          faceFeedback.style.zIndex = '10000';
        }
      }, 500);

    } catch (e) {
      console.error("[WebGazer] Init failed:", e);
      setStatus('fallback');
      setFallbackReason("Webcam access denied or browser canvas error.");
      setTrackingSource('mouse');
    }

    return () => {
      console.log('[Gaze WebGazer] Cleaning up WebGazer tracker...');
      if (window.webgazer) {
        try {
          window.webgazer.end();
        } catch (err) {}
      }
      cleanupWebGazerDOM();
      setIsGazeConnected(false);
    };
  }, [isActive, trackingSource, webgazerLoaded]);

  const cleanupWebGazerDOM = () => {
    const video = document.getElementById('webgazerVideoFeed');
    const canvas = document.getElementById('webgazerVideoCanvas');
    const faceBox = document.getElementById('webgazerFaceFeedbackBox');
    const faceOverlay = document.getElementById('webgazerFaceOverlay');
    if (video) video.remove();
    if (canvas) canvas.remove();
    if (faceBox) faceBox.remove();
    if (faceOverlay) faceOverlay.remove();
  };

  // Hook 3: Python Gaze Bridge — explicit start/stop + SSE data stream
  useEffect(() => {
    if (!isActive || trackingSource !== 'python') return;

    setStatus('connecting');
    setIsGazeConnected(false);
    console.log('[Gaze Python] Starting Python tracker and subscribing to SSE...');

    // 1. Tell the server to spawn (or restart) the Python process
    fetch('http://localhost:5000/api/gaze/start', { method: 'POST' })
      .then(r => r.json())
      .then(data => console.log('[Gaze Python] Server responded:', data))
      .catch(err => console.error('[Gaze Python] Start request failed:', err));

    // 2. Subscribe to the SSE data stream
    const eventSource = new EventSource('http://localhost:5000/api/gaze/stream');

    eventSource.onopen = () => {
      console.log('[Gaze SSE] Connected to data stream.');
    };

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);

        if (parsed.type === 'status') {
          if (parsed.status === 'ready') {
            console.log('[Gaze SSE] Python bridge is ready:', parsed.message);
            setStatus('active');
            setIsGazeConnected(true);
          } else if (parsed.status === 'fallback') {
            setStatus('fallback');
            setFallbackReason(parsed.reason);
          }
        } else if (parsed.type === 'data') {
          setStatus('active');
          setIsGazeConnected(true);
          setGazeData(parsed);
          if (onGazeUpdate) onGazeUpdate(parsed);
          updateFixations(parsed.x, parsed.y);
        }
      } catch (err) {
        console.error("Gaze SSE parsing error:", err);
      }
    };

    eventSource.onerror = () => {
      console.warn('[Gaze SSE] Connection error.');
      setStatus('fallback');
      setFallbackReason("Could not connect to the Python gaze server. Is the server running?");
    };

    // Cleanup: only fires when isActive turns false or trackingSource changes away from python
    return () => {
      console.log('[Gaze Python] Stopping tracker and closing SSE.');
      eventSource.close();
      fetch('http://localhost:5000/api/gaze/stop', { method: 'POST' }).catch(() => {});
      setIsGazeConnected(false);
      setStatus('disconnected');
    };
  }, [isActive, trackingSource]);

  // Hook 4: Mouse Simulator Gaze Telemetry
  useEffect(() => {
    if (!isActive || trackingSource !== 'mouse') return;

    console.log('[Gaze Mouse] Spawning local mouse tracking listener...');
    setStatus('fallback');
    setIsGazeConnected(true);

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

      const simulatedData = {
        located: true,
        state: 'center',
        x,
        y,
        pupil_size: parseFloat((3.4 + Math.sin(Date.now() / 800) * 0.25).toFixed(2)),
        mode: 'mouse'
      };

      setGazeData(simulatedData);
      if (onGazeUpdate) onGazeUpdate(simulatedData);
      updateFixations(x, y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      setIsGazeConnected(false);
    };
  }, [isActive, trackingSource]);

  const [calibrationClicks, setCalibrationClicks] = useState(new Array(9).fill(0));

  const updateFixations = (gx, gy) => {
    setCalibrationPoints((prev) =>
      prev.map((pt) => {
        const dist = Math.sqrt(Math.pow(gx - pt.x, 2) + Math.pow(gy - pt.y, 2));
        if (dist < 0.12) {
          return { ...pt, fixation: Math.min(100, pt.fixation + 3) };
        } else {
          return { ...pt, fixation: Math.max(0, pt.fixation - 0.8) };
        }
      })
    );
  };

  const handleTargetClick = (e, pt, idx) => {
    e.stopPropagation();
    if (!isActive || trackingSource !== 'browser') return;

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = rect.left + pt.x * rect.width;
    const clickY = rect.top + pt.y * rect.height;

    // Train WebGazer at this target's pixel coordinates
    if (window.webgazer) {
      window.webgazer.recordScreenPosition(clickX, clickY, 'click');
      console.log(`[WebGazer Calibration] Registered click at X: ${clickX}, Y: ${clickY}`);
    }

    setCalibrationClicks((prev) => {
      const copy = [...prev];
      copy[idx] = Math.min(2, copy[idx] + 1);
      return copy;
    });
  };

  const handleResetHeatmaps = () => {
    setCalibrationPoints((prev) => prev.map((pt) => ({ ...pt, fixation: 0 })));
  };

  const handleResetCalibration = () => {
    setCalibrationClicks(new Array(9).fill(0));
    if (window.webgazer) {
      try {
        window.webgazer.clearData();
        console.log('[WebGazer Calibration] Data cleared.');
      } catch (err) {}
    }
  };

  if (!isActive && showOverlayOnly) return null;

  if (showOverlayOnly) {
    if (!gazeData.located) return null;
    return (
      <div
        className="gaze-reticle fixed-reticle"
        style={{
          position: 'fixed',
          left: `${gazeData.x * window.innerWidth}px`,
          top: `${gazeData.y * window.innerHeight}px`,
          borderColor: trackingSource === 'mouse' ? 'var(--accent-cyan)' : 'var(--accent-pink)',
          boxShadow: trackingSource === 'mouse' ? 'var(--glow-cyan)' : 'var(--glow-pink)',
          pointerEvents: 'none',
          zIndex: 10000,
          width: '32px',
          height: '32px',
          border: '2px solid var(--accent-pink)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          transition: 'left 0.08s ease, top 0.08s ease'
        }}
      >
        <div className="reticle-core" style={{ position: 'absolute', width: '6px', height: '6px', background: 'var(--text-main)', borderRadius: '50%', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
        <div className="reticle-line-h" style={{ position: 'absolute', width: '44px', height: '1px', background: 'rgba(255, 255, 255, 0.35)', left: '-6px', top: '50%' }} />
        <div className="reticle-line-v" style={{ position: 'absolute', width: '1px', height: '44px', background: 'rgba(255, 255, 255, 0.35)', left: '50%', top: '-6px' }} />
      </div>
    );
  }

  return (
    <div className="gaze-visualizer-layout" ref={containerRef}>
      {/* 3x3 Heatmap Grid Area */}
      <div className="heatmap-grid-canvas glass-panel">
        <div className="grid-header">
          <div className="panel-title-row">
            <Compass className="glow-text-pink" size={16} />
            <h3>Oculomotor Heatmap Grid</h3>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {trackingSource === 'browser' && (
              <button className="btn-outline btn-xs" onClick={handleResetCalibration}>
                Reset Calibration
              </button>
            )}
            <button className="btn-outline btn-xs" onClick={handleResetHeatmaps}>
              Reset Heatmap
            </button>
          </div>
        </div>

        {/* 9 Grid Targets */}
        <div className="targets-wrapper">
          {trackingSource === 'browser' && isActive && (
            <div className="calibration-instructions animate-pulse" style={{ position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', zIndex: 15, background: 'rgba(7,7,20,0.85)', border: '1px solid var(--accent-yellow)', padding: '8px 16px', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--accent-yellow)', textAlign: 'center', pointerEvents: 'none', maxWidth: '500px' }}>
              <strong>CALIBRATION MODE</strong>: Look directly at each target below and <strong>click it 2 times</strong>. They will turn green when calibrated!
            </div>
          )}
          
          {calibrationPoints.map((pt, idx) => {
            const clicks = calibrationClicks[idx] || 0;
            const isCalibrated = clicks >= 2;
            const isBrowserActive = trackingSource === 'browser' && isActive;
            
            return (
              <button
                key={pt.id}
                className="heatmap-target"
                onClick={(e) => handleTargetClick(e, pt, idx)}
                disabled={!isBrowserActive}
                style={{
                  left: `${pt.x * 100}%`,
                  top: `${pt.y * 100}%`,
                  cursor: isBrowserActive ? 'pointer' : 'default',
                  '--target-glow': `rgba(255, 0, 127, ${pt.fixation / 100})`,
                  boxShadow: isCalibrated 
                    ? 'var(--glow-green)' 
                    : clicks > 0 
                      ? '0 0 10px rgba(255, 215, 0, 0.4)' 
                      : pt.fixation > 5 
                        ? `0 0 ${10 + pt.fixation * 0.3}px rgba(255, 0, 127, ${pt.fixation / 100})` 
                        : 'none',
                  borderColor: isCalibrated 
                    ? 'var(--accent-green)' 
                    : clicks > 0 
                      ? 'var(--accent-yellow)' 
                      : pt.fixation > 5 
                        ? `rgba(255, 0, 127, ${0.2 + pt.fixation / 100})` 
                        : 'var(--border-color)',
                  background: isCalibrated 
                    ? 'rgba(57, 255, 20, 0.08)' 
                    : clicks > 0 
                      ? 'rgba(255, 215, 0, 0.05)' 
                      : 'rgba(13, 13, 30, 0.4)'
                }}
              >
                <div className="target-pulse" style={{ opacity: pt.fixation / 100 }} />
                <span className="target-label" style={{ opacity: (pt.fixation > 10 || clicks > 0) ? 1 : 0.4 }}>
                  {isCalibrated ? 'READY' : clicks > 0 ? `${clicks}/2` : pt.fixation > 0 ? `${Math.round(pt.fixation)}%` : pt.label}
                </span>
              </button>
            );
          })}

          {/* Glowing Gaze Reticle Cursor */}
          {gazeData.located && (
            <div
              className="gaze-reticle"
              style={{
                left: `${gazeData.x * 100}%`,
                top: `${gazeData.y * 100}%`,
                borderColor: trackingSource === 'mouse' ? 'var(--accent-cyan)' : 'var(--accent-pink)',
                boxShadow: trackingSource === 'mouse' ? 'var(--glow-cyan)' : 'var(--glow-pink)'
              }}
            >
              <div className="reticle-core" />
              <div className="reticle-line-h" />
              <div className="reticle-line-v" />
            </div>
          )}
        </div>
      </div>

      {/* Control / Troubleshooting Side Panel */}
      <div className="gaze-controls-side glass-panel flex-col">
        <h3 className="panel-title-cyber"><Eye size={16} /> Gaze Calibration</h3>

        <button 
          className={`btn-primary ${isActive ? 'active-rec' : ''}`}
          onClick={() => setIsGazeActive(!isActive)}
          style={{ width: '100%', marginBottom: '14px' }}
        >
          {isActive ? 'Stop Gaze Tracking' : 'Start Gaze Tracking'}
        </button>

        {/* Source selector */}
        <div className="input-group" style={{ marginBottom: '8px' }}>
          <label className="input-label">Tracking Source</label>
          <select 
            value={trackingSource} 
            onChange={(e) => setTrackingSource(e.target.value)} 
            className="cyber-input"
            disabled={isActive}
            style={{ width: '100%' }}
          >
            <option value="browser">Browser Webcam (WebGazer - Instant)</option>
            <option value="python">Local Python Server (MediaPipe - Recommended)</option>
            <option value="mouse">Interactive Mouse Simulator</option>
          </select>
        </div>

        <div className="gaze-metrics-box flex-col">
          <div className="metric-row">
            <span className="key">Gaze Status:</span>
            <span className={`val ${gazeData.located ? 'active-green' : 'lost-red'}`}>
              {isActive ? (gazeData.located ? (gazeData.state === 'blinking' ? 'BLINKING' : 'LOCKED') : 'SEARCHING...') : 'INACTIVE'}
            </span>
          </div>
          <div className="metric-row">
            <span className="key">Telemetry Source:</span>
            <span className="val cyan-text">
              {trackingSource === 'browser' ? 'BROWSER WEBCAM' : trackingSource === 'python' ? 'PYTHON CORE' : 'MOUSE SIMULATOR'}
            </span>
          </div>
          <div className="metric-row">
            <span className="key">Focus Point:</span>
            <span className="val">
              X: {gazeData.x.toFixed(3)} / Y: {gazeData.y.toFixed(3)}
            </span>
          </div>
          <div className="metric-row">
            <span className="key">Pupil Size:</span>
            <span className="val pink-text">
              {gazeData.pupil_size > 0 ? `${gazeData.pupil_size.toFixed(2)} mm` : 'Closed'}
            </span>
          </div>
        </div>

        {/* Dynamic Fallback / Troubleshooting banner */}
        {trackingSource === 'python' && status === 'fallback' && (
          <div className="troubleshoot-banner glass-panel">
            <div className="banner-title">
              <AlertCircle size={16} className="warn-icon" />
              <span>Python Gaze Server Fallback</span>
            </div>
            <p className="banner-text">
              The Express backend could not spawn the camera process. {fallbackReason}
            </p>
            <div className="divider-line" />
            <h4 className="steps-title">To enable Python Gaze tracking:</h4>
            <ol className="steps-list">
              <li>Run: <pre className="code-snippet">pip install opencv-python numpy mediapipe</pre></li>
              <li>Ensure no other app is using your webcam, then click **Start Gaze Tracking**!</li>
            </ol>
          </div>
        )}

        {trackingSource === 'browser' && status === 'active' && (
          <div className="success-banner glass-panel">
            <div className="banner-title text-green">
              <ShieldCheck size={16} />
              <span>Browser WebGazer Active</span>
            </div>
            <p className="banner-text">
              WebGazer.js is running inside your browser. Grant camera access in the browser popup.
              A camera window will appear in the bottom-left. Focus your gaze on targets to train/calibrate.
            </p>
          </div>
        )}

        {trackingSource === 'python' && status === 'active' && (
          <div className="python-video-panel glass-panel" style={{ marginTop: '12px' }}>
            <div className="banner-title text-green" style={{ marginBottom: '8px' }}>
              <ShieldCheck size={16} />
              <span>Live Eye Tracking Feed</span>
            </div>
            <div style={{
              position: 'relative',
              width: '100%',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid var(--accent-green)',
              boxShadow: '0 0 15px rgba(57, 255, 20, 0.15)',
              background: '#000'
            }}>
              <img
                src="http://localhost:5001/video"
                alt="Eye Tracking Feed"
                style={{
                  width: '100%',
                  display: 'block',
                  borderRadius: '8px'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(0,0,0,0.7)',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.7rem',
                color: 'var(--accent-green)',
                fontWeight: 600
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--accent-green)',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }} />
                LIVE
              </div>
            </div>
            <p className="banner-text" style={{ marginTop: '8px', fontSize: '0.72rem', opacity: 0.7 }}>
              MediaPipe iris tracking active. Move your eyes to see the gaze arrows follow.
            </p>
          </div>
        )}
      </div>

      <style>{`
        .gaze-visualizer-layout {
          display: grid;
          grid-template-columns: 5fr 3fr;
          gap: 24px;
          height: 100%;
        }

        .heatmap-grid-canvas {
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow: hidden;
          position: relative;
          background: #030308;
          min-height: 450px;
        }

        .grid-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 18px;
          border-bottom: 1px solid var(--border-color);
          background: rgba(7, 7, 20, 0.4);
          z-index: 10;
        }

        .btn-xs {
          font-size: 0.65rem;
          padding: 4px 8px;
        }

        .targets-wrapper {
          flex: 1;
          position: relative;
          overflow: hidden;
        }

        .heatmap-target {
          position: absolute;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 1px dashed var(--border-color);
          background: rgba(13, 13, 30, 0.4);
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .target-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: var(--accent-pink);
          animation: target-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          pointer-events: none;
        }

        @keyframes target-ping {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        .target-label {
          font-family: var(--font-tech);
          font-size: 0.58rem;
          text-align: center;
          color: var(--text-main);
          white-space: nowrap;
          z-index: 5;
        }

        /* Gaze Reticle Pointer */
        .gaze-reticle {
          position: absolute;
          width: 32px;
          height: 32px;
          border: 2px solid var(--accent-pink);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          transition: left 0.08s ease, top 0.08s ease; /* smooth movement slightly */
          z-index: 20;
        }

        .reticle-core {
          position: absolute;
          width: 6px;
          height: 6px;
          background: var(--text-main);
          border-radius: 50%;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        .reticle-line-h {
          position: absolute;
          width: 44px;
          height: 1px;
          background: rgba(255, 255, 255, 0.35);
          left: -6px;
          top: 50%;
        }

        .reticle-line-v {
          position: absolute;
          width: 1px;
          height: 44px;
          background: rgba(255, 255, 255, 0.35);
          left: 50%;
          top: -6px;
        }

        /* Side Controls Panel */
        .gaze-controls-side {
          padding: 16px;
          justify-content: flex-start;
          gap: 16px;
          overflow-y: auto;
        }

        .gaze-metrics-box {
          gap: 12px;
          background: rgba(7, 7, 20, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.02);
          padding: 14px;
          border-radius: 8px;
        }

        .metric-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          font-family: var(--font-tech);
        }

        .metric-row .key {
          color: var(--text-muted);
        }

        .metric-row .val {
          color: var(--text-main);
          font-weight: 600;
        }

        .metric-row .active-green {
          color: var(--accent-green);
          text-shadow: var(--glow-green);
        }

        .metric-row .lost-red {
          color: var(--accent-pink);
          text-shadow: var(--glow-pink);
        }

        .cyan-text {
          color: var(--accent-cyan) !important;
        }

        .pink-text {
          color: var(--accent-pink) !important;
        }

        /* Troubleshooting Banner */
        .troubleshoot-banner {
          background: rgba(255, 215, 0, 0.02);
          border: 1px solid rgba(255, 215, 0, 0.15);
          padding: 12px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .banner-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-tech);
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--accent-yellow);
          text-transform: uppercase;
        }

        .banner-title.text-green {
          color: var(--accent-green);
        }

        .banner-text {
          font-size: 0.75rem;
          line-height: 1.4;
          color: var(--text-muted);
        }

        .divider-line {
          height: 1px;
          background: rgba(255, 215, 0, 0.1);
          margin: 4px 0;
        }

        .steps-title {
          font-family: var(--font-tech);
          font-size: 0.65rem;
          color: var(--text-main);
          text-transform: uppercase;
        }

        .steps-list {
          font-size: 0.72rem;
          color: var(--text-muted);
          padding-left: 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .code-snippet {
          background: rgba(0, 0, 0, 0.4);
          color: var(--accent-cyan);
          padding: 4px 8px;
          border-radius: 4px;
          font-family: monospace;
          margin-top: 4px;
          display: block;
          overflow-x: auto;
        }

        .success-banner {
          background: rgba(57, 255, 20, 0.02);
          border: 1px solid rgba(57, 255, 20, 0.15);
          padding: 12px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        @media (max-width: 900px) {
          .gaze-visualizer-layout {
            grid-template-columns: 1fr;
          }
          .heatmap-grid-canvas {
            height: 380px;
          }
        }
      `}</style>
    </div>
  );
}
