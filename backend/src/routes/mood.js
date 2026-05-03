const router = require('express').Router();
const ctrl = require('../controllers/moodController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('client'));
router.get('/', ctrl.getEntries);
router.post('/', ctrl.record);

module.exports = router;
