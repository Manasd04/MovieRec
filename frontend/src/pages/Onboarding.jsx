import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Onboarding.css'; 

const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", 
  "Drama", "Family", "Fantasy", "History", "Horror", "Music", 
  "Mystery", "Romance", "Science Fiction", "Thriller", "War", "Western"
];

export default function Onboarding() {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const navigate = useNavigate();

  const toggleGenre = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleContinue = () => {
    // Save to localStorage (simulating user profile)
    localStorage.setItem('userPreferences', JSON.stringify({ genres: selectedGenres }));
    // In a real app, we'd POST to /api/users/preferences
    
    navigate('/');
  };

  return (
    <div className="onboarding">
      <div className="onboarding__container">
        <h1 className="onboarding__title">Welcome to MovieApp</h1>
        <p className="onboarding__subtitle">
          Select a few genres you love to help us personalize your recommendations.
        </p>

        <div className="genre-grid">
          {GENRES.map(genre => (
            <button
              key={genre}
              className={`genre-card ${selectedGenres.includes(genre) ? 'selected' : ''}`}
              onClick={() => toggleGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="onboarding__actions">
          <button 
            className="btn btn--primary btn--large"
            disabled={selectedGenres.length === 0}
            onClick={handleContinue}
          >
            Start Watching
          </button>
          <button 
            className="btn btn--text"
            onClick={() => navigate('/')}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
