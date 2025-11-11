import React from 'react';
import './chat.css';

export function Chat({ userName }) {
  const [messages, setMessages] = React.useState([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const messagesEndRef = React.useRef(null);

  // Load messages from backend on mount
  React.useEffect(() => {
    loadMessages();
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate "someone is typing" indicator
  React.useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => setIsTyping(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

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
          const message = await response.json();
          setMessages([...messages, {
            ...message,
            timestamp: new Date(message.timestamp)
          }]);
          setNewMessage('');
          
          // Simulate another user typing after you send a message
          setTimeout(() => setIsTyping(true), 1000);
          
          // Simulate a response from another user
          setTimeout(async () => {
            const responses = [
              'Got it!',
              'Thanks for the update!',
              'Sounds good to me.',
              'I\'ll take a look at that.',
              'Great work!'
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            try {
              const botResponse = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user: 'Team Member',
                  text: randomResponse
                })
              });

              if (botResponse.ok) {
                const botMessage = await botResponse.json();
                setMessages(prev => [...prev, {
                  ...botMessage,
                  timestamp: new Date(botMessage.timestamp)
                }]);
              }
            } catch (err) {
              console.error('Error sending bot response:', err);
            }
            
            setIsTyping(false);
          }, 3000);
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
          <h2>TEAM CHAT</h2>
          <div className="loading">Loading messages...</div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section id="team-chat">
        <h2>TEAM CHAT</h2>
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
          {isTyping && (
            <p className="typing-indicator">
              <em>Team Member is typing...</em>
            </p>
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