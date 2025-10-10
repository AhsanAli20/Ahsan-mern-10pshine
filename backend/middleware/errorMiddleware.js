// 404 (Not Found) Error Handler
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error); // Next() mein error pass karne se woh errorHandler mein chala jata hai
};

// General Error Handler
const errorHandler = (err, req, res, next) => {
    // Agar status code 200 hai (yaani success tha lekin error throw hua), to 500 set karein
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    res.json({
        message: err.message,
        // Production mode mein stack trace nahi dikhana chahiye (security ke liye)
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { notFound, errorHandler };