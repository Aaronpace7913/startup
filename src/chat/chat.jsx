import React from 'react';
import './chat.css';
import { useWebSocket } from '../hooks/useWebSocket';

export function Chat({ userName }) {
  const [messages, setMessages] = React.useState([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const messagesEndRef = React.useRef(null);

  // WebSocket connection for global chat
  const { isConnected, lastMessage } = useWebSocket('global', userName);

  // Load messages from backend on mount
  React.useEffect(() => {
    loadMessages();
  }, []);

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

  const loadMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const response = await fetch('/api/messages', {
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
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
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
        <section id="team-chat">
          <h2>
            TEAM CHAT
            {isConnected && <span style={{ marginLeft: '10px', color: '#4ade80', fontSize: '0.8rem' }}>● Live</span>}
          </h2>
          <div className="loading">Loading messages...</div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section id="team-chat">
        <h2>
          TEAM CHAT
          {isConnected && <span style={{ marginLeft: '10px', color: '#4ade80', fontSize: '0.8rem' }}>● Live</span>}
        </h2>
        <div id="chat-messages-placeholder">
          {messages.length === 0 ? (
            <p className="empty-chat">No messages yet. Start the conversation!</p>
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
            placeholder="Type message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleSendMessage}>SEND</button>
        </div>
      </section>
    </main>
  );
}