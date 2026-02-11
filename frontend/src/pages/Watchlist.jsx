import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Film, TrendingUp, Clock } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import '../css/watchlist.css'; 

export default function Watchlist() {
  const [movies, setMovies] = useState([]);
  const [stats, setStats] = useState({ total: 0, genres: new Set() });

  // Load watchlist from local storage
  const loadWatchlist = () => {
    const saved = JSON.parse(localStorage.getItem('watchlist') || '[]');
    setMovies(saved);
    
    // Calculate stats
    const genreSet = new Set();
    saved.forEach(movie => {
      if (movie.genres) {
        movie.genres.split(' ').forEach(g => genreSet.add(g));
      }
    });
    setStats({ total: saved.length, genres: genreSet });
  };

  useEffect(() => {
    loadWatchlist();

    // Listen for the custom event created in MovieCard.jsx
    window.addEventListener('watchlistUpdated', loadWatchlist);
    
    return () => {
      window.removeEventListener('watchlistUpdated', loadWatchlist);
    };
  }, []);

  return (
    <div className="watchlist-page">
      <div className="watchlist-hero">
        <div className="watchlist-hero__content">
          <div className="watchlist-hero__icon">
            <Heart size={48} fill="currentColor" />
          </div>
          <h1 className="watchlist-hero__title">My Watchlist</h1>
          <p className="watchlist-hero__subtitle">
            Your personal collection of must-watch movies
          </p>
        </div>
      </div>

      {movies.length > 0 ? (
        <>
          <div className="watchlist-stats">
            <div className="stat-card">
              <Film size={24} />
              <div className="stat-card__content">
                <div className="stat-card__value">{stats.total}</div>
                <div className="stat-card__label">Movies Saved</div>
              </div>
            </div>
            <div className="stat-card">
              <TrendingUp size={24} />
              <div className="stat-card__content">
                <div className="stat-card__value">{stats.genres.size}</div>
                <div className="stat-card__label">Unique Genres</div>
              </div>
            </div>
            <div className="stat-card">
              <Clock size={24} />
              <div className="stat-card__content">
                <div className="stat-card__value">{Math.round(stats.total * 2)}h</div>
                <div className="stat-card__label">Watch Time</div>
              </div>
            </div>
          </div>

          <div className="watchlist-header">
            <h2 className="watchlist-header__title">
              All Movies <span className="count-badge">{movies.length}</span>
            </h2>
            <Link to="/search" className="btn btn--outline">
              <Film size={18} />
              Browse More
            </Link>
          </div>

          <div className="watchlist-grid">
            {movies.map((movie, index) => (
              <div 
                key={movie.id || movie.movieId} 
                className="watchlist-item"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="watchlist-empty">
          <div className="watchlist-empty__icon">
            <Heart size={80} strokeWidth={1.5} />
          </div>
          <h3 className="watchlist-empty__title">Your watchlist is empty</h3>
          <p className="watchlist-empty__desc">
            Start building your personal collection by adding movies you want to watch.
            <br />
            Click the <Heart size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> icon on any movie to save it here!
          </p>
          <div className="empty-actions">
            <Link to="/" className="btn btn--primary">
              <Film size={18} />
              Explore Popular Movies
            </Link>
            <Link to="/recommendations" className="btn btn--outline">
              <TrendingUp size={18} />
              Get Recommendations
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}