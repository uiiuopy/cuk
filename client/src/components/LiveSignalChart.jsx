import React, { useRef, useEffect } from 'react';

export default function LiveSignalChart({ config, isActive, pupilSize }) {
  const canvasRef = useRef(null);

  // References to keep track of animation state across renders
  const stateRef = useRef({
    time: 0,
    ecgPhase: 0,
    gsrCurrent: config.gsr,
    eegBuffer: [],
    ecgBuffer: [],
    gsrBuffer: [],
    pupilBuffer: [],
    lastTime: Date.now(),
    hrvOffset: 0 // Heart Rate Variability time jitter
  });

  // Keep state sync with config changes
  useEffect(() => {
    // Quickly rise GSR, but let it drift slowly on decay
    const delta = config.gsr - stateRef.current.gsrCurrent;
    if (delta > 0) {
      // Stress spike: fast transition
      stateRef.current.gsrCurrent = config.gsr;
    }
  }, [config.gsr]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Dimensions
    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Buffer limit based on width
    const maxPoints = 500;

    const drawGrid = (width, height, dpr) => {
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40 * dpr;

      // Vertical lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    const renderLoop = () => {
      if (!isActive) {
        animationFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      const now = Date.now();
      const dt = (now - stateRef.current.lastTime) / 1000; // seconds
      stateRef.current.lastTime = now;

      // Limit large deltas (e.g. background tab resume)
      const clampedDt = Math.min(dt, 0.1);
      
      const s = stateRef.current;
      s.time += clampedDt;

      // ----------------------------------------------------
      // 1. GENERATE EEG: Sum of Alpha, Beta, Theta + noise
      // ----------------------------------------------------
      const t = s.time;
      const alphaFreq = 10; // 10 Hz
      const betaFreq = 20;  // 20 Hz
      const thetaFreq = 6;   // 6 Hz

      const alphaWave = Math.sin(t * alphaFreq * Math.PI * 2) * config.eegAlpha * 0.25 + 
                        Math.sin(t * (alphaFreq - 1.5) * Math.PI * 2) * config.eegAlpha * 0.1;
      const betaWave = Math.sin(t * betaFreq * Math.PI * 2) * config.eegBeta * 0.15 + 
                       Math.sin(t * (betaFreq + 4) * Math.PI * 2) * config.eegBeta * 0.08;
      const thetaWave = Math.sin(t * thetaFreq * Math.PI * 2) * config.eegTheta * 0.2;
      const eegNoise = (Math.random() - 0.5) * 0.15;
      
      const eegVal = alphaWave + betaWave + thetaWave + eegNoise;
      s.eegBuffer.push(eegVal);
      if (s.eegBuffer.length > maxPoints) s.eegBuffer.shift();

      // ----------------------------------------------------
      // 2. GENERATE ECG: P-QRS-T Heartbeat
      // ----------------------------------------------------
      // Modulate frequency slightly with HRV (Heart Rate Variability)
      if (s.ecgPhase === 0) {
        // Randomize HRV offset on each beat start
        s.hrvOffset = (Math.random() - 0.5) * config.hrv * 2.0;
      }

      const currentBpm = config.heartRate * (1 + s.hrvOffset);
      const phaseInc = (currentBpm / 60) * clampedDt;
      s.ecgPhase += phaseInc;

      let ecgVal = 0;
      const p = s.ecgPhase;

      if (p >= 1.0) {
        s.ecgPhase = 0;
      } else {
        // P-Wave (Phase 0.0 to 0.12)
        if (p > 0.02 && p < 0.12) {
          ecgVal = Math.sin((p - 0.02) * (1 / 0.1) * Math.PI) * 0.08;
        }
        // Q-Wave (Phase 0.12 to 0.15)
        else if (p >= 0.12 && p < 0.15) {
          ecgVal = -((p - 0.12) / 0.03) * 0.15;
        }
        // R-Spike (Phase 0.15 to 0.18)
        else if (p >= 0.15 && p < 0.18) {
          const mid = 0.165;
          if (p < mid) {
            ecgVal = -0.15 + ((p - 0.15) / (mid - 0.15)) * 1.35; // Go up
          } else {
            ecgVal = 1.2 - ((p - mid) / (0.18 - mid)) * 1.6; // Drop down past baseline
          }
        }
        // S-Wave (Phase 0.18 to 0.21)
        else if (p >= 0.18 && p < 0.21) {
          ecgVal = -0.4 + ((p - 0.18) / 0.03) * 0.4; // return to baseline
        }
        // T-Wave (Phase 0.28 to 0.42)
        else if (p >= 0.28 && p < 0.42) {
          ecgVal = Math.sin((p - 0.28) * (1 / 0.14) * Math.PI) * 0.22;
        }
        // Baseline noise
        else {
          ecgVal = (Math.random() - 0.5) * 0.02;
        }
      }

      s.ecgBuffer.push(ecgVal);
      if (s.ecgBuffer.length > maxPoints) s.ecgBuffer.shift();

      // ----------------------------------------------------
      // 3. GENERATE GSR (EDA): Tonic + Phasic
      // ----------------------------------------------------
      // Tonic: slowly approach config.gsr (acts as the target conductance)
      // If target is larger than current (stress spike), approach quickly
      // If target is smaller than current (relaxation decay), decay very slowly (sympathetic response property)
      const approachSpeed = config.gsr > s.gsrCurrent ? 2.5 : 0.06;
      s.gsrCurrent += (config.gsr - s.gsrCurrent) * clampedDt * approachSpeed;

      // Add micro-arousal fluctuations (minor noise spikes)
      const microFluctuations = Math.sin(t * 0.4) * 0.03 + (Math.random() - 0.5) * 0.008;
      const gsrVal = s.gsrCurrent + microFluctuations;
      
      s.gsrBuffer.push(gsrVal);
      if (s.gsrBuffer.length > maxPoints) s.gsrBuffer.shift();

      // ----------------------------------------------------
      // 4. GENERATE PUPIL DILATION
      // ----------------------------------------------------
      const basePupil = pupilSize !== undefined && pupilSize > 0 ? pupilSize : (config.pupilSize || 3.5);
      const pupilNoise = Math.sin(t * 0.7) * 0.06 + (Math.random() - 0.5) * 0.008;
      const finalPupil = basePupil > 0 ? (basePupil + pupilNoise) : 0.0;

      s.pupilBuffer.push(finalPupil);
      if (s.pupilBuffer.length > maxPoints) s.pupilBuffer.shift();

      // ----------------------------------------------------
      // DRAWING
      // ----------------------------------------------------
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      
      // Draw grid
      drawGrid(w, h, dpr);

      // Divide canvas into 4 horizontal tracks
      const trackHeight = h / 4;

      // Draw Titles and Numerical Indicators
      ctx.textBaseline = 'top';
      ctx.font = `${Math.round(11 * dpr)}px Orbitron`;

      // Track 1: EEG
      ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
      ctx.fillText('CHANNEL I: EEG (PREFRONTAL CORRELATE)', 12 * dpr, 10 * dpr);
      ctx.font = `${Math.round(14 * dpr)}px Orbitron`;
      ctx.fillText(`POWER: ${Math.round(config.eegAlpha * 10 + config.eegBeta * 20)} µV²`, w - 150 * dpr, 10 * dpr);

      // Track 2: ECG
      ctx.font = `${Math.round(11 * dpr)}px Orbitron`;
      ctx.fillStyle = 'rgba(255, 0, 127, 0.7)';
      ctx.fillText('CHANNEL II: ECG (HEART RATE TELEMETRY)', 12 * dpr, trackHeight + 10 * dpr);
      ctx.font = `${Math.round(14 * dpr)}px Orbitron`;
      ctx.fillText(`${Math.round(currentBpm)} BPM`, w - 150 * dpr, trackHeight + 10 * dpr);

      // Track 3: GSR
      ctx.font = `${Math.round(11 * dpr)}px Orbitron`;
      ctx.fillStyle = 'rgba(57, 255, 20, 0.7)';
      ctx.fillText('CHANNEL III: GSR (ELECTRODERMAL ACTIVATION)', 12 * dpr, trackHeight * 2 + 10 * dpr);
      ctx.font = `${Math.round(14 * dpr)}px Orbitron`;
      ctx.fillText(`${gsrVal.toFixed(3)} µS`, w - 150 * dpr, trackHeight * 2 + 10 * dpr);

      // Track 4: Pupil Dilation
      ctx.font = `${Math.round(11 * dpr)}px Orbitron`;
      ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
      ctx.fillText('CHANNEL IV: EYE TRACKING (PUPIL DILATION)', 12 * dpr, trackHeight * 3 + 10 * dpr);
      ctx.font = `${Math.round(14 * dpr)}px Orbitron`;
      ctx.fillText(finalPupil > 0 ? `${finalPupil.toFixed(2)} mm` : 'BLINK / LOST', w - 150 * dpr, trackHeight * 3 + 10 * dpr);

      // Function to draw a buffer onto a track
      const drawTrack = (buffer, trackIndex, strokeStyle, scale = 1.0, isUnipolar = false, maxRange = 15.0) => {
        if (buffer.length < 2) return;
        ctx.beginPath();
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = 1.5 * dpr;

        const centerY = trackHeight * trackIndex + trackHeight / 2;
        const xStep = w / maxPoints;

        buffer.forEach((val, idx) => {
          const x = idx * xStep;
          let y = centerY;
          
          if (isUnipolar) {
            // Normalize relative to range 0 - maxRange
            const normVal = (val / maxRange) * (trackHeight * 0.6);
            y = (trackHeight * (trackIndex + 1)) - 25 * dpr - normVal;
          } else {
            // EEG/ECG are bipolar
            y = centerY - val * (trackHeight * 0.35) * scale;
          }

          if (idx === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      };

      // Draw the lines
      drawTrack(s.eegBuffer, 0, 'var(--accent-cyan)', 1.0, false);
      drawTrack(s.ecgBuffer, 1, 'var(--accent-pink)', 1.0, false);
      drawTrack(s.gsrBuffer, 2, 'var(--accent-green)', 1.0, true, 15.0);
      drawTrack(s.pupilBuffer, 3, 'var(--accent-yellow)', 1.0, true, 8.0); // pupil range 0 to 8 mm

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [config, isActive, pupilSize]);

  return (
    <div className="signal-plotter-panel">
      <canvas ref={canvasRef} />
      <style>{`
        .signal-plotter-panel {
          width: 100%;
          height: 100%;
          background: #030308;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }
        canvas {
          display: block;
        }
      `}</style>
    </div>
  );
}
