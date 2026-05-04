import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const createColoredIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -10]
});

const statusColor = (status) => {
  switch (status) {
    case 'help_needed': return '#ef4444';
    case 'lost': return '#dc2626';
    case 'safe': return '#10b981';
    default: return '#6b7280';
  }
};

const MapDashboard = ({ tourists, onSelectTourist }) => {
  if (!tourists || tourists.length === 0) {
    return (
      <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <p style={{ color: '#9ca3af' }}>No tourists being tracked yet.</p>
      </div>
    );
  }

  const center = [tourists[0].lat, tourists[0].lng];

  return (
    <div style={{ height: '500px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors' />
        {tourists.map((t, i) => (
          <Marker key={t._id || i} position={[t.lat, t.lng]}
            icon={createColoredIcon(statusColor(t.status))}
            eventHandlers={{ click: () => onSelectTourist && onSelectTourist(t) }}>
            <Popup>
              <strong>{t.touristId}</strong><br />
              Status: <span style={{ color: statusColor(t.status), fontWeight: '600' }}>{t.status?.replace('_', ' ')}</span><br />
              📍 {t.lat?.toFixed(5)}, {t.lng?.toFixed(5)}<br />
              🕒 {new Date(t.lastSeen).toLocaleTimeString()}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapDashboard;
