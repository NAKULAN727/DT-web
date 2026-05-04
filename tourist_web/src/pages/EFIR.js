import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

const EFIR = () => {
  const { token, user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', location: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/efir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ touristId: user?.id, ...form })
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Submission failed');
      setSuccess(true);
      setForm({ name: user?.name || '', location: '', description: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '8px',
    border: '1px solid #e1e5e9', fontSize: '15px', boxSizing: 'border-box', marginBottom: '16px'
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 60px)' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ color: '#2c3e50', fontSize: '28px', fontWeight: '300', marginBottom: '30px' }}>
          File E-FIR Complaint
        </h2>

        {success && (
          <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '14px', borderRadius: '8px', marginBottom: '20px' }}>
            ✅ Complaint submitted successfully! Police have been notified.
          </div>
        )}
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '14px', borderRadius: '8px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>Your Name</label>
            <input type="text" value={form.name} placeholder="Full name"
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={{ ...inputStyle, marginTop: '6px' }} required />

            <label style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>Location of Incident</label>
            <input type="text" value={form.location} placeholder="e.g. Near Red Fort, Delhi"
              onChange={e => setForm({ ...form, location: e.target.value })}
              style={{ ...inputStyle, marginTop: '6px' }} required />

            <label style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>Description</label>
            <textarea value={form.description} placeholder="Describe the incident in detail..."
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={5} style={{ ...inputStyle, marginTop: '6px', resize: 'vertical' }} required />

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', backgroundColor: loading ? '#95a5a6' : '#e74c3c',
              color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px',
              fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'
            }}>
              {loading ? 'Submitting...' : '📋 Submit Complaint'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EFIR;
