import React, { useEffect, useState, useRef } from 'react';
import { Eye, HelpCircle, AlertCircle, RefreshCw, Compass, ShieldCheck } from 'lucide-react';

interface GazeUpdate {
  x: number;
  y: number;
  located: boolean;
  state: string;
  pupil_size: number;
  mode?: string;
}

interface GazeVisualizerProps {
  onGazeUpdate: (data: GazeUpdate) => void;
  isActive: boolean;
  setIsGazeConnected: (connected: boolean) => void;
  showOverlayOnly: boolean;
  setIsGazeActive: (active: boolean) => void;
}

interface CalibrationPoint {
  id: number;
  label: string;
  x: number;
  y: number;
  fixation: number;
}

export default function GazeVisualizer({
  onGazeUpdate,
  isActive,
  setIsGazeConnected,
  showOverlayOnly,
  setIsGazeActive
}: GazeVisualizerProps) {
  const [gazeData, setGazeData] = useState<GazeUpdate>({ x: 0.5, y: 0.5, located: false, state: 'lost', pupil_size: 3.5 });
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'active' | 'fallback'>('disconnected');
  const [fallbackReason, setFallbackReason] = useState('');
  const [calibrationPoints, setCalibrationPoints] = useState<CalibrationPoint[]>([
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

  const [calibrationClicks, setCalibrationClicks] = useState<Record<number, number>>({});
  const [trackingSource, setTrackingSource] = useState<'browser' | 'python' | 'mouse'>('mouse');
  const [webgazerLoaded, setWebgazerLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Hook 1: Dynamic CDN Loader for WebGazer.js
  useEffect(() => {
    if (isActive && trackingSource === 'browser' && !webgazerLoaded) {
      setStatus('connecting');
      let script = document.getElementById('webgazer-script') as HTMLScriptElement;
      
      if (!script) {
        script = document.createElement('script');
        script.id = 'webgazer-script';
        script.src = 'https://webgazer.cs.brown.edu/webgazer.js';
        script.async = true;
        script.onload = () => {
          setWebgazerLoaded(true);
        };
        script.onerror = () => {
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
    const wg = (window as any).webgazer;
    if (!isActive || trackingSource !== 'browser' || !webgazerLoaded || !wg) {
      if (wg && (trackingSource !== 'browser' || !isActive)) {
        try {
          wg.end();
          const preview = document.getElementById('webgazerVideoContainer');
          if (preview && preview.parentNode) preview.parentNode.removeChild(preview);
        } catch (e) {}
      }
      return;
    }

    setStatus('active');
    setIsGazeConnected(true);

    try {
      wg.setGazeListener((data: any, elapsedTime: number) => {
        if (data == null) {
          setGazeData((prev) => ({ ...prev, located: false, state: 'lost' }));
          return;
        }
        
        const rx = data.x / window.innerWidth;
        const ry = data.y / window.innerHeight;

        const gazeUpdate: GazeUpdate = {
          located: true,
          state: 'center',
          x: parseFloat(Math.max(0, Math.min(1, rx)).toFixed(4)),
          y: parseFloat(Math.max(0, Math.min(1, ry)).toFixed(4)),
          pupil_size: parseFloat((3.4 + Math.sin(elapsedTime / 1000) * 0.15).toFixed(2)),
          mode: 'webgazer'
        };

        setGazeData(gazeUpdate);
        onGazeUpdate(gazeUpdate);
        updateFixations(gazeUpdate.x, gazeUpdate.y);
      });

      wg.showVideoPreview(true)
        .showPredictionPoints(true)
        .applyKalmanFilter(true)
        .begin();

      // Style WebGazer video window
      const checkInterval = setInterval(() => {
        const preview = document.getElementById('webgazerVideoContainer');
        if (preview) {
          preview.style.position = 'fixed';
          preview.style.bottom = '20px';
          preview.style.left = '20px';
          preview.style.top = 'auto';
          preview.style.right = 'auto';
          preview.style.width = '160px';
          preview.style.height = '120px';
          preview.style.borderRadius = '12px';
          preview.style.overflow = 'hidden';
          preview.style.border = '2px solid #0f2d59';
          preview.style.zIndex = '999';
          clearInterval(checkInterval);
        }
      }, 100);

    } catch (e) {
      console.error(e);
      setStatus('fallback');
      setTrackingSource('mouse');
    }

    return () => {
      try {
        if (wg) {
          wg.end();
          const preview = document.getElementById('webgazerVideoContainer');
          if (preview && preview.parentNode) preview.parentNode.removeChild(preview);
        }
      } catch (e) {}
    };
  }, [isActive, trackingSource, webgazerLoaded]);

  // Hook 3: Local Python websocket receiver
  useEffect(() => {
    if (!isActive || trackingSource !== 'python') {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    setStatus('connecting');
    console.log('[Gaze WS] Connecting to local Python gaze bridge...');

    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:5001/ws');
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('active');
        setIsGazeConnected(true);
        console.log('[Gaze WS] Connected successfully.');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const gazeUpdate: GazeUpdate = {
            located: data.located ?? false,
            state: data.state ?? 'lost',
            x: data.x ?? 0.5,
            y: data.y ?? 0.5,
            pupil_size: data.pupil_size ?? 3.5,
            mode: 'python'
          };
          setGazeData(gazeUpdate);
          onGazeUpdate(gazeUpdate);
          if (gazeUpdate.located) {
            updateFixations(gazeUpdate.x, gazeUpdate.y);
          }
        } catch (e) {}
      };

      ws.onerror = () => {
        setStatus('fallback');
        setFallbackReason('Websocket connection failed. Ensure python gaze_bridge.py is running.');
      };

      ws.onclose = () => {
        setIsGazeConnected(false);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isActive, trackingSource]);

  // Hook 4: Mouse calibration tracker fallback
  useEffect(() => {
    if (!isActive || trackingSource !== 'mouse' || showOverlayOnly) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const gazeUpdate: GazeUpdate = {
        located: true,
        state: 'center',
        x: parseFloat(Math.max(0, Math.min(1, x)).toFixed(4)),
        y: parseFloat(Math.max(0, Math.min(1, y)).toFixed(4)),
        pupil_size: 3.5,
        mode: 'mouse'
      };

      setGazeData(gazeUpdate);
      onGazeUpdate(gazeUpdate);
      updateFixations(gazeUpdate.x, gazeUpdate.y);
    };

    setStatus('active');
    setIsGazeConnected(true);

    const el = containerRef.current;
    if (el) el.addEventListener('mousemove', handleMouseMove);
    return () => {
      if (el) el.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isActive, trackingSource, showOverlayOnly]);

  const updateFixations = (gx: number, gy: number) => {
    setCalibrationPoints((prev) =>
      prev.map((pt) => {
        const dx = gx - pt.x;
        const dy = gy - pt.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.08) {
          return { ...pt, fixation: Math.min(100, pt.fixation + 0.8) };
        }
        return pt;
      })
    );
  };

  const handleTargetClick = (e: React.MouseEvent, pt: CalibrationPoint, idx: number) => {
    e.preventDefault();
    if (trackingSource !== 'browser') return;
    setCalibrationClicks((prev) => {
      const current = prev[idx] || 0;
      return { ...prev, [idx]: current + 1 };
    });
  };

  const handleResetCalibration = () => {
    setCalibrationClicks({});
    setCalibrationPoints((prev) => prev.map((pt) => ({ ...pt, fixation: 0 })));
  };

  const handleResetHeatmaps = () => {
    setCalibrationPoints((prev) => prev.map((pt) => ({ ...pt, fixation: 0 })));
  };

  if (!isActive && showOverlayOnly) return null;

  // Render overlay only (used globally to trace gaze reticle across all tabs)
  if (showOverlayOnly) {
    if (!gazeData.located) return null;
    return (
      <div
        className="fixed pointer-events-none z-[10000] w-8 h-8 border-2 rounded-full -translate-x-1/2 -translate-y-1/2 transition-[left_top] duration-75"
        style={{
          left: `${gazeData.x * window.innerWidth}px`,
          top: `${gazeData.y * window.innerHeight}px`,
          borderColor: trackingSource === 'mouse' ? '#0f2d59' : '#e11d48',
          boxShadow: trackingSource === 'mouse' ? '0 0 10px rgba(15, 45, 89, 0.4)' : '0 0 10px rgba(225, 29, 72, 0.4)',
        }}
      >
        <div className="absolute w-1.5 h-1.5 bg-slate-900 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute w-11 h-px bg-white/45 left-[-6px] top-1/2" />
        <div className="absolute w-px h-11 bg-white/45 left-1/2 top-[-6px]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8" ref={containerRef}>
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 text-blue-950 mb-2">
          <Eye className="h-6 w-6" />
          <h2 className="text-2xl font-extrabold tracking-tight">Oculomotor Gaze Tracker</h2>
        </div>
        <p className="text-sm text-slate-600">
          Calibrate WebGazer or map python eye tracking inputs onto heatmaps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Heatmap Grid Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden shadow-sm flex flex-col relative h-144">
          
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60 z-10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="h-4 w-4 text-rose-500 animate-spin" /> Oculomotor Heatmap Calibration Grid
            </h3>
            <div className="flex gap-2">
              {trackingSource === 'browser' && (
                <button 
                  onClick={handleResetCalibration}
                  className="px-2.5 py-1 rounded border border-slate-700 text-slate-300 bg-slate-900 hover:bg-slate-800 text-[10px] font-bold"
                >
                  Reset Clicks
                </button>
              )}
              <button 
                onClick={handleResetHeatmaps}
                className="px-2.5 py-1 rounded border border-slate-700 text-slate-300 bg-slate-900 hover:bg-slate-800 text-[10px] font-bold"
              >
                Reset Heatmap
              </button>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            {trackingSource === 'browser' && isActive && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-15 bg-slate-900/95 border border-amber-500/30 px-4 py-2 rounded-xl text-xs text-amber-400 font-semibold text-center max-w-lg pointer-events-none">
                <strong>CALIBRATION MODE</strong>: Look directly at targets and <strong>click them twice</strong>. They turn green when calibrated!
              </div>
            )}

            {/* Render 3x3 Calibration Target Grid */}
            {calibrationPoints.map((pt, idx) => {
              const clicks = calibrationClicks[idx] || 0;
              const isCalibrated = clicks >= 2;
              const isBrowserActive = trackingSource === 'browser' && isActive;
              
              return (
                <button
                  key={pt.id}
                  onClick={(e) => handleTargetClick(e, pt, idx)}
                  disabled={!isBrowserActive}
                  className="absolute w-12 h-12 rounded-full border flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all"
                  style={{
                    left: `${pt.x * 100}%`,
                    top: `${pt.y * 100}%`,
                    cursor: isBrowserActive ? 'pointer' : 'default',
                    boxShadow: isCalibrated 
                      ? '0 0 12px rgba(16, 185, 129, 0.4)' 
                      : clicks > 0 
                        ? '0 0 10px rgba(245, 158, 11, 0.4)' 
                        : pt.fixation > 5 
                          ? `0 0 ${10 + pt.fixation * 0.3}px rgba(225, 29, 72, ${pt.fixation / 100})` 
                          : 'none',
                    borderColor: isCalibrated 
                      ? '#10b981' 
                      : clicks > 0 
                        ? '#f59e0b' 
                        : pt.fixation > 5 
                          ? `rgba(225, 29, 72, ${0.2 + pt.fixation / 100})` 
                          : '#334155',
                    background: isCalibrated 
                      ? 'rgba(16, 185, 129, 0.15)' 
                      : clicks > 0 
                        ? 'rgba(245, 158, 11, 0.08)' 
                        : 'rgba(15, 23, 42, 0.4)'
                  }}
                >
                  <div 
                    className="absolute inset-0 rounded-full bg-rose-600 animate-ping pointer-events-none" 
                    style={{ animationDuration: '1.5s', opacity: pt.fixation / 150 }} 
                  />
                  <span className="text-[9px] font-bold text-slate-300 select-none">
                    {isCalibrated ? 'READY' : clicks > 0 ? `${clicks}/2` : pt.fixation > 0 ? `${Math.round(pt.fixation)}%` : pt.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}

            {/* Glowing Gaze Reticle Pointer inside Canvas */}
            {gazeData.located && (
              <div
                className="absolute w-8 h-8 border-2 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-[left_top] duration-75"
                style={{
                  left: `${gazeData.x * 100}%`,
                  top: `${gazeData.y * 100}%`,
                  borderColor: trackingSource === 'mouse' ? '#38bdf8' : '#e11d48',
                  boxShadow: trackingSource === 'mouse' ? '0 0 10px rgba(56, 189, 248, 0.4)' : '0 0 10px rgba(225, 29, 72, 0.4)',
                }}
              >
                <div className="absolute w-1.5 h-1.5 bg-white rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute w-11 h-px bg-white/20 left-[-6px] top-1/2" />
                <div className="absolute w-px h-11 bg-white/20 left-1/2 top-[-6px]" />
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Controls & Troubleshoot (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
            <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <Eye className="h-4 w-4 text-blue-950" />
              Gaze Calibration
            </h3>

            <button 
              onClick={() => setIsGazeActive(!isActive)}
              className={`w-full py-3 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all ${
                isActive 
                  ? 'bg-rose-700 hover:bg-rose-800' 
                  : 'bg-blue-950 hover:bg-slate-800'
              }`}
            >
              {isActive ? 'Stop Gaze Tracking' : 'Start Gaze Tracking'}
            </button>

            {/* Source selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Tracking Source
              </label>
              <select 
                value={trackingSource} 
                onChange={(e) => setTrackingSource(e.target.value as any)} 
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 text-slate-900 font-semibold"
                disabled={isActive}
              >
                <option value="browser">Browser Webcam (WebGazer)</option>
                <option value="python">Local Python Server (MediaPipe)</option>
                <option value="mouse">Interactive Mouse Simulator</option>
              </select>
            </div>

            {/* Metrics HUd */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs font-medium font-mono text-slate-600">
              <div className="flex justify-between">
                <span>Gaze Status:</span>
                <span className={`font-bold ${gazeData.located ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {isActive ? (gazeData.located ? (gazeData.state === 'blinking' ? 'BLINKING' : 'LOCKED') : 'SEARCHING...') : 'INACTIVE'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Telemetry:</span>
                <span className="font-bold text-blue-950">
                  {trackingSource.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Focus Point:</span>
                <span className="font-bold text-slate-850">
                  X:{gazeData.x.toFixed(3)} Y:{gazeData.y.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pupil Diameter:</span>
                <span className="font-bold text-rose-700 animate-pulse">
                  {gazeData.pupil_size > 0 ? `${gazeData.pupil_size.toFixed(2)} mm` : 'Closed'}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Fallback / Troubleshooting banner */}
          {trackingSource === 'python' && status === 'fallback' && (
            <div className="bg-amber-50/50 border border-amber-250 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider">
                <AlertCircle className="h-4.5 w-4.5" /> Python Gaze Server Fallback
              </div>
              <p className="text-[11px] text-slate-600 leading-normal font-semibold">
                Websocket connectivity failed. {fallbackReason}
              </p>
              <div className="h-px bg-amber-200" />
              <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">To enable local webcam gaze tracking:</h4>
              <ol className="text-[10px] text-slate-600 list-decimal pl-4 space-y-1 font-semibold">
                <li>Install prerequisites: <code className="bg-amber-100 border border-amber-200 px-1 py-0.5 rounded text-blue-950 font-mono">pip install opencv-python numpy mediapipe</code></li>
                <li>Verify your webcam is plugged in and not active in other programs, then click Start.</li>
              </ol>
            </div>
          )}

          {trackingSource === 'browser' && status === 'active' && (
            <div className="bg-emerald-50/50 border border-emerald-250 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="h-4.5 w-4.5" /> Browser WebGazer Active
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                WebGazer.js is running inside your browser. Please approve the webcam permissions box in the browser prompt.
                A video preview container is floating at the bottom left to calibrate your face/gaze landmarks.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
