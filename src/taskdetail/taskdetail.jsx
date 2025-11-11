import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './taskdetail.css';

export function Taskdetail({ userName }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = React.useState(null);
  const [tasks, setTasks] = React.useState([]);
  const [activities, setActivities] = React.useState([]);
  const [showModal, setShowModal] = React.useState(false);
  const [newTaskText, setNewTaskText] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  // Load project, tasks, and activities on mount
  React.useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      // Load project
      const projectRes = await fetch(`/api/projects/${projectId}`);
      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProject(projectData);
      } else {
        console.error('Failed to load project');
        navigate('/dashboard');
        return;
      }

      // Load tasks
      const tasksRes = await fetch(`/api/projects/${projectId}/tasks`);
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }

      // Load activities
      const activitiesRes = await fetch(`/api/projects/${projectId}/activities`);
      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData);
      }
    } catch (err) {
      console.error('Error loading project data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (newTaskText.trim()) {
      try {
        const response = await fetch(`/api/projects/${projectId}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: newTaskText })
        });

        if (response.ok) {
          const newTask = await response.json();
          setTasks([...tasks, newTask]);
          
          // Add activity
          await addActivity(`You added new task "${newTaskText}"`);
          
          setNewTaskText('');
          setShowModal(false);
          
          // Reload project to get updated progress
          await loadProject();
        } else {
          alert('Failed to create task. Please try again.');
        }
      } catch (err) {
        console.error('Error creating task:', err);
        alert('Error creating task. Please try again.');
      }
    }
  };

  const handleToggleTask = async (task) => {
    try {
      const newCompleted = !task.completed;
      
      const response = await fetch(`/api/projects/${projectId}/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newCompleted })
      });

      if (response.ok) {
        // Update task in local state
        const updatedTask = { ...task, completed: newCompleted };
        setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
        
        // Add activity
        const activityMessage = newCompleted 
          ? `You completed "${task.text}"`
          : `You uncompleted "${task.text}"`;
        await addActivity(activityMessage);
        
        // Reload project to get updated progress
        await loadProject();
      } else {
        const errorText = await response.text();
        console.error('Failed to update task:', errorText);
        alert('Failed to update task. Please try again.');
      }
    } catch (err) {
      console.error('Error updating task:', err);
      alert('Error updating task. Please try again.');
    }
  };

  const handleDeleteTask = async (task) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${task.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== task.id));
        
        // Add activity
        await addActivity(`You deleted "${task.text}"`);
        
        // Reload project to get updated progress
        await loadProject();
      } else {
        alert('Failed to delete task. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Error deleting task. Please try again.');
    }
  };

  const addActivity = async (action) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user: userName || 'User',
          action: action 
        })
      });

      if (response.ok) {
        const newActivity = await response.json();
        setActivities([newActivity, ...activities]);
      }
    } catch (err) {
      console.error('Error adding activity:', err);
    }
  };

  const loadProject = async () => {
    try {
      const projectRes = await fetch(`/api/projects/${projectId}`);
      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProject(projectData);
      }
    } catch (err) {
      console.error('Error reloading project:', err);
    }
  };

  const calculateProgress = () => {
    if (!project || project.total === 0) return 0;
    return (project.completed / project.total) * 100;
  };

  const formatActivityTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <main>
        <div className="container">
          <div className="loading">Loading project...</div>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main>
        <div className="container">
          <div className="error">Project not found</div>
        </div>
      </main>
    );
  }

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
                    onChange={() => handleToggleTask(task)}
                  />
                  <span>{task.text}</span>
                  <button 
                    className="delete-task-btn"
                    onClick={() => handleDeleteTask(task)}
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
        {activities.length === 0 ? (
          <p>🔔 No recent activity</p>
        ) : (
          activities.map((activity) => (
            <p key={activity.id}>
              🔔 {activity.user} {activity.action} ({formatActivityTime(activity.timestamp)})
            </p>
          ))
        )}
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