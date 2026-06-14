const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { initDB } = require('./db/database');
const ordersRouter = require('./routes/orders');
const webhookRouter = require('./routes/webhook');
const { verifyToken, requirePermission, login, getMe } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json());

// Serve static files (login.html, admin-panel.html, etc.)
app.use(express.static(path.join(__dirname)));

// Serve admin panel at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-panel.html'));
});

// ─── Public Routes ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'WA Order Tracker', timestamp: new Date().toISOString() });
});

app.post('/api/auth/login', login);
app.use('/webhook', webhookRouter);

// ─── Protected Routes ───────────────────────────────────────
app.use('/api', verifyToken);
app.get('/api/auth/me', getMe);
app.use('/api', ordersRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message });
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 WA Order Tracker running on http://localhost:${PORT}`);
    console.log(`🖥️  Admin Panel: http://localhost:${PORT}`);
    console.log(`🔐 Login: http://localhost:${PORT}/login.html`);
    console.log(`📱 WhatsApp API: ${process.env.WA_PHONE_NUMBER_ID ? '✓ Configured' : '✗ Not configured'}`);
  });
});
