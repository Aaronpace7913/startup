import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthState } from './authState';
import './login.css';

export function Login({ userName, authState, onAuthChange }) {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (authState === AuthState.Authenticated) {
      navigate('/dashboard');
    }
  }, [authState, navigate]);

  // Validate email has @ sign
  const isValidEmail = (email) => {
    return email.includes('@');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate email format
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address with @ sign');
      return;
    }
    
    if (email && password) {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          onAuthChange(data.email, AuthState.Authenticated);
          navigate('/dashboard');
        } else {
          const errorData = await response.json();
          setError(errorData.msg || 'Login failed. Please check your credentials.');
        }
      } catch (err) {
        setError('Network error. Please try again.');
        console.error('Login error:', err);
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate email format
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address with @ sign');
      return;
    }
    
    if (email && password) {
      try {
        const response = await fetch('/api/auth/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          onAuthChange(data.email, AuthState.Authenticated);
          navigate('/dashboard');
        } else {
          const errorData = await response.json();
          setError(errorData.msg || 'Account creation failed. User may already exist.');
        }
      } catch (err) {
        setError('Network error. Please try again.');
        console.error('Create account error:', err);
      }
    }
  };

  return (
    <main>
      <section className="hero-section">
        <h1>Welcome to GroupTask</h1>
        {error && <div className="error-message">{error}</div>}
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <div className="input-wrapper">
              <span className="input-icon">@</span>
              <input 
                className="form-input" 
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </div>
          </div>
          <div className="form-group">
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input 
                className="form-input" 
                type="password" 
                placeholder="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="button-group">
            <button 
              className="btn btn-primary" 
              type="submit"
              disabled={!email || !password || !isValidEmail(email)}
            >
              Login
            </button>
            <button 
              className="btn btn-secondary" 
              type="button"
              onClick={handleCreate}
              disabled={!email || !password || !isValidEmail(email)}
            >
              Create
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}