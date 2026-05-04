import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const API = 'http://localhost:5000/api';

const MapView = () => {
  const { user } = useAuth();
  const [location, setLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);

  const sendLocation = async (lat, lng) => {
    try {
      await fetch(`${API}/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ touristId: user?.id || localStorage.getItem('touristId'), name: user?.name || 'Unknown', lat, lng })
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
      err => console.error('Geolocation error:', err),
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
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#2c3e50', fontSize: '20px', fontWeight: '500', margin: 0 }}>Live Location Tracking</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {lastUpdate && (
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>Updated: {lastUpdate.toLocaleTimeString()}</span>
          )}
          <button onClick={() => setIsTracking(!isTracking)} style={{
            backgroundColor: isTracking ? '#e74c3c' : '#27ae60',
            color: 'white', border: 'none', padding: '8px 16px',
            borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
          }}>
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </button>
        </div>
      </div>

      {location ? (
        <div style={{ height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
          <MapContainer center={[location.lat, location.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors' />
            <Marker position={[location.lat, location.lng]}>
              <Popup>
                <strong>Your Location</strong><br />
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}<br />
                {isTracking ? '🟢 Tracking active' : '🔴 Tracking paused'}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      ) : (
        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <p style={{ color: '#7f8c8d' }}>{isTracking ? '📡 Locating your position...' : 'Tracking is paused.'}</p>
        </div>
      )}
    </div>
  );
};

export default MapView;
