const { UnauthenticatedError, BadRequestError } = require('../errors');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { StatusCodes } = require('http-status-codes');
const cloudinary = require('../helper/imageUpload');


const getCourses = async (req, res) => {
    const courses = await Course.find().populate({
        path: 'students',
        select: 'name email'
    })
    return res.status(StatusCodes.OK).json({ status: true, code: 200, msg: 'All courses retrieved', data: courses })
}

// This analytics gets the number of students enrolled in a course
const getCourseAnalytics = async (req, res) => {
    const analytics = await Course.aggregate([
        {
            $project: {
                title: 1,
                studentCount: { $size: "$students" }
            }
        },
        {
            $sort: { studentCount: -1 } 
        }
    ]);

    res.status(StatusCodes.OK).json({
        status: true,
        code: 200,
        msg: "Course enrollment analytics retrieved successfully.",
        data: analytics
    });
};


const createCourse = async (req, res) => {
    const { id: instructorId, role } = req.user;
    const { title, duration, description, price } = req.body;

    try {
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                public_id: `${instructorId}_profile`,
                width: 500,
                height: 500,
                crop: 'fill',
            });

            const course = new Course({ instructor: instructorId, title, duration, description, price, image: result.url });
            await course.save();
            res.status(StatusCodes.OK).json({ status: true, code: 200, msg: 'Course added successfully', data: { course } })
        }

        const course = new Course({ instructor: instructorId, title, duration, description, price, image: "" })

        await course.save();
        res.status(StatusCodes.OK).json({ status: true, code: 200, msg: 'Course added successfully', data: { course } })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, code: 500, msg: 'server error, try after some time' })
        console.log("Error while uploading image", error.message);
    }


}


const updateCourse = async (req, res) => {
    const { id: userId, role } = req.user;
    const { id: courseId } = req.params;

    const updatedCourse = await Course.findByIdAndUpdate({ _id: courseId }, req.body);

    res.status(StatusCodes.OK).json({ status: true, code: 200, msg: 'Course updated succesfully', data: { updatedCourse } });
}



const deleteCourse = async (req, res) => {
    const { id: userId, role } = req.user;
    const { id: courseId } = req.params;

    const updatedCourse = await Course.findById(courseId).deleteOne();

    res.status(StatusCodes.OK).json({ status: true, code: 200, msg: 'Course deleted successfully' });
}


const enrollStudent = async (req, res) => {
    const { studentId } = req.body;
    const { course_id } = req.params;

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



module.exports = { getCourses, createCourse, getCourseAnalytics, updateCourse, deleteCourse, enrollStudent, updateStudent, removeStudent } 