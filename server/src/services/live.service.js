const WebSocket = require('ws');
const dotenv = require('dotenv');
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const LIVE_MODEL = process.env.LIVE_MODEL || 'gemini-3.1-flash-live-preview';
const SYSTEM_PROMPT = process.env.LIVE_SYSTEM_PROMPT || 'You are AgriAI, an expert agricultural assistant for Ethiopian farmers and traders. Help with crop recommendations, price forecasting, weather, market trends, and soil analysis. Respond conversationally in voice. Be concise.';

function createGeminiConnection(clientWs, config = {}) {
  if (!GEMINI_API_KEY) {
    sendError(clientWs, 'GEMINI_API_KEY not configured on server');
    return null;
  }

  const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;
  const geminiWs = new WebSocket(url);
  let setupSent = false;

  geminiWs.on('open', () => {
    const setupMsg = JSON.stringify([
      'setup',
      {
        model: `models/${config.model || LIVE_MODEL}`,
        system_instruction: {
          parts: [{ text: config.systemPrompt || SYSTEM_PROMPT }],
        },
        generation_config: {
          response_modalities: ['TEXT', 'AUDIO'],
          speech_config: {
            voice_config: {
              prebuilt_voice_config: {
                voice_name: config.voice || 'Puck',
              },
            },
          },
        },
      },
    ]);
    geminiWs.send(setupMsg);
    setupSent = true;
  });

  geminiWs.on('message', (data) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(data.toString());
    }
  });

  geminiWs.on('error', (err) => {
    sendError(clientWs, `Gemini error: ${err.message}`);
  });

  geminiWs.on('close', () => {
    safeClose(clientWs);
  });

  clientWs.on('close', () => {
    safeClose(geminiWs);
  });

  return geminiWs;
}

function sendError(ws, message) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'error', message }));
  }
}

function safeClose(ws) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close();
  }
}

module.exports = { createGeminiConnection };
