import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { io } from 'socket.io-client';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Alerts from './pages/Alerts';
import EmergencyContacts from './pages/EmergencyContacts';
import Profile from './pages/Profile';
import Login from './pages/Login';
import EFIR from './pages/EFIR';
import './App.css';

const socket = io('http://localhost:5000');

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [liveAlerts, setLiveAlerts] = useState([]);

  useEffect(() => {
    socket.on('new_alert', (alert) => {
      setLiveAlerts(prev => [alert, ...prev]);
    });
    return () => socket.off('new_alert');
  }, []);

  if (!isAuthenticated) return <Login />;

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home />;
      case 'alerts': return <Alerts liveAlerts={liveAlerts} />;
      case 'contacts': return <EmergencyContacts />;
      case 'efir': return <EFIR />;
      case 'profile': return <Profile />;
      default: return <Home />;
    }
  };

  return (
    <div className="App">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {renderPage()}
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
