import express from 'express';
import cors from 'cors';
import { createDb } from './db.js';
import moviesRouter from './routes/movies.js';
import recommendationsRouter from './routes/recommendations.js';
import authRouter from './routes/auth.js';
import mlStatusRouter from './routes/ml_status.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ──────────────────────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────────────────────

// Allow requests from your frontend (adjust port if your frontend uses 3000, 5173, etc.)
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',    // common Vite port
    'http://localhost:4200',    // Angular default
    '*'                         // ← temporary for debugging
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Initialize database (assuming createDb sets up connection/pool)
createDb();

// ──────────────────────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────────────────────
app.use('/api', moviesRouter);
app.use('/api', recommendationsRouter);
app.use('/api', authRouter);
app.use('/api', mlStatusRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Movie Recommendation API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Catch-all for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});