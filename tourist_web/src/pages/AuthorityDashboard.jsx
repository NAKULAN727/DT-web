import React, { useState, useEffect, useMemo } from 'react';

const AuthorityDashboard = () => {
  const [tourists, setTourists] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedTourist, setSelectedTourist] = useState(null);
  const [assignedOfficers, setAssignedOfficers] = useState({});
  const [availableMembers, setAvailableMembers] = useState([]);
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLocationPopup, setShowLocationPopup] = useState(null);

  useEffect(() => {
    const mockMembers = [
      { id: 1, name: 'Inspector Raj Kumar', contact: '+91 9876543220', status: 'available', location: 'Central Delhi', badge: 'DL001' },
      { id: 2, name: 'Sub-Inspector Priya Singh', contact: '+91 9876543221', status: 'busy', location: 'South Delhi', badge: 'DL002' },
      { id: 3, name: 'Constable Amit Sharma', contact: '+91 9876543222', status: 'available', location: 'North Delhi', badge: 'DL003' },
      { id: 4, name: 'Head Constable Neha Gupta', contact: '+91 9876543223', status: 'available', location: 'East Delhi', badge: 'DL004' },
      { id: 5, name: 'Inspector Vikram Singh', contact: '+91 9876543224', status: 'off_duty', location: 'West Delhi', badge: 'DL005' }
    ];
    
    const mockTourists = [
      { id: 1, name: 'John Smith', phone: '+91 9876543210', location: { lat: 28.6139, lng: 77.2090 }, status: 'safe', lastSeen: new Date(Date.now() - 120000), lostTime: null, nationality: 'USA' },
      { id: 2, name: 'Sarah Johnson', phone: '+91 9876543211', location: { lat: 28.6129, lng: 77.2295 }, status: 'help_needed', lastSeen: new Date(Date.now() - 300000), lostTime: new Date(Date.now() - 300000), nationality: 'UK' },
      { id: 3, name: 'Mike Wilson', phone: '+91 9876543212', location: { lat: 28.6169, lng: 77.2295 }, status: 'lost', lastSeen: new Date(Date.now() - 1800000), lostTime: new Date(Date.now() - 1800000), nationality: 'Canada' },
      { id: 4, name: 'Emma Davis', phone: '+91 9876543213', location: { lat: 28.6200, lng: 77.2100 }, status: 'lost', lastSeen: new Date(Date.now() - 3600000), lostTime: new Date(Date.now() - 3600000), nationality: 'Australia' },
      { id: 5, name: 'Hans Mueller', phone: '+91 9876543214', location: { lat: 28.6180, lng: 77.2080 }, status: 'safe', lastSeen: new Date(Date.now() - 60000), lostTime: null, nationality: 'Germany' }
    ];
    
    const mockAlerts = mockTourists
      .filter(t => t.status === 'help_needed' || t.status === 'lost')
      .map(tourist => {
        const timeLost = tourist.lostTime ? (Date.now() - tourist.lostTime.getTime()) / (1000 * 60) : 0;
        let priority = 'low';
        if (timeLost > 60) priority = 'critical';
        else if (timeLost > 30) priority = 'high';
        else if (timeLost > 10) priority = 'medium';
        
        return {
          id: tourist.id,
          touristId: tourist.id,
          message: tourist.status === 'lost' ? `Tourist missing for ${Math.floor(timeLost)} minutes` : 'Emergency assistance requested',
          location: tourist.location,
          timestamp: tourist.lostTime || new Date(),
          priority,
          timeLost: Math.floor(timeLost),
          status: 'open'
        };
      })
      .sort((a, b) => {
        const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    
    setTourists(mockTourists);
    setAlerts(mockAlerts);
    setAvailableMembers(mockMembers);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const filteredTourists = useMemo(() => {
    return tourists.filter(tourist => {
      const matchesSearch = tourist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tourist.phone.includes(searchTerm) ||
                           tourist.nationality.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || tourist.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [tourists, searchTerm, filterStatus]);

  const stats = useMemo(() => ({
    totalTourists: tourists.length,
    safeTourists: tourists.filter(t => t.status === 'safe').length,
    alertTourists: tourists.filter(t => t.status === 'help_needed' || t.status === 'lost').length,
    availableOfficers: availableMembers.filter(m => m.status === 'available').length,
    busyOfficers: availableMembers.filter(m => m.status === 'busy').length,
    criticalAlerts: alerts.filter(a => a.priority === 'critical').length
  }), [tourists, availableMembers, alerts]);

  const assignMember = (alertId, memberId) => {
    const member = availableMembers.find(m => m.id === memberId);
    if (member && member.status === 'available') {
      setAssignedOfficers(prev => ({
        ...prev,
        [alertId]: { 
          id: member.id,
          name: member.name, 
          contact: member.contact, 
          location: member.location,
          badge: member.badge,
          assignedAt: new Date() 
        }
      }));
      
      setAvailableMembers(prev => 
        prev.map(m => m.id === memberId ? { ...m, status: 'busy' } : m)
      );
      
      setAlerts(prev => 
        prev.map(a => a.id === alertId ? { ...a, status: 'assigned' } : a)
      );
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'safe': return '#10b981';
      case 'help_needed': return '#f59e0b';
      case 'lost': return '#ef4444';
      case 'offline': return '#6b7280';
      default: return '#3b82f6';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#2563eb';
      default: return '#6b7280';
    }
  };

  const renderNavbar = () => (
    <nav style={{
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '0 2rem',
      height: '64px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      borderBottom: '1px solid #374151'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#f3f4f6' }}>
          🚔 Police Command Center
        </div>
        <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>
          {currentTime.toLocaleString()}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {['dashboard', 'map', 'alerts', 'contacts', 'team'].map(section => (
          <button
            key={section}
            style={{
              color: currentSection === section ? '#f3f4f6' : '#d1d5db',
              backgroundColor: currentSection === section ? '#374151' : 'transparent',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}
            onClick={() => setCurrentSection(section)}
          >
            {section}
          </button>
        ))}
      </div>
    </nav>
  );

  const renderStatsCards = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
      {[
        { title: 'Total Tourists', value: stats.totalTourists, color: '#3b82f6', icon: '👥' },
        { title: 'Safe', value: stats.safeTourists, color: '#10b981', icon: '✅' },
        { title: 'Need Help', value: stats.alertTourists, color: '#ef4444', icon: '🚨' },
        { title: 'Available Officers', value: stats.availableOfficers, color: '#10b981', icon: '👮' },
        { title: 'Busy Officers', value: stats.busyOfficers, color: '#f59e0b', icon: '⏰' },
        { title: 'Critical Alerts', value: stats.criticalAlerts, color: '#dc2626', icon: '🔥' }
      ].map((stat, index) => (
        <div key={index} style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>{stat.title}</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: '700', color: stat.color }}>{stat.value}</p>
            </div>
            <div style={{ fontSize: '24px' }}>{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDashboard = () => (
    <div style={{ padding: '2rem' }}>
      {renderStatsCards()}
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Search tourists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            minWidth: '150px'
          }}
        >
          <option value="all">All Status</option>
          <option value="safe">Safe</option>
          <option value="help_needed">Need Help</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
            Tourist Monitoring ({filteredTourists.length})
          </h3>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {filteredTourists.map(tourist => (
                <div key={tourist.id} style={{
                  padding: '1rem',
                  margin: '0.5rem 0',
                  borderRadius: '8px',
                  border: `2px solid ${getStatusColor(tourist.status)}`,
                  cursor: 'pointer',
                  backgroundColor: selectedTourist?.id === tourist.id ? '#f3f4f6' : 'white',
                  transition: 'all 0.2s'
                }}
                onClick={() => setSelectedTourist(tourist)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{tourist.name}</h4>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>{tourist.nationality} • {tourist.phone}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                        Last seen: {tourist.lastSeen.toLocaleTimeString()}
                        {tourist.lostTime && ` • Missing: ${Math.floor((Date.now() - tourist.lostTime.getTime()) / 60000)}m`}
                      </p>
                    </div>
                    <div style={{
                      backgroundColor: getStatusColor(tourist.status),
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {tourist.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
            Active Alerts ({alerts.filter(a => a.status === 'open').length})
          </h3>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {alerts.filter(a => a.status === 'open').slice(0, 5).map(alert => {
                const tourist = tourists.find(t => t.id === alert.touristId);
                return (
                  <div key={alert.id} style={{
                    padding: '1rem',
                    margin: '0.5rem 0',
                    borderRadius: '8px',
                    border: `1px solid ${getPriorityColor(alert.priority)}`,
                    backgroundColor: '#fefefe'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <h5 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                          {tourist?.name}
                        </h5>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>{alert.message}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>
                          {alert.timeLost}m ago
                        </p>
                      </div>
                      <span style={{
                        backgroundColor: getPriorityColor(alert.priority),
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {alert.priority}
                      </span>
                    </div>
                    
                    <select 
                      id={`member-${alert.id}`}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db',
                        fontSize: '12px',
                        marginBottom: '8px'
                      }}
                    >
                      <option value="">Assign Officer</option>
                      {availableMembers.filter(m => m.status === 'available').map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.badge})
                        </option>
                      ))}
                    </select>
                    <button 
                      onClick={() => {
                        const memberId = document.getElementById(`member-${alert.id}`).value;
                        if (memberId) assignMember(alert.id, parseInt(memberId));
                      }}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        width: '100%'
                      }}
                    >
                      Assign & Notify
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {selectedTourist && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
            Live Location: {selectedTourist.name}
          </h3>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{selectedTourist.name}</h4>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>📱 {selectedTourist.phone}</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>📍 {selectedTourist.location.lat.toFixed(6)}, {selectedTourist.location.lng.toFixed(6)}</p>
              </div>
              <div style={{
                backgroundColor: getStatusColor(selectedTourist.status),
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {selectedTourist.status.replace('_', ' ').toUpperCase()}
              </div>
            </div>
            
            <div style={{ 
              width: '100%', 
              height: '400px', 
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #e5e7eb'
            }}>
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedTourist.location.lng-0.01},${selectedTourist.location.lat-0.01},${selectedTourist.location.lng+0.01},${selectedTourist.location.lat+0.01}&layer=mapnik&marker=${selectedTourist.location.lat},${selectedTourist.location.lng}`}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title={`${selectedTourist.name} Location`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAlerts = () => (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ margin: '0 0 2rem 0', fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>Emergency Alerts Management</h2>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {alerts.map(alert => {
          const tourist = tourists.find(t => t.id === alert.touristId);
          const officer = assignedOfficers[alert.id];
          
          return (
            <div key={alert.id} style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              borderLeft: `4px solid ${getPriorityColor(alert.priority)}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                      Alert #{alert.id} - {tourist?.name}
                    </h4>
                    <span style={{
                      backgroundColor: getPriorityColor(alert.priority),
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {alert.priority}
                    </span>
                    <span style={{
                      backgroundColor: alert.status === 'assigned' ? '#10b981' : '#f59e0b',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {alert.status}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '14px', color: '#6b7280' }}>{alert.message}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                    Time missing: {alert.timeLost} minutes • Reported: {alert.timestamp.toLocaleString()}
                  </p>
                  
                  {officer && (
                    <div style={{ 
                      backgroundColor: '#f0fdf4', 
                      padding: '1rem', 
                      borderRadius: '8px', 
                      border: '1px solid #bbf7d0',
                      marginTop: '1rem'
                    }}>
                      <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '14px', fontWeight: '600', color: '#166534' }}>
                        Assigned Officer
                      </h5>
                      <p style={{ margin: '0 0 0.25rem 0', fontSize: '14px', color: '#166534' }}>
                        👮 {officer.name} ({officer.badge})
                      </p>
                      <p style={{ margin: '0 0 0.25rem 0', fontSize: '14px', color: '#166534' }}>
                        📱 {officer.contact}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#16a34a' }}>
                        Assigned: {officer.assignedAt.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderContacts = () => (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ margin: '0 0 2rem 0', fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>Emergency Contacts</h2>
      <div style={{ display: 'grid', gap: '1rem', maxWidth: '800px' }}>
        {[
          { name: 'Police Control Room', number: '100', description: 'Immediate police response', color: '#3b82f6' },
          { name: 'Fire Department', number: '101', description: 'Fire emergencies and rescue operations', color: '#ef4444' },
          { name: 'Medical Emergency', number: '102', description: 'Ambulance and medical assistance', color: '#10b981' },
          { name: 'Tourist Helpline', number: '1363', description: '24/7 tourist assistance and information', color: '#f59e0b' }
        ].map((contact, index) => (
          <div key={index} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            borderLeft: `4px solid ${contact.color}`
          }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '18px', fontWeight: '600', color: contact.color }}>
                {contact.name}
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                {contact.description}
              </p>
            </div>
            <a href={`tel:${contact.number}`} style={{
              backgroundColor: contact.color,
              color: 'white',
              padding: '12px 24px',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '16px',
              transition: 'all 0.2s'
            }}>
              📞 {contact.number}
            </a>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTeam = () => (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ margin: '0 0 2rem 0', fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>Team Management</h2>
      <div style={{ display: 'grid', gap: '1rem', maxWidth: '1000px' }}>
        {availableMembers.map(member => (
          <div key={member.id} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            borderLeft: `4px solid ${member.status === 'available' ? '#10b981' : member.status === 'busy' ? '#f59e0b' : '#6b7280'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                  {member.name}
                </h3>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '14px', color: '#6b7280' }}>
                  🆔 Badge: {member.badge} • 📱 {member.contact}
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                  📍 {member.location}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  backgroundColor: member.status === 'available' ? '#10b981' : member.status === 'busy' ? '#f59e0b' : '#6b7280',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>
                  {member.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMap = () => {
    const handleSOS = (touristId) => {
      const tourist = tourists.find(t => t.id === touristId);
      if (tourist) {
        const newAlert = {
          id: Date.now(),
          touristId: tourist.id,
          message: 'SOS EMERGENCY - Immediate assistance required!',
          location: tourist.location,
          timestamp: new Date(),
          priority: 'critical',
          timeLost: 0,
          status: 'open'
        };
        setAlerts(prev => [newAlert, ...prev]);
        alert(`SOS Alert received from ${tourist.name}! Emergency response initiated.`);
      }
    };

    return (
      <div style={{ padding: '2rem' }}>
        <h2 style={{ margin: '0 0 2rem 0', fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>Live Location Tracking</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>Real-Time Map View</h3>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>🔴 Live • {tourists.length} Tourists Tracked</div>
            </div>
            
            <div style={{ position: 'relative', width: '100%', height: '600px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=77.1500,28.5500,77.2500,28.6500&layer=mapnik`}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="Live Tourist Tracking Map"
              />
              
              {/* Tourist Markers Overlay */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                {tourists.map((tourist, index) => {
                  const x = ((tourist.location.lng - 77.1500) / (77.2500 - 77.1500)) * 100;
                  const y = ((28.6500 - tourist.location.lat) / (28.6500 - 28.5500)) * 100;
                  
                  return (
                    <div
                      key={tourist.id}
                      style={{
                        position: 'absolute',
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'auto',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setSelectedTourist(tourist);
                        setShowLocationPopup(tourist);
                      }}
                    >
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: getStatusColor(tourist.status),
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        animation: tourist.status === 'help_needed' || tourist.status === 'lost' ? 'pulse 2s infinite' : 'none'
                      }} />
                      <div style={{
                        position: 'absolute',
                        top: '-30px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        whiteSpace: 'nowrap',
                        opacity: 0,
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = 1}
                      onMouseLeave={(e) => e.target.style.opacity = 0}
                      >
                        {tourist.name}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Location Popup */}
              {showLocationPopup && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                  border: '2px solid #3b82f6',
                  zIndex: 1000,
                  minWidth: '350px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                      📍 {showLocationPopup.name}
                    </h4>
                    <button
                      onClick={() => setShowLocationPopup(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: '#6b7280'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <div>
                        <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Latitude</span>
                        <p style={{ margin: '2px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                          {showLocationPopup.location.lat.toFixed(8)}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Longitude</span>
                        <p style={{ margin: '2px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                          {showLocationPopup.location.lng.toFixed(8)}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Status</span>
                      <div style={{
                        display: 'inline-block',
                        marginLeft: '10px',
                        backgroundColor: getStatusColor(showLocationPopup.status),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {showLocationPopup.status.replace('_', ' ')}
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Contact</span>
                      <p style={{ margin: '2px 0', fontSize: '14px', color: '#1f2937' }}>
                        📱 {showLocationPopup.phone}
                      </p>
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Last Seen</span>
                      <p style={{ margin: '2px 0', fontSize: '14px', color: '#1f2937' }}>
                        🕒 {showLocationPopup.lastSeen.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => {
                        const googleMapsUrl = `https://www.google.com/maps?q=${showLocationPopup.location.lat},${showLocationPopup.location.lng}`;
                        window.open(googleMapsUrl, '_blank');
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      🗺️ Open in Maps
                    </button>
                    <button
                      onClick={() => handleSOS(showLocationPopup.id)}
                      style={{
                        flex: 1,
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      🆘 Send SOS
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Safe ({stats.safeTourists})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Need Help</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Lost</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>Tourist List</h3>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {tourists.map(tourist => (
                  <div key={tourist.id} style={{
                    padding: '1rem',
                    margin: '0.5rem 0',
                    borderRadius: '8px',
                    border: `1px solid ${getStatusColor(tourist.status)}`,
                    cursor: 'pointer',
                    backgroundColor: selectedTourist?.id === tourist.id ? '#f3f4f6' : 'white'
                  }}
                  onClick={() => setSelectedTourist(tourist)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{tourist.name}</h4>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>{tourist.nationality}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>Last seen: {tourist.lastSeen.toLocaleTimeString()}</p>
                      </div>
                      <div style={{
                        backgroundColor: getStatusColor(tourist.status),
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>
                        {tourist.status.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSOS(tourist.id);
                      }}
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: '600',
                        width: '100%',
                        marginTop: '0.5rem'
                      }}
                    >
                      🆘 TRIGGER SOS
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {selectedTourist && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>Selected Tourist Details</h3>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{selectedTourist.name}</h4>
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '14px', color: '#6b7280' }}>📱 {selectedTourist.phone}</p>
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '14px', color: '#6b7280' }}>🌍 {selectedTourist.nationality}</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>📍 {selectedTourist.location.lat.toFixed(4)}, {selectedTourist.location.lng.toFixed(4)}</p>
                </div>
                <div>
                  <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Status</h5>
                  <div style={{
                    backgroundColor: getStatusColor(selectedTourist.status),
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    textAlign: 'center'
                  }}>
                    {selectedTourist.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
                <div>
                  <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Actions</h5>
                  <button
                    onClick={() => handleSOS(selectedTourist.id)}
                    style={{
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      width: '100%'
                    }}
                  >
                    🆘 EMERGENCY SOS
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCurrentSection = () => {
    switch(currentSection) {
      case 'dashboard': return renderDashboard();
      case 'map': return renderMap();
      case 'alerts': return renderAlerts();
      case 'contacts': return renderContacts();
      case 'team': return renderTeam();
      default: return renderDashboard();
    }
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <style>
        {`
          @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.7; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          }
        `}
      </style>
      {renderNavbar()}
      {renderCurrentSection()}
    </div>
  );
};

export default AuthorityDashboard;