const express = require('express');
const router = express.Router()

const { getCourses, createCourse, updateCourse, deleteCourse, enrollStudent, updateStudent, removeStudent } = require('../controllers/courses')

// Joi Validators
const validate = require('../middlewares/validate');
const courseSchema = require('../validator/courseValidation');
const enrollmentSchema = require('../validator/enrollmentValidation');
const updateStudentSchema = require('../validator/updateStudentValidation');
const updateCourseSchema = require('../validator/updateCourseValidation');

// Auth Middlewares
const adminAuth = require('../middlewares/adminAuth');
const studentAuth = require('../middlewares/studentAuth');
const instructorAuth = require('../middlewares/instructorAuth');


    


router.get('/', getCourses);
router.post('/', instructorAuth, validate(courseSchema), createCourse);
router.put('/:id', instructorAuth, validate(updateCourseSchema), updateCourse);
router.delete('/:id', instructorAuth, deleteCourse);
router.post('/:course_id/enroll', adminAuth, validate(enrollmentSchema), validate(courseSchema), enrollStudent);
router.put('/:course_id/update', adminAuth, validate(updateStudentSchema), updateStudent);
router.delete('/:course_id/students/:student_id', adminAuth, removeStudent);




module.exports = router;    