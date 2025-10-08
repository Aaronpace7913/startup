import React from 'react';
import './dashboard.css';
import {Link} from 'react-router-dom';

export function Dashboard() {
  return (
    <main className="container">
      <div className= "dashboard-header">
        <h2>My Projects</h2>
        <button className="new-project-btn">+ New Project</button>
      </div>
      
        <section id="projects-container">
            <div className="project-card">
                <Link to="/taskdetail/taskdetail">Group Presentation</Link>
                <div className="project-progress">
                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                    <span className="progress-text">5/8 tasks done</span>
                </div>
            </div>
            <div className="project-card">
                <Link to="/taskdetail/taskdetail">Apartment Cleaning</Link>
                <div className="project-progress">
                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                    <span className="progress-text">2/6 tasks done</span>
                </div>
            </div>
            <div className="project-card">
                <Link to="/taskdetail/taskdetail">Event Planning</Link>
                <div className="project-progress">
                    <div className="progress-bar">
                       <div className="progress-fill"></div>
                    </div>
                    <span className="progress-text">8/10 tasks done</span>
                </div>
            </div>
        </section>
    </main>
  );
}