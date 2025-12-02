import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './taskdetail.css';
import { ProjectMembers } from './ProjectMembers';
import { useWebSocket } from '../hooks/useWebSocket';

export function Taskdetail({ userName }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = React.useState(null);
  const [tasks, setTasks] = React.useState([]);
  const [activities, setActivities] = React.useState([]);
  const [showModal, setShowModal] = React.useState(false);
  const [newTaskText, setNewTaskText] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  // WebSocket connection
  const { isConnected, lastMessage } = useWebSocket(parseInt(projectId), userName);

  // Load project, tasks, and activities on mount
  React.useEffect(() => {
    loadProjectData();
  }, [projectId]);

  // Handle WebSocket messages
  React.useEffect(() => {
    if (!lastMessage) return;

    console.log('Processing WebSocket message:', lastMessage);

    switch (lastMessage.type) {
      case 'task-created':
        setTasks(prev => [...prev, lastMessage.task]);
        if (lastMessage.project) {
          setProject(lastMessage.project);
        }
        break;

      case 'task-updated':
        setTasks(prev => prev.map(t => 
          t.id === lastMessage.task.id ? lastMessage.task : t
        ));
        if (lastMessage.project) {
          setProject(lastMessage.project);
        }
        break;

      case 'task-deleted':
        setTasks(prev => prev.filter(t => t.id !== lastMessage.taskId));
        if (lastMessage.project) {
          setProject(lastMessage.project);
        }
        break;

      case 'new-activity':
        setActivities(prev => [lastMessage.activity, ...prev]);
        break;

      case 'member-joined':
        setActivities(prev => [lastMessage.activity, ...prev]);
        // Reload project to get updated member list
        loadProject();
        break;

      case 'member-removed':
      case 'member-left':
        setActivities(prev => [lastMessage.activity, ...prev]);
        // Reload project to get updated member list
        loadProject();
        break;

      case 'project-updated':
        setProject(lastMessage.project);
        break;

      case 'project-deleted':
        alert('This project has been deleted by the owner');
        navigate('/dashboard');
        break;
    }
  }, [lastMessage]);

  const loadProjectData = async () => {
    try {
      const projectRes = await fetch(`/api/projects/${projectId}`);
      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProject(projectData);
      } else {
        console.error('Failed to load project');
        navigate('/dashboard');
        return;
      }

      const tasksRes = await fetch(`/api/projects/${projectId}/tasks`);
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }

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

  const handleAddTask = async () => {
    if (newTaskText.trim()) {
      try {
        const response = await fetch(`/api/projects/${projectId}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: newTaskText })
        });

        if (response.ok) {
          await addActivity(`added new task "${newTaskText}"`);
          setNewTaskText('');
          setShowModal(false);
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
        const activityMessage = newCompleted 
          ? `completed "${task.text}"`
          : `uncompleted "${task.text}"`;
        await addActivity(activityMessage);
      } else {
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
        await addActivity(`deleted "${task.text}"`);
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
      await fetch(`/api/projects/${projectId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user: userName || 'User',
          action: action 
        })
      });
    } catch (err) {
      console.error('Error adding activity:', err);
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
        <ProjectMembers 
          projectId={parseInt(projectId)}
          projectOwner={project.owner}
          currentUserEmail={userName}
        />

        <section id="tasks">
          <div className="task-header">
            <div>
              <button className="back-btn" onClick={() => navigate('/dashboard')}>
                ← Back to Dashboard
              </button>
              <h2>
                {project.name}
                {isConnected && <span style={{ marginLeft: '10px', color: '#4ade80', fontSize: '0.8rem' }}>● Live</span>}
              </h2>
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