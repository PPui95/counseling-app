const { getDb } = require('../models/db');

exports.getAll = (req, res) => {
  const db = getDb();
  const clients = db.prepare(
    "SELECT u.id, u.email, u.full_name, u.created_at, COUNT(s.id) as total_sessions, MAX(s.date) as last_session_date FROM users u LEFT JOIN counseling_sessions s ON s.client_id = u.id AND s.counselor_id = ? WHERE u.role = 'client' AND u.assigned_counselor_id = ? GROUP BY u.id"
  ).all(req.user.id, req.user.id);

  const result = clients.map((c) => {
    const latestPHQ9 = db.prepare(
      "SELECT score, severity FROM assessment_results WHERE user_id = ? AND type = 'PHQ9' ORDER BY taken_at DESC LIMIT 1"
    ).get(c.id);
    const latestGAD7 = db.prepare(
      "SELECT score, severity FROM assessment_results WHERE user_id = ? AND type = 'GAD7' ORDER BY taken_at DESC LIMIT 1"
    ).get(c.id);
    return {
      id: c.id,
      fullName: c.full_name,
      email: c.email,
      totalSessions: c.total_sessions,
      lastSessionDate: c.last_session_date,
      assignedCounselorId: req.user.id,
      createdAt: c.created_at,
      latestPHQ9: latestPHQ9 || null,
      latestGAD7: latestGAD7 || null,
    };
  });

  return res.json({ clients: result });
};

exports.getById = (req, res) => {
  const db = getDb();
  const client = db.prepare(
    "SELECT * FROM users WHERE id = ? AND role = 'client' AND assigned_counselor_id = ?"
  ).get(req.params.id, req.user.id);
  if (!client) return res.status(404).json({ message: 'ไม่พบผู้รับบริการ' });

  const sessions = db.prepare(
    'SELECT * FROM counseling_sessions WHERE counselor_id = ? AND client_id = ? ORDER BY date DESC LIMIT 10'
  ).all(req.user.id, req.params.id);

  const assessments = db.prepare(
    'SELECT * FROM assessment_results WHERE user_id = ? ORDER BY taken_at DESC LIMIT 10'
  ).all(req.params.id);

  const moodEntries = db.prepare(
    'SELECT * FROM mood_entries WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 14'
  ).all(req.params.id);

  return res.json({
    client: {
      id: client.id,
      fullName: client.full_name,
      email: client.email,
      createdAt: client.created_at,
    },
    sessions: sessions.map((s) => ({
      id: s.id, date: s.date, duration: s.duration,
      presentingProblem: s.presenting_problem,
      techniques: JSON.parse(s.techniques || '[]'),
    })),
    assessments: assessments.map((a) => ({
      id: a.id, type: a.type, score: a.score,
      severity: a.severity, takenAt: a.taken_at,
    })),
    moodEntries: moodEntries.map((m) => ({
      id: m.id, mood: m.mood, recordedAt: m.recorded_at,
    })),
  });
};

exports.getProgress = (req, res) => {
  const db = getDb();
  const client = db.prepare(
    "SELECT id FROM users WHERE id = ? AND role = 'client' AND assigned_counselor_id = ?"
  ).get(req.params.id, req.user.id);
  if (!client) return res.status(404).json({ message: 'ไม่พบผู้รับบริการ' });

  const phq9Trend = db.prepare(
    "SELECT score, taken_at FROM assessment_results WHERE user_id = ? AND type = 'PHQ9' ORDER BY taken_at ASC LIMIT 10"
  ).all(req.params.id);

  const gad7Trend = db.prepare(
    "SELECT score, taken_at FROM assessment_results WHERE user_id = ? AND type = 'GAD7' ORDER BY taken_at ASC LIMIT 10"
  ).all(req.params.id);

  const moodTrend = db.prepare(
    "SELECT mood, recorded_at FROM mood_entries WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 14"
  ).all(req.params.id);

  return res.json({ phq9Trend, gad7Trend, moodTrend });
};
