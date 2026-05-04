import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import MapDashboard from '../components/MapDashboard';

const API = 'http://localhost:5000/api';

const Dashboard = () => {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [tourists, setTourists] = useState([]);
  const [efirs, setEfirs] = useState([]);
  const [selectedTourist, setSelectedTourist] = useState(null);
  const [activeTab, setActiveTab] = useState('map');
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [assignForm, setAssignForm] = useState({});

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchData = useCallback(async () => {
    try {
      const [alertsRes, touristsRes, efirsRes] = await Promise.all([
        fetch(`${API}/alerts`, { headers }),
        fetch(`${API}/location`, { headers }),
        fetch(`${API}/efir`, { headers })
      ]);
      if (alertsRes.ok) setAlerts(await alertsRes.json());
      if (touristsRes.ok) setTourists(await touristsRes.json());
      if (efirsRes.ok) setEfirs(await efirsRes.json());
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Socket.io real-time updates
  useEffect(() => {
    import('socket.io-client').then(({ io }) => {
      const socket = io('http://localhost:5000');
      socket.on('new_alert', alert => setAlerts(prev => [{ ...alert, assignment: null }, ...prev]));
      socket.on('location_update', tourist => setTourists(prev => {
        const idx = prev.findIndex(t => t.touristId === tourist.touristId);
        if (idx >= 0) { const updated = [...prev]; updated[idx] = tourist; return updated; }
        return [tourist, ...prev];
      }));
      socket.on('officer_assigned', ({ alertId, officerName, officerContact }) => {
        setAlerts(prev => prev.map(a =>
          a._id === alertId ? { ...a, assignment: { officerName, officerContact, assignedAt: new Date() } } : a
        ));
      });
      socket.on('new_efir', efir => setEfirs(prev => [efir, ...prev]));
      return () => socket.disconnect();
    });
  }, []);

  const assignOfficer = async (alertId) => {
    const { officerName, officerContact } = assignForm[alertId] || {};
    if (!officerName || !officerContact) return alert('Enter officer name and contact');
    try {
      const res = await fetch(`${API}/assignments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ alertId, officerName, officerContact })
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error);
      setAlerts(prev => prev.map(a =>
        a._id === alertId ? { ...a, assignment: data.assignment } : a
      ));
      setAssignForm(prev => { const f = { ...prev }; delete f[alertId]; return f; });
    } catch { alert('Failed to assign officer'); }
  };

  const updateEfirStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/efir/${id}/status`, { method: 'PATCH', headers, body: JSON.stringify({ status }) });
      if (res.ok) setEfirs(prev => prev.map(e => e._id === id ? { ...e, status } : e));
    } catch { alert('Failed to update status'); }
  };

  const getPriorityColor = (p) => ({ critical: '#dc2626', high: '#ea580c', medium: '#d97706' }[p] || '#3b82f6');
  const statusBadge = (color, text) => (
    <span style={{ backgroundColor: color, color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>
      {text}
    </span>
  );

  const tabs = ['map', 'alerts', 'efir'];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 60px)', backgroundColor: '#f8f9fa' }}>
      <p style={{ color: '#7f8c8d', fontSize: '18px' }}>Loading dashboard...</p>
    </div>
  );

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 60px)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Tourists Tracked', value: tourists.length, color: '#3b82f6' },
            { label: 'Active Alerts', value: alerts.filter(a => !a.assignment).length, color: '#ef4444' },
            { label: 'E-FIR Pending', value: efirs.filter(e => e.status === 'pending').length, color: '#f59e0b' },
            { label: 'Last Refresh', value: lastRefresh?.toLocaleTimeString() || '--', color: '#10b981' }
          ].map((s, i) => (
            <div key={i} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</p>
              <p style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              backgroundColor: activeTab === tab ? '#1a365d' : 'white',
              color: activeTab === tab ? 'white' : '#6b7280',
              fontWeight: '600', fontSize: '14px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              {tab === 'efir' ? 'E-FIR' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'alerts' && alerts.filter(a => !a.assignment).length > 0 && (
                <span style={{ marginLeft: '8px', backgroundColor: '#ef4444', color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '11px' }}>
                  {alerts.filter(a => !a.assignment).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Map Tab */}
        {activeTab === 'map' && (
          <div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[['#10b981', 'Safe'], ['#ef4444', 'Help Needed'], ['#6b7280', 'Offline']].map(([color, label]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color }} />
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>{label}</span>
                  </div>
                ))}
              </div>
              <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#9ca3af' }}>
                🔴 Live • {tourists.length} tourists tracked
              </span>
            </div>
            <MapDashboard tourists={tourists} onSelectTourist={setSelectedTourist} />
            {selectedTourist && (
              <div style={{ marginTop: '16px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Selected: {selectedTourist.touristId}</h4>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>
                  📍 {selectedTourist.lat?.toFixed(6)}, {selectedTourist.lng?.toFixed(6)}
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                  🕒 Last seen: {new Date(selectedTourist.lastSeen).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>
              Emergency Alerts ({alerts.length})
            </h3>
            {alerts.length === 0 ? (
              <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ color: '#9ca3af' }}>No alerts yet.</p>
              </div>
            ) : alerts.map((alert, i) => (
              <div key={alert._id || i} style={{
                backgroundColor: 'white', padding: '20px', marginBottom: '12px',
                borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${getPriorityColor(alert.priority)}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#1f2937' }}>Tourist: {alert.touristId}</p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>{alert.message}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                      📍 {alert.location?.lat?.toFixed(5)}, {alert.location?.lng?.toFixed(5)} • {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {statusBadge(getPriorityColor(alert.priority), alert.priority || 'normal')}
                </div>

                {alert.assignment ? (
                  <div style={{ backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#166534' }}>
                      👮 <strong>{alert.assignment.officerName}</strong> — {alert.assignment.officerContact}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#16a34a' }}>
                      Assigned: {new Date(alert.assignment.assignedAt).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <input type="text" placeholder="Officer Name"
                      value={assignForm[alert._id]?.officerName || ''}
                      onChange={e => setAssignForm(prev => ({ ...prev, [alert._id]: { ...prev[alert._id], officerName: e.target.value } }))}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }} />
                    <input type="text" placeholder="Mobile/Email"
                      value={assignForm[alert._id]?.officerContact || ''}
                      onChange={e => setAssignForm(prev => ({ ...prev, [alert._id]: { ...prev[alert._id], officerContact: e.target.value } }))}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }} />
                    <button onClick={() => assignOfficer(alert._id)} style={{
                      backgroundColor: '#3b82f6', color: 'white', border: 'none',
                      padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                    }}>Assign</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* E-FIR Tab */}
        {activeTab === 'efir' && (
          <div>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>
              E-FIR Complaints ({efirs.length})
            </h3>
            {efirs.length === 0 ? (
              <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ color: '#9ca3af' }}>No complaints filed yet.</p>
              </div>
            ) : efirs.map((efir, i) => (
              <div key={efir._id || i} style={{
                backgroundColor: 'white', padding: '20px', marginBottom: '12px',
                borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${efir.status === 'pending' ? '#f59e0b' : efir.status === 'reviewed' ? '#3b82f6' : '#10b981'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#1f2937' }}>{efir.name}</p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>📍 {efir.location}</p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#374151' }}>{efir.description}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                      Filed: {new Date(efir.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  {statusBadge(
                    efir.status === 'pending' ? '#f59e0b' : efir.status === 'reviewed' ? '#3b82f6' : '#10b981',
                    efir.status
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['reviewed', 'resolved'].map(s => (
                    <button key={s} onClick={() => updateEfirStatus(efir._id, s)}
                      disabled={efir.status === s}
                      style={{
                        padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: efir.status === s ? 'not-allowed' : 'pointer',
                        backgroundColor: efir.status === s ? '#e5e7eb' : '#1a365d',
                        color: efir.status === s ? '#9ca3af' : 'white', fontSize: '13px', fontWeight: '500'
                      }}>
                      Mark {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
