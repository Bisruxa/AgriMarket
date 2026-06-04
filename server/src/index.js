const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');
// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const { getClientUrl } = require('./services/email.service');
const emailLinkBase = getClientUrl();
const isProduction = (process.env.NODE_ENV || '').trim().toLowerCase() === 'production';
if (/^null|undefined/i.test(emailLinkBase) || emailLinkBase.includes('://null')) {
  console.error(
    '[config] CLIENT_URL is invalid — verification emails will have broken links. Set CLIENT_URL to your live web app URL (e.g. https://your-app.vercel.app).',
  );
} else if (isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(emailLinkBase)) {
  console.warn(
    `[config] Email links use ${emailLinkBase} — set CLIENT_URL to your public site URL on Render/production.`,
  );
} else {
  console.log(`[config] Email links base URL: ${emailLinkBase}`);
}

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    // and all origins in development for convenience
    if (!origin || process.env.NODE_ENV !== 'production') return callback(null, true);
    // In production, allow any origin (restrict later if needed)
    return callback(null, true);
  },
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/farms', require('./routes/farm.routes'));
app.use('/api/weather', require('./routes/weather.routes'));
app.use('/api/market', require('./routes/market.routes'));
app.use('/api/agriai', require('./routes/agriai.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/prices', require('./routes/price.routes'));

// Chat routes (CRUD only, AI via client-side live voice)
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'AgriMarket API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(err.code && { code: err.code }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const { handleLiveVoiceConnection } = require('./controllers/live-voice.controller');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: '/ws/chat/live' });
wss.on('connection', handleLiveVoiceConnection);

server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`🔊 Live voice WebSocket: ws://localhost:${PORT}/ws/chat/live`);
});
