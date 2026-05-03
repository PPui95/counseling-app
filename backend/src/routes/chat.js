const router = require('express').Router();
const ctrl = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/rooms', ctrl.getRooms);
router.get('/rooms/:roomId/messages', ctrl.getMessages);
router.post('/rooms/:roomId/messages', ctrl.sendMessage);

module.exports = router;
