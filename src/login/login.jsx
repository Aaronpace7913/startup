import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthState } from './authState';
import './login.css';


export function Login({ userName, authState, onAuthChange }) {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (authState === AuthState.Authenticated) {
      navigate('/dashboard');
    }
  }, [authState, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      localStorage.setItem('userName', email);
      onAuthChange(email, AuthState.Authenticated);
      navigate('/dashboard');
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (email && password) {
      localStorage.setItem('userName', email);
      onAuthChange(email, AuthState.Authenticated);
      navigate('/dashboard');
    }
  };

  return (
    <main>
      <section className="hero-section">
        <h1>Welcome to GroupTask</h1>
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <div className="input-wrapper">
              <span className="input-icon">@</span>
              <input 
              className="form-input" 
              type="text" 
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
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
              />
            </div>
          </div>
          <div className="button-group">
            <button 
            className="btn btn-primary" 
            type="submit"
            disabled={!email || !password}
            >
              Login
            </button>
            <button 
            className="btn btn-secondary" 
            type="submit"
            onClick={handleCreate}
            disabled={!email || !password}
            >
              Create
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}