import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, User, LogOut, Menu, X } from 'lucide-react';
import '../css/Navbar.css';

export default function Navbar({ user = null }) {
  const [query, setQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [watchlistCount, setWatchlistCount] = useState(0); 
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Navbar styling change on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Watchlist Badge Logic
  useEffect(() => {
    const updateCount = () => {
      const saved = JSON.parse(localStorage.getItem('watchlist') || '[]');
      setWatchlistCount(saved.length);
    };

    updateCount();
    window.addEventListener('watchlistUpdated', updateCount);
    return () => window.removeEventListener('watchlistUpdated', updateCount);
  }, []);

  // 3. Search handling
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    window.location.href = '/login'; 
  };

  return (
    <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__container">
        
        {/* LOGO */}
        <Link to="/" className="navbar__logo">
          Movie<span>Rec</span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="navbar__links">
          <NavLink to="/" end className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>Home</NavLink>
          <NavLink to="/recommendations" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>For You</NavLink>
          <NavLink to="/search" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>Browse</NavLink>
          <NavLink to="/watchlist" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>My List</NavLink>
        </div>

        {/* RIGHT SECTION: Search + Profile + Mobile Toggle */}
        <div className="navbar__right">
          
          {/* Search Bar - Desktop */}
          <form className="navbar__search desktop-only" onSubmit={handleSearch}>
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Titles, people, genres"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </form>

          {/* Watchlist Icon (Mobile/Tablet usually, but kept for desktop too as quick access) */}
          {/* Watchlist Icon (Desktop) */}
          <Link to="/watchlist" className="navbar__icon-link" aria-label="Watchlist" title="Watchlist">
            <Heart size={24} strokeWidth={2} />
            {watchlistCount > 0 && <span className="badge">{watchlistCount}</span>}
          </Link>

          {user ? (
            <div className="navbar__user">
              <Link to="/profile" className="user-avatar-link">
                {user.name ? (
                  <div className="user-avatar">{user.name[0].toUpperCase()}</div>
                ) : (
                  <User size={22} />
                )}
              </Link>
              <button onClick={handleLogout} className="logout-btn" title="Sign out">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-text">Sign In</Link>
              <Link to="/signup" className="btn-primary">Sign Up</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <form className="mobile-search" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => setQuery('')}
                aria-label="Clear"
              >
                <X size={18} />
              </button>
            )}
            <button type="submit"><Search size={20} /></button>
          </form>
          <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</NavLink>
          <NavLink to="/recommendations" onClick={() => setIsMobileMenuOpen(false)}>For You</NavLink>
          <NavLink to="/search" onClick={() => setIsMobileMenuOpen(false)}>Browse</NavLink>
          <NavLink to="/watchlist" onClick={() => setIsMobileMenuOpen(false)}>My List</NavLink>
        </div>
      )}
    </nav>
  );
}
