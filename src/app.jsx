import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Dashboard } from './dashboard/dashboard';
import { Chat} from './chat/chat';
import { About } from './about/about';
import { Taskdetail } from './taskdetail/taskdetail';
import { Login } from './login/login';
import {AuthState} from './login/authState';


function App() {
  const [userName, setUserName] = React.useState(localStorage.getItem('userName') || '');
  const currentAuthState = userName ? AuthState.Authenticated : AuthState.Unauthenticated;
  const [authState, setAuthState] = React.useState(currentAuthState);

  const handleLogout = () => {
    localStorage.removeItem('userName');
    setUserName('');
    setAuthState(AuthState.Unauthenticated);
};

  return (
    <BrowserRouter>
      <div className="body">
        <header>
          <div className="header-content">
            <div className="logo-section">
              <div className="logo">GT</div>
              <span className="logo-text">GroupTask</span>
            </div>
            <nav>
              <menu>
                <li><NavLink to="/">Home</NavLink></li>
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
          <Route path="/" 
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
          <Route path="/dashboard" element={<Dashboard userName= {userName} />} />
          <Route path="/chat" element={<Chat userName = {userName} />} />
          <Route path="/about" element={<About />} />
          <Route path="/taskdetail" element={<Taskdetail />} />
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