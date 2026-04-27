<<<<<<< HEAD
const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { getProfile, updateProfile, changePassword } = require('../controllers/profile.controller');

const router = express.Router();
router.use(authenticate);
router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/password', changePassword);

=======
const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { getProfile, updateProfile, changePassword } = require('../controllers/profile.controller');

const router = express.Router();
router.use(authenticate);
router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/password', changePassword);

>>>>>>> 4d30978af4095b6db6b658b418ac0348c269a41e
module.exports = router;