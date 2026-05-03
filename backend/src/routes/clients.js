const router = require('express').Router();
const ctrl = require('../controllers/clientController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('counselor'));
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.get('/:id/progress', ctrl.getProgress);

module.exports = router;
