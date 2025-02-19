# e-learning-platform-api
A Node.js &amp; Express-based API for managing online courses and student enrollments. Features include user authentication, course management, student enrollments, and MongoDB Atlas integration. Deployed on Render, documented with Postman.

## Features
- User authentication (Registration & Login)
- Course creation and management
- Student self-enrollment and removal from courses
- Admin management of course enrollments

## Technologies Used
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT Authentication

## Setup Instructions
### Prerequisites
Ensure you have the following installed:
- Node.js
- MongoDB

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/jerry11671/e-learning-platform-api.git
   cd e-learning-platform-api
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add:
   ```env
   PORT=3000
   MONGO_URI=<your_mongodb_connection_string>
   JWT_SECRET=<your_secret_key>
   JWT_LIFETIME=<your-jwt-lifetime>
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints
### Authentication
#### Register
```http
POST /api/v1/auth/register
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```
**Response:**
```json
{
  "status": true,
  "code": 201,
  "msg": "Registration successful",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

#### Login
```http
POST /api/v1/auth/login
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Courses
#### Get All Courses
```http
GET /api/v1/courses
```

#### Create Course (Admin Only)
```http
POST /api/v1/courses
```
**Request Body:**
```json
{
  "instructor": "60f7a6c5d3e0a2b5d4a3b6c7",
  "title": "Node.js Basics",
  "duration": 6,
  "description": "Introduction to Node.js",
  "price": 100
}
```

#### Enroll in a Course (Student)
```http
POST /api/v1/students/:course_id/enroll-course
```

#### Remove Enrollment (Student)
```http
DELETE /api/v1/students/:course_id/remove-course
```

#### Enroll a Student (Admin Only)
```http
POST /api/v1/courses/:course_id/enroll
```
**Request Body:**
```json
{
  "studentId": "60f7a6c5d3e0a2b5d4a3b6c7"
}
```

#### Remove a Student from a Course (Admin Only)
```http
DELETE /api/v1/courses/:course_id/students/:student_id
```
**Response:**
```json
{
  "status": true,
  "msg": "Student removed from course successfully"
}
```

## Error Handling
The API follows structured error handling, returning responses in the format:
```json
{
  "status": false,
  "msg": "Error message here",
  "code": "Error code here"
}
```
## Postman Published Link
https://documenter.getpostman.com/view/33130441/2sAYXCmeig

## Conclusion
This API allows for efficient course management with role-based access control. More features will be added to it such as progress tracking

