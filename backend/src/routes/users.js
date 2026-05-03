const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { getDb } = require('../models/db');

router.get('/my-counselor', authenticate, requireRole('client'), (req, res) => {
  const db = getDb();
  const client = db.prepare('SELECT assigned_counselor_id FROM users WHERE id = ?').get(req.user.id);
  if (!client?.assigned_counselor_id) return res.json({ counselor: null });
  const counselor = db.prepare('SELECT id, email, full_name FROM users WHERE id = ?').get(client.assigned_counselor_id);
  return res.json({ counselor: counselor ? { id: counselor.id, email: counselor.email, fullName: counselor.full_name } : null });
});

module.exports = router;
