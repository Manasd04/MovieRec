import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMovies, getTrendingMovies } from '../services/api';
import MovieRow from '../components/MovieRow';
import { Play, Info } from 'lucide-react';
import '../css/Homepage.css';

export default function Homepage() {
  const [heroMovies, setHeroMovies] = useState([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0); // Triggers animation restart
  
  // Restored State
  const [trending, setTrending] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [horrorMovies, setHorrorMovies] = useState([]);
  const [romanceMovies, setRomanceMovies] = useState([]);
  const [scifiMovies, setScifiMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Genres for chips
  const genres = [
    "Action", "Comedy", "Drama", "Sci-Fi", "Horror", "Romance", "Thriller", "Fantasy", "Animation"
  ];

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        const [
          trendingData,
          actionData,
          comedyData,
          horrorData,
          romanceData,
          scifiData
        ] = await Promise.all([
          getTrendingMovies(),
          getMovies('', 'Action'),
          getMovies('', 'Comedy'),
          getMovies('', 'Horror'),
          getMovies('', 'Romance'),
          getMovies('', 'Science Fiction')
        ]);

        const trends = trendingData.movies || [];
        setTrending(trends);
        
        // Take top 5 for hero carousel
        setHeroMovies(trends.slice(0, 5));

        setActionMovies(actionData.movies || []);
        setComedyMovies(comedyData.movies || []);
        setHorrorMovies(horrorData.movies || []);
        setRomanceMovies(romanceData.movies || []);
        setScifiMovies(scifiData.movies || []);

      } catch (error) {
        console.error("Failed to load homepage data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Carousel Logic
  useEffect(() => {
    if (heroMovies.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentHeroIndex(prev => (prev + 1) % heroMovies.length);
      setFadeKey(prev => prev + 1);
    }, 8000); // 8 seconds per slide

    return () => clearInterval(interval);
  }, [heroMovies]);

  const currentMovie = heroMovies[currentHeroIndex];

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="homepage">
      
      {/* HERO SECTION */}
      {/* HERO SECTION */}
      {currentMovie && (
        <div className="hero">
          {/* Background Layer with Ken Burns Effect */}
          <div 
            key={fadeKey}
            className="hero__background"
            style={{
              backgroundImage: `url(${currentMovie.backdrop_path || currentMovie.poster_path})`
            }}
          />
          
          {/* Netflix Scrim - Gradient Overlay */}
          <div className="hero__scrim" />

          <div className="hero__content">
            <h1 className="hero__title">{currentMovie.title}</h1>
            <p className="hero__overview fade-in-up">
              {currentMovie.overview?.length > 150 
                ? currentMovie.overview.substring(0, 150) + "..." 
                : currentMovie.overview}
            </p>
            <div className="hero__buttons fade-in-up delay-200">
              <Link to={`/movie/${currentMovie.id || currentMovie.movieId}`} className="btn hero-btn btn--play">
                <Play fill="currentColor" size={24} /> Play
              </Link>
              <Link to={`/movie/${currentMovie.id || currentMovie.movieId}`} className="btn hero-btn btn--info">
                <Info size={24} /> More Info
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* GENRE NAV */}
      <div className="genre-scroll">
        {genres.map((genre) => (
          <Link key={genre} to={`/search?genre=${genre}`} className="genre-chip">
            {genre}
          </Link>
        ))}
      </div>

      {/* MOVIE ROWS */}
      <div className="rows-container">
        <MovieRow title="Trending Now" movies={trending} isLargeRow />
        <MovieRow title="Action Thrillers" movies={actionMovies} />
        <MovieRow title="Comedies" movies={comedyMovies} />
        <MovieRow title="Scare Tactics" movies={horrorMovies} />
        <MovieRow title="Romance" movies={romanceMovies} />
        <MovieRow title="Sci-Fi & Fantasy" movies={scifiMovies} />
      </div>
    </div>
  );
}