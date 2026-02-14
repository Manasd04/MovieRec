import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import { HTTP_STATUS, MESSAGES } from '../config/constants.js';

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header
 */
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            error: MESSAGES.UNAUTHORIZED,
            message: 'No token provided'
        });
    }

    jwt.verify(token, config.jwtSecret, (err, user) => {
        if (err) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                error: MESSAGES.UNAUTHORIZED,
                message: 'Invalid or expired token'
            });
        }

        req.user = user;
        next();
    });
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    jwt.verify(token, config.jwtSecret, (err, user) => {
        if (!err) {
            req.user = user;
        }
        next();
    });
};
