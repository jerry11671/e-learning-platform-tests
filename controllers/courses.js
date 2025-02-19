const { UnauthenticatedError, BadRequestError } = require('../errors');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { StatusCodes } = require('http-status-codes');


const getCourses = async (req, res) => {
    const courses = await Course.find().populate({
        path: 'students',
        select: 'name email'
    })
    return res.status(StatusCodes.OK).json({ status: true, code: 200, msg: 'All courses retrieved', data: courses })
}

const createCourse = async (req, res) => {
    const { id, role } = req.user;
    const { instructor, title, duration, description, price } = req.body;

    if (role !== 'admin') {
        throw new UnauthenticatedError('Not an admin.')
    }

    const course = new Course({ instructor, title, duration, description, price });
    await course.save();

    res.status(StatusCodes.OK).json({ status: true, code: 200, msg: 'Course added successfully', data: { course } })
}


const updateCourse = async (req, res) => {
    const { id: userId, role } = req.user;
    const { id: courseId } = req.params;

    if (role !== 'admin') {
        throw new UnauthenticatedError('Not an admin.')
    }

    const updatedCourse = await Course.findByIdAndUpdate({ _id: courseId }, req.body);

    res.status(StatusCodes.OK).json({ status: true, code: 200, msg: 'Course updated succesfully', data: { updatedCourse } });
}



const deleteCourse = async (req, res) => {
    const { id: userId, role } = req.user;
    const { id: courseId } = req.params;

    if (role !== 'admin') {
        throw new UnauthenticatedError('Not an admin.')
    }

    const updatedCourse = await Course.findById(courseId).deleteOne();

    res.status(StatusCodes.OK).json({ status: true, code: 200, msg: 'Course deleted successfully' });
}


const enrollStudent = async (req, res) => {
    const { studentId } = req.body;
    const { course_id } = req.params;
    const { role } = req.user;

    if (role !== 'admin') {
        throw new UnauthenticatedError('Not an admin.')
    }

    const course = await Course.findOne({ _id: course_id });
    const isExistingStudent = course.students.includes(studentId); // A check to determine if a student is already enrolled to a course.
    if (isExistingStudent) {
        throw new BadRequestError('Student is already enrolled to course')
    }
    const enrollment = new Enrollment({ student: studentId, course: course_id })
    course.students.push(studentId);
    await enrollment.save();
    await course.save();

    res.status(StatusCodes.OK).json({ status: true, code: 200, msg: 'Student enrolled successfully', data: { course } })
}


const updateStudent = async (req, res) => {
    const { course_id } = req.params;
    const { role } = req.user;
    const { status, studentId } = req.body;

    if (role !== 'admin') {
        throw new UnauthenticatedError('Not an admin.')
    }

    const course = await Course.findOne({ _id: course_id });

    if (!course.students.includes(studentId)) {
        throw new BadRequestError('Student is not enrolled to this course.')
    }

    const updatedEnrollment = await Enrollment.findOne({ course: course_id, student: studentId })
    updatedEnrollment.status = status
    await updatedEnrollment.save();

    res.status(StatusCodes.OK).json({ status: true, code: 200, msg: 'Student enrollment updated', data: { updatedEnrollment } });
}

const removeStudent = async (req, res) => {
    const { course_id, student_id } = req.params;
    const { role } = req.user;

    if (role !== 'admin') {
        throw new UnauthenticatedError('Not an admin.')
    }

    const course = await Course.findOne({ _id: course_id });

    const isExistingStudent = course.students.includes(student_id);
    if (!isExistingStudent) {
        throw new BadRequestError('Student is not enrolled to this course.')
    }

    // Finds the enrollment with the course_id and student_id
    const enrollment = await Enrollment.findOne({ course: course_id, student: student_id });

    // Removes the student from the course
    const studentIndex = course.students.indexOf(student_id)
    course.students.splice(studentIndex, 1);
    enrollment.status = 'dropped';
    await course.save()
    await enrollment.save();

    res.status(StatusCodes.OK).json({ status: true, code: 200, msg: 'Student removed from course successfully' });
}



module.exports = { getCourses, createCourse, updateCourse, deleteCourse, enrollStudent, updateStudent, removeStudent } 