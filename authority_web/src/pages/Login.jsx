import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

const Login = ({ onLogin }) => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Login failed');
      if (data.user.role !== 'police') return setError('Access denied. Police accounts only.');
      login(data.token, data.user);
      onLogin();
    } catch {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', color: '#1a365d', marginBottom: '8px', fontSize: '26px' }}>Police Login</h2>
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px', marginBottom: '24px' }}>
          Command Center Access
        </p>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Police Email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            style={{ width: '100%', padding: '12px 16px', margin: '8px 0', borderRadius: '8px', border: '1px solid #e1e5e9', fontSize: '16px', boxSizing: 'border-box' }}
            required />
          <input type="password" placeholder="Password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            style={{ width: '100%', padding: '12px 16px', margin: '8px 0', borderRadius: '8px', border: '1px solid #e1e5e9', fontSize: '16px', boxSizing: 'border-box' }}
            required />
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', backgroundColor: loading ? '#95a5a6' : '#1a365d',
            color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px',
            fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '16px'
          }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
