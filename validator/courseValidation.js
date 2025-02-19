const Joi = require("joi");
const mongoose = require("mongoose");

const courseSchema = Joi.object({
    instructor: Joi.string().custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            return helpers.error("any.invalid");
        }
        return value;
    }, "MongoDB ObjectId").required(),
    title: Joi.string().min(3).max(100).required(),
    duration: Joi.number().integer().positive().required(),
    description: Joi.string().allow("").optional(),
    price: Joi.number().positive().required(),
});

module.exports = courseSchema;

