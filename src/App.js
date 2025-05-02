import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Dashboard from './components/Dashboard';
import LoginForm from './components/LoginForm';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  if (checkingAuth) return <div>Checking authentication...</div>;

  return (
    <div className="App">
      {user ? (
        <>
          <header className="App-header">
            <div className="container">
              <h1>Energy & Climate Analytics Platform</h1>
              <nav>
                <ul className="nav-links">
                  <li><a href="#dashboard">Dashboard</a></li>
                  <li><a href="#reports">Reports</a></li>
                  <li><a href="#settings">Settings</a></li>
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
        </>
      ) : (
        <div className="login-wrapper">
          <h2>Please log in to access the platform</h2>
          <LoginForm />
        </div>
      )}
    </div>
  );
}

export default App;
