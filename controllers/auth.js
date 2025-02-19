const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const { BadRequestError, UnauthenticatedError } = require("../errors");


const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!email || !name || !password || !role) {
        throw new BadRequestError("Please provide all fields");
    }

    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
        throw new BadRequestError("User with this email already exists");
    }

    const user = new User({ name, email, password, role });
    await user.save()
    const token = user.createJWT();

    res.status(StatusCodes.CREATED).json({ status: true, code: 201, msg: 'Registration successful', data: { user, token: token } });
}


const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new BadRequestError("Please provide email and password to login");
    }

    const user = await User.findOne({ email: email });

    if (!user) {
        throw new UnauthenticatedError("Invalid email");
    }

    const isPasswordCorrect = await user.comparePasswords(password);

    if (!isPasswordCorrect) {
        throw new UnauthenticatedError("Invalid password");
    }

    const token = user.createJWT();

    return res.status(StatusCodes.OK).json({
        status: true, code: 200, msg: 'Login successful', data: { user, token: token }
    });
}




module.exports = { register, login };