import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import MapDashboard from '../components/MapDashboard';

const API = 'http://localhost:5000/api';

const Dashboard = ({ onLogout }) => {
  const { token, user, logout } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [tourists, setTourists] = useState([]);
  const [registeredTourists, setRegisteredTourists] = useState([]);
  const [efirs, setEfirs] = useState([]);
  const [selectedTourist, setSelectedTourist] = useState(null);
  const [selectedRegTourist, setSelectedRegTourist] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [assignForm, setAssignForm] = useState({});

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchData = useCallback(async () => {
    try {
      const [alertsRes, touristsRes, efirsRes, regTouristsRes] = await Promise.all([
        fetch(`${API}/alerts`, { headers }),
        fetch(`${API}/location`, { headers }),
        fetch(`${API}/efir`, { headers }),
        fetch(`${API}/tourists`, { headers })
      ]);
      if (alertsRes.ok) setAlerts(await alertsRes.json());
      if (touristsRes.ok) setTourists(await touristsRes.json());
      if (efirsRes.ok) setEfirs(await efirsRes.json());
      if (regTouristsRes.ok) setRegisteredTourists(await regTouristsRes.json());
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Socket.io real-time updates
  useEffect(() => {
    import('socket.io-client').then(({ io }) => {
      const socket = io('http://localhost:5000');
      
      socket.on('new_alert', alert => {
        setAlerts(prev => [{ ...alert, assignment: null }, ...prev]);
        // Notification sound or visual could go here
      });
      
      socket.on('location_update', tourist => {
        setTourists(prev => {
          const idx = prev.findIndex(t => t.touristId === tourist.touristId);
          if (idx >= 0) { const updated = [...prev]; updated[idx] = tourist; return updated; }
          return [tourist, ...prev];
        });
      });
      
      socket.on('officer_assigned', ({ alertId, officerName, officerContact }) => {
        setAlerts(prev => prev.map(a =>
          a._id === alertId ? { ...a, assignment: { officerName, officerContact, assignedAt: new Date() } } : a
        ));
      });
      
      socket.on('new_efir', efir => {
        setEfirs(prev => [efir, ...prev]);
      });

      return () => socket.disconnect();
    });
  }, []);

  const handleLogout = () => {
    logout();
    onLogout();
  };

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
    <span style={{ backgroundColor: color, color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {text}
    </span>
  );

  const activeAlertsCount = alerts.filter(a => !a.assignment).length;
  const pendingEfirCount = efirs.filter(e => e.status === 'pending').length;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f4f6' }}>
      <p style={{ color: '#6b7280', fontSize: '18px', fontWeight: '500' }}>Initializing Command Center...</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6', overflow: 'hidden' }}>
      
      {/* Sidebar */}
      <div style={{ width: '260px', backgroundColor: '#1e3a8a', color: 'white', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 10px rgba(0,0,0,0.1)', zIndex: 10 }}>
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🚔</span> Police Dashboard
          </h2>
        </div>
        
        <div style={{ flex: 1, padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'dashboard', label: 'Overview', icon: '📊' },
            { id: 'users', label: 'Tourists Directory', icon: '👥' },
            { id: 'map', label: 'Live Monitoring', icon: '🗺️' },
            { id: 'alerts', label: 'SOS Alerts', icon: '🚨', count: activeAlertsCount, countColor: '#ef4444' },
            { id: 'efir', label: 'E-FIR Management', icon: '📝', count: pendingEfirCount, countColor: '#f59e0b' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSelectedRegTourist(null); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 24px', backgroundColor: activeTab === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: activeTab === item.id ? '#ffffff' : '#9ca3af', border: 'none',
                cursor: 'pointer', textAlign: 'left', fontSize: '15px', fontWeight: '500',
                transition: 'all 0.2s', borderLeft: activeTab === item.id ? '4px solid #60a5fa' : '4px solid transparent'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {item.label}
              </span>
              {item.count > 0 && (
                <span style={{ backgroundColor: item.countColor, color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ marginBottom: '16px', fontSize: '13px', color: '#9ca3af' }}>
            Logged in as:<br/>
            <strong style={{ color: 'white', fontSize: '14px' }}>{user?.name || user?.email}</strong>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none',
            borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background-color 0.2s'
          }}>
            <span>🚪</span> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Header */}
        <header style={{ backgroundColor: 'white', height: '70px', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', zIndex: 5 }}>
          <h1 style={{ margin: 0, fontSize: '20px', color: '#1f2937', fontWeight: '600' }}>
            {activeTab === 'dashboard' && 'Command Overview'}
            {activeTab === 'users' && 'Registered Tourists Directory'}
            {activeTab === 'map' && 'Live Tourist Monitoring'}
            {activeTab === 'alerts' && 'Emergency SOS Alerts'}
            {activeTab === 'efir' && 'E-FIR Management'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#10b981', fontWeight: '500', backgroundColor: '#d1fae5', padding: '6px 12px', borderRadius: '20px' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)' }}></div>
              System Online
            </span>
          </div>
        </header>

        {/* Scrollable Content */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {[
                  { label: 'Active Tourists Tracked', value: tourists.length, color: '#3b82f6', bg: '#eff6ff', icon: '📍' },
                  { label: 'Unresolved SOS Alerts', value: activeAlertsCount, color: '#ef4444', bg: '#fef2f2', icon: '🚨' },
                  { label: 'Pending E-FIRs', value: pendingEfirCount, color: '#f59e0b', bg: '#fffbeb', icon: '📋' },
                  { label: 'Officers Dispatched', value: alerts.filter(a => a.assignment).length, color: '#10b981', bg: '#ecfdf5', icon: '🚓' }
                ].map((s, i) => (
                  <div key={i} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', borderLeft: `5px solid ${s.color}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{s.label}</p>
                        <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>{s.value}</p>
                      </div>
                      <div style={{ fontSize: '28px', backgroundColor: s.bg, width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
                        {s.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Directory Tab */}
          {activeTab === 'users' && (
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              {!selectedRegTourist ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {registeredTourists.map(t => {
                      const statusColor = t.status === 'ALERT' ? '#ef4444' : '#10b981';
                      return (
                        <div key={t._id} onClick={() => setSelectedRegTourist(t)} style={{
                          backgroundColor: 'white', padding: '24px', borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', cursor: 'pointer',
                          borderTop: `4px solid ${statusColor}`,
                          transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' }
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1f2937' }}>{t.name || 'Unknown User'}</h4>
                            <span style={{ backgroundColor: t.status === 'ALERT' ? '#fef2f2' : '#ecfdf5', color: statusColor, padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                              {t.status || 'SAFE'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>📧</span> {t.email}
                            </p>
                            {t.phone && (
                              <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>📞</span> {t.phone}
                              </p>
                            )}
                            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                              <span>📋</span> Click to view full details
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {registeredTourists.length === 0 && (
                    <div style={{ backgroundColor: 'white', padding: '60px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                      <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>No registered tourists found in the system.</p>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <button onClick={() => setSelectedRegTourist(null)} style={{ marginBottom: '20px', padding: '8px 16px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>←</span> Back to Directory
                  </button>
                  
                  <div style={{ display: 'flex', gap: '24px', flexDirection: 'column' }}>
                    {/* Top Info Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                      {/* Tourist Info */}
                      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>Tourist Details</h3>
                        <p style={{ margin: '0 0 8px 0', fontSize: '15px' }}><strong>Name:</strong> {selectedRegTourist.name || 'N/A'}</p>
                        <p style={{ margin: '0 0 8px 0', fontSize: '15px' }}><strong>Email:</strong> {selectedRegTourist.email || 'N/A'}</p>
                        <p style={{ margin: '0 0 8px 0', fontSize: '15px' }}><strong>Phone:</strong> {selectedRegTourist.phone || 'N/A'}</p>
                        <p style={{ margin: '0', fontSize: '15px' }}><strong>Status:</strong> <span style={{ color: selectedRegTourist.status === 'ALERT' ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>{selectedRegTourist.status || 'SAFE'}</span></p>
                      </div>

                      {/* Trip Info */}
                      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>Trip Details</h3>
                        <p style={{ margin: '0 0 8px 0', fontSize: '15px' }}><strong>Destination:</strong> {selectedRegTourist.tripDetails?.destination || 'N/A'}</p>
                        <p style={{ margin: '0 0 8px 0', fontSize: '15px' }}><strong>Start Date:</strong> {selectedRegTourist.tripDetails?.startDate || 'N/A'}</p>
                        <p style={{ margin: '0', fontSize: '15px' }}><strong>End Date:</strong> {selectedRegTourist.tripDetails?.endDate || 'N/A'}</p>
                      </div>

                      {/* Guardian Info */}
                      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>Guardian Information</h3>
                        <p style={{ margin: '0 0 8px 0', fontSize: '15px' }}><strong>Name:</strong> {selectedRegTourist.guardianName || 'N/A'}</p>
                        <p style={{ margin: '0', fontSize: '15px' }}><strong>Phone:</strong> {selectedRegTourist.guardianPhone || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Live Location Map */}
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1f2937' }}>Live Location</h3>
                      {selectedRegTourist.location?.lat && selectedRegTourist.location?.lng ? (
                        <div style={{ height: '400px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                          <MapDashboard tourists={[{
                            _id: selectedRegTourist._id,
                            touristId: selectedRegTourist.name || 'Unknown',
                            status: selectedRegTourist.status === 'ALERT' ? 'help_needed' : 'safe',
                            lat: selectedRegTourist.location.lat,
                            lng: selectedRegTourist.location.lng,
                            lastSeen: selectedRegTourist.location.updatedAt || new Date()
                          }]} />
                        </div>
                      ) : (
                        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                          <p style={{ color: '#6b7280', margin: 0 }}>Location data not available for this tourist.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Map Tab */}
          {activeTab === 'map' && (
            <div style={{ height: 'calc(100% - 20px)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', alignItems: 'center', backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                {[['#10b981', 'Safe'], ['#ef4444', 'SOS Active'], ['#6b7280', 'Offline']].map(([color, label]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, border: '2px solid white', boxShadow: `0 0 0 1px ${color}` }} />
                    <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: '500' }}>{label}</span>
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, position: 'relative', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <MapDashboard tourists={tourists} onSelectTourist={setSelectedTourist} />
              </div>
              {selectedTourist && (
                <div style={{ marginTop: '20px', backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', gap: '32px', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '18px' }}>Selected Target ID: {selectedTourist.touristId}</h4>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>
                      <strong style={{ color: '#374151' }}>Coordinates:</strong> {selectedTourist.lat?.toFixed(6)}, {selectedTourist.lng?.toFixed(6)}
                    </p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>
                      <strong style={{ color: '#374151' }}>Contact:</strong> {selectedTourist.email || 'N/A'} {selectedTourist.phone ? `• ${selectedTourist.phone}` : ''}
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                      <strong style={{ color: '#374151' }}>Last Ping:</strong> {selectedTourist.lastSeen ? new Date(selectedTourist.lastSeen).toLocaleString() : 'Offline'}
                    </p>
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => setSelectedTourist(null)} style={{ padding: '8px 16px', border: '1px solid #d1d5db', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', color: '#4b5563' }}>Clear Selection</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              {alerts.length === 0 ? (
                <div style={{ backgroundColor: 'white', padding: '60px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '20px' }}>No Active Alerts</h3>
                  <p style={{ color: '#6b7280', margin: 0 }}>All tourists are currently safe.</p>
                </div>
              ) : alerts.map((alert, i) => (
                <div key={alert._id || i} style={{
                  backgroundColor: 'white', padding: '24px', marginBottom: '16px',
                  borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  borderLeft: `6px solid ${getPriorityColor(alert.priority)}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '18px', color: '#1f2937', fontWeight: 'bold' }}>Tourist ID: {alert.touristId}</h4>
                        {statusBadge(getPriorityColor(alert.priority), alert.priority || 'high priority')}
                      </div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#4b5563', backgroundColor: '#f3f4f6', padding: '10px 14px', borderRadius: '8px' }}>
                        "{alert.message}"
                      </p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', display: 'flex', gap: '16px' }}>
                        <span>📍 {alert.location?.lat?.toFixed(5)}, {alert.location?.lng?.toFixed(5)}</span>
                        <span>🕒 {new Date(alert.timestamp).toLocaleString()}</span>
                      </p>
                    </div>
                  </div>

                  {alert.assignment ? (
                    <div style={{ backgroundColor: '#ecfdf5', padding: '16px', borderRadius: '8px', border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#065f46', fontWeight: '600' }}>
                          👮 Dispatched: {alert.assignment.officerName}
                        </p>
                        <p style={{ margin: 0, fontSize: '13px', color: '#047857' }}>
                          📞 Contact: {alert.assignment.officerContact} • Assigned at {new Date(alert.assignment.assignedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <span style={{ backgroundColor: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>RESPONDING</span>
                    </div>
                  ) : (
                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '16px' }}>
                      <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Dispatch Officer:</p>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <input type="text" placeholder="Officer Name (e.g. Sgt. Smith)"
                          value={assignForm[alert._id]?.officerName || ''}
                          onChange={e => setAssignForm(prev => ({ ...prev, [alert._id]: { ...prev[alert._id], officerName: e.target.value } }))}
                          style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }} />
                        <input type="text" placeholder="Contact/Radio ID"
                          value={assignForm[alert._id]?.officerContact || ''}
                          onChange={e => setAssignForm(prev => ({ ...prev, [alert._id]: { ...prev[alert._id], officerContact: e.target.value } }))}
                          style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }} />
                        <button onClick={() => assignOfficer(alert._id)} style={{
                          backgroundColor: '#2563eb', color: 'white', border: 'none',
                          padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'background-color 0.2s'
                        }}>Dispatch Unit</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* E-FIR Tab */}
          {activeTab === 'efir' && (
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              {efirs.length === 0 ? (
                <div style={{ backgroundColor: 'white', padding: '60px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '20px' }}>No E-FIRs</h3>
                  <p style={{ color: '#6b7280', margin: 0 }}>There are no complaints filed at the moment.</p>
                </div>
              ) : efirs.map((efir, i) => (
                <div key={efir._id || i} style={{
                  backgroundColor: 'white', padding: '24px', marginBottom: '16px',
                  borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  borderLeft: `6px solid ${efir.status === 'pending' ? '#f59e0b' : efir.status === 'reviewed' ? '#3b82f6' : '#10b981'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '18px', color: '#1f2937', fontWeight: 'bold' }}>{efir.name}</h4>
                        {statusBadge(
                          efir.status === 'pending' ? '#f59e0b' : efir.status === 'reviewed' ? '#3b82f6' : '#10b981',
                          efir.status
                        )}
                      </div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📍</span> <strong>Location:</strong> {efir.location}
                      </p>
                      <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #f3f4f6', marginBottom: '12px' }}>
                        <p style={{ margin: 0, fontSize: '15px', color: '#374151', lineHeight: '1.5' }}>{efir.description}</p>
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>
                        Filed on: {new Date(efir.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    {['pending', 'reviewed', 'resolved'].map(s => (
                      <button key={s} onClick={() => updateEfirStatus(efir._id, s)}
                        disabled={efir.status === s}
                        style={{
                          padding: '8px 16px', borderRadius: '6px', border: '1px solid', cursor: efir.status === s ? 'default' : 'pointer',
                          backgroundColor: efir.status === s ? (s === 'pending' ? '#fef3c7' : s === 'reviewed' ? '#eff6ff' : '#d1fae5') : 'white',
                          borderColor: efir.status === s ? (s === 'pending' ? '#f59e0b' : s === 'reviewed' ? '#3b82f6' : '#10b981') : '#d1d5db',
                          color: efir.status === s ? (s === 'pending' ? '#b45309' : s === 'reviewed' ? '#1d4ed8' : '#047857') : '#4b5563',
                          fontSize: '13px', fontWeight: '600', transition: 'all 0.2s'
                        }}>
                        {efir.status === s ? `✓ Current: ${s.toUpperCase()}` : `Mark ${s.toUpperCase()}`}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
