const jwt = require('jsonwebtoken');
const { LiveVoiceSession } = require('../services/live-voice.service');
const { prisma } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function handleLiveVoiceConnection(ws, req) {
  let session = null;
  let userId = null;
  let authenticated = false;
  let pingInterval = null;

  const send = (data) => {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify(data));
    }
  };

  const cleanup = () => {
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
    if (session) {
      session.close();
      session = null;
    }
  };

  ws.on('message', async (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      await handleMessage(msg);
    } catch (err) {
      send({ type: 'error', message: 'Invalid message format' });
    }
  });

  ws.on('close', () => {
    cleanup();
  });

  ws.on('error', () => {
    cleanup();
  });

  async function handleMessage(msg) {
    switch (msg.type) {
      case 'auth':
        await handleAuth(msg);
        break;
      case 'start':
        await handleStart(msg);
        break;
      case 'audio':
        handleAudio(msg);
        break;
      case 'stop':
        handleStop();
        break;
      case 'ping':
        send({ type: 'pong' });
        break;
      default:
        send({ type: 'error', message: `Unknown message type: ${msg.type}` });
    }
  }

  async function handleAuth(msg) {
    try {
      const decoded = jwt.verify(msg.token, JWT_SECRET);
      userId = decoded.id;
      authenticated = true;
      send({ type: 'auth_ok' });
    } catch {
      send({ type: 'auth_error', message: 'Invalid or expired token' });
      ws.close();
    }
  }

  async function handleStart(msg) {
    if (!authenticated || !userId) {
      return send({ type: 'error', message: 'Not authenticated. Send auth first.' });
    }

    if (!GEMINI_API_KEY) {
      return send({ type: 'error', message: 'Server Gemini API key not configured' });
    }

    if (session) {
      session.close();
      session = null;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, role: true, region: true, woreda: true, farmSize: true, crops: true },
      });

      const farms = await prisma.farm.findMany({
        where: { farmerId: userId, isActive: true },
        select: { id: true, name: true, region: true, woreda: true, size: true, soilType: true },
      });

      session = new LiveVoiceSession({
        apiKey: GEMINI_API_KEY,
        language: msg.language || 'en',
        voice: msg.voice || 'Zephyr',
        userContext: user ? { role: user.role, region: user.region, woreda: user.woreda, name: user.name, farms } : null,
        callbacks: {
          onOpen: () => {
            send({ type: 'connected' });
          },
          onTranscript: (role, text) => {
            send({ type: 'transcript', role, text });
          },
          onAudio: (base64Data) => {
            send({ type: 'audio', data: base64Data });
          },
          onToolCall: (name, args) => {
            send({ type: 'tool_call', name, args });
          },
          onTurnComplete: () => {
            send({ type: 'turn_complete' });
          },
          onError: (message) => {
            send({ type: 'error', message });
          },
          onClose: () => {
            send({ type: 'closed' });
            session = null;
          },
        },
      });

      await session.start();
      pingInterval = setInterval(() => {
        if (ws.readyState === 1) {
          ws.ping();
        }
      }, 30000);
    } catch (err) {
      send({ type: 'error', message: err.message || 'Failed to start voice session' });
    }
  }

  function handleAudio(msg) {
    if (!session) {
      return send({ type: 'error', message: 'No active session. Send start first.' });
    }
    session.sendAudio(msg.data);
  }

  function handleStop() {
    if (session) {
      session.close();
      session = null;
    }
    send({ type: 'closed' });
  }
}

module.exports = { handleLiveVoiceConnection };
