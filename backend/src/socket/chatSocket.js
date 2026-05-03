const jwt = require('jsonwebtoken');
const { getDb } = require('../models/db');

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

module.exports = function setupSocket(io) {
  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.fullName} (${socket.user.role})`);

    socket.on('join_room', ({ roomId }) => {
      const db = getDb();
      const room = db.prepare('SELECT * FROM chat_rooms WHERE id = ?').get(roomId);
      if (!room) return;
      if (room.counselor_id !== socket.user.id && room.client_id !== socket.user.id) return;
      socket.join(roomId);
      socket.emit('joined_room', { roomId });
    });

    socket.on('leave_room', ({ roomId }) => {
      socket.leave(roomId);
    });

    socket.on('send_message', ({ roomId, content }) => {
      if (!content?.trim()) return;
      const db = getDb();
      const room = db.prepare('SELECT * FROM chat_rooms WHERE id = ?').get(roomId);
      if (!room) return;
      if (room.counselor_id !== socket.user.id && room.client_id !== socket.user.id) return;

      const id = genId();
      const now = new Date().toISOString();
      db.prepare(
        'INSERT INTO chat_messages (id, room_id, sender_id, content, sent_at) VALUES (?, ?, ?, ?, ?)'
      ).run(id, roomId, socket.user.id, content.trim(), now);

      const user = db.prepare('SELECT full_name, role FROM users WHERE id = ?').get(socket.user.id);
      const msg = {
        id, roomId, senderId: socket.user.id,
        senderName: user.full_name, senderRole: user.role,
        content: content.trim(), sentAt: now, read: false,
      };

      io.to(roomId).emit('new_message', msg);
    });

    socket.on('typing', ({ roomId, isTyping }) => {
      socket.to(roomId).emit('user_typing', {
        userId: socket.user.id,
        userName: socket.user.fullName,
        isTyping,
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.user.fullName}`);
    });
  });
};
