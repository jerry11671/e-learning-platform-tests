const express = require('express');
const router = express.Router()

const { enrollCourse, updateEnrollment, removeCourse } = require('../controllers/students');
const validate = require('../middlewares/validate')
const updateEnrollmentSchema = require('../validator/updateEnrollmentValidation');



router.post('/:course_id/enroll-course', enrollCourse);
router.put('/:course_id/update', validate(updateEnrollmentSchema), updateEnrollment);
router.delete('/:course_id/remove-course', removeCourse);



module.exports = router;