<<<<<<< HEAD
const express = require('express');
const { submitFeedback, getFeedback } = require('../controllers/feedback.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authenticate);
router.post('/', authorize('STUDENT'), submitFeedback);
router.get('/', authorize('INSTRUCTOR', 'ADMIN'), getFeedback);

=======
const express = require('express');
const { submitFeedback, getFeedback } = require('../controllers/feedback.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authenticate);
router.post('/', authorize('STUDENT'), submitFeedback);
router.get('/', authorize('INSTRUCTOR', 'ADMIN'), getFeedback);

>>>>>>> 4d30978af4095b6db6b658b418ac0348c269a41e
module.exports = router;