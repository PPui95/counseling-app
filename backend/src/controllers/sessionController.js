const { getDb } = require('../models/db');

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function formatSession(row) {
  return {
    id: row.id,
    counselorId: row.counselor_id,
    clientId: row.client_id,
    clientName: row.client_name,
    date: row.date,
    duration: row.duration,
    presentingProblem: row.presenting_problem,
    techniques: JSON.parse(row.techniques || '[]'),
    notes: row.notes,
    followUpPlan: row.follow_up_plan,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

exports.getAll = (req, res) => {
  const db = getDb();
  const { clientId } = req.query;
  let rows;
  if (clientId) {
    rows = db.prepare(
      'SELECT * FROM counseling_sessions WHERE counselor_id = ? AND client_id = ? ORDER BY date DESC'
    ).all(req.user.id, clientId);
  } else {
    rows = db.prepare(
      'SELECT * FROM counseling_sessions WHERE counselor_id = ? ORDER BY date DESC'
    ).all(req.user.id);
  }
  return res.json({ sessions: rows.map(formatSession) });
};

exports.getById = (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM counseling_sessions WHERE id = ? AND counselor_id = ?').get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ message: 'ไม่พบบันทึก' });
  return res.json({ session: formatSession(row) });
};

exports.create = (req, res) => {
  const { clientName, clientId, date, duration, presentingProblem, techniques, notes, followUpPlan } = req.body;
  if (!clientName || !presentingProblem) {
    return res.status(400).json({ message: 'กรุณากรอกชื่อผู้รับบริการและปัญหา' });
  }
  const db = getDb();
  const id = genId();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO counseling_sessions (id, counselor_id, client_id, client_name, date, duration, presenting_problem, techniques, notes, follow_up_plan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, req.user.id, clientId || null, clientName,
    date || now, duration || 60, presentingProblem,
    JSON.stringify(techniques || []), notes || '', followUpPlan || '', now, now
  );
  const row = db.prepare('SELECT * FROM counseling_sessions WHERE id = ?').get(id);
  return res.status(201).json({ session: formatSession(row) });
};

exports.update = (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM counseling_sessions WHERE id = ? AND counselor_id = ?').get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ message: 'ไม่พบบันทึก' });

  const { clientName, date, duration, presentingProblem, techniques, notes, followUpPlan } = req.body;
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE counseling_sessions SET client_name = ?, date = ?, duration = ?, presenting_problem = ?, techniques = ?, notes = ?, follow_up_plan = ?, updated_at = ? WHERE id = ?`
  ).run(
    clientName ?? existing.client_name,
    date ?? existing.date,
    duration ?? existing.duration,
    presentingProblem ?? existing.presenting_problem,
    JSON.stringify(techniques ?? JSON.parse(existing.techniques)),
    notes ?? existing.notes,
    followUpPlan ?? existing.follow_up_plan,
    now, req.params.id
  );
  const row = db.prepare('SELECT * FROM counseling_sessions WHERE id = ?').get(req.params.id);
  return res.json({ session: formatSession(row) });
};

exports.delete = (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM counseling_sessions WHERE id = ? AND counselor_id = ?').get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ message: 'ไม่พบบันทึก' });
  db.prepare('DELETE FROM counseling_sessions WHERE id = ?').run(req.params.id);
  return res.json({ message: 'ลบสำเร็จ' });
};
