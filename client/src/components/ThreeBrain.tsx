import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { 
  Brain, 
  Activity, 
  Info, 
  Zap, 
  Upload, 
  Sliders, 
  RotateCcw, 
  Play, 
  Pause, 
  Eye, 
  Check, 
  Layers, 
  ChevronRight,
  Maximize2,
  Sparkles,
  Waves
} from 'lucide-react';

interface LobeInfo {
  name: string;
  subtitle: string;
  function: string;
  signals: string;
  biosignalLink: string;
  color: string;
  nodePosition: [number, number, number]; // MNI [X, Y, Z]
  volumePct: string;
  dominantWave: string;
  channels: string;
}

const LOBES_DATA: Record<string, LobeInfo> = {
  frontal: {
    name: 'Frontal Lobe',
    subtitle: 'Executive Center & Motor Control',
    function: 'Coordinates higher-order cognitive operations, goal-directed behavior, working memory manipulation, decision-making, and primary voluntary motor execution.',
    signals: 'Generates frontal midline Theta (FmTheta, 4–8 Hz) during concentrated workload, and synchronized Beta oscillations (13–30 Hz) during motor planning. Primary electrodes: Fp1, Fp2, F3, F4, Fz.',
    biosignalLink: 'Frontal EEG Beta / Theta Ratio (Cognitive Load)',
    color: '#3b82f6', // Blue 500
    nodePosition: [0, 38, 30],
    volumePct: '32%',
    dominantWave: 'Beta (13–30 Hz)',
    channels: 'Fp1, Fp2, F3, F4, Fz'
  },
  parietal: {
    name: 'Parietal Lobe',
    subtitle: 'Somatosensory & Spatial Integration',
    function: 'Processes multi-sensory afferents, spatial orientation, mental rotation, tactile feedback, and coordinate transformation between eye, head, and body frames.',
    signals: 'Sensorimotor rhythm (SMR, 12–15 Hz) desynchronization during tactile exploration; Parietal P300 ERP amplitude scaling with stimulus novelty. Primary electrodes: P3, P4, Pz.',
    biosignalLink: 'P300 Evoked Potentials (Sensory Integration)',
    color: '#a855f7', // Purple 500
    nodePosition: [0, -42, 52],
    volumePct: '21%',
    dominantWave: 'Mu Rhythm & Alpha (8–13 Hz)',
    channels: 'P3, P4, Pz, CP1, CP2'
  },
  occipital: {
    name: 'Occipital Lobe',
    subtitle: 'Visual Processing & Retinotopic Core',
    function: 'Primary visual cortex (V1) through associative areas (V2–V5), decoding orientation, retinotopic maps, spatial frequency, and visual motion patterns.',
    signals: 'Robust occipital Alpha rhythm (8–12 Hz) emerging strongly during eyes-closed states, instantly blocked upon saccadic visual fixation (Berger effect). Primary electrodes: O1, O2, Oz.',
    biosignalLink: 'Occipital Alpha Coherence (Gaze Fixation)',
    color: '#10b981', // Emerald 500
    nodePosition: [0, -78, 12],
    volumePct: '16%',
    dominantWave: 'Alpha (8–12 Hz)',
    channels: 'O1, O2, Oz'
  },
  temporal: {
    name: 'Temporal Lobe',
    subtitle: 'Auditory & Declarative Memory Hub',
    function: 'Houses Heschl’s gyrus (auditory cortex), Wernicke’s language comprehension, hippocampal episodic memory encoding, and amygdaloid emotional valence appraisal.',
    signals: 'Auditory N100 and P200 ERP complexes, localized lateralized Theta bursts during mnemonic recall tasks. Primary electrodes: T3, T4, T5, T6, TP9, TP10.',
    biosignalLink: 'Auditory ERPs & Hippocampal Theta',
    color: '#ec4899', // Pink 500
    nodePosition: [48, -15, -12],
    volumePct: '23%',
    dominantWave: 'Theta (4–8 Hz)',
    channels: 'T7, T8, TP9, TP10, P7, P8'
  },
  cerebellum: {
    name: 'Cerebellum',
    subtitle: 'Motor Coordination & Micro-Timing',
    function: 'Computes internal forward models of motor error, micro-second timing intervals, posture calibration, and eye movement smooth pursuit stabilization.',
    signals: 'High-frequency cerebellar oscillations coordinated with pre-frontal motor commands. Integral to saccadic correction paradigms during eye-tracking experiments.',
    biosignalLink: 'Saccadic Smooth Pursuit & Motor Calibration',
    color: '#eab308', // Yellow 500
    nodePosition: [0, -54, -30],
    volumePct: '10%',
    dominantWave: 'Gamma (>30 Hz) Modulation',
    channels: 'Inion, Cerebellar Poles'
  },
  stem: {
    name: 'Brain Stem',
    subtitle: 'Autonomic & Neurovegetative Nexus',
    function: 'Ascending Reticular Activating System (ARAS), autonomic nucleus tractus solitarius, modulating cardio-respiratory pacing, pupil diameter, and sympathetic arousal.',
    signals: 'Direct central pacemaker driving autonomic peripheral indices: galvanic skin response (GSR / electrodermal skin conductance) and ECG vagal heart rate variability (HRV).',
    biosignalLink: 'GSR Electrodermal Arousal & Vagal HRV',
    color: '#f97316', // Orange 500
    nodePosition: [0, -16, -48],
    volumePct: '3%',
    dominantWave: 'Autonomic Sympathetic Tone',
    channels: 'Peripheral BVP, GSR, ECG Lead-II'
  }
};

interface BrainSceneWrapperProps {
  viewMode: 'anatomical' | 'connectome';
  edgeWeightThreshold: number;
  parsedNodes: any[];
  parsedEdges: any[];
  hoveredLobe: string | null;
  selectedLobe: string;
  setHoveredLobe: (lobe: string | null) => void;
  setSelectedLobe: (lobe: string) => void;
  isAutoRotate: boolean;
}

function BrainSceneWrapper({
  viewMode,
  edgeWeightThreshold,
  parsedNodes,
  parsedEdges,
  hoveredLobe,
  selectedLobe,
  setHoveredLobe,
  setSelectedLobe,
  isAutoRotate
}: BrainSceneWrapperProps) {
  const obj = useLoader(OBJLoader, '/models/brain_vertex_low.obj');

  // Deep clone geometry once and apply MNI-to-Three.js mapping immutably
  const { scaleFactor, centerShift, meshVertices, clonedMesh } = useMemo(() => {
    const cloned = obj.clone(true);
    const coords: number[] = [];

    // Calculate bounding box in original MNI space
    const mniCenter = new THREE.Vector3(0, -10, 15);

    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        // Deep clone geometry to prevent mutating cached loader geometry
        const geom = mesh.geometry.clone();
        const posAttr = geom.attributes.position;
        if (posAttr) {
          for (let i = 0; i < posAttr.count; i++) {
            // MNI Coordinate -> Three.js Coordinate mapping:
            // Three X = MNI X (Left/Right)
            // Three Y = MNI Z (Inferior/Superior)
            // Three Z = MNI Y (Posterior/Anterior)
            const mx = posAttr.getX(i);
            const my = posAttr.getY(i);
            const mz = posAttr.getZ(i);

            posAttr.setXYZ(i, mx, mz, my);
            coords.push(mx, mz, my);
          }
          posAttr.needsUpdate = true;
          geom.computeVertexNormals();
        }
        mesh.geometry = geom;
      }
    });

    const scaleFactor = 1 / 82.0;
    // Map MNI center [X, Y, Z] to Three.js space [X, Z, Y]
    const centerShift: [number, number, number] = [
      -mniCenter.x * scaleFactor,
      -mniCenter.z * scaleFactor,
      -mniCenter.y * scaleFactor
    ];

    return {
      scaleFactor,
      centerShift,
      clonedMesh: cloned,
      meshVertices: new Float32Array(coords)
    };
  }, [obj]);

  const groupRef = useRef<THREE.Group>(null);

  // Smooth, subtle automatic turntable rotation
  useFrame((_, delta) => {
    if (groupRef.current && isAutoRotate) {
      groupRef.current.rotation.y += delta * 0.18;
    }
  });

  // Apply materials for dual-layer futuristic neuro-aesthetic
  useEffect(() => {
    clonedMesh.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        let meshColor = '#3b82f6';
        if (viewMode === 'connectome') {
          meshColor = '#64748b';
        } else if (selectedLobe) {
          meshColor = LOBES_DATA[selectedLobe].color;
        }

        // Dual material styling: Translucent body with glowing additive wireframe
        mesh.material = new THREE.MeshBasicMaterial({
          color: meshColor,
          transparent: true,
          opacity: viewMode === 'connectome' ? 0.08 : 0.28,
          wireframe: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        });
      }
    });
  }, [clonedMesh, viewMode, selectedLobe]);

  return (
    <group ref={groupRef}>
      <group position={centerShift} scale={[scaleFactor, scaleFactor, scaleFactor]}>
        
        {/* Wireframe Mesh */}
        <primitive object={clonedMesh} />

        {/* Neural Synapse Particle Points */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[meshVertices, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={1.4}
            color={viewMode === 'connectome' ? '#38bdf8' : '#60a5fa'}
            transparent
            opacity={viewMode === 'connectome' ? 0.25 : 0.65}
            sizeAttenuation={true}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        {/* Anatomical Mode Elements */}
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

        {/* Connectome Mode Elements */}
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
        // Map MNI [X, Y, Z] to Three.js space [X, Z, Y]
        const mappedPosition: [number, number, number] = [
          data.nodePosition[0], 
          data.nodePosition[2], 
          data.nodePosition[1]
        ];

        // Bilateral placement for temporal lobe
        const positions = key === 'temporal' 
          ? [mappedPosition, [-mappedPosition[0], mappedPosition[1], mappedPosition[2]] as [number, number, number]] 
          : [mappedPosition];

        return positions.map((pos, idx) => (
          <group key={`${key}-${idx}`} position={pos}>
            {/* Core Node Sphere */}
            <mesh
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
              <sphereGeometry args={[isActive ? 5.8 : 4.0, 20, 20]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={isActive ? 0.95 : 0.75}
              />
            </mesh>

            {/* Glowing Halo Ring on Active State */}
            {isActive && (
              <mesh>
                <sphereGeometry args={[9.5, 16, 16]} />
                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={0.3}
                  wireframe
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            )}
          </group>
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

    // Pre-create 12 neural transmission pathways
    for (let i = 0; i < 12; i++) {
      const startKey = lobesKeys[i % lobesKeys.length];
      let endKey = lobesKeys[(i + 2) % lobesKeys.length];
      if (startKey === endKey) {
        endKey = lobesKeys[(i + 3) % lobesKeys.length];
      }

      const s = LOBES_DATA[startKey].nodePosition;
      const e = LOBES_DATA[endKey].nodePosition;
      // Map to Three.js space [X, Z, Y]
      const pStart = [s[0], s[2], s[1]];
      const pEnd = [e[0], e[2], e[1]];

      const pMid = [
        (pStart[0] + pEnd[0]) / 2 + (Math.random() - 0.5) * 20,
        (pStart[1] + pEnd[1]) / 2 + (Math.random() - 0.5) * 20,
        (pStart[2] + pEnd[2]) / 2 + (Math.random() - 0.5) * 20,
      ];

      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(...pStart),
        new THREE.Vector3(...pMid),
        new THREE.Vector3(...pEnd)
      );

      list.push({
        curve,
        speed: 0.35 + (i % 4) * 0.15,
        progress: (i * 0.08) % 1.0,
        color: LOBES_DATA[startKey].color
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
          <sphereGeometry args={[1.6, 8, 8]} />
          <meshBasicMaterial 
            color={new THREE.Color(track.color)} 
            transparent 
            opacity={0.9} 
            blending={THREE.AdditiveBlending}
          />
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
      const colorId = parseInt(parts[3]) || 1;
      const size = parseFloat(parts[4]) || 1;
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
  const { nodePositions, colors, linePositions, lineColors } = useMemo(() => {
    const nodePositions: number[] = [];
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
      colors: new Float32Array(colors),
      linePositions: new Float32Array(linePositions),
      lineColors: new Float32Array(lineColors)
    };
  }, [nodes, edgesMatrix, threshold]);

  return (
    <group>
      {/* Node Spheres */}
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

      {/* Edge Connections */}
      {linePositions.length > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
            <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            vertexColors
            transparent
            opacity={0.4}
            linewidth={1}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      )}
    </group>
  );
}

// Camera controller helper
function CameraController({ resetTrigger }: { resetTrigger: number }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (resetTrigger > 0) {
      camera.position.set(0, 0, 2.1);
      camera.lookAt(0, 0, 0);
      if (controlsRef.current) {
        controlsRef.current.reset();
      }
    }
  }, [resetTrigger, camera]);

  return (
    <OrbitControls 
      ref={controlsRef}
      enableZoom={true} 
      maxDistance={3.8} 
      minDistance={0.9}
      enablePan={false}
      enableDamping
      dampingFactor={0.05}
    />
  );
}

interface ThreeBrainProps {
  gaze: { x: number; y: number; located: boolean } | null;
  isGazeConnected: boolean;
}

export default function ThreeBrain({ gaze, isGazeConnected }: ThreeBrainProps) {
  const [viewMode, setViewMode] = useState<'anatomical' | 'connectome'>('anatomical'); 
  const [connectomePreset, setConnectomePreset] = useState<'aal90' | 'brodmann' | 'custom'>('aal90'); 
  const [edgeWeightThreshold, setEdgeWeightThreshold] = useState(0.35);
  const [parsedNodes, setParsedNodes] = useState<any[]>([]);
  const [parsedEdges, setParsedEdges] = useState<number[][]>([]);
  const [customNodeText, setCustomNodeText] = useState('');
  const [customEdgeText, setCustomEdgeText] = useState('');
  const [selectedLobe, setSelectedLobe] = useState('frontal');
  const [hoveredLobe, setHoveredLobe] = useState<string | null>(null);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [resetCameraCount, setResetCameraCount] = useState(0);

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

  // Load Preset Connectome Data safely with exact file paths
  useEffect(() => {
    if (viewMode !== 'connectome') return;
    
    const loadPresetData = async () => {
      let nodeUrl = '';
      let edgeUrl = '';

      if (connectomePreset === 'aal90') {
        nodeUrl = '/templates/Node_AAL90.node';
        edgeUrl = '/templates/Edge_AAL90_Weighted.edge';
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
        } else {
          console.warn('Failed to load connectome preset, status:', nodeRes.status, edgeRes.status);
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

  const activeEdgeCount = useMemo(() => {
    if (!parsedEdges || parsedEdges.length === 0) return 0;
    let count = 0;
    for (let i = 0; i < parsedEdges.length; i++) {
      for (let j = i + 1; j < parsedEdges[i].length; j++) {
        if (parsedEdges[i][j] >= edgeWeightThreshold) count++;
      }
    }
    return count;
  }, [parsedEdges, edgeWeightThreshold]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Upper Unified Workstation Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-blue-950">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">
              <Brain className="h-6 w-6 text-blue-950" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                3D Brain Network Explorer
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                Anatomical Lobe Coordinates, EEG Wave Topology & Structural Connectome
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar / Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-100 border border-slate-200 rounded-xl">
            <button
              onClick={() => setViewMode('anatomical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'anatomical'
                  ? 'bg-blue-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-950'
              }`}
            >
              <Brain className="h-3.5 w-3.5" />
              <span>Anatomical Lobes</span>
            </button>
            <button
              onClick={() => setViewMode('connectome')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'connectome'
                  ? 'bg-blue-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-950'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Connectome Matrix</span>
            </button>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-950 border border-blue-150">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            WebGL 3D Active
          </span>
        </div>

        {/* Camouflaged provenance */}
        <span className="text-white select-all selection:bg-blue-950 selection:text-white text-[1px] absolute top-1 right-1 pointer-events-auto">
          Copyrighted to jaanvin. Original 3D Brain Architecture & Topology Authored by Jaanvin.
        </span>
      </div>

      {/* Aligned Workstation Grid: Both Sections Perfectly Balanced with Equal Height */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ========================================================================= */}
        {/* Section 1 (Left): 3D Viewport Console (7 cols)                           */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 h-[580px] sm:h-[640px] flex flex-col rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md relative group">
          
          {/* Viewport Top Overlay Bar */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
            
            {/* View Mode Tag */}
            <div className="pointer-events-auto flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-sm flex items-center gap-2">
                <span 
                  className="h-2.5 w-2.5 rounded-full" 
                  style={{ backgroundColor: viewMode === 'anatomical' ? activeData.color : '#38bdf8' }}
                />
                {viewMode === 'anatomical' ? activeData.name : 'Structural Matrix Graph'}
              </span>

              {/* Gaze calibration status */}
              {isGazeConnected && gaze && (
                <span className="hidden sm:inline-flex text-[10px] font-bold text-emerald-400 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-emerald-900/50 items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Gaze Synced
                </span>
              )}
            </div>

            {/* Quick View Controls: Auto-Rotate & Camera Reset */}
            <div className="pointer-events-auto flex items-center gap-1.5">
              <button
                onClick={() => setIsAutoRotate(!isAutoRotate)}
                title={isAutoRotate ? 'Pause Rotation' : 'Resume Auto-Rotate'}
                className={`p-2 rounded-xl text-xs font-bold border backdrop-blur-md transition-all ${
                  isAutoRotate 
                    ? 'bg-blue-950/90 border-blue-700 text-blue-200 hover:bg-blue-900' 
                    : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {isAutoRotate ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>

              <button
                onClick={() => setResetCameraCount(c => c + 1)}
                title="Reset Camera View"
                className="p-2 rounded-xl text-xs font-bold bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 backdrop-blur-md transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* 3D Canvas Rendering Body */}
          <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
            <Suspense fallback={
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs font-semibold gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-800 border-t-blue-500" />
                <span>Loading High-Resolution 3D Coordinate Topology...</span>
              </div>
            }>
              <Canvas camera={{ position: [0, 0, 2.1], fov: 52 }}>
                <ambientLight intensity={0.9} />
                <directionalLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
                <directionalLight position={[-10, -10, -10]} intensity={0.6} color="#38bdf8" />
                <pointLight position={[0, 4, 4]} intensity={1.2} color="#60a5fa" />
                
                <BrainSceneWrapper
                  viewMode={viewMode}
                  edgeWeightThreshold={edgeWeightThreshold}
                  parsedNodes={parsedNodes}
                  parsedEdges={parsedEdges}
                  hoveredLobe={hoveredLobe}
                  selectedLobe={selectedLobe}
                  setHoveredLobe={setHoveredLobe}
                  setSelectedLobe={setSelectedLobe}
                  isAutoRotate={isAutoRotate}
                />

                <CameraController resetTrigger={resetCameraCount} />
              </Canvas>
            </Suspense>
          </div>

          {/* Viewport Bottom Overlay Bar */}
          <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none text-[10px] font-semibold text-slate-400">
            <span className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800/80 pointer-events-auto">
              MNI Coordinate: [{activeData.nodePosition[0]}, {activeData.nodePosition[1]}, {activeData.nodePosition[2]}]
            </span>

            <span className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800/80 hidden sm:inline-block pointer-events-auto">
              🖱️ Left-drag to rotate · Scroll to zoom
            </span>
          </div>

          {/* Hidden Steganographic Copyright (Black on Black in Dark Viewport) */}
          <div className="absolute bottom-1 right-2 z-10 text-[9px] text-slate-950 selection:bg-blue-600 selection:text-white select-all pointer-events-auto">
            Copyrighted to jaanvin. 3D Brain Engine & Coordinate System Authored by Jaanvin.
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Section 2 (Right): Diagnostics & Intelligence Console (5 cols)           */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 h-[580px] sm:h-[640px] flex flex-col rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xs">
          
          {viewMode === 'anatomical' ? (
            /* ================= ANATOMICAL LOBE DETAILS ================= */
            <div className="flex flex-col h-full">
              
              {/* Lobe Selection Bar Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                  Select Anatomical Region
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {Object.keys(LOBES_DATA).map((key) => {
                    const lobe = LOBES_DATA[key];
                    const isSelected = selectedLobe === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedLobe(key)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-blue-950 text-white border-blue-950 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span 
                          className="h-2 w-2 rounded-full shrink-0" 
                          style={{ backgroundColor: lobe.color }}
                        />
                        <span className="truncate">{lobe.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Scrollable Lobe Content */}
              <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5">
                
                {/* Lobe Title Banner */}
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {activeData.name}
                    </h3>
                    <span 
                      className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full text-white shadow-3xs"
                      style={{ backgroundColor: activeData.color }}
                    >
                      {activeData.dominantWave.split(' ')[0]} Band
                    </span>
                  </div>
                  <p className="text-xs font-bold text-blue-950 mt-1">
                    {activeData.subtitle}
                  </p>
                </div>

                {/* Quantitative Metric Badges */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">Cortical Mass</span>
                    <span className="text-xs font-black text-slate-800">{activeData.volumePct}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">Primary Rhythm</span>
                    <span className="text-xs font-black text-slate-800 truncate block">{activeData.dominantWave}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">EEG Sites</span>
                    <span className="text-xs font-black text-slate-800 truncate block">{activeData.channels.split(',')[0]}</span>
                  </div>
                </div>

                {/* Functional Description */}
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-blue-950" /> Functional Neurobiology
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                    {activeData.function}
                  </p>
                </div>

                {/* Electrophysiological Footprint */}
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-blue-950" /> Electrophysiological Footprint
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                    {activeData.signals}
                  </p>
                </div>

              </div>

              {/* Anchored Footer: Biosignal Modality Link */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-950 shrink-0">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">
                      Biofeedback Sensor Modality
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {activeData.biosignalLink}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* ================= CONNECTOME MATRIX CONTROLS ================= */
            <div className="flex flex-col h-full justify-between">
              
              {/* Preset Selector Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                  Connectome Atlas Preset
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setConnectomePreset('aal90')}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                      connectomePreset === 'aal90'
                        ? 'bg-blue-950 border-blue-950 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    AAL-90 MNI Nodes
                  </button>
                  <button
                    onClick={() => setConnectomePreset('brodmann')}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                      connectomePreset === 'brodmann'
                        ? 'bg-blue-950 border-blue-950 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Brodmann 82 Areas
                  </button>
                </div>
              </div>

              {/* Main Connectome Controls */}
              <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
                
                {/* Metric Summary Badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">Atlas Nodes</span>
                    <span className="text-sm font-black text-slate-900">{parsedNodes.length || 90} Regions</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">Active Edges</span>
                    <span className="text-sm font-black text-blue-950">{activeEdgeCount} Connections</span>
                  </div>
                </div>

                {/* Edge Weight Threshold Controller */}
                <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-blue-950" />
                      Connectivity Weight Threshold
                    </span>
                    <span className="font-mono font-black text-blue-950 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {edgeWeightThreshold.toFixed(2)}
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    min="0.10"
                    max="0.85"
                    step="0.05"
                    value={edgeWeightThreshold}
                    onChange={(e) => setEdgeWeightThreshold(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-950"
                  />
                  
                  <span className="text-[10px] text-slate-500 block leading-tight font-medium">
                    Hides structural white-matter tracts with probabilistic weight below {edgeWeightThreshold.toFixed(2)}.
                  </span>
                </div>

                {/* Custom File Upload Drawer */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5 text-blue-950" /> Custom Coordinates (.node & .edge)
                  </h4>
                  
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      value={customNodeText}
                      onChange={(e) => setCustomNodeText(e.target.value)}
                      placeholder="-45.2 -67.1 12.3 2 4.5 Prefrontal_L_Fp1&#10;45.1 -67.3 12.4 2 4.5 Prefrontal_R_Fp2"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 text-slate-900 placeholder:text-slate-400 font-mono"
                    />
                    <textarea
                      rows={2}
                      value={customEdgeText}
                      onChange={(e) => setCustomEdgeText(e.target.value)}
                      placeholder="0.00 0.85 0.12&#10;0.85 0.00 0.45"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-950 text-slate-900 placeholder:text-slate-400 font-mono"
                    />
                  </div>
                </div>

              </div>

              {/* Anchored Footer: Apply Custom Coordinates */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
                <button
                  onClick={handleCustomUpload}
                  disabled={!customNodeText && !customEdgeText}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider py-3 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Apply Custom Matrix</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
