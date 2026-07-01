import React, { useState, useEffect, useRef } from 'react';

const initialNodes = [
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
  const containerRef = useRef(null);
  const [rotation, setRotation] = useState({ x: -0.2, y: 0.4 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [signals, setSignals] = useState({});

  // Simulate electrical signal noise
  useEffect(() => {
    const interval = setInterval(() => {
      const newSignals = {};
      initialNodes.forEach((node, idx) => {
        newSignals[idx] = (Math.sin(Date.now() / 200 + idx) * 3 + Math.random() * 2 + 5).toFixed(1);
      });
      setSignals(newSignals);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Track mouse coordinates for 3D rotation parallax
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Normalize coordinates between -0.5 and 0.5
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;
    
    // Smooth target rotation (lerp target)
    setRotation({
      x: mouseY * 0.8, // rotation around X axis
      y: mouseX * 1.2  // rotation around Y axis
    });
  };

  const handleMouseLeave = () => {
    // Return to a gentle default rotation
    setRotation({ x: -0.2, y: 0.4 });
  };

  // Projected 3D nodes
  const projectedNodes = initialNodes.map((node, idx) => {
    // 3D rotation math
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);

    // Rotate around Y axis (horizontal mouse movement)
    let x1 = node.x * cosY - node.z * sinY;
    let z1 = node.x * sinY + node.z * cosY;

    // Rotate around X axis (vertical mouse movement)
    let y1 = node.y * cosX - z1 * sinX;
    let z2 = node.y * sinX + z1 * cosX;

    // Center coordinates inside a 300x300 viewport
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
      className="interactive-svg-container"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dynamic Signal Readout overlay */}
      <div className="signal-hud glass-panel">
        <div className="hud-title">EEG Signal Monitor</div>
        <div className="hud-metric">
          {hoveredNode !== null ? (
            <>
              <span className="hud-label">{projectedNodes[hoveredNode].label}</span>
              <span className="hud-value glow-text-pink">{signals[hoveredNode] || '0.0'} µV</span>
            </>
          ) : (
            <>
              <span className="hud-label">Hover Node to Probe</span>
              <span className="hud-value" style={{ color: 'var(--text-muted)' }}>Monitoring...</span>
            </>
          )}
        </div>
      </div>

      <svg viewBox="0 0 300 300" className="brain-svg">
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--accent-pink)" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-pink)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--accent-pink)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Draw Head/MNI Grid Outline */}
        <path
          d="M 150 25 A 115 115 0 0 1 265 140 A 115 115 0 0 1 150 255 A 115 115 0 0 1 35 140 A 115 115 0 0 1 150 25 Z"
          fill="none"
          stroke="rgba(87, 197, 182, 0.15)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        {/* Nose reference */}
        <path
          d="M 140 25 L 150 5 L 160 25"
          fill="none"
          stroke="rgba(87, 197, 182, 0.25)"
          strokeWidth="1.5"
        />

        {/* Draw Connections */}
        {connections.map(([i1, i2], idx) => {
          const n1 = projectedNodes[i1];
          const n2 = projectedNodes[i2];
          return (
            <g key={idx}>
              {/* Static link */}
              <line
                x1={n1.px} y1={n1.py}
                x2={n2.px} y2={n2.py}
                stroke="url(#lineGrad)"
                strokeWidth={1}
                strokeOpacity={0.5}
              />
              {/* Glowing Pulse */}
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
          const r = isHovered ? 8 : 4.5;
          return (
            <g 
              key={node.id}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Glow aura */}
              <circle
                cx={node.px}
                cy={node.py}
                r={r * 3.2}
                fill="url(#nodeGlow)"
                opacity={isHovered ? 0.95 : 0.3}
              />
              {/* Solid point */}
              <circle
                cx={node.px}
                cy={node.py}
                r={r}
                fill={isHovered ? 'var(--accent-pink)' : 'var(--accent-cyan)'}
                stroke="var(--bg-dark)"
                strokeWidth={1.5}
                style={{ transition: 'r 0.15s ease, fill 0.15s ease' }}
              />
            </g>
          );
        })}
      </svg>

      <style>{`
        .interactive-svg-container {
          position: relative;
          width: 100%;
          max-width: 320px; /* Prevents visual stretching */
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .brain-svg {
          width: 100%;
          height: 100%;
          max-height: 280px;
          filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.05));
        }

        .signal-hud {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 160px;
          padding: 8px 10px;
          z-index: 5;
          text-align: center;
          border-radius: 8px;
          background: var(--bg-glass);
          border: 1px solid var(--border-glass);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          pointer-events: none; /* Allows pointer hover to pass through to underlying elements */
        }

        .hud-title {
          font-family: var(--font-body);
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--text-muted);
          margin-bottom: 2px;
        }

        .hud-metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
        }

        .hud-label {
          font-size: 0.74rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .hud-value {
          font-family: var(--font-body);
          font-size: 0.8rem;
          font-weight: 700;
        }

        @media (max-width: 600px) {
          .interactive-svg-container {
            max-width: 280px;
            padding: 10px;
          }
          .brain-svg {
            max-height: 230px;
          }
          .signal-hud {
            top: auto;
            right: auto;
            bottom: 4px;
            left: 50%;
            transform: translateX(-50%);
            width: calc(100% - 16px);
            max-width: 220px;
            padding: 6px 8px;
          }
          .hud-title {
            font-size: 0.62rem;
          }
          .hud-label {
            font-size: 0.7rem;
          }
          .hud-value {
            font-size: 0.74rem;
          }
        }
      `}</style>
    </div>
  );
}
