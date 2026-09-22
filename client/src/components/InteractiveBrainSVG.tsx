import React, { useState, useEffect, useRef } from 'react';

interface BrainNode {
  x: number;
  y: number;
  z: number;
  label: string;
}

interface ProjectedNode extends BrainNode {
  px: number;
  py: number;
  pz: number;
  id: number;
}

const initialNodes: BrainNode[] = [
  // Frontal lobe
  { x: -45, y: -70, z: 15, label: 'Fp1 (Pre-Frontal Left)' },
  { x: 45, y: -70, z: 15, label: 'Fp2 (Pre-Frontal Right)' },
  { x: -30, y: -45, z: 40, label: 'F3 (Frontal Left)' },
  { x: 30, y: -45, z: 40, label: 'F4 (Frontal Right)' },
  { x: 0, y: -50, z: 50, label: 'Fz (Frontal Midline)' },
  
  // Central / Motor strip
  { x: -55, y: -5, z: 35, label: 'C3 (Central Left)' },
  { x: 55, y: -5, z: 35, label: 'C4 (Central Right)' },
  { x: 0, y: -5, z: 65, label: 'Cz (Vertex Midline)' },
  
  // Temporal lobe
  { x: -75, y: -25, z: -15, label: 'T3 (Temporal Left)' },
  { x: 80, y: -25, z: -15, label: 'T4 (Temporal Right)' },
  { x: -75, y: 25, z: -15, label: 'T5 (Posterior Temporal Left)' },
  { x: 80, y: 25, z: -15, label: 'T6 (Posterior Temporal Right)' },
  
  // Parietal lobe
  { x: -35, y: 35, z: 45, label: 'P3 (Parietal Left)' },
  { x: 35, y: 35, z: 45, label: 'P4 (Parietal Right)' },
  { x: 0, y: 35, z: 55, label: 'Pz (Parietal Midline)' },
  
  // Occipital lobe (Visual cortex)
  { x: -20, y: 75, z: 15, label: 'O1 (Occipital Left)' },
  { x: 20, y: 75, z: 15, label: 'O2 (Occipital Right)' },
  { x: 0, y: 80, z: 5, label: 'Oz (Occipital Midline)' }
];

const connections = [
  [0, 2], [1, 3], [0, 4], [1, 4], [2, 4], [3, 4],
  [2, 5], [3, 6], [4, 7], [5, 7], [6, 7],
  [5, 8], [6, 9], [8, 10], [9, 11],
  [5, 12], [6, 13], [7, 14], [12, 14], [13, 14],
  [12, 15], [13, 16], [14, 17], [15, 17], [16, 17],
  [8, 0], [9, 1] // Temporal-frontal links
];

export default function InteractiveBrainSVG() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: -0.2, y: 0.4 });
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [signals, setSignals] = useState<Record<number, string>>({});

  // Simulate electrical signal noise
  useEffect(() => {
    const interval = setInterval(() => {
      const newSignals: Record<number, string> = {};
      initialNodes.forEach((_, idx) => {
        newSignals[idx] = (Math.sin(Date.now() / 200 + idx) * 3 + Math.random() * 2 + 5).toFixed(1);
      });
      setSignals(newSignals);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Track mouse coordinates for 3D rotation parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Normalize coordinates between -0.5 and 0.5
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;
    
    setRotation({
      x: mouseY * 0.8, // rotation around X axis
      y: mouseX * 1.2  // rotation around Y axis
    });
  };

  const handleMouseLeave = () => {
    setRotation({ x: -0.2, y: 0.4 });
  };

  // Projected 3D nodes
  const projectedNodes: ProjectedNode[] = initialNodes.map((node, idx) => {
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);

    // Rotate around Y axis
    const x1 = node.x * cosY - node.z * sinY;
    const z1 = node.x * sinY + node.z * cosY;

    // Rotate around X axis
    const y1 = node.y * cosX - z1 * sinX;
    const z2 = node.y * sinX + z1 * cosX;

    const scale = 1.35;
    const px = 150 + x1 * scale;
    const py = 150 + y1 * scale;

    return {
      ...node,
      px,
      py,
      pz: z2,
      id: idx
    };
  });

  return (
    <div 
      className="relative w-full aspect-square flex items-center justify-center p-4 cursor-pointer select-none"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dynamic Signal Readout overlay */}
      <div className="absolute top-2 right-2 w-40 p-2.5 z-10 text-center rounded-xl bg-white/80 border border-slate-200 shadow-xs pointer-events-none">
        <div className="font-semibold text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">
          EEG Signal Monitor
        </div>
        <div className="flex flex-col items-center">
          {hoveredNode !== null ? (
            <>
              <span className="text-[11px] font-bold text-slate-800 leading-tight">
                {projectedNodes[hoveredNode].label.split(' ')[0]}
              </span>
              <span className="text-xs font-extrabold text-blue-950">
                {signals[hoveredNode] || '0.0'} µV
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] font-semibold text-slate-500">Probe Node</span>
              <span className="text-[9px] text-slate-405 font-medium">Hovering...</span>
            </>
          )}
        </div>
      </div>

      <svg 
        viewBox="0 0 300 300" 
        className="w-full h-full max-h-72 drop-shadow-sm"
        data-engine="InteractiveBrain-SVG-v2"
        data-creator="Jaanvin"
      >
        <defs>
          <metadata id="bcnl-svg-provenance" data-author="Jaanvin" data-signature="JAANVIN-BCNL-CUK-2026" />
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0f2d59" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0f2d59" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f2d59" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#64748b" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64748b" stopOpacity="0" />
            <stop offset="50%" stopColor="#0f2d59" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#64748b" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Draw Head/MNI Grid Outline */}
        <path
          d="M 150 25 A 115 115 0 0 1 265 140 A 115 115 0 0 1 150 255 A 115 115 0 0 1 35 140 A 115 115 0 0 1 150 25 Z"
          fill="none"
          stroke="rgba(15, 45, 89, 0.12)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        {/* Nose reference */}
        <path
          d="M 140 25 L 150 5 L 160 25"
          fill="none"
          stroke="rgba(15, 45, 89, 0.2)"
          strokeWidth="1.5"
        />

        {/* Draw Connections */}
        {connections.map(([i1, i2], idx) => {
          const n1 = projectedNodes[i1];
          const n2 = projectedNodes[i2];
          return (
            <g key={idx}>
              <line
                x1={n1.px} y1={n1.py}
                x2={n2.px} y2={n2.py}
                stroke="url(#lineGrad)"
                strokeWidth={1}
              />
              <line
                x1={n1.px} y1={n1.py}
                x2={n2.px} y2={n2.py}
                stroke="url(#pulseGrad)"
                strokeWidth={1.5}
                strokeDasharray="15 60"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="100;0"
                  dur={`${2.5 + (idx % 3) * 0.5}s`}
                  repeatCount="indefinite"
                />
              </line>
            </g>
          );
        })}

        {/* Draw Nodes */}
        {projectedNodes.map((node) => {
          const isHovered = hoveredNode === node.id;
          const r = isHovered ? 7.5 : 4.5;
          return (
            <g 
              key={node.id}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <circle
                cx={node.px}
                cy={node.py}
                r={r * 3.2}
                fill="url(#nodeGlow)"
                opacity={isHovered ? 0.95 : 0.25}
              />
              <circle
                cx={node.px}
                cy={node.py}
                r={r}
                fill={isHovered ? '#0f2d59' : '#64748b'}
                stroke="#ffffff"
                strokeWidth={1.5}
                style={{ transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
