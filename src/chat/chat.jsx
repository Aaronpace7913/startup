import React from 'react';
import './chat.css';

export function Chat() {
  return (
    <main>
      <section id="team-chat">
                <h2>TEAM CHAT</h2>
                <div id="chat-messages-placeholder">
                    <p><strong>User 1:</strong> Hey team! How's the project coming along?</p>
                    <p><strong>User 2:</strong> Making great progress! Just finished my tasks.</p>
                    <p><strong>User 1:</strong> Awesome! I'll review them this afternoon.</p>
                    <p><strong>User 2:</strong> Sounds good. Let me know if you need anything!</p>
                    <p><em>Sarah is typing... (live via WebSocket)</em></p>
                </div>
                <div id="chat-input">
                    <input type="text" placeholder="Type message..."></input>
                    <button>SEND Via Websocket</button>
                </div>
        </section>
    </main>
  );
}