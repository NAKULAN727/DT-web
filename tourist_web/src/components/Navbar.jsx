import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth();

  const linkStyle = (page) => ({
    color: 'white', cursor: 'pointer', padding: '8px 16px',
    borderRadius: '6px', fontSize: '14px', fontWeight: '500',
    backgroundColor: currentPage === page ? '#2d5a87' : 'transparent',
    transition: 'all 0.2s'
  });

  return (
    <nav style={{
      padding: '0 2rem', height: '60px', backgroundColor: '#1a365d', color: 'white',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>🛡️ Tourist Safety</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {['home', 'alerts', 'contacts', 'efir', 'profile'].map(page => (
          <span key={page} style={linkStyle(page)} onClick={() => setCurrentPage(page)}>
            {page === 'efir' ? 'E-FIR' : page.charAt(0).toUpperCase() + page.slice(1)}
          </span>
        ))}
        <span style={{ color: '#9ca3af', fontSize: '13px', marginLeft: '8px' }}>
          {user?.name || user?.email}
        </span>
        <button onClick={logout} style={{
          backgroundColor: '#e74c3c', color: 'white', border: 'none',
          padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
          fontSize: '13px', marginLeft: '8px'
        }}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
