import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';

const AppContent = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [loggedIn, setLoggedIn] = useState(isAuthenticated);

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <nav style={{
        backgroundColor: '#1a365d', color: 'white', padding: '0 2rem', height: '60px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '600' }}>🚔 Police Command Center</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#9ca3af' }}>{user?.email}</span>
          <button onClick={() => { logout(); setLoggedIn(false); }} style={{
            backgroundColor: '#e74c3c', color: 'white', border: 'none',
            padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
          }}>Logout</button>
        </div>
      </nav>
      <Dashboard />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
