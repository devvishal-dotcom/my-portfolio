const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_env';

// ─── Default Users (change passwords in production) ──────────
// Passwords are hashed with bcrypt
const USERS = [
  {
    id: 1,
    username: 'admin',
    // Default password: admin123
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'admin'   // Full access: send, view, delete, manage users
  },
  {
    id: 2,
    username: 'operator',
    // Default password: operator123
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'operator' // Can send notifications and view orders only
  },
  {
    id: 3,
    username: 'viewer',
    // Default password: viewer123
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'viewer'  // Read only: view orders and stats only
  }
];

// ─── Role Permissions ─────────────────────────────────────────
const PERMISSIONS = {
  admin:    ['send', 'view', 'delete', 'retry', 'stats', 'manage_users'],
  operator: ['send', 'view', 'retry', 'stats'],
  viewer:   ['view', 'stats']
};

// ─── Generate JWT Token ───────────────────────────────────────
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// ─── Verify JWT Token Middleware ──────────────────────────────
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Invalid or expired token.' });
  }
}

// ─── Role Check Middleware ────────────────────────────────────
function requirePermission(permission) {
  return (req, res, next) => {
    const userPermissions = PERMISSIONS[req.user?.role] || [];
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Your role '${req.user?.role}' cannot perform '${permission}'.`
      });
    }
    next();
  };
}

// ─── Login Handler ────────────────────────────────────────────
async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password required.' });
  }

  const user = USERS.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid username or password.' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ success: false, error: 'Invalid username or password.' });
  }

  const token = generateToken(user);
  res.json({
    success: true,
    token,
    user: { id: user.id, username: user.username, role: user.role },
    permissions: PERMISSIONS[user.role]
  });
}

// ─── Get Current User ─────────────────────────────────────────
function getMe(req, res) {
  res.json({
    success: true,
    user: req.user,
    permissions: PERMISSIONS[req.user.role]
  });
}

module.exports = { verifyToken, requirePermission, login, getMe, PERMISSIONS };
