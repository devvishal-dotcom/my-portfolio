const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_env';

const USERS = [
  { id: 1, username: 'admin', password: '$2b$10$MzkHAZsyOTkHvld9RSEwgOhumIbhBUdL.KMLPzRTP8Vd7v/tx9DGy', role: 'admin' },
  { id: 2, username: 'operator', password: '$2b$10$Nd.Xngaj4rIgaShFOaWISe5TsIANGPKNotQ/NQMbd30222T3eZXI2', role: 'operator' },
  { id: 3, username: 'viewer', password: '$2b$10$SJxiP5yiI8sdfl4Y.ld1seIyYGvIj0r9mOpwQCe7oTXmqv8.nwB9e', role: 'viewer' }
];

const PERMISSIONS = {
  admin:    ['send', 'view', 'delete', 'retry', 'stats', 'manage_users'],
  operator: ['send', 'view', 'retry', 'stats'],
  viewer:   ['view', 'stats']
};

function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
}

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Invalid or expired token.' });
  }
}

function requirePermission(permission) {
  return (req, res, next) => {
    const userPermissions = PERMISSIONS[req.user?.role] || [];
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ success: false, error: `Access denied. Your role '${req.user?.role}' cannot perform '${permission}'.` });
    }
    next();
  };
}

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, error: 'Username and password required.' });
  const user = USERS.find(u => u.username === username);
  if (!user) return res.status(401).json({ success: false, error: 'Invalid username or password.' });
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(401).json({ success: false, error: 'Invalid username or password.' });
  const token = generateToken(user);
  res.json({ success: true, token, user: { id: user.id, username: user.username, role: user.role }, permissions: PERMISSIONS[user.role] });
}

function getMe(req, res) {
  res.json({ success: true, user: req.user, permissions: PERMISSIONS[req.user.role] });
}

module.exports = { verifyToken, requirePermission, login, getMe, PERMISSIONS };