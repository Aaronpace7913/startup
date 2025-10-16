import React from 'react';
import './dashboard.css';
import { Link } from 'react-router-dom';

export function Dashboard() {
  // Load projects from localStorage or use default
  const [projects, setProjects] = React.useState(() => {
    const saved = localStorage.getItem('projects');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      { id: 1, name: 'Group Presentation', completed: 5, total: 8 },
      { id: 2, name: 'Apartment Cleaning', completed: 2, total: 6 },
      { id: 3, name: 'Event Planning', completed: 8, total: 10 }
    ];
  });

  const [showModal, setShowModal] = React.useState(false);
  const [newProjectName, setNewProjectName] = React.useState('');

  // Save projects to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  // Update project progress from localStorage when component mounts
  React.useEffect(() => {
    const updateProjectsFromTasks = () => {
      const updatedProjects = projects.map(project => {
        const tasksKey = `tasks_${project.id}`;
        const savedTasks = localStorage.getItem(tasksKey);
        if (savedTasks) {
          const tasks = JSON.parse(savedTasks);
          const completed = tasks.filter(task => task.completed).length;
          return {
            ...project,
            completed: completed,
            total: tasks.length
          };
        }
        return project;
      });
      setProjects(updatedProjects);
    };

    updateProjectsFromTasks();
    
    // Listen for custom event when tasks are updated
    window.addEventListener('tasksUpdated', updateProjectsFromTasks);
    return () => window.removeEventListener('tasksUpdated', updateProjectsFromTasks);
  }, []);

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      const newProject = {
        id: Date.now(),
        name: newProjectName,
        completed: 0,
        total: 0
      };
      setProjects([...projects, newProject]);
      
      // Initialize empty tasks array for new project
      localStorage.setItem(`tasks_${newProject.id}`, JSON.stringify([]));
      
      setNewProjectName('');
      setShowModal(false);
    }
  };

  const handleDeleteProject = (projectId, projectName, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm(`Are you sure you want to delete "${projectName}"? This will remove all associated tasks and activities.`)) {
      // Remove project from state
      setProjects(projects.filter(p => p.id !== projectId));
      
      // Clean up localStorage
      localStorage.removeItem(`tasks_${projectId}`);
      localStorage.removeItem(`activities_${projectId}`);
    }
  };

  const calculateProgress = (completed, total) => {
    if (total === 0) return 0;
    return (completed / total) * 100;
  };

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