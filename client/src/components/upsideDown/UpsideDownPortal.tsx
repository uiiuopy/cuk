import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  Camera, 
  CameraOff, 
  AlertTriangle, 
  Compass, 
  DoorClosed, 
  DoorOpen, 
  Scroll, 
  Skull, 
  Flame, 
  Radio, 
  Eye, 
  Lock 
} from 'lucide-react';
import { useOpticalGuardian } from '../../hooks/useOpticalGuardian';
import { useScreenArmor } from '../../hooks/useScreenArmor';
import RoomChamber from './RoomChamber';

interface UpsideDownPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpsideDownPortal({ isOpen, onClose }: UpsideDownPortalProps) {
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);
  const [introGlitch, setIntroGlitch] = useState(true);

  // Optical guardian hook
  const {
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
    clearThreat,
  } = useOpticalGuardian(isOpen);

  // Screen armor hook
  const {
    isScreenProtected,
    showScreenshotWarning,
    blockScreenshot,
  } = useScreenArmor(isOpen);

  // Initial glitch effect on open
  useEffect(() => {
    if (isOpen) {
      setIntroGlitch(true);
      const timer = setTimeout(() => {
        setIntroGlitch(false);
      }, 900);
      // Auto-request optical verification
      startCamera();
      return () => clearTimeout(timer);
    }
  }, [isOpen, startCamera]);

  // Handle Escape key to return to surface
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopCamera();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, stopCamera]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 overflow-y-auto bg-[#070606] text-[#e5dbcc] selection:bg-[#7f1d1d] selection:text-white ${
        introGlitch ? 'animate-pulse invert duration-300' : ''
      }`}
      style={{
        boxShadow: 'inset 0 0 140px rgba(0, 0, 0, 0.95)',
        fontFamily: 'serif'
      }}
    >
      {/* Hidden Analysis / Stream Video Hook */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="fixed top-0 left-0 w-1 h-1 opacity-0 pointer-events-none -z-50"
      />

      {/* Atmospheric Background Noise & Vignette */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 -z-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, #1e130c 0%, #000000 100%)'
        }}
      />

      {/* Clandestine Top Bar / Gothic HUD */}
      <header className="sticky top-0 z-40 bg-[#0e0c0b]/90 border-b border-[#5c4028]/50 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left Title & Occult Clearance */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a130b] to-[#120a06] border border-[#8b6534]/60 flex items-center justify-center shadow-lg">
              <Skull className="w-5 h-5 text-[#c5a059]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-serif font-black tracking-widest text-[#f3ece0] uppercase">
                  THE UPSIDE DOWN
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#7f1d1d]/80 text-[#fecaca] border border-red-800">
                  REDACTED REALITY
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#a89b88] tracking-wider">
                ACTIVATION CODE: <span className="text-[#c5a059]">23PPSYC011</span> // RESTRICTED ACCESS
              </p>
            </div>
          </div>

          {/* Center Optical & AI Threat HUD */}
          <div className="hidden md:flex items-center gap-3 bg-[#161210] px-4 py-1.5 rounded-full border border-[#4a3520]/60">
            {/* Front Optical Mini-Viewfinder */}
            {cameraActive && cameraStream ? (
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#c5a059]/60 bg-black">
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
                  <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="text-left font-mono">
                  <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {facePresent ? 'OPTICAL TRACK: VERIFIED' : 'SEARCHING SUBJECT...'}
                  </div>
                  <div className="text-[9px] text-[#9c8e7c]">
                    {isModelReady ? 'AI THREAT SENSOR: ACTIVE' : 'AI SENSOR: ENGAGING...'}
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={startCamera}
                disabled={isRequestingCamera}
                className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>{isRequestingCamera ? 'ENGAGING SENSOR...' : 'ENABLE OPTICAL SENSOR'}</span>
              </button>
            )}

            {/* Neural Shield Pill */}
            {cameraActive && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                threatDetected 
                  ? 'bg-red-950 text-red-300 border-red-600 animate-bounce' 
                  : isModelReady 
                    ? 'bg-[#1e150f] text-[#c5a059] border-[#8b6534]/50' 
                    : 'bg-black text-slate-500 border-slate-700'
              }`}>
                <ShieldCheck className="h-3 w-3 text-[#c5a059]" />
                <span>{threatDetected ? 'THREAT DETECTED' : 'ANTI-RECORD SHIELD ON'}</span>
              </span>
            )}
          </div>

          {/* Right Exit / Return to Surface Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-[#1c140f] hover:bg-red-950/80 text-[#e5dbcc] hover:text-red-200 border border-[#8b6534]/50 hover:border-red-600 transition-all font-serif text-xs font-bold tracking-widest flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
              title="Return to the Surface (Esc)"
            >
              <span>RETURN TO SURFACE</span>
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Dark Academia Sanctum Body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        
        {/* Optical Sensor Required Banner (If camera not active) */}
        {!cameraActive && (
          <div className="rounded-xl bg-[#26130b] border-2 border-[#b91c1c]/70 p-4 sm:p-6 text-center space-y-3 shadow-2xl">
            <div className="flex items-center justify-center gap-2 text-red-400 font-serif font-black tracking-wide text-lg sm:text-xl">
              <CameraOff className="w-6 h-6 animate-pulse" />
              <span>MANDATORY BIOMETRIC OPTICAL CLEARANCE REQUIRED</span>
            </div>
            <p className="text-xs sm:text-sm font-mono text-[#d1c2ab] max-w-2xl mx-auto leading-relaxed">
              This department archive is sealed under strict anti-leak protocols. Continuous front camera monitoring is enforced by neural computer vision to ensure zero secondary recording devices or unauthorized screen capture occurs.
            </p>
            <button
              type="button"
              onClick={startCamera}
              disabled={isRequestingCamera}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-900 to-amber-900 text-white font-serif font-bold text-xs tracking-widest border border-red-500 shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>{isRequestingCamera ? 'INITIALIZING SENSOR...' : 'ENABLE FRONT OPTICAL SENSOR NOW'}</span>
            </button>
            {cameraError && (
              <p className="text-xs font-mono text-red-300 pt-1">{cameraError}</p>
            )}
          </div>
        )}

        {/* Optical Threat Alarm Banner (If phone or camera detected in view) */}
        {threatDetected && (
          <div className="rounded-xl bg-red-950/95 border-2 border-red-500 p-4 sm:p-5 text-center space-y-2 animate-bounce shadow-2xl">
            <div className="flex items-center justify-center gap-2 text-red-200 font-mono font-bold text-sm sm:text-base">
              <ShieldAlert className="w-6 h-6 text-red-400" />
              <span>BREACH DETECTED: {threatDetected}</span>
            </div>
            <p className="text-xs font-mono text-red-300">
              Clear all secondary lenses, phones, or cameras from sensor field immediately. Records are quarantined.
            </p>
          </div>
        )}

        {/* Chamber Selection Corridor / Navigation Doors */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#5c4028]/40 pb-2">
            <h3 className="text-sm font-mono tracking-widest uppercase text-[#c5a059] flex items-center gap-2">
              <Compass className="w-4 h-4" />
              SELECT ARCHIVAL CHAMBER
            </h3>
            <span className="text-xs font-mono text-[#8b7965]">
              [2 CLASSIFIED ROOMS DISCOVERED]
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chamber 1 Selector */}
            <button
              type="button"
              onClick={() => setSelectedRoomIndex(0)}
              className={`p-4 sm:p-5 rounded-xl text-left border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                selectedRoomIndex === 0
                  ? 'bg-gradient-to-br from-[#2b170e] to-[#170e08] border-[#c5a059] shadow-xl shadow-black/80 ring-1 ring-[#c5a059]/40'
                  : 'bg-[#120f0d] hover:bg-[#1c1511] border-[#4a3422]/60 text-[#a89985]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-red-500" />
                  LEVEL 5 RESTRICTED
                </span>
                {selectedRoomIndex === 0 ? (
                  <DoorOpen className="w-5 h-5 text-[#c5a059]" />
                ) : (
                  <DoorClosed className="w-5 h-5 text-[#6b5844] group-hover:text-[#c5a059]" />
                )}
              </div>
              <h4 className="text-lg font-serif font-black text-[#ede4d6]">
                Chamber I: The EEG & Neurofeedback Vault
              </h4>
              <p className="text-xs font-serif italic text-[#a3937f] mt-1">
                Investigation into laboratory exclusion & denied student research.
              </p>
            </button>

            {/* Chamber 2 Selector */}
            <button
              type="button"
              onClick={() => setSelectedRoomIndex(1)}
              className={`p-4 sm:p-5 rounded-xl text-left border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                selectedRoomIndex === 1
                  ? 'bg-gradient-to-br from-[#2b170e] to-[#170e08] border-[#c5a059] shadow-xl shadow-black/80 ring-1 ring-[#c5a059]/40'
                  : 'bg-[#120f0d] hover:bg-[#1c1511] border-[#4a3422]/60 text-[#a89985]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-red-500" />
                  INTERNAL TRAGEDY RECORD
                </span>
                {selectedRoomIndex === 1 ? (
                  <DoorOpen className="w-5 h-5 text-[#c5a059]" />
                ) : (
                  <DoorClosed className="w-5 h-5 text-[#6b5844] group-hover:text-[#c5a059]" />
                )}
              </div>
              <h4 className="text-lg font-serif font-black text-[#ede4d6]">
                Chamber II: The Catacombs of Silenced Echoes
              </h4>
              <p className="text-xs font-serif italic text-[#a3937f] mt-1">
                Concealed departmental fatalities and suppressed inquiries.
              </p>
            </button>
          </div>
        </section>

        {/* The Active Dossier Chamber Viewport */}
        <section className="pt-2">
          <RoomChamber 
            roomIndex={selectedRoomIndex}
            cameraActive={cameraActive}
            facePresent={facePresent}
            threatDetected={threatDetected}
            isScreenProtected={isScreenProtected}
            onSecurityBreach={blockScreenshot}
          />
        </section>

        {/* Ambient Dark Academia Footer Notice */}
        <footer className="text-center pt-8 pb-4 text-xs font-serif italic text-[#705e4c] border-t border-[#4a3520]/30 space-y-1">
          <p>
            "Veritas vos liberabit, sed primum vos exasperabit."
          </p>
          <p className="text-[10px] font-mono tracking-widest text-[#574839]">
            CENTRAL UNIVERSITY OF KARNATAKA // DEPARTMENT OF PSYCHOLOGY ARCHIVE
          </p>
        </footer>

      </main>

      {/* Screen Armor Blackout & Snip Shield Overlay */}
      {isScreenProtected && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-100">
          <div className="p-8 rounded-2xl bg-[#140b08] border-2 border-red-600 max-w-lg space-y-4 shadow-2xl">
            <ShieldAlert className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
            <h2 className="text-2xl font-serif font-bold text-red-400 tracking-wider">
              OPTICAL SHIELD ACTIVATED
            </h2>
            <p className="text-xs font-mono text-[#d6c4ad] leading-relaxed">
              Screen capture command, focus loss, snipping tool, or secondary lens interaction detected. The classified archive has been instantly sealed and clipboard sanitized.
            </p>
            <div className="text-[10px] font-mono text-red-400 bg-red-950/80 py-1.5 px-3 rounded border border-red-800">
              RE-ENGAGE WINDOW FOCUS & DISMISS CAPTURE TOOLS TO RESUME
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Warning Banner */}
      {showScreenshotWarning && !isScreenProtected && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-900 text-white font-mono text-xs px-4 py-2.5 rounded-xl border border-red-500 shadow-2xl flex items-center gap-2 animate-bounce">
          <AlertTriangle className="w-4 h-4 text-amber-300" />
          <span>Capture attempted. Buffer purged.</span>
        </div>
      )}

    </div>
  );
}
