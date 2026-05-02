import React, { useState, useEffect, useRef } from 'react';

const TOURIST_ID = localStorage.getItem('touristId') || 'tourist_' + Math.random().toString(36).slice(2, 9);
localStorage.setItem('touristId', TOURIST_ID);

const MapView = () => {
  const [location, setLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);

  const sendLocation = async (lat, lng) => {
    try {
      await fetch('http://localhost:5000/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ touristId: TOURIST_ID, lat, lng })
      });
    } catch (err) {
      console.error('Failed to send location:', err);
    }
  };

  const fetchLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        setLocation({ lat, lng });
        setLastUpdate(new Date());
        sendLocation(lat, lng);
      },
      (err) => console.error('Geolocation error:', err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (isTracking) {
      fetchLocation();
      intervalRef.current = setInterval(fetchLocation, 10000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isTracking]);

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '30px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#2c3e50', fontSize: '20px', fontWeight: '500', margin: 0 }}>Live Location Tracking</h3>
        <button
          onClick={() => setIsTracking(!isTracking)}
          style={{
            backgroundColor: isTracking ? '#e74c3c' : '#27ae60',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {isTracking ? 'Stop Tracking' : 'Start Tracking'}
        </button>
      </div>

      {location ? (
        <div>
          <div style={{ display: 'flex', gap: '30px', marginBottom: '10px' }}>
            <div>
              <span style={{ color: '#7f8c8d', fontSize: '14px' }}>Latitude</span>
              <p style={{ margin: '5px 0', fontSize: '16px', fontWeight: '500' }}>{location.lat.toFixed(6)}</p>
            </div>
            <div>
              <span style={{ color: '#7f8c8d', fontSize: '14px' }}>Longitude</span>
              <p style={{ margin: '5px 0', fontSize: '16px', fontWeight: '500' }}>{location.lng.toFixed(6)}</p>
            </div>
          </div>

          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#7f8c8d', fontSize: '12px' }}>
              Last updated: {lastUpdate?.toLocaleTimeString()}
            </span>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: isTracking ? '#27ae60' : '#e74c3c'
            }} />
            <span style={{ fontSize: '12px', color: '#7f8c8d' }}>
              {isTracking ? 'Sending every 10s' : 'Paused'}
            </span>
          </div>

          <div style={{ width: '100%', height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
            <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.01},${location.lat - 0.01},${location.lng + 0.01},${location.lat + 0.01}&layer=mapnik&marker=${location.lat},${location.lng}`}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="Current Location Map"
            />
          </div>
        </div>
      ) : (
        <p style={{ color: '#7f8c8d' }}>
          {isTracking ? '📡 Locating your position...' : 'Tracking is paused.'}
        </p>
      )}
    </div>
  );
};

export default MapView;
