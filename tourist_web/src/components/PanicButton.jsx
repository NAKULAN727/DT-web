import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

const PanicButton = () => {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handlePanic = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported.');
    setSending(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(`${API}/panic`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              touristId: user?.id || localStorage.getItem('touristId'),
              message: 'Emergency help needed!',
              location: { lat: coords.latitude, lng: coords.longitude }
            })
          });
          if (res.ok) { setSent(true); setTimeout(() => setSent(false), 5000); }
          else { const e = await res.json(); alert('Failed: ' + e.error); }
        } catch { alert('Network error. Could not reach server.'); }
        finally { setSending(false); }
      },
      () => { setSending(false); alert('Could not get location. Enable GPS.'); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (sent) return (
    <div style={{ backgroundColor: '#27ae60', color: 'white', padding: '20px 40px', borderRadius: '8px', fontSize: '18px', fontWeight: '600', textAlign: 'center' }}>
      ✅ Emergency Alert Sent! Help is on the way.
    </div>
  );

  return (
    <button onClick={handlePanic} disabled={sending} style={{
      backgroundColor: sending ? '#95a5a6' : '#e74c3c', color: 'white', border: 'none',
      padding: '20px 40px', fontSize: '18px', fontWeight: '600', borderRadius: '8px',
      cursor: sending ? 'not-allowed' : 'pointer', textTransform: 'uppercase', letterSpacing: '1px',
      boxShadow: sending ? 'none' : '0 4px 6px rgba(231,76,60,0.3)', transition: 'all 0.3s ease'
    }}>
      {sending ? '📡 Getting Location...' : '🆘 Emergency Alert'}
    </button>
  );
};

export default PanicButton;
