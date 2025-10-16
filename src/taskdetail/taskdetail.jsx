import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './taskdetail.css';

export function Taskdetail() {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Load project from localStorage or location state
  const [project, setProject] = React.useState(() => {
    if (location.state?.project) {
      return location.state.project;
    }
    // Try to load from localStorage
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      const projects = JSON.parse(savedProjects);
      const found = projects.find(p => p.id === parseInt(projectId));
      if (found) return found;
    }
    return { id: projectId, name: 'Project', completed: 0, total: 0 };
  });
  
  // Load tasks from localStorage
  const [tasks, setTasks] = React.useState(() => {
    const tasksKey = `tasks_${projectId}`;
    const saved = localStorage.getItem(tasksKey);
    if (saved) {
      return JSON.parse(saved);
    }
    // Default tasks only if it's one of the original projects
    if (projectId === '1' || projectId === '2' || projectId === '3') {
      return [
        { id: 1, text: 'Task 1 - Completed', completed: true },
        { id: 2, text: 'Task 2 - Pending', completed: false },
        { id: 3, text: 'Task 3 - Pending', completed: false },
        { id: 4, text: 'Task 4 - Pending', completed: false }
      ];
    }
    return [];
  });

  // Load activities from localStorage
  const [activities, setActivities] = React.useState(() => {
    const activitiesKey = `activities_${projectId}`;
    const saved = localStorage.getItem(activitiesKey);
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      { id: 1, message: '🔔 Welcome to your project!' }
    ];
  });

  const [showModal, setShowModal] = React.useState(false);
  const [newTaskText, setNewTaskText] = React.useState('');

  // Save tasks to localStorage whenever they change
  React.useEffect(() => {
    const tasksKey = `tasks_${projectId}`;
    localStorage.setItem(tasksKey, JSON.stringify(tasks));
    
    // Dispatch custom event to notify Dashboard
    window.dispatchEvent(new Event('tasksUpdated'));
  }, [tasks, projectId]);

  // Save activities to localStorage whenever they change
  React.useEffect(() => {
    const activitiesKey = `activities_${projectId}`;
    localStorage.setItem(activitiesKey, JSON.stringify(activities));
  }, [activities, projectId]);

  // Update project progress when tasks change
  React.useEffect(() => {
    const completedCount = tasks.filter(task => task.completed).length;
    const updatedProject = {
      ...project,
      completed: completedCount,
      total: tasks.length
    };
    setProject(updatedProject);
    
    // Update in localStorage projects array
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      const projects = JSON.parse(savedProjects);
      const updatedProjects = projects.map(p => 
        p.id === parseInt(projectId) ? updatedProject : p
      );
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
    }
  }, [tasks, projectId]);

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      const newTask = {
        id: Date.now(),
        text: newTaskText,
        completed: false
      };
      setTasks([...tasks, newTask]);
      
      // Add activity
      const newActivity = {
        id: Date.now(),
        message: `🔔 You added new task "${newTaskText}" (just now)`
      };
      setActivities([newActivity, ...activities]);
      
      setNewTaskText('');
      setShowModal(false);
    }
  };

  const handleToggleTask = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newCompleted = !task.completed;
        
        // Add activity
        const activityMessage = newCompleted 
          ? `🔔 You completed "${task.text}" (just now)`
          : `🔔 You uncompleted "${task.text}" (just now)`;
        
        const newActivity = {
          id: Date.now(),
          message: activityMessage
        };
        setActivities([newActivity, ...activities]);
        
        return { ...task, completed: newCompleted };
      }
      return task;
    }));
  };

  const handleDeleteTask = (taskId) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    setTasks(tasks.filter(task => task.id !== taskId));
    
    // Add activity
    const newActivity = {
      id: Date.now(),
      message: `🔔 You deleted "${taskToDelete.text}" (just now)`
    };
    setActivities([newActivity, ...activities]);
  };

  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    return (tasks.filter(task => task.completed).length / tasks.length) * 100;
  };

  return (
    <main>
      <div id="task-and-chat-container">
        <section id="tasks">
          <div className="task-header">
            <div>
              <button className="back-btn" onClick={() => navigate('/dashboard')}>
                ← Back to Dashboard
              </button>
              <h2>{project.name}</h2>
              <div className="project-progress-detail">
                <div className="progress-bar-large">
                  <div
                    className="progress-fill-large"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
                <span className="progress-text-large">
                  {project.completed}/{project.total} tasks completed ({Math.round(calculateProgress())}%)
                </span>
              </div>
            </div>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowModal(true); }}>
              + ADD TASK
            </a>
          </div>
          
          <ul id="task-list-placeholder">
            {tasks.length === 0 ? (
              <li className="empty-task-state">
                No tasks yet. Click "+ ADD TASK" to create one!
              </li>
            ) : (
              tasks.map((task) => (
                <li key={task.id} className={task.completed ? 'completed' : ''}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task.id)}
                  />
                  <span>{task.text}</span>
                  <button 
                    className="delete-task-btn"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    🗑️
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <div id="recent-activity">
        {activities.map((activity) => (
          <p key={activity.id}>{activity.message}</p>
        ))}
      </div>

      {/* Modal for adding new task */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Task</h3>
            <input
              type="text"
              placeholder="Enter task description"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              autoFocus
            />
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-create" onClick={handleAddTask}>
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}