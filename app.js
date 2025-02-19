require('express-async-errors');
require('dotenv').config()

const express = require('express');
const app = express()

const PORT = process.env.PORT || 3000
const connectDB = require('./db/connect')

const { StatusCodes } = require('http-status-codes');

const cors = require('cors')

// routes
const authRouter = require('./routes/auth');
const courseRouter = require('./routes/courses');
const studentRouter = require('./routes/students');

// error handler middleware
const errorHandlerMiddleware = require('./middlewares/error-handler')
const notFoundMiddleware = require('./middlewares/not-found');
const authMiddleware = require('./middlewares/auth')

app.get('/healthcheck', (req, res) => {
    res.status(StatusCodes.OK).json({ status: 'active' });
})

// middlewares
app.use(express.json());
app.use(cors());
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/courses', authMiddleware, courseRouter);
app.use('/api/v1/students', authMiddleware, studentRouter);


app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
    await connectDB(process.env.MONGO_URI)
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    })
}



start();