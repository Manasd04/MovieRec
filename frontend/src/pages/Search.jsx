import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { api } from '../services/api';
import '../css/Search.css';

const GENRES = ["Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery", "Romance", "Science Fiction", "TV Movie", "Thriller", "War", "Western"];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || '');
  const [sortBy, setSortBy] = useState('relevance');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(!!searchParams.get('q'));
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const g = searchParams.get('genre') || '';
    setQuery(q);
    setGenre(g);
    fetchResults(q, g);
  }, [searchParams]);

  const fetchResults = async (q, g) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMovies({ q, genre: g, limit: 20 });
      const movieList = data.movies || data.results || data || [];
      setResults(movieList);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to load search results.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateParams(query, genre);
  };

  const updateParams = (q, g) => {
    const params = {};
    if (q.trim()) params.q = q.trim();
    if (g) params.genre = g;
    setSearchParams(params);
  };

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'rating') return (b.vote_average || 0) - (a.vote_average || 0);
    if (sortBy === 'year') {
      const yearA = a.release_year || new Date(a.release_date).getFullYear() || 0;
      const yearB = b.release_year || new Date(b.release_date).getFullYear() || 0;
      return yearB - yearA;
    }
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  return (
    <div className="search-page">
      <header className="search-page__header">
        <h1 className="search-page__title">Explore <span>Movies</span></h1>
        <p className="search-page__subtitle">Browse thousands of titles by title, genre, or rating.</p>
      </header>

      <form className="search-bar" onSubmit={handleSubmit}>
        <div className="search-bar__main">
          <input
            className="search-bar__input"
            type="text"
            placeholder="Search by title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <svg className="search-bar__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <div className="search-bar__filters">
          <select
            className="search-bar__select"
            value={genre}
            onChange={(e) => {
              setGenre(e.target.value);
              updateParams(query, e.target.value);
            }}
          >
            <option value="">All Genres</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <select
            className="search-bar__select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="relevance">Sort by: Relevance</option>
            <option value="rating">Sort by: Top Rated</option>
            <option value="year">Sort by: Newest</option>
            <option value="title">Sort by: A-Z</option>
          </select>

          <button className="search-bar__btn" type="submit">Search</button>
        </div>
      </form>

      {error && <div className="search-error">{error}</div>}

      {loading ? (
        <div className="movie-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : sortedResults.length > 0 ? (
        <div className="search-results">
          <p className="search-results__count">Found {sortedResults.length} movies</p>
          <div className="movie-grid">
            {sortedResults.map(movie => (
              <MovieCard key={movie.id || movie.movieId} movie={movie} />
            ))}
          </div>
        </div>
      ) : !loading && (
        <div className="search-empty">
          <div className="search-empty__icon">🎬</div>
          <h3>No matches found</h3>
          <p>We couldn't find any movies matching "{query}". Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
}