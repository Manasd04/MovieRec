import express from 'express';
import cors from 'cors';
import config from './config/env.js';
import { HTTP_STATUS, MESSAGES } from './config/constants.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { createDb } from './services/database.service.js';
import routes from './routes/index.js';

const app = express();

// ──────────────────────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────────────────────

// CORS
app.use(cors({
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
createDb();

// ──────────────────────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────────────────────

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(HTTP_STATUS.OK).json({
        ok: true,
        message: MESSAGES.SERVER_RUNNING,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv
    });
});

// API routes
app.use('/api', routes);

// ──────────────────────────────────────────────────────────────
// Error Handling
// ──────────────────────────────────────────────────────────────

// 404 handler (must be after all routes)
app.use('*', notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
