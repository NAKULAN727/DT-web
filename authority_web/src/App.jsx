import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const [loggedIn, setLoggedIn] = useState(isAuthenticated);

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  return <Dashboard onLogout={() => setLoggedIn(false)} />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
