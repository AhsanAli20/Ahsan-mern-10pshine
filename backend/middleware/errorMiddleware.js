const logger = require('../utils/logger'); 

// 404 (Not Found) Error Handler
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    // Log karein ki kaunsi URL nahi mili
    logger.warn({ 
        url: req.originalUrl, 
        method: req.method 
    }, '404 Not Found'); 
    next(error);
};

// General Error Handler
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    //Global Error ko Pino se log karna
    logger.error({ 
        message: err.message, 
        stack: err.stack,
        url: req.originalUrl,
        statusCode: statusCode,
        // user object auth middleware se attach hota hai
        user: req.user ? req.user._id : 'N/A' 
    }, 'Unhandled Error Encountered');

    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { notFound, errorHandler };