import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Auth.css';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation Logic
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    // Simulated API call for account creation
    setTimeout(() => {
      try {
        // Format name: "john doe" -> "John Doe"
        const formattedName = name
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

        const user = { 
          name: formattedName, 
          email: email.toLowerCase(),
          avatar: formattedName.charAt(0).toUpperCase() 
        };
        
        // Save to localStorage for demo persistence
        localStorage.setItem('authUser', JSON.stringify(user));
        localStorage.setItem('authToken', 'demo-new-user-token');
        
        // IMPORTANT: Notify App.jsx and Navbar of the login state change
        window.dispatchEvent(new Event('authChange'));
        
        // Navigate to the onboarding page we discussed to solve the "Cold Start"
        navigate('/onboarding');
      } catch (err) {
        setError('Failed to create account. Please try again.');
        setLoading(false);
      }
    }, 1200); 
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-card__header">
          <div className="auth-logo">
            Movie<span>Rec</span>
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join us for a personalized cinematic journey</p>
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
            <label>Full Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button 
            className={`auth-submit ${loading ? 'auth-submit--loading' : ''}`} 
            type="submit" 
            disabled={loading}
          >
            {loading ? <div className="spinner"></div> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </div>
    </div>
  );
}