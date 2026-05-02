import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Mock authentication for demo
    if (credentials.username === 'police' && credentials.password === 'admin123') {
      setTimeout(() => {
        onLogin();
        setLoading(false);
      }, 1000);
    } else {
      alert('Invalid credentials. Use: police/admin123');
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ 
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          color: '#1a365d', 
          marginBottom: '30px',
          fontSize: '28px',
          fontWeight: '600'
        }}>
          Police Login
        </h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={credentials.username}
            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            style={{ 
              width: '100%', 
              padding: '12px 16px', 
              margin: '10px 0', 
              borderRadius: '8px', 
              border: '1px solid #e1e5e9',
              fontSize: '16px'
            }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            style={{ 
              width: '100%', 
              padding: '12px 16px', 
              margin: '10px 0', 
              borderRadius: '8px', 
              border: '1px solid #e1e5e9',
              fontSize: '16px'
            }}
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '14px', 
              backgroundColor: loading ? '#95a5a6' : '#1a365d', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '20px'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ 
          textAlign: 'center', 
          color: '#7f8c8d', 
          fontSize: '14px', 
          marginTop: '20px' 
        }}>
          Demo: police / admin123
        </p>
      </div>
    </div>
  );
};

export default Login;