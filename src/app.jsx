import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { Dashboard } from './dashboard/dashboard';
import { Chat } from './chat/chat';
import { About } from './about/about';
import { Taskdetail } from './taskdetail/taskdetail';
import { Login } from './login/login';
import { AuthState } from './login/authState';

function AppContent() {
  const navigate = useNavigate();
  const [userName, setUserName] = React.useState('');
  const [authState, setAuthState] = React.useState(AuthState.Unauthenticated);

  // Check authentication status on mount
  React.useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const data = await response.json();
        setUserName(data.email);
        setAuthState(AuthState.Authenticated);
      } else {
        setAuthState(AuthState.Unauthenticated);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setAuthState(AuthState.Unauthenticated);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'DELETE',
      });
      setUserName('');
      setAuthState(AuthState.Unauthenticated);
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="body">
      <header>
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">GT</div>
            <span className="logo-text">GroupTask</span>
          </div>
          <nav>
            <menu>
              {authState === AuthState.Unauthenticated && (
                <li><NavLink to="/">Home</NavLink></li>
              )}
              {authState === AuthState.Authenticated && (
                <>
                  <li><NavLink to="dashboard">Dashboard</NavLink></li>
                  <li><NavLink to="chat">Chat</NavLink></li>
                </>
              )}
              <li><NavLink to="about">About</NavLink></li>
              {authState === AuthState.Authenticated && (
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}
                  >
                    Logout
                  </a>
                </li>
              )}
            </menu>
          </nav>
        </div>
      </header>

      <Routes>
        <Route 
          path="/" 
          element={
            <Login 
              userName={userName}
              authState={authState}
              onAuthChange={(userName, authState) => {
                setUserName(userName);
                setAuthState(authState);
              }}
            />
          } 
        />
        <Route path="/dashboard" element={<Dashboard userName={userName} />} />
        <Route path="/chat" element={<Chat userName={userName} />} />
        <Route path="/about" element={<About />} />
        <Route path="/taskdetail/:projectId" element={<Taskdetail userName={userName} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <footer>
        <div className="footer-content">
          Created by <strong>Aaron Pace</strong>
          <br />
          <NavLink to="https://github.com/Aaronpace7913/startup">View on GitHub</NavLink>
        </div>
      </footer>
    </div>
  );
}

// Main App component wraps everything in BrowserRouter
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <main className="container-fluid bg-secondary text-center">
      <div>404 - Not Found</div>
    </main>
  );
}

export default App;