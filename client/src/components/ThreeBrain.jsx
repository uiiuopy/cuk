import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { Brain, Activity, Info, Zap, Upload, FileText, Sliders, Check } from 'lucide-react';

// Brain lobes details database (MNI Coordinates)
const LOBES_DATA = {
  frontal: {
    name: 'Frontal Lobe',
    subtitle: 'Executive Center & Motor Control',
    function: 'Responsible for higher-level cognitive processes, including planning, decision making, social behavior, focus, and voluntary muscle movements.',
    signals: 'Primary source of high-frequency EEG Beta waves (13-30 Hz) during active thinking, and slow Theta waves during cognitive fatigue. Electrodes: Fp1, Fp2, F3, F4.',
    biosignalLink: 'EEG Beta & Theta waves (Cognitive Load)',
    color: '#00f0ff',
    nodePosition: [0, 35, 30]
  },
  parietal: {
    name: 'Parietal Lobe',
    subtitle: 'Sensory Integration & Spatial Awareness',
    function: 'Integrates sensory information from various parts of the body (somatosensory cortex), processes spatial relationships, navigation, and numbers.',
    signals: 'Involved in sensorimotor rhythms (SMR) and alpha band attenuation during tactile attention. Electrodes: P3, P4, Pz.',
    biosignalLink: 'EEG Mu Rhythm (Sensory Processing)',
    color: '#bd00ff',
    nodePosition: [0, -45, 50]
  },
  occipital: {
    name: 'Occipital Lobe',
    subtitle: 'Visual Processing Core',
    function: 'The visual processing center of the mammalian brain, containing most of the anatomical region of the visual cortex.',
    signals: 'Strong generator of EEG Alpha waves (8-12 Hz) when eyes are closed or in resting states. Occipital alpha drops instantly upon visual attention. Electrodes: O1, O2, Oz.',
    biosignalLink: 'EEG Alpha Coherence (Visual Processing)',
    color: '#39ff14',
    nodePosition: [0, -80, 10]
  },
  temporal: {
    name: 'Temporal Lobe',
    subtitle: 'Auditory & Memory Center',
    function: 'Processes auditory stimuli, language comprehension, memory acquisition (via hippocampus), and emotional processing (via amygdala).',
    signals: 'Generates localized Theta (4-7 Hz) waves and plays a key role in emotional reactivity indexing when combined with GSR. Electrodes: T3, T4, T5, T6.',
    biosignalLink: 'EEG Theta waves (Memory & Auditory)',
    color: '#ff007f',
    nodePosition: [48, -15, -15]
  },
  cerebellum: {
    name: 'Cerebellum',
    subtitle: 'Motor Coordination & Timing',
    function: 'Coordinates voluntary movements such as posture, balance, coordination, and speech, resulting in smooth and balanced muscular activity.',
    signals: 'Mainly high-frequency sub-cortical signals. Crucial for motor learning and micro-timing paradigms.',
    biosignalLink: 'Saccadic Eye Movement Integration',
    color: '#ffd700',
    nodePosition: [0, -55, -30]
  },
  stem: {
    name: 'Brain Stem',
    subtitle: 'Autonomic Control Center',
    function: 'Controls flow of messages between the brain and the rest of the body. Governs essential survival functions like respiration, heartbeat, blood pressure, and sweating.',
    signals: 'Primary driver of autonomic biosignals, including electrodermal activity (GSR/EDA) via the sympathetic pathway, and ECG heart rate variability via the vagus nerve.',
    biosignalLink: 'GSR / EDA & Heart Rate (ECG)',
    color: '#ff4500',
    nodePosition: [0, -15, -50]
  }
};

// 3D Brain Scene Wrapper loading the OBJ model from victors1681/3dbrain
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
}) {
  // Load 3D model
  const obj = useLoader(OBJLoader, '/models/brain_vertex_low.obj');

  // Compute MNI scaling and centering parameters
  const { scaleFactor, centerShift, meshVertices, clonedObj } = useMemo(() => {
    // Clone obj to avoid mutating the cached loader asset across renders
    const cloned = obj.clone();

    // Swap Y and Z coordinates of the OBJ geometries to match standard Three.js axes mapping
    cloned.traverse((child) => {
      if (child.isMesh) {
        const posAttr = child.geometry.attributes.position;
        if (posAttr) {
          for (let i = 0; i < posAttr.count; i++) {
            const yVal = posAttr.getY(i);
            const zVal = posAttr.getZ(i);
            // Swap Y and Z
            posAttr.setY(i, zVal);
            posAttr.setZ(i, yVal);
          }
          posAttr.needsUpdate = true;
          child.geometry.computeVertexNormals();
        }
      }
    });

    // AAL90 and Brodmann82 coordinates sit in standard MNI space.
    // MNI coordinate ranges are: X [-70, 70], Y [-100, 70], Z [-50, 80].
    // Center is approximately [2.5, -14.0, 17.5].
    const scaleFactor = 1 / 85.0; // scale down MNI to fit canvas +/-0.8
    const mniCenter = [2.5, -14.0, 17.5]; // [X, Y, Z]
    
    // Map MNI [X, Y, Z] to Three.js [X, Z, Y]
    const centerShift = [
      -mniCenter[0] * scaleFactor,
      -mniCenter[2] * scaleFactor,
      -mniCenter[1] * scaleFactor
    ];

    const coords = [];
    cloned.traverse((child) => {
      if (child.isMesh) {
        const posAttr = child.geometry.attributes.position;
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

  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
    }
  });

  // Assign dynamic colors to the wireframe mesh based on the selected lobe
  useEffect(() => {
    clonedObj.traverse((child) => {
      if (child.isMesh) {
        let meshColor = '#00a0ff';
        if (viewMode === 'connectome') {
          meshColor = '#334155';
        } else if (selectedLobe) {
          meshColor = LOBES_DATA[selectedLobe].color;
        }

        child.material = new THREE.MeshBasicMaterial({
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
      {/* Shift sub-group so that rotation center is aligned with the anatomical center */}
      <group position={centerShift} scale={[scaleFactor, scaleFactor, scaleFactor]}>
        {/* 1. Real 3D Anatomical Wireframe Mesh */}
        <primitive object={clonedObj} />

        {/* 2. Anatomical Point Cloud aligned to the mesh */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[meshVertices, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={1.0}
            color={viewMode === 'connectome' ? '#38bdf8' : '#00f0ff'}
            transparent
            opacity={viewMode === 'connectome' ? 0.1 : 0.45}
            sizeAttenuation={true}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        {/* 3. Lobe Interactive Nodes (only in anatomical mode) */}
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

        {/* 4. Connectome Visualizer (only in connectome mode) */}
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

// Glowing Interactive Node Indicators
function InteractiveNodes({ hoveredLobe, selectedLobe, onHoverLobe, onClickLobe }) {
  return (
    <group>
      {Object.entries(LOBES_DATA).map(([key, data]) => {
        const isActive = selectedLobe === key || hoveredLobe === key;
        const color = new THREE.Color(data.color);

        // Map MNI coordinate [X, Y, Z] to Three.js space [X, Z, Y]
        const mappedPosition = [data.nodePosition[0], data.nodePosition[2], data.nodePosition[1]];

        // Adjust position for temporal lobes (bilateral)
        const positions = key === 'temporal' 
          ? [mappedPosition, [-mappedPosition[0], mappedPosition[1], mappedPosition[2]]] 
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
              wireframe={false}
            />
            {/* Tiny HTML tag on hover */}
            {isActive && (
              <Html distanceFactor={0.03} position={[0, 8, 0]} center>
                <div className="node-tooltip">
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

// Neural Impulses traveling through the network
function NeuralImpulses() {
  const groupRef = useRef();
  
  // Create randomized neural impulse tracks
  const tracks = useMemo(() => {
    const list = [];
    const lobesKeys = Object.keys(LOBES_DATA);

    for (let i = 0; i < 8; i++) {
      const startLobe = lobesKeys[Math.floor(Math.random() * lobesKeys.length)];
      let endLobe = lobesKeys[Math.floor(Math.random() * lobesKeys.length)];
      while (startLobe === endLobe) {
        endLobe = lobesKeys[Math.floor(Math.random() * lobesKeys.length)];
      }

      // Convert MNI [X, Y, Z] to three.js [X, Z, Y]
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

  useFrame((state, delta) => {
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

// File Parser helpers
function parseNodeFile(text) {
  const lines = text.trim().split('\n');
  const nodes = [];
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') || trimmed === '') return;
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 6) {
      nodes.push({
        x: parseFloat(parts[0]),
        y: parseFloat(parts[1]),
        z: parseFloat(parts[2]),
        colorVal: parseFloat(parts[3]),
        sizeVal: parseFloat(parts[4]),
        label: parts.slice(5).join(' ')
      });
    }
  });
  return nodes;
}

function parseEdgeFile(text) {
  const lines = text.trim().split('\n');
  const matrix = [];
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') || trimmed === '') return;
    const parts = trimmed.split(/\s+/).map(Number);
    if (parts.length > 0) {
      matrix.push(parts);
    }
  });
  return matrix;
}

// Glowing Interactive Connectome Renderer
function ConnectomeRenderer({ nodes, edgesMatrix, threshold }) {
  // Prepare spheres (nodes)
  const nodeSpheres = useMemo(() => {
    return nodes.map((node, index) => {
      // Map MNI space [X, Y, Z] to Three.js space [X, Z, Y]
      const x = node.x;
      const y = node.z;
      const z = node.y;

      const colors = ['#00f0ff', '#ff007f', '#39ff14', '#ffd700', '#ff4500', '#bd00ff', '#00e5ff'];
      const nodeColor = colors[Math.floor(node.colorVal) % colors.length] || '#00f0ff';
      const nodeSize = Math.max(1.36, Math.min(3.8, node.sizeVal * 0.68));

      return {
        id: index,
        position: [x, y, z],
        color: nodeColor,
        size: nodeSize,
        label: node.label
      };
    });
  }, [nodes]);

  // Prepare line segments (edges)
  const edgeLineSegments = useMemo(() => {
    const points = [];
    const colors = [];

    for (let i = 0; i < nodeSpheres.length; i++) {
      for (let j = i + 1; j < nodeSpheres.length; j++) {
        const weight = edgesMatrix[i]?.[j] ?? 0;
        if (weight > threshold) {
          const p1 = nodeSpheres[i].position;
          const p2 = nodeSpheres[j].position;

          points.push(new THREE.Vector3(...p1));
          points.push(new THREE.Vector3(...p2));

          const c1 = new THREE.Color(nodeSpheres[i].color);
          const c2 = new THREE.Color(nodeSpheres[j].color);
          colors.push(c1.r, c1.g, c1.b);
          colors.push(c2.r, c2.g, c2.b);
        }
      }
    }

    return {
      points,
      colors: new Float32Array(colors)
    };
  }, [nodeSpheres, edgesMatrix, threshold]);

  return (
    <group>
      {/* Node Spheres */}
      {nodeSpheres.map((node) => (
        <mesh key={node.id} position={node.position}>
          <sphereGeometry args={[node.size, 16, 16]} />
          <meshBasicMaterial color={node.color} />
          <Html distanceFactor={0.03} position={[0, node.size * 1.5, 0]} center>
            <div className="node-tooltip">
              {node.label}
            </div>
          </Html>
        </mesh>
      ))}

      {/* Edge Lines Segments */}
      {edgeLineSegments.points.length > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(edgeLineSegments.points.flatMap(p => [p.x, p.y, p.z])), 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[edgeLineSegments.colors, 3]}
            />
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

export default function ThreeBrain({ gaze, isGazeConnected }) {
  const [viewMode, setViewMode] = useState('anatomical'); // 'anatomical' | 'connectome'
  const [connectomePreset, setConnectomePreset] = useState('aal90'); // 'aal90' | 'brodmann' | 'custom'
  const [edgeWeightThreshold, setEdgeWeightThreshold] = useState(0.3);
  const [parsedNodes, setParsedNodes] = useState([]);
  const [parsedEdges, setParsedEdges] = useState([]);
  const [customNodeText, setCustomNodeText] = useState('');
  const [customEdgeText, setCustomEdgeText] = useState('');

  const [selectedLobe, setSelectedLobe] = useState('frontal');
  const [hoveredLobe, setHoveredLobe] = useState(null);

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
        edgeUrl = '/templates/Edge_AAL90_Binary.edge';
      } else if (connectomePreset === 'brodmann') {
        nodeUrl = '/templates/Node_Brodmann82.node';
        edgeUrl = '/templates/Edge_Brodmann82.edge';
      } else {
        // Custom uploader handles this
        return;
      }

      try {
        const [nodeRes, edgeRes] = await Promise.all([
          fetch(nodeUrl),
          fetch(edgeUrl)
        ]);

        if (nodeRes.ok && edgeRes.ok) {
          const nodeText = await nodeRes.text();
          const edgeText = await edgeRes.text();
          setParsedNodes(parseNodeFile(nodeText));
          setParsedEdges(parseEdgeFile(edgeText));
        } else {
          console.error("Failed to load template preset files");
        }
      } catch (err) {
        console.error("Error fetching connectome preset files:", err);
      }
    };

    loadPresetData();
  }, [viewMode, connectomePreset]);

  // Calculate active connections
  const activeConnectionsCount = useMemo(() => {
    if (!parsedEdges.length) return 0;
    let count = 0;
    for (let i = 0; i < parsedNodes.length; i++) {
      for (let j = i + 1; j < parsedNodes.length; j++) {
        const w = parsedEdges[i]?.[j] ?? 0;
        if (w > edgeWeightThreshold) {
          count++;
        }
      }
    }
    return count;
  }, [parsedNodes, parsedEdges, edgeWeightThreshold]);

  const handleCustomFileUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text !== 'string') return;

      if (type === 'node') {
        setCustomNodeText(text);
        setParsedNodes(parseNodeFile(text));
      } else if (type === 'edge') {
        setCustomEdgeText(text);
        setParsedEdges(parseEdgeFile(text));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="brain-view-container">
      {/* 3D Canvas Panel */}
      <div className="canvas-wrapper glass-panel">
        <div className="canvas-header">
          <div className="view-mode-tabs">
            <button 
              className={`view-mode-tab-btn ${viewMode === 'anatomical' ? 'active' : ''}`}
              onClick={() => setViewMode('anatomical')}
            >
              <Brain size={14} /> Anatomical Lobes
            </button>
            <button 
              className={`view-mode-tab-btn ${viewMode === 'connectome' ? 'active' : ''}`}
              onClick={() => setViewMode('connectome')}
            >
              <Activity size={14} /> Connectome Viewer (BrainNet)
            </button>
          </div>
          {isGazeConnected ? (
            <span className="helper-tag animate-pulse-pink" style={{ color: 'var(--accent-pink)' }}>
              EYE TRACKING MODE ACTIVE • LOOK AROUND TO CHOOSE LOBES
            </span>
          ) : (
            <span className="helper-tag">DRAG TO ROTATE • SCROLL TO ZOOM</span>
          )}
        </div>

        <div className="r3f-canvas-container">
          <Canvas camera={{ position: [0, 0, 1.8], fov: 60 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={1.2} />
            
            <Suspense fallback={null}>
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
            </Suspense>

            <OrbitControls 
              enableZoom={true} 
              maxDistance={3.5} 
              minDistance={1.0}
              enablePan={false}
            />
          </Canvas>
        </div>

        {/* Lobe Selection Quick-Tray */}
        {viewMode === 'anatomical' && (
          <div className="quick-tray">
            {Object.keys(LOBES_DATA).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedLobe(key)}
                className={`tray-btn ${selectedLobe === key ? 'active' : ''}`}
                style={{
                  '--lobe-color': LOBES_DATA[key].color,
                  borderColor: selectedLobe === key ? LOBES_DATA[key].color : 'transparent'
                }}
              >
                {LOBES_DATA[key].name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Anatomical Side Info Panel or Connectome Controls */}
      <div className="info-wrapper glass-panel">
        {viewMode === 'connectome' ? (
          <div className="anatomy-details-card connectome-card">
            <div className="card-top-header" style={{ borderLeft: '4px solid var(--accent-pink)' }}>
              <h2 className="anatomy-title text-glow-pink">
                Connectome
              </h2>
              <span className="anatomy-subtitle">BrainNet connectivity</span>
            </div>

            {/* Template Presets Picker */}
            <div className="anatomy-section">
              <div className="section-subtitle-row">
                <FileText size={14} className="info-icon" />
                <h4>Select Template</h4>
              </div>
              <div className="preset-selector-row">
                <button 
                  className={`preset-select-btn ${connectomePreset === 'aal90' ? 'active' : ''}`}
                  onClick={() => setConnectomePreset('aal90')}
                >
                  AAL 90
                </button>
                <button 
                  className={`preset-select-btn ${connectomePreset === 'brodmann' ? 'active' : ''}`}
                  onClick={() => setConnectomePreset('brodmann')}
                >
                  Brodmann 82
                </button>
                <button 
                  className={`preset-select-btn ${connectomePreset === 'custom' ? 'active' : ''}`}
                  onClick={() => setConnectomePreset('custom')}
                >
                  Custom Upload
                </button>
              </div>
            </div>

            {/* Edge Threshold Slider */}
            <div className="anatomy-section">
              <div className="section-subtitle-row">
                <Sliders size={14} className="info-icon" />
                <h4>Density Threshold ({edgeWeightThreshold.toFixed(2)})</h4>
              </div>
              <div className="slider-wrapper">
                <input 
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={edgeWeightThreshold}
                  onChange={(e) => setEdgeWeightThreshold(parseFloat(e.target.value))}
                  className="edge-slider"
                />
                <div className="slider-labels">
                  <span>0.0 (High Density)</span>
                  <span>1.0 (Low Density)</span>
                </div>
              </div>
            </div>

            {/* Node Stats details */}
            <div className="connectome-stats-panel glass-panel">
              <div className="stats-header">Network Status</div>
              <div className="stats-row">
                <span>Active Nodes:</span>
                <span className="stats-val">{parsedNodes.length}</span>
              </div>
              <div className="stats-row">
                <span>Active Connections:</span>
                <span className="stats-val">{activeConnectionsCount}</span>
              </div>
            </div>

            {/* Drag & Drop Custom Uploader */}
            {connectomePreset === 'custom' && (
              <div className="custom-upload-section">
                <div className="file-uploader-dropzone">
                  <Upload size={24} className="upload-icon" />
                  <p className="upload-main-text">Upload Custom Files</p>
                  <p className="upload-sub-text">BrainNet ASCII format (.node / .edge)</p>
                  
                  <div className="upload-btn-group">
                    <label className="upload-file-label">
                      Choose .node file
                      <input 
                        type="file" 
                        accept=".node,.txt" 
                        onChange={(e) => handleCustomFileUpload(e, 'node')} 
                        style={{ display: 'none' }}
                      />
                    </label>
                    <label className="upload-file-label">
                      Choose .edge file
                      <input 
                        type="file" 
                        accept=".edge,.txt" 
                        onChange={(e) => handleCustomFileUpload(e, 'edge')} 
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>
                
                <div className="upload-status-row">
                  <div className={`status-item ${customNodeText ? 'loaded' : 'missing'}`}>
                    <Check size={12} /> {customNodeText ? 'Node Loaded' : 'No Node File'}
                  </div>
                  <div className={`status-item ${customEdgeText ? 'loaded' : 'missing'}`}>
                    <Check size={12} /> {customEdgeText ? 'Edge Loaded' : 'No Edge File'}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : activeData ? (
          <div className="anatomy-details-card">
            <div className="card-top-header" style={{ borderLeft: `4px solid ${activeData.color}` }}>
              <h2 className="anatomy-title" style={{ color: activeData.color }}>
                {activeData.name}
              </h2>
              <span className="anatomy-subtitle">{activeData.subtitle}</span>
            </div>

            <div className="anatomy-section">
              <div className="section-subtitle-row">
                <Info size={14} className="info-icon" />
                <h4>Functional Utility</h4>
              </div>
              <p className="anatomy-text">{activeData.function}</p>
            </div>

            <div className="anatomy-section">
              <div className="section-subtitle-row">
                <Activity size={14} className="info-icon" />
                <h4>EEG Signal Mapping</h4>
              </div>
              <p className="anatomy-text">{activeData.signals}</p>
            </div>

            <div className="linked-indicator glass-panel" style={{ border: `1px solid ${activeData.color}33` }}>
              <div className="indicator-row">
                <Zap size={16} style={{ color: activeData.color }} />
                <div>
                  <span className="indicator-label">Telemetry Output Link</span>
                  <span className="indicator-val" style={{ color: activeData.color }}>{activeData.biosignalLink}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="anatomy-placeholder">
            <Brain size={48} className="placeholder-icon" />
            <p>Hover or click a brain node to load anatomical mappings.</p>
          </div>
        )}
      </div>

      <style>{`
        .brain-view-container {
          display: grid;
          grid-template-columns: 5fr 3fr;
          gap: 24px;
          height: calc(100vh - 130px);
          min-height: 550px;
        }

        .canvas-wrapper {
          display: flex;
          flex-direction: column;
          position: relative;
          padding: 0;
          overflow: hidden;
        }

        .canvas-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          background: #ffffff;
          z-index: 10;
        }

        .panel-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .panel-title-row h3 {
          font-size: 0.95rem;
          font-weight: 700;
        }

        .helper-tag {
          font-family: var(--font-body);
          font-size: 0.65rem;
          color: var(--text-muted);
          letter-spacing: 0.5px;
        }

        .r3f-canvas-container {
          flex: 1;
          background: #05101f;
          position: relative;
          cursor: grab;
        }

        .r3f-canvas-container:active {
          cursor: grabbing;
        }

        .node-tooltip {
          font-family: var(--font-body);
          font-size: 0.68rem;
          font-weight: 600;
          color: #ffffff;
          background: var(--accent-cyan);
          padding: 4px 8px;
          border-radius: 4px;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          pointer-events: none;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .quick-tray {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 12px;
          justify-content: center;
          background: var(--bg-dark);
          border-top: 1px solid var(--border-color);
          z-index: 10;
        }

        .tray-btn {
          font-family: var(--font-body);
          font-size: 0.72rem;
          background: var(--bg-darker);
          color: var(--text-muted);
          border: 1px solid var(--border-color);
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tray-btn:hover {
          color: var(--accent-cyan);
          background: rgba(182, 146, 96, 0.08);
          border-color: var(--accent-cyan);
        }

        .tray-btn.active {
          color: #ffffff;
          background: var(--accent-cyan);
          border-color: var(--accent-cyan);
          font-weight: 600;
        }

        .info-wrapper {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          overflow-y: auto;
        }

        .anatomy-details-card {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .card-top-header {
          padding-left: 14px;
        }

        .anatomy-title {
          font-size: 1.4rem;
          font-weight: 800;
        }

        .anatomy-subtitle {
          font-family: var(--font-tech);
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .anatomy-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .section-subtitle-row {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-main);
        }

        .section-subtitle-row h4 {
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-icon {
          color: var(--accent-cyan);
        }

        .anatomy-text {
          font-size: 0.88rem;
          line-height: 1.6;
        }

        .linked-indicator {
          padding: 12px;
          border-radius: 8px;
          background: rgba(7, 7, 20, 0.3);
        }

        .indicator-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .indicator-row div {
          display: flex;
          flex-direction: column;
        }

        .indicator-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .indicator-val {
          font-family: var(--font-tech);
          font-size: 0.8rem;
          font-weight: 700;
        }

        .anatomy-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: var(--text-muted);
          gap: 16px;
        }

        .placeholder-icon {
          color: rgba(255, 255, 255, 0.05);
        }

        @media (max-width: 900px) {
          .brain-view-container {
            grid-template-columns: 1fr;
            height: auto;
          }
          .r3f-canvas-container {
            height: 400px;
          }
        }

        /* Connectome Explorer styles */
        .view-mode-tabs {
          display: flex;
          background: var(--bg-darker);
          border: 1px solid var(--border-color);
          padding: 3px;
          border-radius: 6px;
        }

        .view-mode-tab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          background: transparent;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-mode-tab-btn:hover {
          color: var(--text-main);
        }

        .view-mode-tab-btn.active {
          color: #ffffff;
          background: var(--accent-cyan);
        }

        .preset-selector-row {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }

        .preset-select-btn {
          flex: 1;
          font-family: var(--font-body);
          font-size: 0.72rem;
          font-weight: 500;
          background: var(--bg-darker);
          color: var(--text-muted);
          border: 1px solid var(--border-color);
          padding: 6px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .preset-select-btn:hover {
          border-color: var(--accent-pink);
          color: var(--text-main);
        }

        .preset-select-btn.active {
          background: rgba(182, 146, 96, 0.08);
          border-color: var(--accent-pink);
          color: var(--accent-pink);
          font-weight: 600;
        }

        .slider-wrapper {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 4px;
        }

        .edge-slider {
          width: 100%;
          accent-color: var(--accent-pink);
          cursor: pointer;
        }

        .slider-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .connectome-stats-panel {
          padding: 12px;
          border-radius: 6px;
          background: var(--bg-darker);
          border: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 10px;
        }

        .stats-header {
          font-family: var(--font-tech);
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--accent-pink);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 4px;
          font-weight: 700;
        }

        .stats-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
        }

        .stats-row span:first-child {
          color: var(--text-muted);
        }

        .stats-val {
          font-family: monospace;
          font-weight: 700;
          color: var(--text-main);
        }

        .custom-upload-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 14px;
        }

        .file-uploader-dropzone {
          border: 2px dashed var(--border-color);
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 6px;
          background: var(--bg-darker);
          transition: border-color 0.2s ease;
        }

        .file-uploader-dropzone:hover {
          border-color: var(--accent-pink);
        }

        .upload-icon {
          color: var(--text-muted);
        }

        .upload-main-text {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-main);
          margin: 0;
        }

        .upload-sub-text {
          font-size: 0.65rem;
          color: var(--text-muted);
          margin-bottom: 8px;
          margin-top: 0;
        }

        .upload-btn-group {
          display: flex;
          gap: 8px;
        }

        .upload-file-label {
          font-size: 0.7rem;
          background: var(--bg-dark);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .upload-file-label:hover {
          border-color: var(--accent-pink);
          color: var(--accent-pink);
        }

        .upload-status-row {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.68rem;
        }

        .status-item.loaded {
          color: var(--accent-green);
        }

        .status-item.missing {
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
