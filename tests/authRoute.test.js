require('dotenv').config()
const request = require("supertest");
const mongoose = require("mongoose");
const User = require("../models/User");

const app = require("../app");


describe("POST /api/v1/auth/register", () => {
    beforeAll(async () => {
        // Connect to a database
        await mongoose.connect(process.env.MONGO_URI);
    });

    afterEach(async () => {
        // Clean up database after each test    
        await User.deleteMany({});
    }, 100000);

    afterAll(async () => {
        // Close database connection after all tests
        await mongoose.connection.close();
    });

    test("should register a new user with valid data", async () => {
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send({
                name: "John Doe",
                email: "johndoe@example.com",
                password: "securepassword",
                role: "admin"
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("status", true);
        expect(response.body).toHaveProperty("msg", "Registration successful");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("token");
    });

    test("should return 400 for missing fields", async () => {
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send({
                email: "johndoe@example.com",
                password: "securepassword",
                role: "admin"
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("status", false);
        expect(response.body).toHaveProperty("msg", "\"name\" is required");
    });

    test("should return 400 if email is already in use", async () => {
        // Create a user before running this test
        await User.create({
            name: "John Doe",
            email: "johndoe@example.com",
            password: "securepassword",
            role: "admin"
        });

        const response = await request(app)
            .post("/api/v1/auth/register")
            .send({
                name: "John Doe",
                email: "johndoe@example.com",
                password: "securepassword",
                role: "admin"
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("status", false);
        expect(response.body).toHaveProperty("msg", "User with this email already exists");

    });
});


describe("POST /api/v1/auth/login", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);

        // Create a test user
        await User.create({
            name: "John Doe",
            email: "johndoe@example.com",
            password: "securepassword",
            role: "admin",
        });
    });

    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    test("should login successfully with valid credentials", async () => {
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: "johndoe@example.com",
                password: "securepassword",
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("msg", "Login successful");
        expect(response.body.data).toHaveProperty("token");
    });

    test("should return 400 for missing fields", async () => {
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: "johndoe@example.com",
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("msg", "\"password\" is required");
    });

    test("should return 401 for invalid password", async () => {
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: "johndoe@example.com",
                password: "wrongpassword",
            });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("msg", "Invalid password");
    });

    test("should return 404 if user does not exist", async () => {
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: "nonexistent@example.com",
                password: "password123",
            });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("msg", "User not found");
    });
});

