
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MOVIES_CSV_PATH = path.join(__dirname, '../../ML/data/movies_cleaned.csv');
const RATINGS_CSV_PATH = path.join(__dirname, '../../ML/data/ratings.csv');
const OUTPUT_JSON_PATH = path.join(__dirname, '../data/movies.json'); // Overwriting existing for now

// Simple CSV Parser handling quotes
function parseCSVLine(line) {
    const values = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            values.push(currentValue.trim());
            currentValue = '';
        } else {
            currentValue += char;
        }
    }
    values.push(currentValue.trim());
    return values;
}

async function importData() {
    console.log('Reading movies CSV...');
    if (!fs.existsSync(MOVIES_CSV_PATH)) {
        console.error(`File not found: ${MOVIES_CSV_PATH}`);
        return;
    }

    const fileContent = fs.readFileSync(MOVIES_CSV_PATH, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');

    if (lines.length < 2) {
        console.error('CSV file is empty or missing header');
        return;
    }

    const headers = parseCSVLine(lines[0]);
    console.log('Headers:', headers);

    const movies = [];

    // Create header map for easier access
    const headerMap = {};
    headers.forEach((h, i) => { headerMap[h.trim()] = i; });

    // Ensure required columns exist (adjust names based on actual CSV)
    // Assuming: id, title, overview, genres, poster_path, vote_average, release_date
    // The user's CSV might vary, so we'll try to be flexible.

    for (let i = 1; i < lines.length; i++) {
        const row = parseCSVLine(lines[i]);
        if (row.length < headers.length) continue; // Skip malformed rows

        const movie = {};

        // Mapping - adjust indices or names based on actual CSV header inspection
        // Defaulting to common names if exact match fails
        // Mapping - adjusted to use index if ID column is missing
        if (headerMap['id'] !== undefined) {
            movie.id = row[headerMap['id']];
        } else {
            // Use 1-based index to align with content_based.json keys which start at "1"
            movie.id = i;
        }
        movie.title = row[headerMap['title']] || row[headerMap['original_title']] || 'Unknown Title';
        movie.overview = row[headerMap['overview']] || '';
        movie.genres = (row[headerMap['genres']] || '').split(',').map(g => g.trim()).filter(g => g);
        movie.poster_path = row[headerMap['poster_path']] || '';
        movie.backdrop_path = row[headerMap['backdrop_path']] || movie.poster_path; // Fallback

        // Release Year
        const releaseDate = row[headerMap['release_date']] || '';
        movie.release_year = releaseDate ? new Date(releaseDate).getFullYear() : null;
        if (!movie.release_year && row[headerMap['release_year']]) {
            movie.release_year = parseInt(row[headerMap['release_year']]);
        }

        // Ratings
        movie.vote_average = parseFloat(row[headerMap['vote_average']] || row[headerMap['rating']] || '0');
        movie.vote_count = parseInt(row[headerMap['vote_count']] || '0');

        // Only add valid movies
        if (movie.title && movie.poster_path) {
            movies.push(movie);
        }
    }

    console.log(`Parsed ${movies.length} movies.`);

    // Optional: Load ratings.csv to enrich data if needed, but for now relying on movies_cleaned.csv
    // which likely already has aggregated ratings.

    // Write to JSON
    fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(movies, null, 2));
    console.log(`Successfully wrote to ${OUTPUT_JSON_PATH}`);
}

importData();
