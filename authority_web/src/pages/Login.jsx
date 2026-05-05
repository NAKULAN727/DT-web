import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

const Login = ({ onLogin }) => {
  const { login } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isSignup ? '/auth/signup' : '/auth/login';
      const bodyData = isSignup ? { ...form, role: 'police' } : { email: form.email, password: form.password };
      
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || (isSignup ? 'Signup failed' : 'Login failed'));
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: '#1e3a8a', margin: '0 0 8px 0', fontSize: '28px' }}>🚔 Police Dashboard</h2>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            {isSignup ? 'Create your command center account' : 'Sign in to access the command center'}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #f87171' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isSignup && (
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>Full Name</label>
              <input type="text" placeholder="Officer Name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', boxSizing: 'border-box' }}
                required={isSignup} />
            </div>
          )}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>Email Address</label>
            <input type="email" placeholder="officer@police.gov" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', boxSizing: 'border-box' }}
              required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>Password</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', boxSizing: 'border-box' }}
              required />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', backgroundColor: loading ? '#9ca3af' : '#1e40af',
            color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px',
            fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px',
            transition: 'background-color 0.2s'
          }}>
            {loading ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button onClick={() => { setIsSignup(!isSignup); setError(''); }} style={{
            background: 'none', border: 'none', color: '#2563eb', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline'
          }}>
            {isSignup ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
