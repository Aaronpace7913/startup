import React from 'react';
import './about.css';

export function About() {
  const [imageUrl, setImageUrl] = React.useState('data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=');
  const [quote, setQuote] = React.useState('Loading...');
  const [quoteAuthor, setQuoteAuthor] = React.useState('unknown');

    React.useEffect(() => {
      setImageUrl(`img for cs260 startup.jpg`);
      setQuote('Words are cheap; Show me the code');
      setQuoteAuthor('Linus Torvalds');
    }, []);
  
  return (
    <main>
      <div className="picture-box"><img width="400px" src={imageUrl} alt="random" /></div>
      <div className="about-content">
        <p>
          GroupTask is a collaborative to-do list application that transforms individual task management into a team effort. 
          Users can create shared projects (like "Group Presentation," "Apartment Cleaning," or "Event Planning") 
          and invite friends, roommates, or classmates to join. 
          Within each project, team members can add tasks, assign them to specific people, and track progress together. 
          The key feature is real-time synchronization - when anyone marks a task complete, adds a new item, or makes changes, everyone in the group sees the updates instantly. 
          Each project also includes a built-in chat feature for quick coordination and communication, making it perfect for group projects, 
          household chores, event planning, or any collaborative effort that requires shared accountability.
        </p>
      </div>
      
  
      <div id="quote">
          <p><em>🔗 3rd Party API: Random Quotes Service</em></p>
        <div className="quote-text">{quote}</div>
        <div className="quote-author">{quoteAuthor}</div>
      </div>
    </main>
  );
}