const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

describe("Course API Endpoints", () => {
    let instructorToken, adminToken, studentToken;
    let instructorId, adminId, studentId;
    let courseId;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
        const hashedPassword = "securedpassword";
        // Create test users (Instructor, Admin, Student)
        const instructor = await User.create({
            name: "Instructor",
            email: "instructor@example.com",
            password: hashedPassword,
            role: "instructor",
        });
        instructorId = instructor._id;
        instructorToken = instructor.createJWT();

        const admin = await User.create({
            name: "Admin",
            email: "admin@example.com",
            password: hashedPassword,
            role: "admin",
        });
        adminId = admin._id;
        adminToken = admin.createJWT();

        const student = await User.create({
            name: "Student",
            email: "student@example.com",
            password: hashedPassword,
            role: "student",
        });
        studentId = student._id;
        studentToken = student.createJWT();
    }, 100000);

    afterAll(async () => {
        await User.deleteMany({});
        await Course.deleteMany({});
        await Enrollment.deleteMany({});
        await mongoose.connection.close();
    });

    test("should create a new course as an instructor", async () => {
        const response = await request(app)
            .post("/api/v1/courses")
            .set("Authorization", `Bearer ${instructorToken}`)
            .send({
                title: "Test Course",
                duration: "4 weeks",
                description: "This is a test course.",
                price: 100,
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("msg", "Course added successfully");
        expect(response.body.data.course).toHaveProperty("title", "Test Course");

        courseId = response.body.data.course._id; // Store course ID for later tests
    });

    test("should retrieve all courses", async () => {
        const response = await request(app).get("/api/v1/courses");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("msg", "All courses retrieved");
        // expect(response.body.data.length).toBeGreaterThan(0);
    });

    test("should update a course as an instructor", async () => {
        const response = await request(app)
            .put(`/api/v1/courses/${courseId}`)
            .set("Authorization", `Bearer ${instructorToken}`)
            .send({
                title: "Updated Course Title",
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("msg", "Course updated succesfully");
    });

    test("should delete a course as an instructor", async () => {
        const response = await request(app)
            .delete(`/api/v1/courses/${courseId}`)
            .set("Authorization", `Bearer ${instructorToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("msg", "Course deleted successfully");
    });

    test("should enroll a student as an admin", async () => {
        // First, create a course again for enrollment testing
        const courseResponse = await request(app)
            .post("/api/v1/courses")
            .set("Authorization", `Bearer ${instructorToken}`)
            .send({
                title: "Enrollment Test Course",
                duration: "4 weeks",
                description: "This course is for testing enrollment.",
                price: 50,
            });

        courseId = courseResponse.body.data.course._id; // Store new course ID

        const response = await request(app)
            .post(`/api/v1/courses/${courseId}/enroll`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                studentId: studentId,
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("msg", "Student enrolled successfully");
        expect(response.body.data.course.students).toContain(studentId.toString());
    });

    test("should return 400 if student is already enrolled", async () => {
        const response = await request(app)
            .post(`/api/v1/courses/${courseId}/enroll`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                studentId: studentId,
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("msg", "Student is already enrolled to course");
    });

    test("should update student enrollment status as an admin", async () => {
        const response = await request(app)
            .put(`/api/v1/courses/${courseId}/update`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                studentId: studentId,
                status: "completed",
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("msg", "Student enrollment updated");
        expect(response.body.data.updatedEnrollment.status).toBe("completed");
    });

    test("should remove a student from a course as an admin", async () => {
        const response = await request(app)
            .delete(`/api/v1/courses/${courseId}/students/${studentId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("msg", "Student removed from course successfully");
    });

    test("should prevent unauthorized user from enrolling a student", async () => {
        const response = await request(app)
            .post(`/api/v1/courses/${courseId}/enroll`)
            .set("Authorization", `Bearer ${studentToken}`) // A student trying to enroll someone
            .send({
                studentId: studentId,
            });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("msg", "Not an admin.");
    });
});