const Joi = require("joi");
const mongoose = require("mongoose");

const updateEnrollmentSchema = Joi.object({
    status: Joi.string().valid("active", "completed", "dropped").default("active").required(),
});

module.exports = updateEnrollmentSchema;
