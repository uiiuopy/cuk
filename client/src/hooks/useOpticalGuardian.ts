import { useState, useEffect, useRef, useCallback } from 'react';

interface DetectedObject {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

interface CocoModelInstance {
  detect: (img: HTMLVideoElement | HTMLCanvasElement, maxNumBoxes?: number, minScore?: number) => Promise<DetectedObject[]>;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

async function getOrLoadCocoSsd(): Promise<any> {
  const win = window as any;
  if (win.cocoSsd) return win.cocoSsd;
  if (!win.tf) {
    await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js');
  }
  if (!win.cocoSsd) {
    await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js');
  }
  return win.cocoSsd;
}

export function useOpticalGuardian(isActive: boolean) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isRequestingCamera, setIsRequestingCamera] = useState(false);
  const [facePresent, setFacePresent] = useState(true);
  const [threatDetected, setThreatDetected] = useState<string | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previousFrameBrightnessRef = useRef<number | null>(null);
  const cocoModelRef = useRef<CocoModelInstance | null>(null);
  const isDetectingRef = useRef(false);

  // Load TensorFlow COCO-SSD Neural Model
  useEffect(() => {
    let isMounted = true;
    const preloadModel = async () => {
      try {
        const coco = await getOrLoadCocoSsd();
        if (coco && isMounted) {
          const model = await coco.load({ base: 'lite_mobilenet_v2' });
          if (isMounted) {
            cocoModelRef.current = model;
            setIsModelReady(true);
          }
        }
      } catch (err) {
        console.warn('AI Optical Guardian model load warning:', err);
      }
    };
    preloadModel();
    return () => {
      isMounted = false;
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => {
        try { track.stop(); } catch (_) {}
      });
      setCameraStream(null);
    }
    setCameraActive(false);
    setFacePresent(false);
    setThreatDetected(null);
  }, [cameraStream]);

  const startCamera = useCallback(async () => {
    setIsRequestingCamera(true);
    setCameraError(null);
    setThreatDetected(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Front camera sensor not accessible in this browser context.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });
      setCameraStream(stream);
      setCameraActive(true);
      setFacePresent(true);
      setCameraError(null);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
        };
      }
    } catch (err: any) {
      console.warn('Camera sensor clearance denied:', err);
      setCameraError('Optical Clearance Mandate: Continuous front optical monitoring is required to view classified archives.');
      setCameraActive(false);
    } finally {
      setIsRequestingCamera(false);
    }
  }, []);

  // Bind video element when stream is ready
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(() => {});
      };
    }
  }, [cameraStream]);

  // Optical analysis loop
  useEffect(() => {
    if (!isActive || !cameraActive || !cameraStream) return;

    let animId: number;
    let lastAnalysisTime = 0;

    const analyzeOpticalFrame = (timestamp: number) => {
      if (timestamp - lastAnalysisTime >= 90) { // ~11 FPS
        lastAnalysisTime = timestamp;

        const video = videoRef.current;
        if (video && video.readyState >= 2 && video.videoWidth > 0) {
          // 1. Neural AI Detection via COCO-SSD
          if (cocoModelRef.current && !isDetectingRef.current) {
            isDetectingRef.current = true;
            cocoModelRef.current.detect(video, 10, 0.25)
              .then((predictions) => {
                const secondaryThreat = predictions.find(
                  (p) =>
                    (p.class === 'cell phone' || p.class === 'camera' || p.class === 'remote') &&
                    p.score >= 0.28
                );

                if (secondaryThreat) {
                  const label = secondaryThreat.class === 'cell phone' ? 'Mobile Phone' : secondaryThreat.class.toUpperCase();
                  setThreatDetected(`Optical Capture Device (${label}) Detected in Sensor View (${Math.round(secondaryThreat.score * 100)}% Confidence)`);
                  return;
                }

                const hasPerson = predictions.some((p) => p.class === 'person' && p.score >= 0.30);
                if (hasPerson) {
                  setFacePresent(true);
                }
              })
              .catch((e) => {
                console.warn('AI Optical Scan inference error:', e);
              })
              .finally(() => {
                isDetectingRef.current = false;
              });
          }

          // 2. Hardware Canvas Frame Analysis (Anti-Tape / Flash / Tamper)
          if (!analysisCanvasRef.current) {
            analysisCanvasRef.current = document.createElement('canvas');
            analysisCanvasRef.current.width = 120;
            analysisCanvasRef.current.height = 90;
          }
          const canvas = analysisCanvasRef.current;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, 120, 90);
            const frame = ctx.getImageData(0, 0, 120, 90);
            const data = frame.data;
            const totalPixels = 120 * 90;

            let totalBrightness = 0;
            for (let i = 0; i < data.length; i += 4) {
              totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
            }
            const avgBrightness = totalBrightness / totalPixels;

            // Anti-Tape / Fully Covered Camera
            if (avgBrightness < 10) {
              setThreatDetected('Optical Sensor Obstructed / Lens Covered. Clearance Suspended.');
            }

            // Sudden Flash Anomaly
            if (previousFrameBrightnessRef.current !== null) {
              const diff = avgBrightness - previousFrameBrightnessRef.current;
              if (diff > 75) {
                setThreatDetected('Optical Flash Spike Detected. Screen Obfuscated.');
              }
            }
            previousFrameBrightnessRef.current = avgBrightness;
          }
        }
      }
      animId = requestAnimationFrame(analyzeOpticalFrame);
    };

    animId = requestAnimationFrame(analyzeOpticalFrame);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isActive, cameraActive, cameraStream]);

  // Teardown camera on deactivate
  useEffect(() => {
    if (!isActive) {
      stopCamera();
    }
  }, [isActive, stopCamera]);

  return {
    cameraActive,
    cameraStream,
    cameraError,
    isRequestingCamera,
    facePresent,
    threatDetected,
    isModelReady,
    videoRef,
    startCamera,
    stopCamera,
    clearThreat: () => setThreatDetected(null),
  };
}
