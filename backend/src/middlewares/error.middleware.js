import { HTTP_STATUS, MESSAGES } from '../config/constants.js';

/**
 * Error handling middleware
 * Catches all errors and sends a standardized error response
 */
export const errorHandler = (err, req, res, next) => {
    console.error('=== ERROR ===');
    console.error('Path:', req.method, req.originalUrl);
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('=============');

    const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = err.message || MESSAGES.INTERNAL_ERROR;

    res.status(statusCode).json({
        error: statusCode >= 500 ? MESSAGES.INTERNAL_ERROR : message,
        message: message,
        path: req.originalUrl,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({
        error: MESSAGES.NOT_FOUND,
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
};
