const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const DB_PATH = process.env.DB_PATH || './database/counseling.db';
const dbPath = path.resolve(process.cwd(), DB_PATH);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('counselor', 'client')),
    avatar TEXT,
    assigned_counselor_id TEXT REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS counseling_sessions (
    id TEXT PRIMARY KEY,
    counselor_id TEXT NOT NULL REFERENCES users(id),
    client_id TEXT REFERENCES users(id),
    client_name TEXT NOT NULL,
    date TEXT NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60,
    presenting_problem TEXT NOT NULL,
    techniques TEXT NOT NULL DEFAULT '[]',
    notes TEXT DEFAULT '',
    follow_up_plan TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS assessment_results (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    type TEXT NOT NULL CHECK (type IN ('PHQ9', 'GAD7', 'SWLS')),
    answers TEXT NOT NULL DEFAULT '[]',
    score INTEGER NOT NULL,
    severity TEXT NOT NULL,
    interpretation TEXT NOT NULL,
    taken_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS mood_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    mood INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 5),
    note TEXT DEFAULT '',
    recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS chat_rooms (
    id TEXT PRIMARY KEY,
    counselor_id TEXT NOT NULL REFERENCES users(id),
    client_id TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(counselor_id, client_id)
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES chat_rooms(id),
    sender_id TEXT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    read INTEGER NOT NULL DEFAULT 0,
    sent_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Seed demo data
const { v4: uuidv4 } = { v4: () => Math.random().toString(36).slice(2) + Date.now().toString(36) };

const hasUsers = db.prepare('SELECT COUNT(*) as c FROM users').get();
if (hasUsers.c === 0) {
  const counselorId = 'counselor-demo-001';
  const client1Id = 'client-demo-001';
  const client2Id = 'client-demo-002';

  const hash = (pw) => bcrypt.hashSync(pw, 10);

  db.prepare(`INSERT INTO users (id, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)`).run(
    counselorId, 'counselor@demo.com', hash('demo1234'), 'ดร. สุภาพร มั่นคง', 'counselor'
  );
  db.prepare(`INSERT INTO users (id, email, password, full_name, role, assigned_counselor_id) VALUES (?, ?, ?, ?, ?, ?)`).run(
    client1Id, 'client@demo.com', hash('demo1234'), 'สมชาย ใจดี', 'client', counselorId
  );
  db.prepare(`INSERT INTO users (id, email, password, full_name, role, assigned_counselor_id) VALUES (?, ?, ?, ?, ?, ?)`).run(
    client2Id, 'client2@demo.com', hash('demo1234'), 'นิดา แสงทอง', 'client', counselorId
  );

  // Sessions
  const now = new Date().toISOString();
  const week = new Date(Date.now() - 7 * 86400000).toISOString();

  db.prepare(`INSERT INTO counseling_sessions (id, counselor_id, client_id, client_name, date, duration, presenting_problem, techniques, notes, follow_up_plan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    'session-001', counselorId, client1Id, 'สมชาย ใจดี', now, 50,
    'ความเครียดจากการทำงาน รู้สึกล้า ไม่อยากไปทำงาน',
    JSON.stringify(['การฟังอย่างตั้งใจ', 'CBT']),
    'ผู้รับบริการมีความเครียดสะสมจากงาน ได้ฝึกเทคนิค CBT เพื่อปรับความคิดอัตโนมัติ',
    'ฝึก thought record ทุกวัน นัดพบสัปดาห์หน้า'
  );
  db.prepare(`INSERT INTO counseling_sessions (id, counselor_id, client_id, client_name, date, duration, presenting_problem, techniques, notes, follow_up_plan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    'session-002', counselorId, client2Id, 'นิดา แสงทอง', week, 60,
    'ความสัมพันธ์ในครอบครัว ความขัดแย้งกับพ่อแม่',
    JSON.stringify(['การสะท้อน', 'การยืนยันความรู้สึก']),
    'สะท้อนความรู้สึกและช่วยให้เห็นมุมมองของครอบครัว',
    'ลองคุยกับพ่อแม่ด้วยเทคนิค I-message'
  );

  // Assessment results
  db.prepare(`INSERT INTO assessment_results (id, user_id, type, answers, score, severity, interpretation, taken_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    'ar-001', client1Id, 'PHQ9', JSON.stringify([1,1,0,1,0,1,0,0,0]), 8, 'น้อย', 'มีอาการซึมเศร้าเล็กน้อย แนะนำให้ติดตามอาการ', week
  );
  db.prepare(`INSERT INTO assessment_results (id, user_id, type, answers, score, severity, interpretation, taken_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    'ar-002', client1Id, 'GAD7', JSON.stringify([1,0,1,1,0,1,0]), 6, 'น้อย', 'มีความวิตกกังวลเล็กน้อย', week
  );

  // Mood entries
  for (let i = 13; i >= 0; i--) {
    const moods = [3,3,4,2,3,4,4,5,4,3,4,5,4,4];
    db.prepare(`INSERT INTO mood_entries (id, user_id, mood, recorded_at) VALUES (?, ?, ?, ?)`).run(
      `mood-${i}`, client1Id, moods[13 - i],
      new Date(Date.now() - i * 86400000).toISOString()
    );
  }

  // Chat room + messages
  db.prepare(`INSERT INTO chat_rooms (id, counselor_id, client_id) VALUES (?, ?, ?)`).run(
    'room-001', counselorId, client1Id
  );
  db.prepare(`INSERT INTO chat_messages (id, room_id, sender_id, content, read, sent_at) VALUES (?, ?, ?, ?, ?, ?)`).run(
    'msg-001', 'room-001', counselorId, 'สวัสดีค่ะ คุณสมชาย เป็นอย่างไรบ้างวันนี้คะ?', 1, week
  );
  db.prepare(`INSERT INTO chat_messages (id, room_id, sender_id, content, read, sent_at) VALUES (?, ?, ?, ?, ?, ?)`).run(
    'msg-002', 'room-001', client1Id, 'สวัสดีครับ รู้สึกดีขึ้นมากครับ หลังจากฝึกตามที่แนะนำ', 1, now
  );

  console.log('✅ Database seeded with demo data');
  console.log('📧 Demo accounts:');
  console.log('   Counselor: counselor@demo.com / demo1234');
  console.log('   Client:    client@demo.com / demo1234');
} else {
  console.log('ℹ️  Database already has data, skipping seed');
}

db.close();
module.exports = db;
