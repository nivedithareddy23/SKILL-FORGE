<<<<<<< HEAD
const express = require('express');
const { getDashboard, getAllUsers, deleteUser, getAllCourses, deleteCourse, getReports, getAiLogs } = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', getDashboard);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/courses', getAllCourses);
router.delete('/courses/:id', deleteCourse);
router.get('/reports', getReports);
router.get('/ai-logs', getAiLogs);

=======
const express = require('express');
const { getDashboard, getAllUsers, deleteUser, getAllCourses, deleteCourse, getReports, getAiLogs } = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', getDashboard);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/courses', getAllCourses);
router.delete('/courses/:id', deleteCourse);
router.get('/reports', getReports);
router.get('/ai-logs', getAiLogs);

>>>>>>> 4d30978af4095b6db6b658b418ac0348c269a41e
module.exports = router;