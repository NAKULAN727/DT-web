import React, { useState } from 'react';

const TOURIST_ID = localStorage.getItem('touristId') || 'tourist_' + Math.random().toString(36).slice(2, 9);
localStorage.setItem('touristId', TOURIST_ID);

const PanicButton = () => {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handlePanic = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setSending(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch('http://localhost:5000/api/panic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              touristId: TOURIST_ID,
              message: 'Emergency help needed!',
              location: { lat: latitude, lng: longitude }
            })
          });

          if (res.ok) {
            setSent(true);
            setTimeout(() => setSent(false), 5000);
          } else {
            const err = await res.json();
            alert('Failed to send alert: ' + err.error);
          }
        } catch (error) {
          alert('Network error. Could not reach server.');
        } finally {
          setSending(false);
        }
      },
      (error) => {
        setSending(false);
        alert('Could not get your location. Please enable GPS and try again.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (sent) {
    return (
      <div style={{
        backgroundColor: '#27ae60',
        color: 'white',
        padding: '20px 40px',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: '600',
        textAlign: 'center'
      }}>
        ✅ Emergency Alert Sent! Help is on the way.
      </div>
    );
  }

  return (
    <button
      onClick={handlePanic}
      disabled={sending}
      style={{
        backgroundColor: sending ? '#95a5a6' : '#e74c3c',
        color: 'white',
        border: 'none',
        padding: '20px 40px',
        fontSize: '18px',
        fontWeight: '600',
        borderRadius: '8px',
        cursor: sending ? 'not-allowed' : 'pointer',
        boxShadow: sending ? 'none' : '0 4px 6px rgba(231, 76, 60, 0.3)',
        transition: 'all 0.3s ease',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}
    >
      {sending ? '📡 Getting Location...' : '🆘 Emergency Alert'}
    </button>
  );
};

export default PanicButton;
