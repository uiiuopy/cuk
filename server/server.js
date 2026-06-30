const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Load static JSON databases
const loadJSONFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
};

const equipmentPath = path.join(__dirname, 'data', 'equipment.json');
const publicationsPath = path.join(__dirname, 'data', 'publications.json');
const sessionsFilePath = path.join(__dirname, 'data', 'sessions.json');

// Ensure sessions file exists
if (!fs.existsSync(sessionsFilePath)) {
  fs.mkdirSync(path.dirname(sessionsFilePath), { recursive: true });
  fs.writeFileSync(sessionsFilePath, JSON.stringify([], null, 2), 'utf8');
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Psychophysiology Lab API is running', timestamp: new Date() });
});

app.get('/api/equipment', (req, res) => {
  const equipment = loadJSONFile(equipmentPath);
  res.json(equipment);
});

app.get('/api/publications', (req, res) => {
  const publications = loadJSONFile(publicationsPath);
  res.json(publications);
});

// ---------------------------------------------------------------------------
// Gaze Tracking: Singleton Python process manager
// ---------------------------------------------------------------------------
let gazeProcess = null;
let gazeClients = new Set();
let gazeProcessReady = false;
let gazeKilledIntentionally = false;

function spawnGazeProcess() {
  if (gazeProcess) return;
  gazeProcessReady = false;
  gazeKilledIntentionally = false;

  const bridgePath = path.join(__dirname, 'gaze_bridge.py');
  console.log('[Gaze Manager] Spawning Python gaze_bridge.py...');

  try {
    gazeProcess = spawn('python', [bridgePath]);
  } catch (err) {
    console.error('[Gaze Manager] Failed to spawn:', err.message);
    broadcastToGazeClients({ type: 'status', status: 'fallback', reason: 'Python failed to spawn.' });
    return;
  }

  gazeProcess.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line);
        if (parsed.type === 'error') {
          console.warn('[Gaze Bridge Error] ' + parsed.message);
          broadcastToGazeClients({ type: 'status', status: 'fallback', reason: parsed.message });
          killGazeProcess(true);
          break;
        } else {
          if (parsed.type === 'status' && parsed.status === 'ready') {
            gazeProcessReady = true;
            console.log('[Gaze Manager] Python bridge is ready.');
          }
          broadcastRaw(line.trim());
        }
      } catch (e) {}
    }
  });

  gazeProcess.stderr.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg) console.log('[Gaze stderr] ' + msg);
  });

  gazeProcess.on('error', (err) => {
    console.warn('[Gaze Process Error] ' + err.message);
    broadcastToGazeClients({ type: 'status', status: 'fallback', reason: err.message });
    gazeProcess = null;
  });

  gazeProcess.on('close', (code) => {
    console.log('[Gaze Manager] Process exited with code ' + code);
    gazeProcess = null;
    gazeProcessReady = false;
    if (!gazeKilledIntentionally && code !== 0) {
      broadcastToGazeClients({ type: 'status', status: 'fallback', reason: 'Python exited (code ' + code + ').' });
    }
  });
}

function killGazeProcess(intentional) {
  if (!gazeProcess) return;
  gazeKilledIntentionally = intentional;
  console.log('[Gaze Manager] Killing Python process...');
  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', gazeProcess.pid.toString(), '/f', '/t'], { stdio: 'ignore' });
    } else {
      gazeProcess.kill('SIGTERM');
    }
  } catch (e) {}
  gazeProcess = null;
  gazeProcessReady = false;
}

function broadcastRaw(line) {
  for (const client of gazeClients) {
    try { client.write('data: ' + line + '\n\n'); }
    catch (e) { gazeClients.delete(client); }
  }
}

function broadcastToGazeClients(obj) {
  broadcastRaw(JSON.stringify(obj));
}

app.post('/api/gaze/start', (req, res) => {
  if (gazeProcess) {
    killGazeProcess(true);
    setTimeout(() => { spawnGazeProcess(); res.json({ status: 'restarted' }); }, 1500);
  } else {
    spawnGazeProcess();
    res.json({ status: 'started' });
  }
});

app.post('/api/gaze/stop', (req, res) => {
  killGazeProcess(true);
  res.json({ status: 'stopped' });
});

app.get('/api/gaze/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  gazeClients.add(res);
  if (gazeProcessReady) {
    res.write('data: ' + JSON.stringify({ type: 'status', status: 'ready', message: 'Already running.' }) + '\n\n');
  }
  req.on('close', () => {
    gazeClients.delete(res);
    console.log('[Gaze Stream] Client disconnected. ' + gazeClients.size + ' remaining.');
  });
});

// GET /api/signals/config?stimulus=...
// Returns target physiological parameters for client-side generation
app.get('/api/signals/config', (req, res) => {
  const stimulus = req.query.stimulus || 'baseline';
  let config = {};

  switch (stimulus.toLowerCase()) {
    case 'relaxation':
      config = {
        stimulusName: 'Deep Breathing & Mindfulness',
        heartRate: 58,           // Beats per minute
        hrv: 0.15,               // Heart rate variability index (RMSSD scale representation)
        gsr: 1.5,                // Skin conductance level (microSiemens)
        respRate: 8,             // Breaths per minute
        eegAlpha: 2.5,           // Alpha wave amplitude multiplier (relaxed)
        eegBeta: 0.2,            // Beta wave amplitude multiplier (low cognitive load)
        eegTheta: 1.0,           // Theta wave amplitude multiplier
        pupilSize: 3.1           // Pupil diameter (mm)
      };
      break;
    case 'stress':
      config = {
        stimulusName: 'Stroop Color Word Stressor',
        heartRate: 104,
        hrv: 0.02,
        gsr: 8.5,
        respRate: 25,
        eegAlpha: 0.3,           // Alpha suppression under cognitive load
        eegBeta: 2.3,            // Beta spike under stress/cognitive processing
        eegTheta: 0.5,
        pupilSize: 4.8           // Dilation due to autonomic arousal
      };
      break;
    case 'startle':
      config = {
        stimulusName: 'Acoustic White Noise Startle',
        heartRate: 92,
        hrv: 0.05,
        gsr: 11.2,               // Severe GSR spike
        respRate: 18,
        eegAlpha: 0.6,
        eegBeta: 1.5,
        eegTheta: 1.8,           // Sudden response transient
        pupilSize: 5.2           // Sudden dilation reflex
      };
      break;
    case 'baseline':
    default:
      config = {
        stimulusName: 'Resting Baseline Condition',
        heartRate: 72,
        hrv: 0.07,
        gsr: 3.8,
        respRate: 15,
        eegAlpha: 1.0,
        eegBeta: 0.8,
        eegTheta: 0.7,
        pupilSize: 3.6
      };
      break;
  }

  res.json(config);
});

// POST /api/sessions
// Saves a virtual simulator recording session
app.post('/api/sessions', (req, res) => {
  const { participantName, stimulusTriggered, durationSeconds, averageHeartRate, maxGsr, signalSamplesCount, timestamp } = req.body;

  if (!participantName) {
    return res.status(400).json({ error: 'Participant name is required' });
  }

  const sessions = loadJSONFile(sessionsFilePath);
  const newSession = {
    id: `session_${Date.now()}`,
    participantName,
    stimulusTriggered,
    durationSeconds,
    averageHeartRate,
    maxGsr,
    signalSamplesCount,
    timestamp: timestamp || new Date().toISOString()
  };

  sessions.unshift(newSession); // Newest first

  try {
    fs.writeFileSync(sessionsFilePath, JSON.stringify(sessions, null, 2), 'utf8');
    res.status(201).json({ success: true, message: 'Session saved successfully', session: newSession });
  } catch (err) {
    console.error('Error saving session:', err);
    res.status(500).json({ error: 'Failed to write session record' });
  }
});

// GET /api/sessions
// Retrieve list of saved sessions
app.get('/api/sessions', (req, res) => {
  const sessions = loadJSONFile(sessionsFilePath);
  res.json(sessions);
});

// Start server
app.listen(PORT, () => {
  console.log(`[Psychophysiology Server] Running on port ${PORT}`);
});
