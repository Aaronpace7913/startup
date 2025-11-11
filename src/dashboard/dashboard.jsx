import React from 'react';
import './dashboard.css';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const [projects, setProjects] = React.useState([]);
  const [showModal, setShowModal] = React.useState(false);
  const [newProjectName, setNewProjectName] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  // Load projects from backend on mount
  React.useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        console.error('Failed to load projects');
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async () => {
    if (newProjectName.trim()) {
      try {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newProjectName })
        });

        if (response.ok) {
          const newProject = await response.json();
          setProjects([...projects, newProject]);
          setNewProjectName('');
          setShowModal(false);
        } else {
          console.error('Failed to create project');
          alert('Failed to create project. Please try again.');
        }
      } catch (err) {
        console.error('Error creating project:', err);
        alert('Error creating project. Please try again.');
      }
    }
  };

  const handleDeleteProject = async (projectId, projectName, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm(`Are you sure you want to delete "${projectName}"? This will remove all associated tasks and activities.`)) {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setProjects(projects.filter(p => p.id !== projectId));
        } else {
          console.error('Failed to delete project');
          alert('Failed to delete project. Please try again.');
        }
      } catch (err) {
        console.error('Error deleting project:', err);
        alert('Error deleting project. Please try again.');
      }
    }
  };

  const calculateProgress = (completed, total) => {
    if (total === 0) return 0;
    return (completed / total) * 100;
  };

  if (loading) {
    return (
      <main>
        <div className="container">
          <div className="loading">Loading projects...</div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="container">
        <div className="dashboard-header">
          <h2>My Projects</h2>
          <button className="new-project-btn" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        </div>

        <section id="projects-container">
          {projects.length === 0 ? (
            <div className="empty-state">
              <h3>No Projects Yet</h3>
              <p>Click "New Project" to get started!</p>
            </div>
          ) : (
            projects.map((project) => (
              <div className="project-card" key={project.id}>
                <div className="project-card-content">
                  <Link to={`/taskdetail/${project.id}`} state={{ project }}>
                    {project.name}
                  </Link>
                  <button 
                    className="delete-project-btn"
                    onClick={(e) => handleDeleteProject(project.id, project.name, e)}
                    title="Delete project"
                  >
                    🗑️
                  </button>
                </div>
                <div className="project-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${calculateProgress(project.completed, project.total)}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {project.completed}/{project.total} tasks done
                  </span>
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      {/* Modal for adding new project */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Project</h3>
            <input
              type="text"
              placeholder="Enter project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddProject()}
              autoFocus
            />
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-create" onClick={handleAddProject}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}