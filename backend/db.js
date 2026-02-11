import { readFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');

// ──────────────────────────────────────────────────────────────
// In-memory cache
// ──────────────────────────────────────────────────────────────
let moviesCache = null;
let recommendationsCache = new Map(); // filename → data

// ──────────────────────────────────────────────────────────────
// Utility functions
// ──────────────────────────────────────────────────────────────
function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
    console.log(`Created data directory: ${DATA_DIR}`);
  }
}

/**
 * Load and parse JSON file safely
 * @param {string} filePath - full path to JSON file
 * @returns {any} parsed data or empty object/array on failure
 */
function safeLoadJson(filePath) {
  if (!existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return null;
  }

  try {
    const raw = readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    return data;
  } catch (err) {
    console.error(`Failed to parse JSON file: ${filePath}`);
    console.error(err.message);
    return null;
  }
}

// ──────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────
export function createDb() {
  ensureDataDir();
  // You can add more initialization here later (e.g. connect to real DB)
  console.log('Database layer initialized (file-based)');
}

/**
 * Get all movies from movies.json
 * @returns {Array<object>} array of movie objects
 */
export function loadMoviesFromJson() {
  if (moviesCache) return moviesCache;

  const jsonPath = path.join(DATA_DIR, 'movies.json');
  const data = safeLoadJson(jsonPath);

  if (!data || !Array.isArray(data)) {
    console.warn('movies.json is missing, empty or not an array');
    moviesCache = [];
    return [];
  }

  // Normalize movie IDs (support both id and movieId)
  moviesCache = data.map(movie => ({
    ...movie,
    id: movie.id ?? movie.movieId ?? null
  }));

  console.log(`Loaded ${moviesCache.length} movies from file`);
  return moviesCache;
}

/**
 * Get a single movie by ID
 * @param {string|number} id
 * @returns {object|null}
 */
export function getMovieByIdFromStore(id) {
  const movies = loadMoviesFromJson();
  if (!movies.length) return null;

  const numId = Number(id);
  if (isNaN(numId)) return null;

  return movies.find(m => m.id === numId) || null;
}

/**
 * Get multiple movies by array of IDs
 * @param {Array<string|number>} ids
 * @returns {Array<object>}
 */
export function getMoviesByIdsFromStore(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return [];

  const movies = loadMoviesFromJson();
  if (!movies.length) return [];

  const idSet = new Set(ids.map(Number).filter(n => !isNaN(n)));

  return movies.filter(m => idSet.has(m.id));
}

/**
 * Load recommendations from a JSON file (user_recommendations.json, etc.)
 * @param {string} filename
 * @returns {object} { userId: { collaborative: [...], hybrid: [...] } }
 */
export function loadRecommendations(filename = 'user_recommendations.json') {
  if (recommendationsCache.has(filename)) {
    return recommendationsCache.get(filename);
  }

  const filePath = path.join(DATA_DIR, filename);
  const data = safeLoadJson(filePath);

  if (!data || typeof data !== 'object') {
    console.warn(`Recommendations file invalid or empty: ${filename}`);
    const empty = {};
    recommendationsCache.set(filename, empty);
    return empty;
  }

  // Optional: normalize user IDs to strings
  const normalized = {};
  for (const [key, value] of Object.entries(data)) {
    normalized[String(key)] = value;
  }

  recommendationsCache.set(filename, normalized);
  console.log(`Loaded recommendations from ${filename} (${Object.keys(normalized).length} users)`);

  return normalized;
}

/**
 * Get all movies (convenience alias)
 */
export function getMoviesFromStore() {
  return loadMoviesFromJson();
}