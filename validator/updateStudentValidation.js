const Joi = require("joi");
const mongoose = require("mongoose");

const updateStudentSchema = Joi.object({
    studentId: Joi.string().custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            return helpers.error("any.invalid");
        }
        return value;
    }, "MongoDB ObjectId").required(),

    status: Joi.string().valid("active", "completed", "dropped").default("active"),
});

module.exports = updateStudentSchema;
