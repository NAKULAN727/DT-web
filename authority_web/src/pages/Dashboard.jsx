import React, { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:5000/api';

const Dashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [tourists, setTourists] = useState([]);
  const [selectedTourist, setSelectedTourist] = useState(null);
  const [assignedOfficers, setAssignedOfficers] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [alertsRes, touristsRes] = await Promise.all([
        fetch(`${API}/alerts`),
        fetch(`${API}/location`)
      ]);
      if (alertsRes.ok) setAlerts(await alertsRes.json());
      if (touristsRes.ok) setTourists(await touristsRes.json());
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const assignOfficer = (alertId, officerName, officerContact) => {
    setAssignedOfficers(prev => ({
      ...prev,
      [alertId]: { name: officerName, contact: officerContact, assignedAt: new Date() }
    }));
    alert(`Officer ${officerName} assigned to alert #${alertId}. Notification sent to ${officerContact}`);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      default: return '#3b82f6';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 60px)', backgroundColor: '#f8f9fa' }}>
        <p style={{ color: '#7f8c8d', fontSize: '18px' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 60px)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '30px' }}>
          {[
            { label: 'Total Tourists', value: tourists.length, color: '#3b82f6' },
            { label: 'Active Alerts', value: alerts.length, color: '#ef4444' },
            { label: 'Last Refresh', value: lastRefresh?.toLocaleTimeString() || '--', color: '#10b981' }
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>

          {/* Tourist Locations Panel */}
          <div>
            <h2 style={{ color: '#2c3e50', marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>
              Live Tourist Locations ({tourists.length})
            </h2>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxHeight: '500px', overflowY: 'auto' }}>
              {tourists.length === 0 ? (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>No tourists tracked yet.</p>
              ) : tourists.map((t, i) => (
                <div key={t._id || i}
                  onClick={() => setSelectedTourist(t)}
                  style={{
                    padding: '14px',
                    margin: '8px 0',
                    borderRadius: '8px',
                    border: `2px solid ${t.status === 'help_needed' ? '#ef4444' : '#10b981'}`,
                    cursor: 'pointer',
                    backgroundColor: selectedTourist?._id === t._id ? '#f3f4f6' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#1f2937', fontSize: '15px' }}>{t.touristId}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                        📍 {t.lat?.toFixed(5)}, {t.lng?.toFixed(5)}
                      </p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#9ca3af' }}>
                        Last seen: {new Date(t.lastSeen).toLocaleTimeString()}
                      </p>
                    </div>
                    <span style={{
                      backgroundColor: t.status === 'help_needed' ? '#ef4444' : '#10b981',
                      color: 'white', padding: '4px 10px', borderRadius: '20px',
                      fontSize: '11px', fontWeight: '600', textTransform: 'uppercase'
                    }}>
                      {t.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts Panel */}
          <div>
            <h2 style={{ color: '#2c3e50', marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>
              Emergency Alerts ({alerts.length})
            </h2>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxHeight: '500px', overflowY: 'auto' }}>
              {alerts.length === 0 ? (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>No alerts yet.</p>
              ) : alerts.map((alert, i) => {
                const officer = assignedOfficers[alert._id];
                return (
                  <div key={alert._id || i} style={{
                    padding: '16px', margin: '10px 0', borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    borderLeft: `4px solid ${getPriorityColor(alert.priority)}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                          Tourist: {alert.touristId}
                        </p>
                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#6b7280' }}>{alert.message}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>
                          📍 {alert.location?.lat?.toFixed(5)}, {alert.location?.lng?.toFixed(5)} •{' '}
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {officer ? (
                      <div style={{ backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#166534' }}>
                          👮 <strong>{officer.name}</strong> — {officer.contact}
                        </p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#16a34a' }}>
                          Assigned: {officer.assignedAt.toLocaleTimeString()}
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <input
                          type="text"
                          placeholder="Officer Name"
                          id={`officer-${alert._id}`}
                          style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
                        />
                        <input
                          type="text"
                          placeholder="Mobile/Email"
                          id={`contact-${alert._id}`}
                          style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
                        />
                        <button
                          onClick={() => {
                            const name = document.getElementById(`officer-${alert._id}`).value;
                            const contact = document.getElementById(`contact-${alert._id}`).value;
                            if (name && contact) assignOfficer(alert._id, name, contact);
                            else alert('Enter officer name and contact');
                          }}
                          style={{
                            backgroundColor: '#3b82f6', color: 'white', border: 'none',
                            padding: '7px 14px', borderRadius: '6px', cursor: 'pointer',
                            fontSize: '13px', fontWeight: '600'
                          }}
                        >
                          Assign
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Tourist Map */}
        {selectedTourist && (
          <div style={{ marginTop: '30px' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>
              Live Location: {selectedTourist.touristId}
            </h2>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '14px' }}>
                📍 {selectedTourist.lat?.toFixed(6)}, {selectedTourist.lng?.toFixed(6)} •
                Last seen: {new Date(selectedTourist.lastSeen).toLocaleString()}
              </p>
              <div style={{ width: '100%', height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedTourist.lng - 0.01},${selectedTourist.lat - 0.01},${selectedTourist.lng + 0.01},${selectedTourist.lat + 0.01}&layer=mapnik&marker=${selectedTourist.lat},${selectedTourist.lng}`}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  title="Tourist Location"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
