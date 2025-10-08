import React from 'react';
import './taskdetail.css';

export function Taskdetail() {
  return (
    <main>
    <div id="task-and-chat-container">
    <section id="tasks">
        <h2>TASKS</h2>
        <a href="#">+ ADD TASK</a>
        <ul id="task-list-placeholder">
            <li><input type="checkbox" checked> Task 1 - Completed</input></li>
            <li><input type="checkbox"> Task 2 - Pending</input></li>
            <li><input type="checkbox"> Task 3 - Pending</input></li>
            <li><input type="checkbox"> Task 4 - Pending</input></li>
        </ul>

    </section>
</div>
<div id="recent-activity">
    <p>🔔 Sarah just completed "Task 1" (2 minutes ago)</p>
    <p>🔔 Mike added new task "Review slides" (5 minutes ago)</p>
    <p>🔔 John is currently working on "Task 3"</p>
</div>
</main>
  );
}