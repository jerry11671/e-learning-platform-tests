const Joi = require("joi");
const mongoose = require("mongoose");

const updateCourseSchema = Joi.object({
    instructor: Joi.string().custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            return helpers.error("any.invalid");
        }
        return value;
    }, "MongoDB ObjectId").optional(),
    title: Joi.string().min(3).max(100).optional(),
    duration: Joi.number().integer().positive().optional(),
    description: Joi.string().allow("").optional(),
    price: Joi.number().positive().optional(),
});

module.exports = updateCourseSchema;

