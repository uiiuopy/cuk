import React, { useRef, useEffect } from 'react';

interface SignalConfig {
  heartRate: number;
  hrv: number;
  gsr: number;
  pupilSize: number;
  eegAlpha: number;
  eegBeta: number;
  eegTheta: number;
}

interface LiveSignalChartProps {
  config: SignalConfig;
  isActive: boolean;
  pupilSize?: number;
}

interface ChartState {
  time: number;
  ecgPhase: number;
  gsrCurrent: number;
  eegBuffer: number[];
  ecgBuffer: number[];
  gsrBuffer: number[];
  pupilBuffer: number[];
  lastTime: number;
  hrvOffset: number;
}

export default function LiveSignalChart({ config, isActive, pupilSize }: LiveSignalChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stateRef = useRef<ChartState>({
    time: 0,
    ecgPhase: 0,
    gsrCurrent: config.gsr,
    eegBuffer: [],
    ecgBuffer: [],
    gsrBuffer: [],
    pupilBuffer: [],
    lastTime: Date.now(),
    hrvOffset: 0
  });

  useEffect(() => {
    const delta = config.gsr - stateRef.current.gsrCurrent;
    if (delta > 0) {
      stateRef.current.gsrCurrent = config.gsr;
    }
  }, [config.gsr]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const maxPoints = 500;

    const drawGrid = (width: number, height: number, dpr: number) => {
      ctx.strokeStyle = 'rgba(15, 45, 89, 0.05)';
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
      const dt = (now - stateRef.current.lastTime) / 1000;
      stateRef.current.lastTime = now;

      const clampedDt = Math.min(dt, 0.1);
      const s = stateRef.current;
      s.time += clampedDt;

      // 1. GENERATE EEG
      const t = s.time;
      const alphaFreq = 10;
      const betaFreq = 20;
      const thetaFreq = 6;

      const alphaWave = Math.sin(t * alphaFreq * Math.PI * 2) * config.eegAlpha * 0.25 + 
                        Math.sin(t * (alphaFreq - 1.5) * Math.PI * 2) * config.eegAlpha * 0.1;
      const betaWave = Math.sin(t * betaFreq * Math.PI * 2) * config.eegBeta * 0.15 + 
                       Math.sin(t * (betaFreq + 4) * Math.PI * 2) * config.eegBeta * 0.08;
      const thetaWave = Math.sin(t * thetaFreq * Math.PI * 2) * config.eegTheta * 0.2;
      const eegNoise = (Math.random() - 0.5) * 0.15;
      
      const eegVal = alphaWave + betaWave + thetaWave + eegNoise;
      s.eegBuffer.push(eegVal);
      if (s.eegBuffer.length > maxPoints) s.eegBuffer.shift();

      // 2. GENERATE ECG
      if (s.ecgPhase === 0) {
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
        if (p > 0.02 && p < 0.12) {
          ecgVal = Math.sin((p - 0.02) * (1 / 0.1) * Math.PI) * 0.08;
        } else if (p >= 0.12 && p < 0.15) {
          ecgVal = -((p - 0.12) / 0.03) * 0.15;
        } else if (p >= 0.15 && p < 0.18) {
          const mid = 0.165;
          if (p < mid) {
            ecgVal = -0.15 + ((p - 0.15) / (mid - 0.15)) * 1.35;
          } else {
            ecgVal = 1.2 - ((p - mid) / (0.18 - mid)) * 1.6;
          }
        } else if (p >= 0.18 && p < 0.21) {
          ecgVal = -0.4 + ((p - 0.18) / 0.03) * 0.4;
        } else if (p >= 0.28 && p < 0.42) {
          ecgVal = Math.sin((p - 0.28) * (1 / 0.14) * Math.PI) * 0.22;
        } else {
          ecgVal = (Math.random() - 0.5) * 0.02;
        }
      }

      s.ecgBuffer.push(ecgVal);
      if (s.ecgBuffer.length > maxPoints) s.ecgBuffer.shift();

      // 3. GENERATE GSR
      const approachSpeed = config.gsr > s.gsrCurrent ? 2.5 : 0.06;
      s.gsrCurrent += (config.gsr - s.gsrCurrent) * clampedDt * approachSpeed;

      const microFluctuations = Math.sin(t * 0.4) * 0.03 + (Math.random() - 0.5) * 0.008;
      const gsrVal = s.gsrCurrent + microFluctuations;
      
      s.gsrBuffer.push(gsrVal);
      if (s.gsrBuffer.length > maxPoints) s.gsrBuffer.shift();

      // 4. GENERATE PUPIL DILATION
      const basePupil = pupilSize !== undefined && pupilSize > 0 ? pupilSize : (config.pupilSize || 3.5);
      const pupilNoise = Math.sin(t * 0.7) * 0.06 + (Math.random() - 0.5) * 0.008;
      const finalPupil = basePupil > 0 ? (basePupil + pupilNoise) : 0.0;

      s.pupilBuffer.push(finalPupil);
      if (s.pupilBuffer.length > maxPoints) s.pupilBuffer.shift();

      // DRAWING
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      
      drawGrid(w, h, dpr);

      const trackHeight = h / 4;

      ctx.textBaseline = 'top';
      ctx.font = `bold ${Math.round(10 * dpr)}px sans-serif`;

      // Track 1: EEG (Blue-950 context dark overlay)
      ctx.fillStyle = 'rgba(15, 45, 89, 0.8)';
      ctx.fillText('CHANNEL I: EEG (PREFRONTAL CORRELATE)', 12 * dpr, 10 * dpr);
      ctx.font = `bold ${Math.round(12 * dpr)}px sans-serif`;
      ctx.fillText(`POWER: ${Math.round(config.eegAlpha * 10 + config.eegBeta * 20)} µV²`, w - 160 * dpr, 10 * dpr);

      // Track 2: ECG
      ctx.font = `bold ${Math.round(10 * dpr)}px sans-serif`;
      ctx.fillStyle = 'rgba(190, 24, 74, 0.8)';
      ctx.fillText('CHANNEL II: ECG (HEART RATE TELEMETRY)', 12 * dpr, trackHeight + 10 * dpr);
      ctx.font = `bold ${Math.round(12 * dpr)}px sans-serif`;
      ctx.fillText(`${Math.round(currentBpm)} BPM`, w - 160 * dpr, trackHeight + 10 * dpr);

      // Track 3: GSR
      ctx.font = `bold ${Math.round(10 * dpr)}px sans-serif`;
      ctx.fillStyle = 'rgba(4, 120, 87, 0.8)';
      ctx.fillText('CHANNEL III: GSR (ELECTRODERMAL ACTIVATION)', 12 * dpr, trackHeight * 2 + 10 * dpr);
      ctx.font = `bold ${Math.round(12 * dpr)}px sans-serif`;
      ctx.fillText(`${gsrVal.toFixed(3)} µS`, w - 160 * dpr, trackHeight * 2 + 10 * dpr);

      // Track 4: Pupil Dilation
      ctx.font = `bold ${Math.round(10 * dpr)}px sans-serif`;
      ctx.fillStyle = 'rgba(180, 83, 9, 0.8)';
      ctx.fillText('CHANNEL IV: EYE TRACKING (PUPIL DILATION)', 12 * dpr, trackHeight * 3 + 10 * dpr);
      ctx.font = `bold ${Math.round(12 * dpr)}px sans-serif`;
      ctx.fillText(finalPupil > 0 ? `${finalPupil.toFixed(2)} mm` : 'BLINK / LOST', w - 160 * dpr, trackHeight * 3 + 10 * dpr);

      const drawTrack = (
        buffer: number[],
        trackIndex: number,
        strokeStyle: string,
        scale = 1.0,
        isUnipolar = false,
        maxRange = 15.0
      ) => {
        if (buffer.length < 2) return;
        ctx.beginPath();
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = 2 * dpr;

        const centerY = trackHeight * trackIndex + trackHeight / 2;
        const xStep = w / maxPoints;

        buffer.forEach((val, idx) => {
          const x = idx * xStep;
          let y = centerY;
          
          if (isUnipolar) {
            const normVal = (val / maxRange) * (trackHeight * 0.65);
            y = (trackHeight * (trackIndex + 1)) - 20 * dpr - normVal;
          } else {
            y = centerY - val * (trackHeight * 0.4) * scale;
          }

          if (idx === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      };

      // Plot high-contrast academic colors
      drawTrack(s.eegBuffer, 0, '#0f2d59', 1.0, false);
      drawTrack(s.ecgBuffer, 1, '#be1848', 1.0, false);
      drawTrack(s.gsrBuffer, 2, '#047857', 1.0, true, 15.0);
      drawTrack(s.pupilBuffer, 3, '#b45309', 1.0, true, 8.0);

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [config, isActive, pupilSize]);

  return (
    <div className="w-full h-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden relative shadow-2xs">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
