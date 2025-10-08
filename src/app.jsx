import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Dashboard } from './dashboard/dashboard';
import { Chat} from './chat/chat';
import { About } from './about/about';
import { Taskdetail } from './taskdetail/taskdetail';
import { Login } from './login/login';

function App() {
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
                <li><NavLink to="dashboard">Dashboard</NavLink></li>
                <li><NavLink to="chat">Chat</NavLink></li>
                <li><NavLink to="about">About</NavLink></li>
              </menu>
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/about" element={<About />} />
          <Route path="/taskdetail" element={<Taskdetail />} />
        </Routes>
        <footer>
          <div className="footer-content">
            Created by <strong>Aaron Pace</strong>
            <br />
            <NavLink href="#">View on GitHub</NavLink>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;

function NotFound() {
  return (
    <main className="container-fluid bg-secondary text-center">
      <div>404 - Not Found</div>
    </main>
  );
}
