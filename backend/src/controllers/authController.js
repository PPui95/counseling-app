const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../models/db');

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, fullName: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function formatUser(row) {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    avatar: row.avatar,
    createdAt: row.created_at,
  };
}

exports.register = async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;
    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบ' });
    }
    if (!['counselor', 'client'].includes(role)) {
      return res.status(400).json({ message: 'บทบาทไม่ถูกต้อง' });
    }
    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) return res.status(409).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });

    const hashed = await bcrypt.hash(password, 10);
    const id = genId();

    // Auto-assign counselor for new clients (first available counselor)
    let assignedCounselorId = null;
    if (role === 'client') {
      const counselor = db.prepare("SELECT id FROM users WHERE role = 'counselor' LIMIT 1").get();
      if (counselor) assignedCounselorId = counselor.id;
    }

    db.prepare(
      'INSERT INTO users (id, email, password, full_name, role, assigned_counselor_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, email.toLowerCase(), hashed, fullName, role, assignedCounselorId);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    const token = signToken(user);

    return res.status(201).json({ user: formatUser(user), token });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'กรุณากรอกอีเมลและรหัสผ่าน' });

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });

    const token = signToken(user);
    return res.json({ user: formatUser(user), token });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
};

exports.me = (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    return res.json({ user: formatUser(user) });
  } catch (err) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
};
