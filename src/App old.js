import React from 'react';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="container">
          <h1>Energy & Climate Analytics Platform</h1>
          <nav>
            <ul className="nav-links">
              <li><a href="#dashboard">Dashboard</a></li>
              <li><a href="#reports">Reports</a></li>
              <li><a href="#settings">Settings</a></li>
              {/* Add more navigation links as needed */}
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="App-main" id="dashboard">
        <Dashboard />
      </main>
      
      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} PowerOptimise AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;

