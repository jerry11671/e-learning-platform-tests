const { StatusCodes } = require('http-status-codes');
const CustomAPIError = require('./custom-error');


class NotFoundError extends CustomAPIError {
    constructor(message) {
        super(message);
        this.statusCode = StatusCodes.NOT_FOUND;
        this.code = 404;
    }
}


module.exports = NotFoundError;