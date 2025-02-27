const { StatusCodes } = require('http-status-codes');

const errorHandlerMiddleware = (err, req, res, next) => {
    let customError = {
        msg: err.message || 'Something went wrong, please try again later',
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        code: err.code || 500
    }

    if (err.name === 'CastError') {
        customError.msg = `No object with id: ${err.value._id} found`
        customError.statusCode = StatusCodes.NOT_FOUND
        customError.code = 404
    }


    return res.status(customError.statusCode).json({ status: false, msg: customError.msg, code: customError.code });
}



module.exports = errorHandlerMiddleware;                