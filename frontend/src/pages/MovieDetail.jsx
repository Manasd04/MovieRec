import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import MovieCard from '../components/MovieCard';
import '../css/MovieDetail.css';

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // To detect if we came from somewhere specific if needed
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    // Scroll to top whenever the ID changes
    window.scrollTo(0, 0);

    const fetchMovieData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [movieData, recData] = await Promise.all([
          api.getMovieById(id),
          api.getRecommendationsByMovie(id, 8).catch(() => ({ movies: [] }))
        ]);

        const movieObj = movieData.movie || movieData;
        if (!movieObj || Object.keys(movieObj).length === 0) {
          throw new Error('Movie details not found');
        }

        setMovie(movieObj);
        setRecommendations(recData.movies || recData || []);
        
        // Check if in watchlist
        const saved = JSON.parse(localStorage.getItem('watchlist') || '[]');
        const exists = saved.some(m => (m.id || m.movieId) === (movieObj.id || movieObj.movieId));
        setInWatchlist(exists);

      } catch (err) {
        console.error('[MovieDetail] Error:', err);
        setError(err.message || 'Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  const toggleWatchlist = () => {
    const saved = JSON.parse(localStorage.getItem('watchlist') || '[]');
    let newWatchlist;

    if (inWatchlist) {
      newWatchlist = saved.filter(m => (m.id || m.movieId) !== (movie.id || movie.movieId));
    } else {
      newWatchlist = [...saved, movie];
    }

    localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
    setInWatchlist(!inWatchlist);
    
    // Dispatch event for Navbar and other components
    window.dispatchEvent(new Event('watchlistUpdated'));
  };

  if (loading) {
    return (
      <div className="movie-detail__loading">
        <div className="movie-detail__loading-spinner" />
        <p>Fetching movie details...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-detail__error">
        <h2>Oops!</h2>
        <p>{error || 'Movie not found.'}</p>
        <Link to="/" className="btn btn--outline">← Back to home</Link>
      </div>
    );
  }

  // Data normalization
  const posterUrl = movie.poster_path
    ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`)
    : '/images/placeholder-poster.svg';

  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` 
    : null;

  const genres = Array.isArray(movie.genres) 
    ? movie.genres.map(g => typeof g === 'object' ? g.name : g).join(' · ')
    : 'No genres listed';

  return (
    <div className="movie-detail">
      {/* Cinematic Backdrop Overlay */}
      {backdropUrl && (
        <div 
          className="movie-detail__backdrop" 
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
      )}

      <div className="movie-detail__nav">
        <button onClick={() => navigate(-1)} className="movie-detail__back-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
      </div>

      <div className="movie-detail__hero">
        <div className="movie-detail__poster-wrap">
          <img
            className="movie-detail__poster"
            src={posterUrl}
            alt={movie.title}
          />
        </div>

        <div className="movie-detail__info">
          <h1 className="movie-detail__title">{movie.title}</h1>

          <div className="movie-detail__meta">
            <span className="movie-detail__rating">
              ★ {movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}
            </span>
            <span className="movie-detail__dot">•</span>
            {genres !== 'No genres listed' ? (
              <span>{genres}</span>
            ) : (
             <span className="movie-detail__genre-tag">Genre Info Unavailable</span>
            )}
            <span className="movie-detail__dot">•</span>
            <span>
              {movie.release_year || 
               (movie.release_date ? new Date(movie.release_date).getFullYear() : 'Year Unknown')}
            </span>
            {movie.runtime > 0 && (
              <>
                <span className="movie-detail__dot">•</span>
                <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
              </>
            )}
          </div>

          <div className="movie-detail__actions">
            <button 
              className={`btn ${inWatchlist ? 'btn--outline' : 'btn--primary'}`}
              onClick={toggleWatchlist}
            >
              {inWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
            </button>
            <a 
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' trailer')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn--outline"
            >
              ▶ Watch Trailer
            </a>
          </div>

          {movie.overview && (
            <div className="movie-detail__overview-section">
              <h3>Overview</h3>
              <p className="movie-detail__overview">{movie.overview}</p>
            </div>
          )}
        </div>
      </div>

      <section className="movie-detail__section">
        <h2 className="movie-detail__section-title">
          Similar movies
        </h2>
        
        {recommendations.length > 0 ? (
          <div className="movie-detail__rec-cards">
            {recommendations.map((m) => (
              <MovieCard key={m.id || m.movieId} movie={m} />
            ))}
          </div>
        ) : (
          <div className="movie-detail__empty-state">
            <p className="movie-detail__empty-text">Our engine couldn't find similar movies for this title.</p>
          </div>
        )}
      </section>
    </div>
  );
}