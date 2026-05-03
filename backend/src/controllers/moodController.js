const { getDb } = require('../models/db');

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

exports.getEntries = (req, res) => {
  const db = getDb();
  const entries = db.prepare(
    'SELECT * FROM mood_entries WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 30'
  ).all(req.user.id);
  return res.json({
    entries: entries.map((e) => ({
      id: e.id, mood: e.mood, note: e.note, recordedAt: e.recorded_at,
    })),
  });
};

exports.record = (req, res) => {
  const { mood, note } = req.body;
  if (!mood || mood < 1 || mood > 5) {
    return res.status(400).json({ message: 'กรุณาระบุอารมณ์ระหว่าง 1-5' });
  }
  const db = getDb();
  const id = genId();
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO mood_entries (id, user_id, mood, note, recorded_at) VALUES (?, ?, ?, ?, ?)'
  ).run(id, req.user.id, mood, note || '', now);
  return res.status(201).json({ entry: { id, mood, note: note || '', recordedAt: now } });
};
