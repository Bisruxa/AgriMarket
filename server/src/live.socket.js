const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { createGeminiConnection } = require('./services/live.service');

function setupLiveSocket(httpServer) {
  const wss = new WebSocket.Server({ server: httpServer, path: '/live' });

  wss.on('connection', (clientWs, req) => {
    const params = new URLSearchParams(req.url?.split('?')[1] || '');
    const token = params.get('token');

    if (!token) {
      clientWs.send(JSON.stringify({ type: 'error', message: 'Authentication required' }));
      clientWs.close();
      return;
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      clientWs.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
      clientWs.close();
      return;
    }

    let geminiWs = null;

    clientWs.on('message', (data) => {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'connect_live') {
        geminiWs = createGeminiConnection(clientWs, msg.config || {});
        return;
      }

      if (geminiWs && geminiWs.readyState === WebSocket.OPEN) {
        geminiWs.send(data.toString());
      }
    });

    clientWs.on('close', () => {
      if (geminiWs) {
        geminiWs.close();
      }
    });

    clientWs.on('error', () => {
      if (geminiWs) {
        geminiWs.close();
      }
    });
  });

  return wss;
}

module.exports = { setupLiveSocket };
