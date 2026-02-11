import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ──────────────────────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/';
const DB_NAME = 'movie_recommendation';
const MOVIES_FILE = path.join(__dirname, '..', 'data', 'movies.json');

// ──────────────────────────────────────────────────────────────
// Main import function
// ──────────────────────────────────────────────────────────────
async function importMoviesToMongoDB() {
    console.log('═'.repeat(70));
    console.log('MongoDB Movie Data Import');
    console.log('═'.repeat(70));
    console.log();

    let client;

    try {
        // Load movies from JSON file
        console.log(`📂 Loading movies from: ${MOVIES_FILE}`);
        const moviesData = JSON.parse(readFileSync(MOVIES_FILE, 'utf8'));

        if (!Array.isArray(moviesData)) {
            throw new Error('Movies data is not an array');
        }

        console.log(`✓ Loaded ${moviesData.length} movies from file`);
        console.log();

        // Connect to MongoDB
        console.log(`🔌 Connecting to MongoDB: ${MONGO_URI}`);
        client = new MongoClient(MONGO_URI);
        await client.connect();
        console.log('✓ Connected to MongoDB');
        console.log();

        const db = client.db(DB_NAME);
        const moviesCollection = db.collection('movies');

        // Clear existing data (optional - comment out to append instead)
        console.log('🗑️  Clearing existing movies collection...');
        await moviesCollection.deleteMany({});
        console.log('✓ Collection cleared');
        console.log();

        // Transform data for MongoDB
        console.log('🔄 Transforming movie data...');
        const moviesForMongo = moviesData.map(movie => ({
            _id: movie.id || movie.movieId,
            movieId: movie.id || movie.movieId,
            title: movie.title || '',
            overview: movie.overview || movie.description || '',
            genres: movie.genres || '',
            releaseDate: movie.releaseDate || movie.release_date || '',
            posterPath: movie.posterPath || movie.poster_path || '',
            backdropPath: movie.backdropPath || movie.backdrop_path || '',
            voteAverage: parseFloat(movie.voteAverage || movie.vote_average || 0),
            voteCount: parseInt(movie.voteCount || movie.vote_count || 0, 10),
            popularity: parseFloat(movie.popularity || 0),
            runtime: parseInt(movie.runtime || 0, 10),
            // Additional fields for ML
            genresList: (movie.genres || '').split(',').map(g => g.trim()).filter(Boolean),
            year: movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null,
        }));

        console.log('✓ Data transformed');
        console.log();

        // Insert movies
        console.log('💾 Inserting movies into MongoDB...');
        const result = await moviesCollection.insertMany(moviesForMongo, { ordered: false });
        console.log(`✓ Inserted ${result.insertedCount} movies`);
        console.log();

        // Create indexes for performance
        console.log('🔍 Creating indexes...');
        await moviesCollection.createIndex({ title: 'text', overview: 'text' });
        await moviesCollection.createIndex({ movieId: 1 });
        await moviesCollection.createIndex({ genres: 1 });
        await moviesCollection.createIndex({ voteAverage: -1 });
        console.log('✓ Indexes created');
        console.log();

        // Verify import
        const count = await moviesCollection.countDocuments();
        console.log('═'.repeat(70));
        console.log(`✅ Import completed successfully!`);
        console.log(`   Total movies in database: ${count}`);
        console.log('═'.repeat(70));

    } catch (error) {
        console.error('❌ Error during import:');
        console.error(error.message);
        console.error();
        console.error('Stack trace:');
        console.error(error.stack);
        process.exit(1);
    } finally {
        if (client) {
            await client.close();
            console.log();
            console.log('🔌 MongoDB connection closed');
        }
    }
}

// ──────────────────────────────────────────────────────────────
// Run import
// ──────────────────────────────────────────────────────────────
importMoviesToMongoDB();
