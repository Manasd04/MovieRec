/**
 * Application Constants
 */

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};

export const MESSAGES = {
    SERVER_RUNNING: 'Movie Recommendation API is running',
    NOT_FOUND: 'Resource not found',
    INTERNAL_ERROR: 'Internal server error',
    INVALID_CREDENTIALS: 'Invalid credentials',
    UNAUTHORIZED: 'Unauthorized access',
};

export const PAGINATION = {
    DEFAULT_LIMIT: 24,
    MAX_LIMIT: 100,
    DEFAULT_OFFSET: 0,
};

export const ML_ALGORITHMS = {
    HYBRID: 'hybrid',
    CONTENT: 'content',
    COLLABORATIVE: 'collaborative',
    TFIDF: 'tfidf',
    COSINE: 'cosine',
    SVD: 'svd',
};
