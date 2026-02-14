import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Environment Configuration
 */
export const config = {
    // Server
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017',
    dbName: process.env.DB_NAME || 'movie_recommendation',

    // JWT
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

    // CORS
    corsOrigins: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',')
        : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4200'],

    // ML Models
    mlDataPath: process.env.ML_DATA_PATH || './data',
};

export default config;
