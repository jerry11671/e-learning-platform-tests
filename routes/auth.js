const express = require('express');
const router = express.Router()

const { register, login, forgotPassword } = require('../controllers/auth')
const validate = require('../middlewares/validate');
const userSchema = require('../validator/registerSchema');
const loginSchema = require('../validator/loginSchema')
const forgotPasswordSchema = require('../validator/forgotPasswordValidation')


router.post('/register', validate(userSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword)




module.exports = router;