const { BadRequestError } = require('../errors')

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            throw new BadRequestError(error.details.map(err => err.message));
        }

        next();
    };
};

module.exports = validate;
