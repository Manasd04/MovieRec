import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import '../css/MovieRow.css';

export default function MovieRow({ title, fetchUrl, isLargeRow = false, movies = [] }) {
  const rowRef = useRef(null);
  const [rowMovies, setRowMovies] = useState(movies);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // If fetchUrl is provided, we would fetch here. 
  // For now, we assume 'movies' are passed in or we filter from a global list if needed.
  // This supports both direct prop passing (from Homepage) or internal fetching later.

  useEffect(() => {
    if (movies.length > 0) {
      setRowMovies(movies);
    }
  }, [movies]);

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth / 2 
        : scrollLeft + clientWidth / 2;
      
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Check scroll position to toggle arrows
  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 0);
      // Give a small buffer (1px) for calculation errors
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1); 
    }
  };

  useEffect(() => {
    const row = rowRef.current;
    if (row) {
      row.addEventListener('scroll', checkScroll);
      // Initial check
      checkScroll();
      return () => row.removeEventListener('scroll', checkScroll);
    }
  }, [rowMovies]);

  if (!rowMovies || rowMovies.length === 0) return null;

  return (
    <div className="movie-row">
      <h2 className="movie-row__title">{title}</h2>
      
      <div className="movie-row__container">
        {showLeftArrow && (
          <div 
            className="movie-row__arrow movie-row__arrow--left" 
            onClick={() => handleScroll('left')}
          >
            <ChevronLeft size={40} />
          </div>
        )}

        <div className="movie-row__posters" ref={rowRef}>
          {rowMovies.map((movie) => (
            <div key={movie.id || movie.movieId} className={`movie-row__poster-wrapper ${isLargeRow ? 'large' : ''}`}>
              <MovieCard movie={movie} showScore={false} />
            </div>
          ))}
        </div>

        {showRightArrow && (
          <div 
            className="movie-row__arrow movie-row__arrow--right" 
            onClick={() => handleScroll('right')}
          >
            <ChevronRight size={40} />
          </div>
        )}
      </div>
    </div>
  );
}
