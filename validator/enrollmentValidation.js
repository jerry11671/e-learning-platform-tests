const Joi = require("joi");
const mongoose = require("mongoose");

const enrollmentSchema = Joi.object({
    student: Joi.string().custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            return helpers.error("any.invalid");
        }
        return value;
    }, "MongoDB ObjectId").required(),

    course: Joi.string().custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            return helpers.error("any.invalid");
        }
        return value;
    }, "MongoDB ObjectId"),

    status: Joi.string().valid("active", "completed", "dropped").default("active"),
});

module.exports = enrollmentSchema;
