const Joi = require("joi");
const mongoose = require("mongoose");

const courseSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    duration: Joi.number().integer().positive().required(),
    description: Joi.string().allow("").optional(),
    price: Joi.number().positive().required(),
});

module.exports = courseSchema;

