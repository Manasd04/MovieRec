import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../css/Layout.css';

export default function Layout() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [watchlistCount, setWatchlistCount] = useState(0);

  // Sync user and watchlist state
  const syncState = () => {
    try {
      // Sync User
      const storedUser = localStorage.getItem('authUser');
      setUser(storedUser ? JSON.parse(storedUser) : null);

      // Sync Watchlist Count
      const savedWatchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
      setWatchlistCount(savedWatchlist.length);
    } catch (err) {
      console.error('Failed to sync state', err);
    }
  };

  useEffect(() => {
    syncState();

    // Listen for custom auth and watchlist events
    window.addEventListener('authChange', syncState);
    window.addEventListener('watchlistUpdated', syncState);
    // Listen for storage changes across tabs
    window.addEventListener('storage', syncState);

    return () => {
      window.removeEventListener('authChange', syncState);
      window.removeEventListener('watchlistUpdated', syncState);
      window.removeEventListener('storage', syncState);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setUser(null);
    setIsMenuOpen(false);
    // Trigger authChange to notify other components
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="layout">
      <header className="header">
        <div className="header__container">
          <NavLink to="/" className="logo" onClick={closeMenu}>
            <span className="logo__icon">🎬</span>
            <span className="logo__text">
              Movie<span>Rec</span>
            </span>
          </NavLink>

          <button 
            className={`mobile-toggle ${isMenuOpen ? 'mobile-toggle--active' : ''}`} 
            onClick={toggleMenu}
            aria-label="Toggle Navigation"
          >
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
          </button>

          <div className={`header__right ${isMenuOpen ? 'header__right--open' : ''}`}>
            <nav className="nav">
              <NavLink to="/" end className="nav__link" onClick={closeMenu}>
                Home
              </NavLink>

              <NavLink to="/search" className="nav__link" onClick={closeMenu}>
                Search
              </NavLink>

              <NavLink to="/recommendations" className="nav__link" onClick={closeMenu}>
                For You
              </NavLink>

              {/* Added Watchlist Link with Badge */}
              <NavLink to="/watchlist" className="nav__link nav__link--watchlist" onClick={closeMenu}>
                Watchlist
                {watchlistCount > 0 && (
                  <span className="navbar__badge">{watchlistCount}</span>
                )}
              </NavLink>
            </nav>

            <div className="auth-section">
              {user ? (
                <div className="user-menu">
                  <span className="user-menu__greeting">
                    Hi, <strong>{user.name?.split(' ')[0] || 'User'}</strong>
                  </span>
                  <button className="btn-logout" onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              ) : (
                <div className="auth-buttons">
                  <NavLink to="/login" className="btn btn--outline" onClick={closeMenu}>
                    Log in
                  </NavLink>
                  <NavLink to="/signup" className="btn btn--primary" onClick={closeMenu}>
                    Sign up
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer__container">
          <div className="footer__brand">
            <p className="footer__title">MovieRec</p>
            <p className="footer__description">
              Smart movie recommendations powered by Hybrid Machine Learning models.
            </p>
          </div>

          <div className="footer__meta">
            <span>© {currentYear} MovieRec</span>
            <span>• Final Year Project</span>
          </div>
        </div>
      </footer>
    </div>
  );
}