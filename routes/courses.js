const express = require('express');
const router = express.Router()

const { getCourses, createCourse, updateCourse, deleteCourse, enrollStudent, updateStudent, removeStudent } = require('../controllers/courses')
const validate = require('../middlewares/validate');
const courseSchema = require('../validator/courseValidation');
const enrollmentSchema = require('../validator/enrollmentValidation');
const updateStudentSchema = require('../validator/updateStudentValidation');
const updateCourseSchema = require('../validator/updateCourseValidation');


router.get('/', getCourses);
router.post('/', validate(courseSchema), createCourse);
router.put('/:id', validate(updateCourseSchema), updateCourse);
router.delete('/:id', deleteCourse);
router.post('/:course_id/enroll', validate(enrollmentSchema), validate(courseSchema), enrollStudent);
router.put('/:course_id/update', validate(updateStudentSchema), updateStudent);
router.delete('/:course_id/students/:student_id', removeStudent);




module.exports = router;    