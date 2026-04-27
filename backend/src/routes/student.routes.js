<<<<<<< HEAD
const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { getDashboard, getCourses, getCourseContent, markCourseStarted, getQuizzes, getProgress } = require('../controllers/student.controller');

const router = express.Router();
router.use(authenticate, authorize('STUDENT'));

router.get('/dashboard', getDashboard);
router.get('/courses', getCourses);
router.get('/courses/:courseId/content', getCourseContent);
router.post('/courses/:courseId/start', markCourseStarted);
router.get('/quizzes', getQuizzes);
router.get('/progress', getProgress);

=======
const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { getDashboard, getCourses, getCourseContent, markCourseStarted, getQuizzes, getProgress } = require('../controllers/student.controller');

const router = express.Router();
router.use(authenticate, authorize('STUDENT'));

router.get('/dashboard', getDashboard);
router.get('/courses', getCourses);
router.get('/courses/:courseId/content', getCourseContent);
router.post('/courses/:courseId/start', markCourseStarted);
router.get('/quizzes', getQuizzes);
router.get('/progress', getProgress);

>>>>>>> 4d30978af4095b6db6b658b418ac0348c269a41e
module.exports = router;