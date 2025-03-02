const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const { BadRequestError, UnauthenticatedError, NotFoundError } = require("../errors");

const sendEmail = require('../utils/sendEmail')


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

    // Email send funcionality
    if (role == 'instructor' || role == 'student') {
        sendEmail(user.email, "Confirmation Email", `Welcome to E-Learning platform, your ${role.charAt(0).toUpperCase() + role.slice(1)} account has been created`);
    }

    res.status(StatusCodes.CREATED).json({ status: true, code: 201, msg: 'Registration successful', data: { user, token: token } });
}


const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new BadRequestError("Please provide email and password to login");
    }

    const user = await User.findOne({ email: email });

    if (!user) {
        throw new NotFoundError("User not found");
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

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    let code = Math.floor((Math.random() * 10000));
    const user = await User.findOne({ email: email })

    if (!user) {
        throw new NotFoundError("User with this email does not exist");
    }

    const otp = new Otp({ user: user._id, code: code });
    sendEmail(email, 'Password Reset Otp', `Use this code to reset your password\n${code}`);
    await otp.save();
    return res.status(StatusCodes.OK).json({ status: true, code: 200, msg: "Check your email for otp code" });
}




module.exports = { register, login, forgotPassword };