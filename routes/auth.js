const express = require('express');
const router = express.Router()

const { register, login } = require('../controllers/auth')
const validate = require('../middlewares/validate');
const userSchema = require('../validator/registerSchema');
const loginSchema = require('../validator/loginSchema')


router.post('/register', validate(userSchema), register);
router.post('/login', validate(loginSchema), login);




module.exports = router;