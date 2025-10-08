import React from 'react';
import './login.css';


export function Login() {
  return (
    <main>
      <section class="hero-section">
        <h1>Welcome to GroupTask</h1>
        <form class="login-form" method="get" action="dashboard.html">
          <div class="form-group">
            <div class="input-wrapper">
              <span class="input-icon">@</span>
              <input class="form-input" type="text" placeholder="your@email.com" />
            </div>
          </div>
          <div class="form-group">
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input class="form-input" type="password" placeholder="password" />
            </div>
          </div>
          <div class="button-group">
            <button class="btn btn-primary" type="submit">Login</button>
            <button class="btn btn-secondary" type="submit">Create</button>
          </div>
        </form>
      </section>
    </main>
  );
}