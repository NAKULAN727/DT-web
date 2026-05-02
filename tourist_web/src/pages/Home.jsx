import React, { useState, useEffect } from 'react';
import MapView from '../components/MapView';
import PanicButton from '../components/PanicButton';

const Home = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [safetyStatus, setSafetyStatus] = useState('Safe');
  const [nearbyAlerts, setNearbyAlerts] = useState(2);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const statusCards = [
    { title: 'Safety Status', value: safetyStatus, color: '#27ae60', icon: '🛡️' },
    { title: 'Nearby Alerts', value: nearbyAlerts, color: '#f39c12', icon: '⚠️' },
    { title: 'Emergency Contacts', value: '4 Available', color: '#3498db', icon: '📞' }
  ];

  return (
    <div style={{ padding: '40px', backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 60px)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h2 style={{ color: '#2c3e50', fontSize: '28px', fontWeight: '300', margin: '0 0 5px 0' }}>Dashboard</h2>
            <p style={{ color: '#7f8c8d', margin: 0, fontSize: '16px' }}>
              {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString()}
            </p>
          </div>
          <div style={{
            backgroundColor: '#27ae60',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            🟢 Online
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {statusCards.map((card, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
              textAlign: 'center',
              transition: 'transform 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>{card.icon}</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {card.title}
              </h3>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: card.color }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
        
        <div style={{ marginBottom: '40px' }}>
          <MapView />
        </div>
        
        <div style={{ 
          textAlign: 'center',
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '500' }}>
            Emergency Response
          </h3>
          <p style={{ color: '#7f8c8d', marginBottom: '25px', fontSize: '14px' }}>
            Press the button below if you need immediate assistance
          </p>
          <PanicButton />
        </div>
      </div>
    </div>
  );
};

export default Home;