const request = require('supertest');
const app = require('../app');
const { connectDB, disconnectDB } = require('../utils/test-utils/dbHandler.utils');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");

let studentToken, courseId, studentId;

beforeAll(async () => {
    await connectDB();
    // await mongoose.connect(process.env.MONGO_URI);
    const student = new User({
        name: 'Test Student',
        email: 'student@example.com',
        password: 'password123',
        role: 'student'
    });
    await student.save();

    studentId = student._id;

    studentToken = jwt.sign({
        name: student.name,
        id: student._id,
        email: student.email,
        role: student.role
    }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const course = new Course({
        title: 'Test Course',
        duration: 5,
        description: 'Sample Course',
        price: 100,
        students: []
    });
    await course.save();
    courseId = course._id;
}, 100000);

afterAll(async () => {
    await User.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});
    // await mongoose.connection.close();
    await disconnectDB();
});

describe('Student Enrollment API', () => {

    it('should allow student to enroll in a course', async () => {
        const res = await request(app)
            .post(`/api/v1/students/${courseId}/enroll-course`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.msg).toBe('Course enrolled successfully');

        const updatedCourse = await Course.findById(courseId);
        expect(updatedCourse.students.length).toBe(1);
        expect(updatedCourse.students[0].toString()).toBe(studentId.toString());
    });

    it('should prevent double enrollment in the same course', async () => {
        const res = await request(app)
            .post(`/api/v1/students/${courseId}/enroll-course`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.status).toBe(false);
        expect(res.body.msg).toBe('You are already enrolled to course');
    });

    it('should allow student to update enrollment status', async () => {
        const res = await request(app)
            .put(`/api/v1/students/${courseId}/update`)
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ status: "completed" });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.msg).toBe('Enrollment successfully updated');

        const updatedEnrollment = await Enrollment.findOne({ course: courseId, student: studentId });
        expect(updatedEnrollment.status).toBe('completed');
    });

    it('should allow student to remove themselves from a course', async () => {
        const res = await request(app)
            .delete(`/api/v1/students/${courseId}/remove-course`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.msg).toBe('Course removed successfully');

        const updatedCourse = await Course.findById(courseId);
        expect(updatedCourse.students.length).toBe(0);

        const updatedEnrollment = await Enrollment.findOne({ course: courseId, student: studentId });
        expect(updatedEnrollment.status).toBe('dropped');
    });
});
