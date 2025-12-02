import React from 'react';
import './chat.css';
import { useWebSocket } from '../hooks/useWebSocket';

export function Chat({ userName }) {
  const [projects, setProjects] = React.useState([]);
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const messagesEndRef = React.useRef(null);

  // WebSocket connection for the selected project
  const { isConnected, lastMessage } = useWebSocket(
    selectedProject ? selectedProject.id : null,
    userName
  );

  // Load user's projects on mount
  React.useEffect(() => {
    loadProjects();
  }, []);

  // Load messages when project is selected
  React.useEffect(() => {
    if (selectedProject) {
      loadMessages(selectedProject.id);
    }
  }, [selectedProject]);

  // Handle WebSocket messages
  React.useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === 'new-message') {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.find(m => m.id === lastMessage.message.id)) {
          return prev;
        }
        return [...prev, {
          ...lastMessage.message,
          timestamp: new Date(lastMessage.message.timestamp)
        }];
      });
    }
  }, [lastMessage]);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
        // Auto-select first project if available
        if (data.length > 0) {
          setSelectedProject(data[0]);
        }
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (projectId) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const handleProjectChange = (project) => {
    setSelectedProject(project);
    setMessages([]); // Clear messages while loading
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedProject) return;

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: userName || 'You',
          text: newMessage
        })
      });

      if (response.ok) {
        setNewMessage('');
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Error sending message. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  if (projects.length === 0) {
    return (
      <main>
        <div className="container">
          <div className="empty-state">
            <h3>No Projects Yet</h3>
            <p>Create or join a project to start chatting with your team!</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="chat-container">
        {/* Project Selector Sidebar */}
        <aside className="project-sidebar">
          <h3>Your Projects</h3>
          <div className="project-list">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`project-item ${selectedProject?.id === project.id ? 'active' : ''}`}
                onClick={() => handleProjectChange(project)}
              >
                <div className="project-name">{project.name}</div>
                <div className="project-members">
                  👥 {project.members?.length || 1} member{(project.members?.length || 1) !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat Area */}
        <section id="team-chat">
          <h2>
            {selectedProject?.name || 'Select a project'}
            {isConnected && <span className="live-indicator">● Live</span>}
          </h2>
          
          <div id="chat-messages-placeholder">
            {messages.length === 0 ? (
              <p className="empty-chat">
                No messages yet. Start the conversation with your team!
              </p>
            ) : (
              messages.map((message) => (
                <p key={message.id} className={message.user === (userName || 'You') ? 'current-user' : 'other-user'}>
                  <strong>{message.user}</strong>
                  <span className="message-text">{message.text}</span>
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                </p>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div id="chat-input">
            <input 
              type="text" 
              placeholder={selectedProject ? "Type message..." : "Select a project first..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!selectedProject}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!selectedProject || !newMessage.trim()}
            >
              SEND
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}