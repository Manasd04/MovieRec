import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom' // Added useLocation
import Navbar from './components/Navbar' // Added Navbar
import Footer from './components/Footer' // Added Footer
import Homepage from './pages/Homepage'
import Search from './pages/Search'
import MovieDetail from './pages/MovieDetail'
import Recommendations from './pages/Recommendations'
import Watchlist from './pages/Watchlist'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'

function App() {
  const [user, setUser] = useState(null);
  const location = useLocation(); // Hook usage
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/onboarding';

  // Sync user state with localStorage
  const syncUser = () => {
    try {
      const savedUser = localStorage.getItem('authUser');
      setUser(savedUser ? JSON.parse(savedUser) : null);
    } catch (error) {
      console.error("Error parsing authUser:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    syncUser();
    // Listen for login/logout events to update the UI instantly
    window.addEventListener('authChange', syncUser); // Custom event listener
    return () => window.removeEventListener('authChange', syncUser);
  }, []);

  return (
    <div className="app-container">
      {!isAuthPage && <Navbar user={user} />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/search" element={<Search />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/recommendations" element={<Recommendations user={user} />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  )
}

export default App