const router = require('express').Router();
const ctrl = require('../controllers/assessmentController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('client'));
router.get('/', ctrl.getResults);
router.post('/', ctrl.submit);

module.exports = router;
