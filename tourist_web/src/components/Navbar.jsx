import React from 'react';

const Navbar = ({ currentPage, setCurrentPage }) => {
  const navStyle = {
    padding: '0 2rem',
    height: '60px',
    backgroundColor: '#1a365d',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    margin: '0 20px',
    cursor: 'pointer',
    padding: '10px 20px',
    transition: 'all 0.3s ease',
    fontWeight: '500'
  };

  const activeLinkStyle = {
    ...linkStyle,
    backgroundColor: '#2d5a87',
    borderRadius: '6px'
  };

  return (
    <nav style={navStyle}>
      <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Tourist Safety</h1>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span 
          style={currentPage === 'home' ? activeLinkStyle : linkStyle}
          onClick={() => setCurrentPage('home')}
        >
          Home
        </span>
        <span 
          style={currentPage === 'alerts' ? activeLinkStyle : linkStyle}
          onClick={() => setCurrentPage('alerts')}
        >
          Alerts
        </span>
        <span 
          style={currentPage === 'contacts' ? activeLinkStyle : linkStyle}
          onClick={() => setCurrentPage('contacts')}
        >
          Emergency
        </span>
        <span 
          style={currentPage === 'profile' ? activeLinkStyle : linkStyle}
          onClick={() => setCurrentPage('profile')}
        >
          Profile
        </span>
      </div>
    </nav>
  );
};

export default Navbar;