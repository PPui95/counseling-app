const { getDb } = require('../models/db');

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

exports.getRooms = (req, res) => {
  const db = getDb();
  const { id, role } = req.user;
  const field = role === 'counselor' ? 'counselor_id' : 'client_id';

  const rooms = db.prepare(
    `SELECT r.*, c.full_name as counselor_name, cl.full_name as client_name FROM chat_rooms r JOIN users c ON r.counselor_id = c.id JOIN users cl ON r.client_id = cl.id WHERE r.${field} = ?`
  ).all(id);

  const result = rooms.map((r) => {
    const lastMsg = db.prepare(
      'SELECT * FROM chat_messages WHERE room_id = ? ORDER BY sent_at DESC LIMIT 1'
    ).get(r.id);
    const unread = db.prepare(
      'SELECT COUNT(*) as c FROM chat_messages WHERE room_id = ? AND sender_id != ? AND read = 0'
    ).get(r.id, id);
    return {
      id: r.id,
      counselorId: r.counselor_id,
      clientId: r.client_id,
      counselorName: r.counselor_name,
      clientName: r.client_name,
      lastMessage: lastMsg ? { content: lastMsg.content, sentAt: lastMsg.sent_at } : null,
      unreadCount: unread.c,
    };
  });

  return res.json({ rooms: result });
};

exports.getMessages = (req, res) => {
  const db = getDb();
  const room = db.prepare('SELECT * FROM chat_rooms WHERE id = ?').get(req.params.roomId);
  if (!room) return res.status(404).json({ message: 'ไม่พบห้องแชท' });
  if (room.counselor_id !== req.user.id && room.client_id !== req.user.id) {
    return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึง' });
  }

  const messages = db.prepare(
    'SELECT m.*, u.full_name as sender_name, u.role as sender_role FROM chat_messages m JOIN users u ON m.sender_id = u.id WHERE m.room_id = ? ORDER BY m.sent_at ASC LIMIT 100'
  ).all(req.params.roomId);

  // Mark as read
  db.prepare(
    'UPDATE chat_messages SET read = 1 WHERE room_id = ? AND sender_id != ?'
  ).run(req.params.roomId, req.user.id);

  return res.json({
    messages: messages.map((m) => ({
      id: m.id, roomId: m.room_id, senderId: m.sender_id,
      senderName: m.sender_name, senderRole: m.sender_role,
      content: m.content, sentAt: m.sent_at, read: !!m.read,
    })),
  });
};

exports.sendMessage = (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ message: 'กรุณากรอกข้อความ' });

  const db = getDb();
  const room = db.prepare('SELECT * FROM chat_rooms WHERE id = ?').get(req.params.roomId);
  if (!room) return res.status(404).json({ message: 'ไม่พบห้องแชท' });
  if (room.counselor_id !== req.user.id && room.client_id !== req.user.id) {
    return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึง' });
  }

  const id = genId();
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO chat_messages (id, room_id, sender_id, content, sent_at) VALUES (?, ?, ?, ?, ?)'
  ).run(id, req.params.roomId, req.user.id, content.trim(), now);

  const user = db.prepare('SELECT full_name, role FROM users WHERE id = ?').get(req.user.id);
  const msg = {
    id, roomId: req.params.roomId, senderId: req.user.id,
    senderName: user.full_name, senderRole: user.role,
    content: content.trim(), sentAt: now, read: false,
  };
  return res.status(201).json({ message: msg });
};
