import React, { useState, useEffect, useRef } from 'react';
import { Mail, BookOpen, Award, ExternalLink, GraduationCap, X, Heart, Sparkles, Lock, ShieldAlert, EyeOff, Eye, Camera, CameraOff, AlertTriangle, ShieldCheck, Timer } from 'lucide-react';
import { fetchSheetData, getDirectDriveUrl } from '../utils/googleSheets';
import fallbackFaculty from '../data/faculty.json';

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

interface FacultyPerson {
  Name: string;
  Designation: string;
  Specialization: string;
  Email: string;
  'Photo URL'?: string;
  Bio?: string;
  ORCID?: string;
  Scholar?: string;
  ResearchGate?: string;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Coordinator() {
  const [faculty, setFaculty] = useState<FacultyPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [showRomateModal, setShowRomateModal] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showStudentInscription, setShowStudentInscription] = useState(false);
  const [isScreenProtected, setIsScreenProtected] = useState(false);
  const [showScreenshotWarning, setShowScreenshotWarning] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(10);

  // Biometric & Optical Camera Protection States
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isRequestingCamera, setIsRequestingCamera] = useState(false);
  const [facePresent, setFacePresent] = useState(true);
  const [threatDetected, setThreatDetected] = useState<string | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previousFrameBrightnessRef = useRef<number | null>(null);
  const threatTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cocoModelRef = useRef<CocoModelInstance | null>(null);
  const isDetectingRef = useRef(false);

  // Preload and initialize TensorFlow COCO-SSD Neural Detector on mount
  useEffect(() => {
    let isMounted = true;
    const preloadModel = async () => {
      try {
        setIsModelLoading(true);
        const coco = await getOrLoadCocoSsd();
        if (coco && isMounted) {
          const model = await coco.load({ base: 'lite_mobilenet_v2' });
          if (isMounted) {
            cocoModelRef.current = model;
            setIsModelReady(true);
            console.log('🛡️ AI Optical Guardian: COCO-SSD Neural Model active');
          }
        }
      } catch (err) {
        console.warn('COCO-SSD model preload warning:', err);
      } finally {
        if (isMounted) setIsModelLoading(false);
      }
    };
    preloadModel();
    return () => {
      isMounted = false;
    };
  }, []);

  // Stop camera tracks cleanly
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => {
        try { track.stop(); } catch (_) {}
      });
      setCameraStream(null);
    }
    setCameraActive(false);
    setFacePresent(false);
    setThreatDetected(null);
    setIsHolding(false);
  };

  // Request front camera verification before revealing content
  const startCameraVerification = async () => {
    setIsRequestingCamera(true);
    setCameraError(null);
    setThreatDetected(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Front camera media devices not supported in this browser.');
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
      console.warn('Camera verification failed or denied:', err);
      setCameraError('Optical Clearance Required: Front camera must remain active & face visible to view this tribute.');
      setCameraActive(false);
    } finally {
      setIsRequestingCamera(false);
    }
  };

  // Strictly require 5 deliberate clicks to open Prof. Romate John section
  const handleFiveClicks = () => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    const nextCount = clickCount + 1;
    if (nextCount >= 5) {
      setShowRomateModal(true);
      setClickCount(0);
      startCameraVerification();
    } else {
      setClickCount(nextCount);
      clickTimerRef.current = setTimeout(() => {
        setClickCount(0);
      }, 2500);
    }
  };

  const startHolding = () => {
    if (!isScreenProtected && document.hasFocus() && cameraActive && facePresent && !threatDetected) {
      setIsHolding(true);
    }
  };

  const stopHolding = () => {
    setIsHolding(false);
  };

  // Anti-screenshot, Anti-snip & Privacy Protection
  useEffect(() => {
    if (!showRomateModal) {
      setIsHolding(false);
      setIsScreenProtected(false);
      return;
    }

    const blockScreenshot = () => {
      setIsHolding(false);
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('');
        }
      } catch (_) {}
      setIsScreenProtected(true);
      setShowScreenshotWarning(true);
      setTimeout(() => setIsScreenProtected(false), 2000);
      setTimeout(() => setShowScreenshotWarning(false), 3500);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowRomateModal(false);
        setShowStudentInscription(false);
        stopHolding();
        return;
      }

      // Spacebar reveal while held
      if (e.code === 'Space' && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        startHolding();
        return;
      }

      // Any screenshot shortcut key (Win, Shift, Ctrl, Alt, PrintScreen) instantly aborts reveal & blocks screen
      const isCaptureKey = 
        e.key === 'PrintScreen' || 
        e.code === 'PrintScreen' ||
        e.key === 'Shift' ||
        e.key === 'Meta' ||
        e.key === 'Control' ||
        e.key === 'Alt' ||
        (e.shiftKey && (e.metaKey || e.ctrlKey));

      if (isCaptureKey) {
        stopHolding();
        blockScreenshot();
        return;
      }

      const isPrint = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p';
      const isSave = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's';

      if (isPrint || isSave) {
        e.preventDefault();
        e.stopPropagation();
        stopHolding();
        blockScreenshot();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        stopHolding();
      }
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        stopHolding();
        blockScreenshot();
      }
    };

    // When snipping tool or screen capture is triggered, window loses focus immediately
    const handleBlur = () => {
      stopHolding();
      setIsScreenProtected(true);
    };

    const handleFocus = () => {
      setIsScreenProtected(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopHolding();
        setIsScreenProtected(true);
      } else {
        setIsScreenProtected(false);
      }
    };

    // If mouse leaves the browser window (e.g. going to snipping tool)
    const handleMouseLeave = () => {
      stopHolding();
      setIsScreenProtected(true);
    };

    const handleMouseEnter = () => {
      if (document.hasFocus()) {
        setIsScreenProtected(false);
      }
    };

    // 80ms heartbeat checking document focus
    const focusInterval = setInterval(() => {
      if (!document.hasFocus() || document.hidden) {
        stopHolding();
        setIsScreenProtected(true);
      }
    }, 80);

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('mouseup', stopHolding);
    window.addEventListener('touchend', stopHolding);
    window.addEventListener('pointercancel', stopHolding);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(focusInterval);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('mouseup', stopHolding);
      window.removeEventListener('touchend', stopHolding);
      window.removeEventListener('pointercancel', stopHolding);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [showRomateModal]);

  // Connect stream to video element
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(() => {});
      };
    }
  }, [cameraStream, showRomateModal]);

  // Real-time Optical AI Computer Vision & Device Threat Analysis
  useEffect(() => {
    if (!showRomateModal || !cameraActive || !cameraStream) return;

    let animId: number;
    let lastAnalysisTime = 0;

    const triggerThreat = (reason: string) => {
      setThreatDetected(reason);
      setIsHolding(false);
      setIsScreenProtected(true);
      if (threatTimeoutRef.current) clearTimeout(threatTimeoutRef.current);
      threatTimeoutRef.current = setTimeout(() => {
        setShowRomateModal(false);
        stopCamera();
      }, 3500);
    };

    const analyzeOpticalFrame = (timestamp: number) => {
      if (timestamp - lastAnalysisTime >= 90) { // ~11 FPS
        lastAnalysisTime = timestamp;

        const video = videoRef.current;
        if (video && video.readyState >= 2 && video.videoWidth > 0) {

          // 1. Neural AI Detection via COCO-SSD (Cell Phone, Camera, Secondary Screen / Remote)
          if (cocoModelRef.current && !isDetectingRef.current) {
            isDetectingRef.current = true;
            cocoModelRef.current.detect(video, 10, 0.25)
              .then((predictions) => {
                // Secondary capture device threat check
                const secondaryThreat = predictions.find(
                  (p) =>
                    (p.class === 'cell phone' || p.class === 'camera' || p.class === 'remote') &&
                    p.score >= 0.28
                );

                if (secondaryThreat) {
                  const label = secondaryThreat.class === 'cell phone' ? 'Mobile Phone' : secondaryThreat.class.toUpperCase();
                  triggerThreat(`Optical Capture Device (${label}) Detected in Sensor View (${Math.round(secondaryThreat.score * 100)}% Confidence)`);
                  return;
                }

                // Check for person face/body presence in front of camera
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

          // 2. Hardware Canvas Frame Analysis (Anti-Tape / Optical Flash / Silhouette Fallback)
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
            let skinPixelsCenter = 0;
            let centerPixelsCount = 0;
            let darkPixelsLower = 0;
            let lowerPixelsCount = 0;

            for (let y = 0; y < 90; y++) {
              for (let x = 0; x < 120; x++) {
                const idx = (y * 120 + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const brightness = (r + g + b) / 3;
                totalBrightness += brightness;

                // Central face zone (x: 25-95, y: 15-70)
                const inCenter = x >= 25 && x <= 95 && y >= 15 && y <= 70;
                if (inCenter) {
                  centerPixelsCount++;
                  const isSkin = r > 70 && g > 30 && b > 15 && r > g && r > b && (r - g) > 8;
                  if (isSkin) skinPixelsCenter++;
                }

                // Lower quadrant (x: 20-100, y: 65-90) - where a raised phone appears
                const inLower = x >= 20 && x <= 100 && y >= 65;
                if (inLower) {
                  lowerPixelsCount++;
                  if (brightness < 35) {
                    darkPixelsLower++;
                  }
                }
              }
            }

            const avgBrightness = totalBrightness / totalPixels;
            const skinRatioCenter = centerPixelsCount > 0 ? (skinPixelsCenter / centerPixelsCount) : 0;
            const darkRatioLower = lowerPixelsCount > 0 ? (darkPixelsLower / lowerPixelsCount) : 0;

            // Camera covered or blacked out
            const isCovered = avgBrightness < 8 || avgBrightness > 252;
            if (isCovered || (!cocoModelRef.current && skinRatioCenter < 0.05)) {
              setFacePresent(false);
              setIsHolding(false);
            } else if (!cocoModelRef.current && skinRatioCenter >= 0.08) {
              setFacePresent(true);
            }

            // Sudden optical flash / secondary camera sensor reflection
            if (previousFrameBrightnessRef.current !== null) {
              const deltaBrightness = avgBrightness - previousFrameBrightnessRef.current;
              if (deltaBrightness > 75) {
                triggerThreat('Optical Flash / Camera Reflection Detected');
              }
            }
            previousFrameBrightnessRef.current = avgBrightness;

            // Secondary device silhouette fallback (when model is loading)
            if (!cocoModelRef.current && darkRatioLower > 0.55 && skinRatioCenter < 0.10) {
              triggerThreat('Secondary Device / Hand Raised in Frame');
            }
          }
        }
      }
      animId = requestAnimationFrame(analyzeOpticalFrame);
    };

    animId = requestAnimationFrame(analyzeOpticalFrame);

    return () => {
      cancelAnimationFrame(animId);
      if (threatTimeoutRef.current) clearTimeout(threatTimeoutRef.current);
    };
  }, [showRomateModal, cameraActive, cameraStream]);

  // 10-Second Strict Ephemeral Session Countdown
  useEffect(() => {
    if (!showRomateModal) {
      setSessionTimeLeft(10);
      return;
    }

    setSessionTimeLeft(10);
    const interval = setInterval(() => {
      setSessionTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowRomateModal(false);
          setShowStudentInscription(false);
          stopHolding();
          stopCamera();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showRomateModal]);

  // 10-Second Auto-Close for Student Inscription if opened
  useEffect(() => {
    if (!showStudentInscription) return;
    const timer = setTimeout(() => {
      setShowStudentInscription(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, [showStudentInscription]);

  // Lock body scroll when tribute modal is open
  useEffect(() => {
    if (showRomateModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showRomateModal]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSheetData('Faculty');
        if (data && data.length > 0) {
          // Normalize sheet data
          const normalized = data.map(item => {
            const isAstha = item.Name?.toLowerCase().includes('astha');
            const isPandey = item.Name?.toLowerCase().includes('pandey') || item.Name?.toLowerCase().includes('vijyendra');
            const isJeyavel = item.Name?.toLowerCase().includes('jeyavel');

            let scholar = item.Scholar || '';
            let orcid = item.ORCID || '';
            let photoUrl = item['Photo URL'] || '';

            if (isAstha) {
              if (!photoUrl) {
                photoUrl = '/photos/astha.png';
              }
              if (!scholar || scholar === 'https://scholar.google.com') {
                scholar = 'https://scholar.google.com/citations?user=FSA3Mp0AAAAJ&hl=en';
              }
              if (!orcid || orcid === 'https://orcid.org') {
                orcid = 'https://orcid.org/0000-0002-1507-3777';
              }
            } else if (isPandey) {
              if (!photoUrl) {
                photoUrl = '/photos/pandey.png';
              }
              if (!scholar || scholar === 'https://scholar.google.com') {
                scholar = 'https://scholar.google.com/citations?user=Sla4s00AAAAJ&hl=en';
              }
              if (!orcid || orcid === 'https://orcid.org') {
                orcid = 'https://orcid.org/0000-0002-7155-5543';
              }
            } else if (isJeyavel) {
              if (!photoUrl) {
                photoUrl = '/photos/jeyavel.jpg';
              }
              if (!orcid || orcid === 'https://orcid.org') {
                orcid = 'https://orcid.org/0000-0002-7431-7268';
              }
            }

            return {
              Name: item.Name || '',
              Designation: item.Designation || 'Assistant Professor',
              Specialization: item.Specialization || '',
              Email: item.Email || '',
              'Photo URL': photoUrl,
              Bio: item.Bio || '',
              ORCID: orcid,
              Scholar: scholar,
              ResearchGate: item.ResearchGate || ''
            };
          });
          setFaculty(normalized);
        } else {
          setFaculty(fallbackFaculty as FacultyPerson[]);
        }
      } catch (err) {
        console.warn('Failed to load coordinator data, falling back:', err);
        setFaculty(fallbackFaculty as FacultyPerson[]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-blue-950">
            <div 
              onClick={handleFiveClicks}
              className="p-2 rounded-xl bg-blue-50 border border-blue-100 cursor-pointer select-none"
              title="Faculty & Coordinators Directory"
            >
              <Award className="h-6 w-6 text-blue-950" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Faculty & Coordinators
            </h2>
          </div>
          <p className="text-sm text-slate-600 font-medium max-w-2xl pl-0.5">
            Principal investigators and academic leaders directing research initiatives in the Biofeedback & Cognitive Neuroscience Laboratory
            <span 
              onClick={handleFiveClicks}
              className="cursor-default select-none text-slate-600 hover:text-blue-950 transition-colors"
              title="Department of Psychology, Central University of Karnataka"
            >
              .
            </span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500 font-semibold text-sm">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-950 mr-2" />
          Loading coordinator profiles...
        </div>
      ) : (
        <div className="space-y-8">
          {faculty.map((person, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Profile Photo & Primary Identity (4 cols) */}
              <div className="lg:col-span-4 flex flex-col items-center text-center lg:items-start lg:text-left space-y-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6">
                <div className="relative">
                  {person['Photo URL'] && !imgErrors[person.Name] ? (
                    <img 
                      src={getDirectDriveUrl(person['Photo URL'])} 
                      alt={person.Name} 
                      className="w-36 h-36 sm:w-40 sm:h-40 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
                      onError={() => {
                        setImgErrors(prev => ({ ...prev, [person.Name]: true }));
                      }}
                    />
                  ) : (
                    <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-100 border-2 border-slate-200 flex items-center justify-center text-blue-950 font-extrabold text-3xl shadow-2xs">
                      {getInitials(person.Name)}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 w-full">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {person.Name}
                  </h3>
                  <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-950 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    {person.Designation || 'Assistant Professor'}
                  </span>
                  <p className="text-xs font-semibold text-slate-500 pt-0.5">
                    Department of Psychology<br />Central University of Karnataka
                  </p>
                </div>

                {/* Academic Identifiers & Badges */}
                <div className="w-full pt-2 flex flex-col gap-2">
                  {/* Google Scholar Badge */}
                  {person.Scholar && (
                    <a
                      href={person.Scholar}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-950 text-xs font-bold transition-all shadow-2xs group"
                    >
                      <span className="inline-flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-blue-900 group-hover:scale-110 transition-transform" />
                        Google Scholar
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-950" />
                    </a>
                  )}

                  {/* ORCID Badge */}
                  {person.ORCID && (
                    <a
                      href={person.ORCID}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-200 text-slate-700 hover:text-emerald-950 text-xs font-bold transition-all shadow-2xs group"
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#A6CE39] text-white flex items-center justify-center font-bold text-[9px] leading-none shrink-0 group-hover:scale-110 transition-transform">
                          iD
                        </span>
                        ORCID Profile
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-900" />
                    </a>
                  )}

                  {/* Email Button */}
                  {person.Email && (
                    <a
                      href={`mailto:${person.Email}`}
                      className="inline-flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-blue-950 text-xs font-bold transition-all shadow-2xs group"
                    >
                      <span className="inline-flex items-center gap-2 truncate">
                        <Mail className="h-4 w-4 text-blue-950 shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="truncate">{person.Email}</span>
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-950 shrink-0" />
                    </a>
                  )}
                </div>
              </div>

              {/* Professional Biography & Specialization (8 cols) */}
              <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Biography & Research Background
                  </h4>
                  <p className="text-sm sm:text-base leading-relaxed text-slate-700 font-sans whitespace-pre-line font-normal">
                    {person.Bio || `${person.Name} is a distinguished faculty coordinator driving advanced cognitive and biofeedback analysis within the laboratory framework.`}
                  </p>
                </div>

                {person.Specialization && (
                  <div className="pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                      Research Specializations & Interests
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {person.Specialization.split(/[,&]/).map((interest, i) => (
                        <span 
                          key={i} 
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                        >
                          <BookOpen className="h-3.5 w-3.5 text-blue-950" />
                          {interest.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Hidden Dedication & Special Acknowledgement Modal: Prof. Romate John */}
      {showRomateModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-x-hidden overflow-y-auto animate-in fade-in duration-200"
          onClick={() => {
            setShowRomateModal(false);
            setShowStudentInscription(false);
            stopHolding();
            stopCamera();
          }}
        >
          <div 
            className="relative w-full max-w-3xl max-h-[96dvh] sm:max-h-[90vh] my-auto bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 select-none romate-modal-protected"
            style={{
              WebkitUserSelect: 'none',
              userSelect: 'none',
              WebkitTouchCallout: 'none'
            }}
            onContextMenu={(e) => e.preventDefault()}
            onCopy={(e) => {
              e.preventDefault();
              if (e.clipboardData) e.clipboardData.setData('text/plain', '');
            }}
            onDragStart={(e) => e.preventDefault()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Optical Analyzer Video Element (Active off-screen for GPU texture decoding & AI inference) */}
            <video 
              ref={videoRef} 
              playsInline 
              muted 
              autoPlay 
              width={640}
              height={480}
              className="fixed -top-[9999px] -left-[9999px] w-[640px] h-[480px] pointer-events-none opacity-0 select-none"
              aria-hidden="true"
            />

            {/* Anti-Screenshot Print Blocker Styles */}
            <style>{`
              @media print {
                .romate-modal-protected {
                  display: none !important;
                  visibility: hidden !important;
                }
              }
              .romate-modal-protected, .romate-modal-protected * {
                -webkit-user-select: none !important;
                user-select: none !important;
                -webkit-touch-callout: none !important;
              }
            `}</style>

            {/* Optical Camera Clearance Mandatory Gate */}
            {cameraError && (
              <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none animate-in fade-in duration-150 overflow-y-auto">
                <div className="p-3 sm:p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-3 sm:mb-4 text-amber-400">
                  <CameraOff className="h-8 w-8 sm:h-10 sm:w-10 animate-bounce" />
                </div>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-700/60 mb-2">
                  Biometric Optical Clearance Required
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Front Camera Verification Mandatory
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-2 max-w-sm sm:max-w-md leading-relaxed px-2">
                  To protect this founding tribute against unauthorized secondary device photography, access is only permitted when your webcam/front camera is active and verifying live viewing presence.
                </p>
                <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full sm:w-auto px-4 sm:px-0 max-w-xs sm:max-w-none">
                  <button
                    onClick={startCameraVerification}
                    disabled={isRequestingCamera}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="h-4 w-4" />
                    <span>{isRequestingCamera ? 'Requesting Access...' : 'Enable Camera & Grant Clearance'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowRomateModal(false);
                      stopCamera();
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
                  >
                    Cancel & Exit
                  </button>
                </div>
                <p className="text-[9px] sm:text-[10px] text-slate-500 mt-4 sm:mt-5 max-w-xs px-2">
                  🔒 100% Client-Side Privacy: Camera frames are analyzed in local browser memory only. No video is recorded or sent to any server.
                </p>
              </div>
            )}

            {/* Secondary Device / Raised Phone Threat Lockdown Screen */}
            {threatDetected && (
              <div className="absolute inset-0 z-50 bg-red-950 flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none animate-in fade-in duration-100 overflow-y-auto">
                <div className="p-3 sm:p-4 bg-red-500/20 border-2 border-red-500 rounded-2xl mb-3 sm:mb-4 text-red-400 animate-pulse">
                  <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12" />
                </div>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-red-200 bg-red-900 px-3 py-1 rounded-full border border-red-500 mb-2">
                  OPTICAL THREAT DETECTED · LOCKDOWN ENGAGED
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight px-2">
                  {threatDetected}
                </h3>
                <p className="text-[11px] sm:text-xs text-red-200/80 mt-2 max-w-md leading-relaxed px-2">
                  A secondary mobile phone, camera lens, or external recording device was detected in front of the screen. Session forcefully terminated for laboratory confidentiality.
                </p>
                <div className="mt-4 px-3.5 py-1.5 rounded-full bg-red-900/80 border border-red-700 text-red-300 text-xs font-bold animate-pulse">
                  Terminating session in 3 seconds...
                </div>
              </div>
            )}

            {/* Face Absence / Obscured Camera Overlay */}
            {cameraActive && !facePresent && !threatDetected && !cameraError && (
              <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none animate-in fade-in duration-100 overflow-y-auto">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-3 text-amber-400">
                  <EyeOff className="h-8 w-8 animate-pulse" />
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Face Presence Lost · Content Obscured
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed px-2">
                  You must remain directly in front of the front camera. The tribute will automatically reveal once your face is detected in the sensor frame.
                </p>
              </div>
            )}

            {/* Screenshot Shield Overlay */}
            {isScreenProtected && !threatDetected && (
              <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none animate-in fade-in duration-100 overflow-y-auto">
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl mb-3">
                  <EyeOff className="h-8 w-8 text-red-400 animate-pulse" />
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Screenshot Protection Active
                </h4>
                <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed px-2">
                  Screen capture or window backgrounding detected. Content is shielded to maintain laboratory confidentiality.
                </p>
                <span className="text-[11px] text-amber-400/90 font-bold mt-4 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20">
                  Click inside window to resume
                </span>
              </div>
            )}

            {/* Screenshot Attempt Warning Toast */}
            {showScreenshotWarning && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-950/95 text-red-100 border border-red-700/80 px-4 py-2 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-none">
                <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
                <span>Screenshots are disabled for this section</span>
              </div>
            )}

            {/* Elegant Background Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* 10-Second Auto-Expire Progress Bar */}
            <div className="w-full h-1 bg-slate-100 overflow-hidden shrink-0 z-30">
              <div 
                className={`h-full transition-all duration-1000 ease-linear ${
                  sessionTimeLeft <= 3 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
                }`}
                style={{ width: `${(sessionTimeLeft / 10) * 100}%` }}
              />
            </div>

            {/* Pinned Sticky Header (Mobile Optimized Two-Tier Layout) */}
            <div className="sticky top-0 z-30 bg-white/98 backdrop-blur-md border-b border-slate-200/80 px-3 py-2.5 sm:px-6 sm:py-3 shrink-0 shadow-xs">
              {/* Primary Row: Title Badge & Right Controls */}
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200/90 shadow-3xs truncate">
                    <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">Special Tribute · Founding Leadership</span>
                  </span>

                  {/* Desktop Status Badges (Hidden on mobile, shown on sm+) */}
                  <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                    {cameraActive && facePresent && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Face Verified
                      </span>
                    )}

                    {cameraActive && !facePresent && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                        Searching Face...
                      </span>
                    )}

                    {cameraActive && (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                        isModelReady 
                          ? 'bg-blue-50 text-blue-800 border-blue-200' 
                          : 'bg-slate-100 text-slate-600 border-slate-200 animate-pulse'
                      }`}>
                        <ShieldCheck className="h-3 w-3 text-blue-600" />
                        <span>{isModelReady ? 'AI Object Shield ON' : 'AI Shield Loading...'}</span>
                      </span>
                    )}

                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black border transition-colors ${
                      sessionTimeLeft <= 3 
                        ? 'bg-red-100 text-red-700 border-red-300 animate-bounce' 
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      <Timer className="h-3 w-3" />
                      <span>{sessionTimeLeft}s</span>
                    </span>
                  </div>
                </div>

                {/* Right Action Cluster: Mini-HUD + Prominent Close Button */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Mini-HUD Optical Viewfinder */}
                  {cameraActive && cameraStream && (
                    <div className="relative shrink-0" title="Front Optical Sensor (Active AI Shield)">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden border-2 border-emerald-400 shadow-xs relative bg-black">
                        <video
                          ref={(el) => {
                            if (el && cameraStream && el.srcObject !== cameraStream) {
                              el.srcObject = cameraStream;
                              el.play().catch(() => {});
                            }
                          }}
                          playsInline
                          muted
                          autoPlay
                          className="w-full h-full object-cover scale-x-[-1]"
                        />
                        <div className="absolute inset-0 border border-emerald-400/50 rounded-lg pointer-events-none" />
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      </div>
                      <div className="absolute -bottom-1 -left-1 px-1 py-0.2 rounded bg-black/90 text-[6.5px] font-mono font-bold text-emerald-400 border border-emerald-500/40 leading-none">
                        {isModelReady ? 'AI' : 'HUD'}
                      </div>
                    </div>
                  )}

                  {/* Guaranteed Visible Mobile-Friendly Close Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowRomateModal(false);
                      setShowStudentInscription(false);
                      stopHolding();
                      stopCamera();
                    }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 hover:border-red-300 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-400 shrink-0 cursor-pointer active:scale-90"
                    aria-label="Close Tribute"
                    title="Close Tribute (Esc)"
                  >
                    <X className="h-5 w-5 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Mobile-Only Status Sub-Row (Visible only on < sm screens) */}
              <div className="flex sm:hidden items-center justify-between gap-1.5 pt-2 mt-1.5 border-t border-slate-100 text-[10px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {cameraActive && facePresent && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Verified
                    </span>
                  )}
                  {cameraActive && !facePresent && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-300">
                      Searching...
                    </span>
                  )}

                  {cameraActive && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold border ${
                      isModelReady ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      <ShieldCheck className="h-3 w-3 text-blue-600" />
                      <span>{isModelReady ? 'AI Guard ON' : 'Loading...'}</span>
                    </span>
                  )}
                </div>

                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono font-black border shrink-0 ${
                  sessionTimeLeft <= 3 
                    ? 'bg-red-100 text-red-700 border-red-300 animate-bounce' 
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  <Timer className="h-3 w-3" />
                  <span>{sessionTimeLeft}s</span>
                </span>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div 
              className="overflow-y-auto overflow-x-hidden px-3.5 py-4 sm:px-8 sm:py-6 overscroll-contain flex-1 space-y-4 sm:space-y-6 relative max-w-full"
              onMouseDown={(e) => {
                if ((e.target as HTMLElement).closest('button, a')) return;
                startHolding();
              }}
              onMouseUp={stopHolding}
              onTouchStart={(e) => {
                if ((e.target as HTMLElement).closest('button, a')) return;
                startHolding();
              }}
              onTouchEnd={stopHolding}
            >
              {/* CMOS Rolling-Shutter Optical Jammer Grid */}
              <div 
                className="pointer-events-none absolute inset-0 z-10 opacity-20 select-none overflow-hidden"
                style={{
                  backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)`,
                  backgroundSize: '100% 3px'
                }}
              />
              {/* Hold to View Portal / Anti-Snip Banner */}
              <div className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/70 border border-slate-200 text-center select-none space-y-1.5">
                <button
                  type="button"
                  onMouseDown={startHolding}
                  onMouseUp={stopHolding}
                  onTouchStart={startHolding}
                  onTouchEnd={stopHolding}
                  className={`w-full max-w-sm px-4 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer select-none ${
                    isHolding 
                      ? 'bg-amber-500 text-white ring-4 ring-amber-300/60 shadow-md scale-102' 
                      : 'bg-slate-900 hover:bg-blue-950 text-white'
                  }`}
                >
                  <Eye className="h-4 w-4 shrink-0" />
                  <span>{isHolding ? `Viewing Tribute (${sessionTimeLeft}s)` : 'Press & Hold to Reveal Content'}</span>
                </button>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-amber-800">⏱️ Strict 10s Window ({sessionTimeLeft}s left)</span>
                  <span>·</span>
                  <span>{isHolding ? '🔒 Active View (Release to lock)' : 'Hold button or Spacebar to view'}</span>
                </p>
              </div>

              {/* Protected Grid Container with Instant Blur Transition */}
              <div 
                className={`transition-all duration-150 ${
                  isHolding 
                    ? 'filter-none opacity-100 select-none' 
                    : 'filter blur-[16px] opacity-25 select-none pointer-events-none'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 items-start">
                  
                  {/* Photo Column */}
                  <div className="md:col-span-4 flex flex-col items-center text-center space-y-3">
                    <div className="relative">
                      <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md bg-slate-100 relative select-none">
                        <img 
                          src="/photos/romate_john.png" 
                          alt="Prof. Romate John" 
                          draggable={false}
                          className="w-full h-full object-cover object-top select-none pointer-events-none"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.src.endsWith('/photos/romate_john.jpg')) {
                              target.src = '/photos/romate_john.jpg';
                            }
                          }}
                        />
                        {/* Drag & Save Protection Overlay */}
                        <div 
                          className="absolute inset-0 bg-transparent select-none"
                          onContextMenu={(e) => e.preventDefault()}
                          onDragStart={(e) => e.preventDefault()}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowStudentInscription(!showStudentInscription)}
                        className="absolute -bottom-2 -right-2 bg-amber-500 hover:bg-amber-600 text-white p-1.5 rounded-xl shadow-sm transition-transform active:scale-90 cursor-pointer focus:outline-none"
                        title={showStudentInscription ? "Hide student inscription" : "Reveal student inscription"}
                      >
                        <Heart className={`h-4 w-4 fill-white ${showStudentInscription ? 'scale-110' : ''}`} />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                        Prof. Romate John
                      </h3>
                      <span className="text-xs font-extrabold text-blue-950 uppercase tracking-wider block">
                        Professor of Psychology
                      </span>
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 inline-block">
                        HOD for 13 Years (2012–2025)
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold text-slate-500 leading-tight">
                      Department of Psychology<br />Central University of Karnataka
                    </p>

                    {/* Google Scholar Link */}
                    <a
                      href="https://scholar.google.com/citations?user=tpHvDVkAAAAJ"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-950 text-xs font-bold transition-all shadow-3xs w-full max-w-[200px] justify-center mt-1"
                    >
                      <GraduationCap className="h-4 w-4 text-blue-900" />
                      <span>Google Scholar</span>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </a>
                  </div>

                  {/* Tribute & Story Column */}
                  <div className="md:col-span-8 space-y-4 text-slate-700">
                    <div className="border-b border-slate-100 pb-2.5">
                      <h4 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                        The Founding Visionary Behind the Laboratory
                      </h4>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        A heartfelt tribute and recognition from the student scholars and engineers
                      </p>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm leading-relaxed font-sans text-slate-600">
                      <p>
                        Special and eternal thanks to <strong className="text-slate-900 font-bold">Professor Romate John</strong>, without whom this laboratory could never have been possible. His relentless personal efforts, persistent resourcefulness, and academic vision were the true foundation that established this laboratory.
                      </p>
                      <p>
                        Serving with distinction as the <strong className="text-blue-950 font-bold">Head of the Department of Psychology for 13 years</strong> (2012–2025) at the Central University of Karnataka, Prof. Romate John laid the institutional and scientific groundwork upon which modern psychophysiological research at CUK thrives today.
                      </p>

                      {/* Hidden Student Scholar & Developer Inscription */}
                      <div className="pt-1">
                        {!showStudentInscription ? (
                          <button
                            type="button"
                            onClick={() => setShowStudentInscription(true)}
                            className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-amber-50/80 border border-dashed border-slate-200 hover:border-amber-300 text-slate-400 hover:text-amber-900 text-xs font-medium transition-all duration-200 cursor-pointer"
                          >
                            <Lock className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                            <span>Student Developers' Inscription</span>
                            <span className="text-[10px] text-amber-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                              [Click to reveal]
                            </span>
                          </button>
                        ) : (
                          <div className="relative p-3.5 sm:p-4 rounded-xl bg-amber-50/80 border-l-4 border-amber-400 border-y border-r border-amber-200 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-900">
                                <Heart className="h-3 w-3 fill-amber-500 text-amber-500" />
                                Student Developers & Scholars' Inscription
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowStudentInscription(false)}
                                className="text-[11px] font-bold text-slate-400 hover:text-slate-700 hover:underline cursor-pointer"
                              >
                                Hide
                              </button>
                            </div>
                            <blockquote className="italic text-slate-800 font-medium text-xs sm:text-sm leading-relaxed">
                              "As student scholars and key developers of this platform, we cannot hide this fundamental truth: the existence of this laboratory was made possible through the enduring leadership, vision, and tireless support of Professor Romate John."
                            </blockquote>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-1.5 sm:gap-2 text-[11px] font-bold text-slate-600">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                        🏛️ 13 Years HOD Tenure (2012–2025)
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                        🧠 Founding Pioneer of the Lab
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                        🎓 Academic Mentor & Guide
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Pinned Sticky Footer */}
            <div className="sticky bottom-0 z-30 bg-slate-50/98 backdrop-blur-md border-t border-slate-200 px-3.5 py-2.5 sm:px-6 sm:py-3.5 flex items-center justify-between gap-3 shrink-0 text-[10px] sm:text-[11px] text-slate-500 font-medium">
              <span className="truncate hidden sm:inline">Department of Psychology · Central University of Karnataka</span>
              <span className="truncate sm:hidden text-slate-600 font-semibold">Dept. of Psychology, CUK</span>
              <button
                type="button"
                onClick={() => {
                  setShowRomateModal(false);
                  setShowStudentInscription(false);
                  stopHolding();
                  stopCamera();
                }}
                className="px-4 py-2 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-blue-950 text-white font-bold text-xs transition-all shadow-xs active:scale-95 ml-auto cursor-pointer shrink-0"
              >
                Close Tribute
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
