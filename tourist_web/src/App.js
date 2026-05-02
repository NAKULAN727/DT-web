import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Alerts from './pages/Alerts';
import EmergencyContacts from './pages/EmergencyContacts';
import Profile from './pages/Profile';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home />;
      case 'alerts': return <Alerts />;
      case 'contacts': return <EmergencyContacts />;
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
}

export default App;
