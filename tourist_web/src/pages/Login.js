import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

const Login = () => {
  const { login } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isSignup ? '/auth/signup' : '/auth/login';
      const body = isSignup
        ? { email: form.email, password: form.password, name: form.name, role: 'police' }
        : { email: form.email, password: form.password };

      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Something went wrong');
      login(data.token, data.user);
    } catch {
      setError('Cannot connect to server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', margin: '8px 0',
    borderRadius: '8px', border: '1px solid #e1e5e9', fontSize: '16px', boxSizing: 'border-box'
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', color: '#1a365d', marginBottom: '30px', fontSize: '26px' }}>
          {isSignup ? 'Create Account' : 'Police Login'}
        </h2>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <input type="text" placeholder="Full Name" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={inputStyle} required />
          )}
          <input type="email" placeholder="Email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            style={inputStyle} required />
          <input type="password" placeholder="Password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            style={inputStyle} required />
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', backgroundColor: loading ? '#95a5a6' : '#1a365d',
            color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px',
            fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '16px'
          }}>
            {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span onClick={() => { setIsSignup(!isSignup); setError(''); }}
            style={{ color: '#1a365d', cursor: 'pointer', fontWeight: '600' }}>
            {isSignup ? 'Login' : 'Sign Up'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
