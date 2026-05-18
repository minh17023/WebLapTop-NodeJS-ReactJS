const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    console.error(`[Error] ${err.message}`);

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Lỗi máy chủ nội bộ (Internal Server Error)',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorHandler;