import React, { useState, useEffect } from 'react';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const mockAlerts = [
    { id: 1, message: 'Tourist reported missing near Red Fort area', createdAt: new Date().toISOString(), priority: 'high' },
    { id: 2, message: 'Medical emergency at India Gate', createdAt: new Date(Date.now() - 3600000).toISOString(), priority: 'critical' },
    { id: 3, message: 'Traffic congestion reported on NH-1', createdAt: new Date(Date.now() - 7200000).toISOString(), priority: 'medium' }
  ];

  const displayAlerts = alerts.length > 0 ? alerts : mockAlerts;

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return '#e74c3c';
      case 'high': return '#f39c12';
      case 'medium': return '#3498db';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 60px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: '#7f8c8d', fontSize: '18px' }}>Loading alerts...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 60px)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#2c3e50', fontSize: '28px', fontWeight: '300', margin: 0 }}>Emergency Alerts</h2>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              backgroundColor: refreshing ? '#95a5a6' : '#3498db',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #e1e5e9',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="all">All Alerts</option>
            <option value="critical">Critical</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
          </select>
        </div>

        {displayAlerts.length > 0 ? (
          displayAlerts.map((alert, index) => (
            <div key={alert.id || index} style={{ 
              backgroundColor: 'white',
              padding: '25px', 
              margin: '15px 0',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
              borderLeft: `4px solid ${getPriorityColor(alert.priority)}`,
              transition: 'transform 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateX(5px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateX(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span style={{
                  backgroundColor: getPriorityColor(alert.priority),
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>
                  {alert.priority || 'Normal'}
                </span>
                <span style={{ color: '#7f8c8d', fontSize: '12px' }}>
                  {new Date(alert.createdAt).toLocaleString()}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.5', color: '#2c3e50' }}>
                {alert.message}
              </p>
            </div>
          ))
        ) : (
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
          }}>
            <p style={{ color: '#7f8c8d', fontSize: '16px', margin: 0 }}>No alerts available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;