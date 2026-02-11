import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { api } from '../services/api';
import '../css/Recommendations.css';

const ALGORITHMS = [
  { id: 'hybrid', label: 'Hybrid', desc: 'Combines content-based (TF-IDF) and collaborative filtering (SVD) for the most balanced results.' },
  { id: 'tfidf', label: 'TF-IDF', desc: 'Focuses on keywords in descriptions, genres, and overviews to find similar themes.' },
  { id: 'cosine', label: 'Cosine Similarity', desc: 'Mathematical angular distance between movie feature vectors based on metadata.' },
  { id: 'svd', label: 'SVD', desc: 'Collaborative filtering that predicts your preference based on patterns from thousands of other users.' },
];

export default function Recommendations() {
  const [searchParams] = useSearchParams();
  const [algorithm, setAlgorithm] = useState('hybrid');
  const [movieQuery, setMovieQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get user from localStorage
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('authUser'));
    } catch { return null; }
  }, []);

  const handleGetRecs = async () => {
    if (!movieQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    setRecs([]);

    try {
      // Search for the movie to get its ID
      const searchData = await api.getMovies({ q: movieQuery, limit: 1 });
      const movieMatch = searchData.movies?.[0] || searchData?.[0];

      if (!movieMatch) {
        setError(`Could not find a movie matching "${movieQuery}"`);
        setLoading(false);
        return;
      }

      setSelectedMovie(movieMatch);
      const movieId = movieMatch.id || movieMatch.movieId;

      // Get recommendations using the selected algorithm
      const recData = await api.getRecommendationsByAlgorithm(movieId, 10, algorithm);
      const results = recData.movies || recData || [];
      
      setRecs(results);
    } catch (err) {
      setError("Failed to fetch recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const activeAlgo = ALGORITHMS.find(a => a.id === algorithm);

  return (
    <div className="recs-page">
      <div className="recs-page__content">
        <div className="recs-page__header">
          <h1 className="recs-page__title">AI Recommendation Engine</h1>
          <p className="recs-page__subtitle">
            Discover your next favorite film using our advanced machine learning models.
          </p>
        </div>

        <div className="recs-panel">
          <div className="algo-tabs">
            {ALGORITHMS.map(algo => (
              <button
                key={algo.id}
                className={`algo-tab ${algorithm === algo.id ? 'algo-tab--active' : ''}`}
                onClick={() => setAlgorithm(algo.id)}
              >
                {algo.label}
              </button>
            ))}
          </div>

          <div className="algo-description">
            <div className="algo-description__badge">Active Model</div>
            <p><strong>{activeAlgo.label}:</strong> {activeAlgo.desc}</p>
          </div>

          <div className="movie-picker">
            <label className="movie-picker__label">START YOUR DISCOVERY WITH A MOVIE YOU LOVE</label>
            <div className="movie-picker__input-wrap">
              <input
                className="movie-picker__input"
                type="text"
                placeholder="e.g. Inception, The Dark Knight..."
                value={movieQuery}
                onChange={(e) => setMovieQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGetRecs()}
              />
              <button
                className="movie-picker__btn"
                onClick={handleGetRecs}
                disabled={loading || !movieQuery.trim()}
              >
                {loading ? 'Analyzing...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>

        {error && <div className="recs-error">{error}</div>}

        {loading ? (
          <div className="movie-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : recs.length > 0 ? (
          <div className="recs-results">
            <h2 className="section-title">
              Because you liked <span>{selectedMovie?.title}</span>
            </h2>
            <div className="movie-grid">
              {recs.map(movie => (
                <MovieCard key={movie.id || movie.movieId} movie={movie} showScore={true} />
              ))}
            </div>
          </div>
        ) : (
          !loading && (
            <div className="recs-empty">
              <div className="recs-empty__icon">✨</div>
              <h3>Ready to Explore?</h3>
              <p>Select an algorithm and enter a movie to let our AI do the magic.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}