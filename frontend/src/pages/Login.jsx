import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);

    // Simulated API Call
    setTimeout(() => {
      try {
        // IMPROVEMENT: Create a clean user object
        const userName = email.split('@')[0];
        const user = { 
          name: userName.charAt(0).toUpperCase() + userName.slice(1), // Capitalize first letter
          email: email.toLowerCase(),
          avatar: email.charAt(0).toUpperCase() 
        };
        
        // Save to storage
        localStorage.setItem('authUser', JSON.stringify(user));
        localStorage.setItem('authToken', 'demo-jwt-token-123');
        
        // IMPORTANT: Trigger the global event for App.jsx and Navbar.jsx
        window.dispatchEvent(new Event('authChange'));
        
        // Redirect to homepage
        navigate('/');
      } catch (err) {
        setError('Login failed. Please try again.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-card__header">
          <div className="auth-logo">
            Movie<span>Rec</span>
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Log in to sync your watch history</p>
        </div>

        {error && (
          <div className="auth-error-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <div className="label-wrapper">
              <label>Password</label>
              <Link to="/forgot-password">Forgot?</Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button 
            className={`auth-submit ${loading ? 'auth-submit--loading' : ''}`} 
            type="submit" 
            disabled={loading}
          >
            {loading ? <div className="spinner"></div> : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          New to MovieRec? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}