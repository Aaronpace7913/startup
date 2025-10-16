import React from 'react';
import './chat.css';

export function Chat({ userName }) {
  // Load messages from localStorage or use default
  const [messages, setMessages] = React.useState(() => {
    const saved = localStorage.getItem('chatMessages');
    if (saved) {
      return JSON.parse(saved).map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
    return [
      { id: 1, user: 'User 1', text: 'Hey team! How\'s the project coming along?', timestamp: new Date(Date.now() - 300000) },
      { id: 2, user: userName || 'You', text: 'Making great progress! Just finished my tasks.', timestamp: new Date(Date.now() - 240000) },
      { id: 3, user: 'User 1', text: 'Awesome! I\'ll review them this afternoon.', timestamp: new Date(Date.now() - 180000) },
      { id: 4, user: userName || 'You', text: 'Sounds good. Let me know if you need anything!', timestamp: new Date(Date.now() - 120000) }
    ];
  });
  
  const [newMessage, setNewMessage] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef(null);

  // Save messages to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

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

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        user: userName || 'You',
        text: newMessage,
        timestamp: new Date()
      };
      
      setMessages([...messages, message]);
      setNewMessage('');
      
      // Simulate another user typing after you send a message
      setTimeout(() => setIsTyping(true), 1000);
      
      // Simulate a response from another user
      setTimeout(() => {
        const responses = [
          'Got it!',
          'Thanks for the update!',
          'Sounds good to me.',
          'I\'ll take a look at that.',
          'Great work!'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        setMessages(prev => [...prev, {
          id: Date.now(),
          user: 'Team Member',
          text: randomResponse,
          timestamp: new Date()
        }]);
        setIsTyping(false);
      }, 3000);
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

  return (
    <main>
      <section id="team-chat">
        <h2>TEAM CHAT</h2>
        <div id="chat-messages-placeholder">
          {messages.map((message) => (
            <p key={message.id} className={message.user === (userName || 'You') ? 'current-user' : 'other-user'}>
              <strong>{message.user}</strong>
              <span className="message-text">{message.text}</span>
              <span className="message-time">{formatTime(message.timestamp)}</span>
            </p>
          ))}
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