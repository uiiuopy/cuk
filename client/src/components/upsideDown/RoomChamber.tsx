import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  FileText, 
  Flame, 
  Scroll, 
  Clock, 
  Compass, 
  Key, 
  AlertOctagon, 
  Sparkles 
} from 'lucide-react';
import { decryptSecret } from '../../utils/upsideDownCrypto';

interface RoomChamberProps {
  roomIndex: number;
  cameraActive: boolean;
  facePresent: boolean;
  threatDetected: string | null;
  isScreenProtected: boolean;
  onSecurityBreach: () => void;
}

interface RoomMeta {
  id: string;
  number: string;
  name: string;
  codename: string;
  caseFile: string;
  clearanceLevel: string;
  classification: string;
  dateArchived: string;
  subjectSummary: string;
  seals: string[];
}

const ROOM_METAS: RoomMeta[] = [
  {
    id: 'room-1',
    number: 'CHAMBER I',
    name: 'The EEG & Neurofeedback Vault',
    codename: 'OPERATION SYNAPSE REDACTED',
    caseFile: 'CUK-PSY-2024-EEG-088',
    clearanceLevel: 'LEVEL 5 - RESTRICTED',
    classification: 'FACULTY & RESEARCH DISMISSAL RECORD',
    dateArchived: 'AUTUMN 2024',
    subjectSummary: 'Exclusion of specialized personnel & denied neurofeedback experimental clearance.',
    seals: ['SEALED BY COORDINATION', 'EEG QUARANTINE']
  },
  {
    id: 'room-2',
    number: 'CHAMBER II',
    name: 'The Catacombs of Silenced Echoes',
    codename: 'THE UNREPORTED CASUALTIES',
    caseFile: 'CUK-DEPT-OCCULT-019',
    clearanceLevel: 'EYES ONLY - MAXIMUM CLASSIFICATION',
    classification: 'INTERNAL TRAGEDY REDACTION LEDGER',
    dateArchived: 'CONFIDENTIAL TIMELINE',
    subjectSummary: 'Suppressed occurrences within departmental quarters and unexplained silence.',
    seals: ['DEPT CENSORSHIP', 'PERPETUAL BLACKOUT']
  }
];

export default function RoomChamber({
  roomIndex,
  cameraActive,
  facePresent,
  threatDetected,
  isScreenProtected,
  onSecurityBreach
}: RoomChamberProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [decryptedText, setDecryptedText] = useState<string>('');
  const [revealTimeLeft, setRevealTimeLeft] = useState<number>(15);
  const [watermarkSession] = useState(() => 'SEC-' + Math.random().toString(36).substring(2, 9).toUpperCase());
  const [watermarkTime, setWatermarkTime] = useState(() => new Date().toISOString());

  const currentMeta = ROOM_METAS[roomIndex] || ROOM_METAS[0];

  // Refresh watermark timestamp periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setWatermarkTime(new Date().toISOString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Can reveal check
  const canReveal = cameraActive && facePresent && !threatDetected && !isScreenProtected;

  // Handle reveal hold
  const handleStartHold = () => {
    if (!canReveal) {
      onSecurityBreach();
      return;
    }
    setIsHolding(true);
    setDecryptedText(decryptSecret(roomIndex));
    setRevealTimeLeft(15);
  };

  const handleStopHold = () => {
    setIsHolding(false);
    setDecryptedText('');
  };

  // Keyboard Spacebar hold listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !isHolding) {
        // Prevent default spacebar scroll
        e.preventDefault();
        handleStartHold();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        handleStopHold();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [canReveal, isHolding, roomIndex]);

  // Countdown timer while holding to prevent indefinite exposure
  useEffect(() => {
    if (!isHolding) return;
    const interval = setInterval(() => {
      setRevealTimeLeft((prev) => {
        if (prev <= 1) {
          handleStopHold();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isHolding]);

  // Cancel hold immediately if security conditions break
  useEffect(() => {
    if (!canReveal && isHolding) {
      handleStopHold();
    }
  }, [canReveal, isHolding]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Dark Academia Ledger Paper / Obsidian Folder Container */}
      <div className="relative rounded-2xl bg-[#120f0e]/95 border-2 border-[#8b6534]/40 shadow-2xl p-6 sm:p-10 backdrop-blur-md overflow-hidden transition-all duration-300">
        
        {/* Antique Corner Filigree Accents */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#c5a059]/40 pointer-events-none" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#c5a059]/40 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#c5a059]/40 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#c5a059]/40 pointer-events-none" />

        {/* Ambient Top Dossier Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#8b6534]/30">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase bg-[#3a1a15] text-[#fca5a5] border border-[#7f1d1d]/60 flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-red-500 animate-pulse" />
                {currentMeta.clearanceLevel}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest text-[#d4af37]/80 bg-[#1c1815] border border-[#c5a059]/30">
                {currentMeta.caseFile}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-wide text-[#e8dfcf] flex items-center gap-2">
              <span>{currentMeta.number}:</span>
              <span className="text-[#c5a059] italic">{currentMeta.name}</span>
            </h2>
            <p className="text-xs font-mono text-[#a89b88] mt-1 tracking-wider">
              {currentMeta.classification} // {currentMeta.dateArchived}
            </p>
          </div>

          {/* Seals Badge Cluster */}
          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 shrink-0">
            {currentMeta.seals.map((seal, i) => (
              <span 
                key={i} 
                className="px-2.5 py-1 text-[9px] font-mono tracking-widest uppercase rounded bg-[#1c120c] text-[#c5a059] border border-[#8b6534]/40"
              >
                ✦ {seal}
              </span>
            ))}
          </div>
        </div>

        {/* Dossier Metadata Strip */}
        <div className="my-5 p-3.5 rounded-lg bg-[#181412] border border-[#4a3928]/50 flex items-center justify-between text-xs font-serif text-[#b8a992]">
          <div className="flex items-center gap-2">
            <Scroll className="w-4 h-4 text-[#c5a059]" />
            <span className="italic">{currentMeta.subjectSummary}</span>
          </div>
          <span className="hidden sm:inline-block font-mono text-[10px] text-[#786c5c]">
            HASH: {watermarkSession}
          </span>
        </div>

        {/* The Classified Document Body */}
        <div className="relative my-6 rounded-xl bg-[#0a0807] border border-[#3d2f23] p-6 sm:p-8 min-h-[220px] flex flex-col justify-center select-none overflow-hidden">
          
          {/* Subtle Gothic Ledger Background Grid */}
          <div 
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #c5a059 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Unrevealed Redacted / Blurred State */}
          {!isHolding ? (
            <div className="relative space-y-4 py-4 filter transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold tracking-widest text-red-500/80 uppercase flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" />
                  CLASSIFIED ARCHIVE RECORD — VAULT ENCRYPTED
                </span>
                <span className="text-[10px] font-mono text-[#a89b88]/50">
                  PRESS & HOLD TO DECRYPT
                </span>
              </div>

              {/* Redacted Bar Mimics */}
              <div className="space-y-3 opacity-70">
                <div className="h-6 w-11/12 bg-[#251d18] rounded flex items-center px-3 border border-[#3d2f23]/40">
                  <span className="w-16 h-2 bg-red-950/70 rounded mr-2" />
                  <span className="w-32 h-2 bg-black/80 rounded" />
                </div>
                <div className="h-6 w-4/5 bg-[#251d18] rounded flex items-center px-3 border border-[#3d2f23]/40">
                  <span className="w-24 h-2 bg-black/80 rounded mr-2" />
                  <span className="w-20 h-2 bg-red-950/70 rounded" />
                </div>
                <div className="h-6 w-full bg-[#251d18] rounded flex items-center px-3 border border-[#3d2f23]/40">
                  <span className="w-36 h-2 bg-black/80 rounded mr-2" />
                  <span className="w-16 h-2 bg-black/80 rounded mr-2" />
                  <span className="w-24 h-2 bg-red-950/70 rounded" />
                </div>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs font-serif italic text-[#c5a059]/70">
                  "Only those under constant optical surveillance may break the seals of this institution."
                </p>
              </div>
            </div>
          ) : (
            /* Active Decrypted State with Dynamic Watermark Protection */
            <div className="relative py-4 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Dynamic Anti-Capture Optical Watermark Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-around opacity-25 select-none overflow-hidden text-center z-20">
                <p className="font-mono text-xs sm:text-sm text-red-400 rotate-[-12deg] tracking-widest uppercase">
                  CONFIDENTIAL // {watermarkSession} // {watermarkTime}
                </p>
                <p className="font-mono text-xs sm:text-sm text-red-400 rotate-[-12deg] tracking-widest uppercase">
                  AI OPTICAL SURVEILLANCE ACTIVE // DO NOT PHOTOGRAPH
                </p>
                <p className="font-mono text-xs sm:text-sm text-red-400 rotate-[-12deg] tracking-widest uppercase">
                  CONFIDENTIAL // {watermarkSession} // {watermarkTime}
                </p>
              </div>

              {/* Decrypted Secret Text Content */}
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between border-b border-[#8b6534]/40 pb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
                    <Unlock className="w-3.5 h-3.5" />
                    CIPHER BROKEN — OPTICAL VERIFIED
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600/40">
                    <Clock className="w-3 h-3 animate-spin" />
                    LOCKED IN {revealTimeLeft}s
                  </span>
                </div>

                <div className="p-4 sm:p-6 rounded-lg bg-[#140e0b]/90 border border-[#8b6534]/50 shadow-inner">
                  <p className="text-base sm:text-lg font-serif leading-relaxed text-[#f4eedf] tracking-wide first-letter:text-3xl first-letter:font-bold first-letter:text-[#c5a059] first-letter:mr-1">
                    "{decryptedText}"
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#a89b88]">
                  <span>AUTHENTICITY STATUS: VERIFIED CUK ARCHIVE</span>
                  <span>SECURITY BREACH PROTOCOL: ACTIVE</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hold-to-Reveal Interaction Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#8b6534]/30">
          <div className="text-xs font-mono text-[#a89b88] text-center sm:text-left">
            {!cameraActive ? (
              <span className="text-amber-400 flex items-center gap-1.5 justify-center sm:justify-start">
                <AlertOctagon className="w-4 h-4 text-amber-500" />
                Optical sensor offline. Activate camera to view.
              </span>
            ) : threatDetected ? (
              <span className="text-red-400 flex items-center gap-1.5 justify-center sm:justify-start">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                Optical threat detected! Decryption disabled.
              </span>
            ) : !facePresent ? (
              <span className="text-amber-400 flex items-center gap-1.5 justify-center sm:justify-start">
                <EyeOff className="w-4 h-4 text-amber-500" />
                Maintain eye contact with front camera.
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1.5 justify-center sm:justify-start">
                <Eye className="w-4 h-4 text-emerald-500" />
                Clearance confirmed. Press & hold to inspect dossier.
              </span>
            )}
          </div>

          {/* Prominent Press-and-Hold Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onMouseDown={handleStartHold}
              onMouseUp={handleStopHold}
              onTouchStart={handleStartHold}
              onTouchEnd={handleStopHold}
              onMouseLeave={handleStopHold}
              disabled={!canReveal}
              className={`px-6 py-3 rounded-xl font-serif tracking-widest uppercase text-xs font-bold border shadow-lg transition-all duration-200 select-none flex items-center gap-2.5 cursor-pointer ${
                isHolding 
                  ? 'bg-red-900 text-white border-red-500 shadow-red-950/80 scale-95' 
                  : canReveal 
                    ? 'bg-gradient-to-r from-[#2c1d11] to-[#452c1a] hover:from-[#3a2717] hover:to-[#573721] text-[#f4eedf] border-[#c5a059]/60 shadow-black active:scale-95' 
                    : 'bg-[#181412] text-[#6b5e50] border-[#382b20] cursor-not-allowed opacity-50'
              }`}
            >
              {isHolding ? (
                <>
                  <Unlock className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>HOLDING RECORD...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 text-[#c5a059]" />
                  <span>HOLD TO REVEAL DOSSIER</span>
                </>
              )}
            </button>

            <span className="hidden md:inline-block text-[10px] font-mono text-[#786c5c] border border-[#3d2f23] px-2 py-1.5 rounded bg-[#120f0e]">
              HOLD [SPACEBAR]
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
