import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { Brain, Activity, Info, Zap, Upload, FileText, Sliders, Check } from 'lucide-react';

interface LobeInfo {
  name: string;
  subtitle: string;
  function: string;
  signals: string;
  biosignalLink: string;
  color: string;
  nodePosition: [number, number, number];
}

const LOBES_DATA: Record<string, LobeInfo> = {
  frontal: {
    name: 'Frontal Lobe',
    subtitle: 'Executive Center & Motor Control',
    function: 'Responsible for higher-level cognitive processes, including planning, decision making, social behavior, focus, and voluntary muscle movements.',
    signals: 'Primary source of high-frequency EEG Beta waves (13-30 Hz) during active thinking, and slow Theta waves during cognitive fatigue. Electrodes: Fp1, Fp2, F3, F4.',
    biosignalLink: 'EEG Beta & Theta waves (Cognitive Load)',
    color: '#3b82f6', // Tailwind blue-500
    nodePosition: [0, 35, 30]
  },
  parietal: {
    name: 'Parietal Lobe',
    subtitle: 'Sensory Integration & Spatial Awareness',
    function: 'Integrates sensory information from various parts of the body (somatosensory cortex), processes spatial relationships, navigation, and numbers.',
    signals: 'Involved in sensorimotor rhythms (SMR) and alpha band attenuation during tactile attention. Electrodes: P3, P4, Pz.',
    biosignalLink: 'EEG Mu Rhythm (Sensory Processing)',
    color: '#a855f7', // Tailwind purple-500
    nodePosition: [0, -45, 50]
  },
  occipital: {
    name: 'Occipital Lobe',
    subtitle: 'Visual Processing Core',
    function: 'The visual processing center of the mammalian brain, containing most of the anatomical region of the visual cortex.',
    signals: 'Strong generator of EEG Alpha waves (8-12 Hz) when eyes are closed or in resting states. Occipital alpha drops instantly upon visual attention. Electrodes: O1, O2, Oz.',
    biosignalLink: 'EEG Alpha Coherence (Visual Processing)',
    color: '#22c55e', // Tailwind green-500
    nodePosition: [0, -80, 10]
  },
  temporal: {
    name: 'Temporal Lobe',
    subtitle: 'Auditory & Memory Center',
    function: 'Processes auditory stimuli, language comprehension, memory acquisition (via hippocampus), and emotional processing (via amygdala).',
    signals: 'Generates localized Theta (4-7 Hz) waves and plays a key role in emotional reactivity indexing when combined with GSR. Electrodes: T3, T4, T5, T6.',
    biosignalLink: 'EEG Theta waves (Memory & Auditory)',
    color: '#ec4899', // Tailwind pink-500
    nodePosition: [48, -15, -15]
  },
  cerebellum: {
    name: 'Cerebellum',
    subtitle: 'Motor Coordination & Timing',
    function: 'Coordinates voluntary movements such as posture, balance, coordination, and speech, resulting in smooth and balanced muscular activity.',
    signals: 'Mainly high-frequency sub-cortical signals. Crucial for motor learning and micro-timing paradigms.',
    biosignalLink: 'Saccadic Eye Movement Integration',
    color: '#eab308', // Tailwind yellow-500
    nodePosition: [0, -55, -30]
  },
  stem: {
    name: 'Brain Stem',
    subtitle: 'Autonomic Control Center',
    function: 'Controls flow of messages between the brain and the rest of the body. Governs essential survival functions like respiration, heartbeat, blood pressure, and sweating.',
    signals: 'Primary driver of autonomic biosignals, including electrodermal activity (GSR/EDA) via the sympathetic pathway, and ECG heart rate variability via the vagus nerve.',
    biosignalLink: 'GSR / EDA & Heart Rate (ECG)',
    color: '#f97316', // Tailwind orange-500
    nodePosition: [0, -15, -50]
  }
};

interface BrainSceneWrapperProps {
  viewMode: 'anatomical' | 'connectome';
  connectomePreset: 'aal90' | 'brodmann' | 'custom';
  edgeWeightThreshold: number;
  parsedNodes: any[];
  parsedEdges: any[];
  hoveredLobe: string | null;
  selectedLobe: string;
  setHoveredLobe: (lobe: string | null) => void;
  setSelectedLobe: (lobe: string) => void;
}

function BrainSceneWrapper({
  viewMode,
  connectomePreset,
  edgeWeightThreshold,
  parsedNodes,
  parsedEdges,
  hoveredLobe,
  selectedLobe,
  setHoveredLobe,
  setSelectedLobe
}: BrainSceneWrapperProps) {
  const obj = useLoader(OBJLoader, '/models/brain_vertex_low.obj');

  const { scaleFactor, centerShift, meshVertices, clonedObj } = useMemo(() => {
    const cloned = obj.clone();

    // Swap Y and Z coordinates of the OBJ geometries to match standard Three.js axes mapping
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const posAttr = mesh.geometry.attributes.position;
        if (posAttr) {
          for (let i = 0; i < posAttr.count; i++) {
            const yVal = posAttr.getY(i);
            const zVal = posAttr.getZ(i);
            posAttr.setY(i, zVal);
            posAttr.setZ(i, yVal);
          }
          posAttr.needsUpdate = true;
          mesh.geometry.computeVertexNormals();
        }
      }
    });

    const scaleFactor = 1 / 85.0; 
    const mniCenter = [2.5, -14.0, 17.5]; 
    
    const centerShift: [number, number, number] = [
      -mniCenter[0] * scaleFactor,
      -mniCenter[2] * scaleFactor,
      -mniCenter[1] * scaleFactor
    ];

    const coords: number[] = [];
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const posAttr = mesh.geometry.attributes.position;
        if (posAttr) {
          for (let i = 0; i < posAttr.count; i++) {
            coords.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
          }
        }
      }
    });

    return {
      scaleFactor,
      centerShift,
      clonedObj: cloned,
      meshVertices: new Float32Array(coords)
    };
  }, [obj]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
    }
  });

  useEffect(() => {
    clonedObj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        let meshColor = '#3b82f6';
        if (viewMode === 'connectome') {
          meshColor = '#64748b';
        } else if (selectedLobe) {
          meshColor = LOBES_DATA[selectedLobe].color;
        }

        mesh.material = new THREE.MeshBasicMaterial({
          color: meshColor,
          transparent: true,
          opacity: viewMode === 'connectome' ? 0.03 : 0.12,
          wireframe: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        });
      }
    });
  }, [clonedObj, viewMode, selectedLobe]);

  return (
    <group ref={groupRef}>
      <group position={centerShift} scale={[scaleFactor, scaleFactor, scaleFactor]}>
        <primitive object={clonedObj} />

        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[meshVertices, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={1.0}
            color={viewMode === 'connectome' ? '#38bdf8' : '#3b82f6'}
            transparent
            opacity={viewMode === 'connectome' ? 0.1 : 0.45}
            sizeAttenuation={true}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        {viewMode === 'anatomical' && (
          <>
            <InteractiveNodes
              hoveredLobe={hoveredLobe}
              selectedLobe={selectedLobe}
              onHoverLobe={setHoveredLobe}
              onClickLobe={setSelectedLobe}
            />
            <NeuralImpulses />
          </>
        )}

        {viewMode === 'connectome' && parsedNodes.length > 0 && (
          <ConnectomeRenderer 
            nodes={parsedNodes} 
            edgesMatrix={parsedEdges} 
            threshold={edgeWeightThreshold} 
          />
        )}
      </group>
    </group>
  );
}

interface InteractiveNodesProps {
  hoveredLobe: string | null;
  selectedLobe: string;
  onHoverLobe: (lobe: string | null) => void;
  onClickLobe: (lobe: string) => void;
}

function InteractiveNodes({ hoveredLobe, selectedLobe, onHoverLobe, onClickLobe }: InteractiveNodesProps) {
  return (
    <group>
      {Object.entries(LOBES_DATA).map(([key, data]) => {
        const isActive = selectedLobe === key || hoveredLobe === key;
        const color = new THREE.Color(data.color);
        const mappedPosition: [number, number, number] = [data.nodePosition[0], data.nodePosition[2], data.nodePosition[1]];

        const positions = key === 'temporal' 
          ? [mappedPosition, [-mappedPosition[0], mappedPosition[1], mappedPosition[2]] as [number, number, number]] 
          : [mappedPosition];

        return positions.map((pos, idx) => (
          <mesh
            key={`${key}-${idx}`}
            position={pos}
            onPointerOver={(e) => {
              e.stopPropagation();
              onHoverLobe(key);
            }}
            onPointerOut={() => onHoverLobe(null)}
            onClick={(e) => {
              e.stopPropagation();
              onClickLobe(key);
            }}
          >
            <sphereGeometry args={[isActive ? 5.5 : 3.8, 16, 16]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={isActive ? 0.95 : 0.6}
            />
            {isActive && (
              <Html distanceFactor={0.03} position={[0, 8, 0]} center>
                <div className="bg-slate-900/90 text-white border border-slate-700 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                  {data.name}
                </div>
              </Html>
            )}
          </mesh>
        ));
      })}
    </group>
  );
}

function NeuralImpulses() {
  const groupRef = useRef<THREE.Group>(null);
  
  const tracks = useMemo(() => {
    const list = [];
    const lobesKeys = Object.keys(LOBES_DATA);

    for (let i = 0; i < 8; i++) {
      const startLobe = lobesKeys[Math.floor(Math.random() * lobesKeys.length)];
      let endLobe = lobesKeys[Math.floor(Math.random() * lobesKeys.length)];
      while (startLobe === endLobe) {
        endLobe = lobesKeys[Math.floor(Math.random() * lobesKeys.length)];
      }

      const sLobe = LOBES_DATA[startLobe].nodePosition;
      const eLobe = LOBES_DATA[endLobe].nodePosition;
      const pStart = [sLobe[0], sLobe[2], sLobe[1]];
      const pEnd = [eLobe[0], eLobe[2], eLobe[1]];

      const pMiddle = [
        (pStart[0] + pEnd[0]) / 2 + (Math.random() - 0.5) * 30,
        (pStart[1] + pEnd[1]) / 2 + (Math.random() - 0.5) * 30,
        (pStart[2] + pEnd[2]) / 2 + (Math.random() - 0.5) * 30,
      ];

      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(...pStart),
        new THREE.Vector3(...pMiddle),
        new THREE.Vector3(...pEnd)
      );

      list.push({
        curve,
        speed: 0.3 + Math.random() * 0.4,
        progress: Math.random(),
        color: LOBES_DATA[startLobe].color
      });
    }
    return list;
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((mesh, index) => {
        const track = tracks[index];
        track.progress += delta * track.speed;
        if (track.progress > 1) {
          track.progress = 0;
        }
        const point = track.curve.getPointAt(track.progress);
        mesh.position.copy(point);
      });
    }
  });

  return (
    <group ref={groupRef}>
      {tracks.map((track, idx) => (
        <mesh key={idx}>
          <sphereGeometry args={[1.36, 8, 8]} />
          <meshBasicMaterial color={new THREE.Color(track.color)} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function parseNodeFile(text: string) {
  const lines = text.split('\n');
  const nodes = [];
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    const parts = line.split(/\s+/);
    if (parts.length >= 6) {
      const x = parseFloat(parts[0]);
      const y = parseFloat(parts[1]);
      const z = parseFloat(parts[2]);
      const colorId = parseInt(parts[3]);
      const size = parseFloat(parts[4]);
      const name = parts.slice(5).join(' ').replace(/^"|"$/g, '');
      nodes.push({ x, y, z, colorId, size, name });
    }
  }
  return nodes;
}

function parseEdgeFile(text: string) {
  const lines = text.split('\n');
  const matrix = [];
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    const parts = line.split(/\s+/).map(Number).filter(n => !isNaN(n));
    if (parts.length > 0) {
      matrix.push(parts);
    }
  }
  return matrix;
}

interface ConnectomeRendererProps {
  nodes: any[];
  edgesMatrix: number[][];
  threshold: number;
}

function ConnectomeRenderer({ nodes, edgesMatrix, threshold }: ConnectomeRendererProps) {
  const { nodePositions, nodeSizes, colors, linePositions, lineColors } = useMemo(() => {
    const nodePositions: number[] = [];
    const nodeSizes: number[] = [];
    const colors: number[] = [];
    const linePositions: number[] = [];
    const lineColors: number[] = [];

    const colorPalette = [
      '#e11d48', '#d97706', '#059669', '#2563eb', '#7c3aed', '#db2777', 
      '#0d9488', '#ea580c', '#4f46e5', '#854d0e', '#1e293b'
    ];

    nodes.forEach((node) => {
      // Map MNI space [X, Y, Z] to Three.js space [X, Z, Y]
      nodePositions.push(node.x, node.z, node.y);
      nodeSizes.push(node.size * 1.8);

      const colorHex = colorPalette[Math.abs(node.colorId) % colorPalette.length];
      const threeColor = new THREE.Color(colorHex);
      colors.push(threeColor.r, threeColor.g, threeColor.b);
    });

    if (edgesMatrix && edgesMatrix.length > 0) {
      for (let i = 0; i < edgesMatrix.length; i++) {
        for (let j = i + 1; j < edgesMatrix[i].length; j++) {
          const w = edgesMatrix[i][j];
          if (w >= threshold && i < nodes.length && j < nodes.length) {
            const n1 = nodes[i];
            const n2 = nodes[j];

            linePositions.push(n1.x, n1.z, n1.y);
            linePositions.push(n2.x, n2.z, n2.y);

            const c1Hex = colorPalette[Math.abs(n1.colorId) % colorPalette.length];
            const c2Hex = colorPalette[Math.abs(n2.colorId) % colorPalette.length];
            const c1 = new THREE.Color(c1Hex);
            const c2 = new THREE.Color(c2Hex);

            lineColors.push(c1.r, c1.g, c1.b);
            lineColors.push(c2.r, c2.g, c2.b);
          }
        }
      }
    }

    return {
      nodePositions: new Float32Array(nodePositions),
      nodeSizes: new Float32Array(nodeSizes),
      colors: new Float32Array(colors),
      linePositions: new Float32Array(linePositions),
      lineColors: new Float32Array(lineColors)
    };
  }, [nodes, edgesMatrix, threshold]);

  return (
    <group>
      {/* Draw Connectome Node Spheres */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={5.5}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Draw Connectome Edges */}
      {linePositions.length > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
            <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            vertexColors
            transparent
            opacity={0.35}
            linewidth={1}
          />
        </lineSegments>
      )}
    </group>
  );
}

interface ThreeBrainProps {
  gaze: { x: number; y: number; located: boolean } | null;
  isGazeConnected: boolean;
}

export default function ThreeBrain({ gaze, isGazeConnected }: ThreeBrainProps) {
  const [viewMode, setViewMode] = useState<'anatomical' | 'connectome'>('anatomical'); 
  const [connectomePreset, setConnectomePreset] = useState<'aal90' | 'brodmann' | 'custom'>('aal90'); 
  const [edgeWeightThreshold, setEdgeWeightThreshold] = useState(0.3);
  const [parsedNodes, setParsedNodes] = useState<any[]>([]);
  const [parsedEdges, setParsedEdges] = useState<number[][]>([]);
  const [customNodeText, setCustomNodeText] = useState('');
  const [customEdgeText, setCustomEdgeText] = useState('');
  const [selectedLobe, setSelectedLobe] = useState('frontal');
  const [hoveredLobe, setHoveredLobe] = useState<string | null>(null);

  const activeData = LOBES_DATA[selectedLobe];

  // Gaze-to-Lobe Coordinate Mapping
  useEffect(() => {
    if (viewMode !== 'anatomical' || !isGazeConnected || !gaze || !gaze.located) return;
    
    const { x, y } = gaze;
    let targetLobe = selectedLobe;
    
    if (x > 0.42 && x < 0.58 && y > 0.58) {
      targetLobe = 'stem';
    } else if (x > 0.35 && x < 0.65 && y > 0.42 && y <= 0.58) {
      targetLobe = 'cerebellum';
    } else if (x < 0.48 && y < 0.48) {
      targetLobe = 'frontal';
    } else if (x >= 0.48 && y < 0.48) {
      targetLobe = 'parietal';
    } else if (x >= 0.48 && y >= 0.48) {
      targetLobe = 'occipital';
    } else if (x < 0.48 && y >= 0.48) {
      targetLobe = 'temporal';
    }
    
    if (targetLobe !== selectedLobe) {
      setSelectedLobe(targetLobe);
    }
  }, [gaze, isGazeConnected, selectedLobe, viewMode]);

  // Load Preset Connectome Data
  useEffect(() => {
    if (viewMode !== 'connectome') return;
    
    const loadPresetData = async () => {
      let nodeUrl = '';
      let edgeUrl = '';

      if (connectomePreset === 'aal90') {
        nodeUrl = '/templates/Node_AAL90.node';
        edgeUrl = '/templates/Edge_AAL90.edge';
      } else if (connectomePreset === 'brodmann') {
        nodeUrl = '/templates/Node_Brodmann82.node';
        edgeUrl = '/templates/Edge_Brodmann82.edge';
      } else {
        return; 
      }

      try {
        const [nodeRes, edgeRes] = await Promise.all([fetch(nodeUrl), fetch(edgeUrl)]);
        if (nodeRes.ok && edgeRes.ok) {
          const nodeText = await nodeRes.text();
          const edgeText = await edgeRes.text();
          setParsedNodes(parseNodeFile(nodeText));
          setParsedEdges(parseEdgeFile(edgeText));
        }
      } catch (err) {
        console.error('Failed to load connectome preset files:', err);
      }
    };
    loadPresetData();
  }, [viewMode, connectomePreset]);

  const handleCustomUpload = () => {
    if (customNodeText) {
      setParsedNodes(parseNodeFile(customNodeText));
    }
    if (customEdgeText) {
      setParsedEdges(parseEdgeFile(customEdgeText));
    }
    setConnectomePreset('custom');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Upper Header Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-blue-950">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">
              <Brain className="h-6 w-6 text-blue-950" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              3D Brain Network Explorer
            </h2>
          </div>
          <p className="text-sm text-slate-600 font-medium max-w-2xl pl-0.5">
            Interactive coordinate mapping of anatomical lobes, EEG sensors, and structural connectivity matrices.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-950 border border-blue-150">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            WebGL 3D Active
          </span>
        </div>
        {/* Hidden Steganographic Copyright (White on White) */}
        <span className="absolute bottom-1 right-2 text-[10px] text-white selection:bg-blue-950 selection:text-white select-all pointer-events-auto">
          Copyrighted to jaanvin. Developed & Engineered by Jaanvin. All Rights Reserved.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Center Column: 3D Render Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl h-144 overflow-hidden relative shadow-sm">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <button
              onClick={() => setViewMode('anatomical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                viewMode === 'anatomical'
                  ? 'bg-blue-950 border-blue-900 text-white'
                  : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Anatomical Lobes
            </button>
            <button
              onClick={() => setViewMode('connectome')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                viewMode === 'connectome'
                  ? 'bg-blue-950 border-blue-900 text-white'
                  : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Connectome Matrix
            </button>
          </div>

          <div className="absolute top-4 right-4 z-10 text-[10px] font-bold text-slate-400 bg-slate-950/50 px-2.5 py-1 rounded-full border border-slate-800/40">
            🖱️ Left drag to rotate · Scroll to zoom
          </div>

          {/* Hidden Steganographic Copyright (Black on Black in Dark Canvas) */}
          <div className="absolute bottom-2 right-4 z-10 text-[10px] text-slate-900 selection:bg-blue-500 selection:text-white select-all pointer-events-auto">
            Copyrighted to jaanvin. 3D Brain Engine & Coordinate System Authored by Jaanvin.
          </div>

          {/* Gaze calibration status */}
          {isGazeConnected && gaze && (
            <div className="absolute bottom-4 left-4 z-10 text-[10px] font-bold text-emerald-400 bg-slate-950/60 px-3 py-1 rounded-full border border-emerald-900/40 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Gaze Track Sync active
            </div>
          )}

          {/* 3D Canvas rendering */}
          <div className="w-full h-full">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-800 border-t-blue-500 mr-2" />
                Initializing 3D Brain coordinates...
              </div>
            }>
              <Canvas camera={{ position: [0, 0, 1.8], fov: 60 }}>
                <ambientLight intensity={0.6} />
                <pointLight position={[10, 10, 10]} intensity={1.2} />
                <BrainSceneWrapper
                  viewMode={viewMode}
                  connectomePreset={connectomePreset}
                  edgeWeightThreshold={edgeWeightThreshold}
                  parsedNodes={parsedNodes}
                  parsedEdges={parsedEdges}
                  hoveredLobe={hoveredLobe}
                  selectedLobe={selectedLobe}
                  setHoveredLobe={setHoveredLobe}
                  setSelectedLobe={setSelectedLobe}
                />
                <OrbitControls 
                  enableZoom={true} 
                  maxDistance={3.5} 
                  minDistance={1.0}
                  enablePan={false}
                  enableDamping
                />
              </Canvas>
            </Suspense>
          </div>
        </div>

        {/* Right Column: Lobe Info or Connectome Controls (5 cols) */}
        <div className="lg:col-span-5 h-144 flex flex-col">
          {viewMode === 'anatomical' ? (
            /* Anatomical Info Panels */
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex-1 flex flex-col justify-between overflow-hidden">
              
              {/* Lobe selection horizontal tab bar */}
              <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-4 shrink-0">
                {Object.keys(LOBES_DATA).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedLobe(key)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                      selectedLobe === key
                        ? 'bg-blue-50 text-blue-950 border border-blue-150'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {LOBES_DATA[key].name.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Dynamic content info */}
              {activeData && (
                <div className="flex-1 py-4 overflow-y-auto space-y-5">
                  <div>
                    <h3 className="text-xl font-extrabold text-blue-950 tracking-tight">
                      {activeData.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                      {activeData.subtitle}
                    </p>
                  </div>

                  <div className="space-y-4 text-xs text-slate-600 leading-relaxed font-sans font-medium">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5 text-blue-950" /> Functional Description
                      </h4>
                      <p className="leading-relaxed">
                        {activeData.function}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-blue-950" /> Electrophysiological Footprint
                      </h4>
                      <p className="leading-relaxed">
                        {activeData.signals}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Biosignal Link card at bottom */}
              {activeData && (
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center gap-2.5 shrink-0 mt-2">
                  <Activity className="h-5 w-5 text-blue-950 shrink-0" />
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Biosignal Link</span>
                    <span className="text-xs font-bold text-slate-900">{activeData.biosignalLink}</span>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* Connectome Controls Panel */
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex-1 flex flex-col justify-between overflow-y-auto space-y-6 scrollbar-thin">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Connectome Configurations
                </h3>

                {/* Preset selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Select Preset Coordinates
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setConnectomePreset('aal90')}
                      className={`px-3 py-2 text-xs font-bold rounded-lg border transition-colors ${
                        connectomePreset === 'aal90'
                          ? 'bg-blue-950 border-blue-950 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      MNI AAL-90 Nodes
                    </button>
                    <button
                      onClick={() => setConnectomePreset('brodmann')}
                      className={`px-3 py-2 text-xs font-bold rounded-lg border transition-colors ${
                        connectomePreset === 'brodmann'
                          ? 'bg-blue-950 border-blue-950 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Brodmann Areas
                    </button>
                  </div>
                </div>

                {/* Threshold Slider */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Sliders className="h-3.5 w-3.5" /> Edge Threshold
                    </span>
                    <span className="font-bold text-blue-950">{edgeWeightThreshold.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.95"
                    step="0.05"
                    value={edgeWeightThreshold}
                    onChange={(e) => setEdgeWeightThreshold(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-950"
                  />
                  <span className="text-[10px] text-slate-500 block leading-tight font-medium">
                    Hides edges with structural connectivity value below the threshold.
                  </span>
                </div>

                {/* Custom Connectome Upload */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Upload className="h-4 w-4 text-blue-950" />
                    Load Custom coordinates
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                        Node Coordinates (.node file contents)
                      </label>
                      <textarea
                        rows={2}
                        value={customNodeText}
                        onChange={(e) => setCustomNodeText(e.target.value)}
                        placeholder="-45.2 -67.1 12.3 2 4.5 Prefrontal_L_Fp1&#10;45.1 -67.3 12.4 2 4.5 Prefrontal_R_Fp2"
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 text-slate-900 placeholder:text-slate-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                        Edge Connectivity Matrix (.edge file contents)
                      </label>
                      <textarea
                        rows={2}
                        value={customEdgeText}
                        onChange={(e) => setCustomEdgeText(e.target.value)}
                        placeholder="0.00 0.85 0.12 0.32&#10;0.85 0.00 0.45 0.22"
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 text-slate-900 placeholder:text-slate-400 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 shrink-0">
                <button
                  onClick={handleCustomUpload}
                  disabled={!customNodeText && !customEdgeText}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Apply Coordinates
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
