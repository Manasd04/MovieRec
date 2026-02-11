import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/MovieCard.css';

export default function MovieCard({ movie, showScore = true }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isSeen, setIsSeen] = useState(false);

  // 1. Check if movie is already in watchlist or seen list on mount
  useEffect(() => {
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    const seenList = JSON.parse(localStorage.getItem('seenMovies') || '[]');
    
    // Support both 'id' and 'movieId'
    const id = movie.id || movie.movieId;
    
    const isSaved = watchlist.some(m => (m.id || m.movieId) === id);
    const isWatched = seenList.some(m => (m.id || m.movieId) === id);
    
    setIsFavorited(isSaved);
    setIsSeen(isWatched);
  }, [movie.id, movie.movieId]);

  // 2. Handle adding/removing from watchlist
  const toggleWatchlist = (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('authUser'));
    
    if (!user) {
      alert("Please log in to add movies to your watchlist.");
      window.location.href = '/login';
      return;
    }

    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    let updatedWatchlist;

    if (isFavorited) {
      updatedWatchlist = watchlist.filter(m => (m.id || m.movieId) !== (movie.id || movie.movieId));
    } else {
      updatedWatchlist = [...watchlist, movie];
    }

    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
    setIsFavorited(!isFavorited);
    window.dispatchEvent(new Event('watchlistUpdated'));
  };

  // 3. Handle 'Seen It' toggle
  const toggleSeen = (e) => {
    e.preventDefault();
    const seenList = JSON.parse(localStorage.getItem('seenMovies') || '[]');
    let updatedSeenList;

    if (isSeen) {
      updatedSeenList = seenList.filter(m => (m.id || m.movieId) !== (movie.id || movie.movieId));
    } else {
      updatedSeenList = [...seenList, movie];
    }

    localStorage.setItem('seenMovies', JSON.stringify(updatedSeenList));
    setIsSeen(!isSeen);
    window.dispatchEvent(new Event('seenUpdated'));
  };

  // 4. Normalize movie data for the UI
  const movieData = useMemo(() => {
    const poster = movie.poster_path
      ? movie.poster_path.startsWith('http')
        ? movie.poster_path
        : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null;

    const releaseYear = movie.release_date
      ? new Date(movie.release_date).getFullYear()
      : movie.release_year || '—';

    let genresList = [];
    if (Array.isArray(movie.genres)) {
      genresList = movie.genres.map(g => typeof g === 'object' ? g.name : g);
    } else if (typeof movie.genres === 'string') {
      genresList = movie.genres.split(',').map(g => g.trim());
    }

    return {
      poster,
      releaseYear,
      genresList,
      rating: movie.vote_average || movie.rating || 0,
      recommendationScore: showScore && movie.score != null ? movie.score : null
    };
  }, [movie, showScore]);

  return (
    <div className={`movie-card ${isSeen ? 'movie-card--seen' : ''}`}>
      {/* Action Buttons */}
      <div className="movie-card__actions">
        <button 
          className={`movie-card__action-btn ${isFavorited ? 'active-heart' : ''}`}
          onClick={toggleWatchlist}
          aria-label={isFavorited ? "Remove from watchlist" : "Add to watchlist"}
          title={isFavorited ? "In Watchlist" : "Add to Watchlist"}
        >
          <svg viewBox="0 0 24 24" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        <button 
          className={`movie-card__action-btn ${isSeen ? 'active-eye' : ''}`}
          onClick={toggleSeen}
          aria-label={isSeen ? "Mark as unwatched" : "Mark as watched"}
          title={isSeen ? "Watched" : "Mark as Watched"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>

      <Link to={`/movie/${movie.id || movie.movieId}`} className="movie-card__link">
        <div className="movie-card__poster-wrapper">
          {movieData.poster ? (
            <img
              className="movie-card__poster"
              src={movieData.poster}
              alt={`${movie.title} poster`}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" fill="%23161b22"><rect width="100%" height="100%" fill="%23161b22"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236366f1" font-size="72">🎬</text></svg>';
              }}
            />
          ) : (
            <div className="movie-card__poster-placeholder">
              <span>🎬</span>
            </div>
          )}

          <div className="movie-card__overlay">
            {movieData.rating > 0 && (
              <div className="movie-card__badge movie-card__rating-badge">
                ★ {movieData.rating.toFixed(1)}
              </div>
            )}
            {movieData.recommendationScore !== null && (
              <div className="movie-card__badge movie-card__score-badge">
                {Math.round(movieData.recommendationScore)}% Match
              </div>
            )}
          </div>
        </div>

        <div className="movie-card__info">
          <h3 className="movie-card__title" title={movie.title}>
            {movie.title}
          </h3>

          <div className="movie-card__meta">
            <span className="movie-card__year">{movieData.releaseYear}</span>
            {movieData.genresList.length > 0 && (
              <>
                <span className="movie-card__meta-dot">•</span>
                <span className="movie-card__genres">
                  {movieData.genresList.slice(0, 2).join(', ')}
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}