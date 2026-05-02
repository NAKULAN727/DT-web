import React, { useState } from 'react';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: 'Tourist User',
    phone: '+91 9876543210',
    emergencyContact: '+91 9876543211',
    location: 'Delhi, India'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!profile.name.trim()) newErrors.name = 'Name is required';
    if (!profile.phone.match(/^\+?[1-9]\d{1,14}$/)) newErrors.phone = 'Invalid phone number';
    if (!profile.emergencyContact.match(/^\+?[1-9]\d{1,14}$/)) newErrors.emergencyContact = 'Invalid emergency contact';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const getInputStyle = (field) => ({
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: `1px solid ${errors[field] ? '#e74c3c' : '#e1e5e9'}`,
    fontSize: '16px',
    transition: 'all 0.3s ease',
    backgroundColor: isEditing ? 'white' : '#f8f9fa'
  });

  const labelStyle = {
    display: 'block',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#2c3e50',
    fontSize: '14px'
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 60px)' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#2c3e50', fontSize: '28px', fontWeight: '300', margin: 0 }}>Profile Settings</h2>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            style={{
              backgroundColor: isEditing ? '#95a5a6' : '#3498db',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
        
        {saved && (
          <div style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #c3e6cb'
          }}>
            Profile updated successfully!
          </div>
        )}
        
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
        }}>
          <div style={{ marginBottom: '25px' }}>
            <label style={labelStyle}>Full Name</label>
            <input 
              type="text" 
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              style={getInputStyle('name')}
              placeholder="Enter your full name"
              disabled={!isEditing}
            />
            {errors.name && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.name}</span>}
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={labelStyle}>Phone Number</label>
            <input 
              type="tel" 
              value={profile.phone}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              style={getInputStyle('phone')}
              placeholder="Enter your phone number"
              disabled={!isEditing}
            />
            {errors.phone && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.phone}</span>}
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={labelStyle}>Emergency Contact</label>
            <input 
              type="tel" 
              value={profile.emergencyContact}
              onChange={(e) => setProfile({...profile, emergencyContact: e.target.value})}
              style={getInputStyle('emergencyContact')}
              placeholder="Enter emergency contact number"
              disabled={!isEditing}
            />
            {errors.emergencyContact && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.emergencyContact}</span>}
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={labelStyle}>Current Location</label>
            <input 
              type="text" 
              value={profile.location}
              onChange={(e) => setProfile({...profile, location: e.target.value})}
              style={getInputStyle('location')}
              placeholder="Enter your current location"
              disabled={!isEditing}
            />
          </div>
          
          {isEditing && (
            <button 
              onClick={handleSave}
              style={{
                backgroundColor: '#27ae60',
                color: 'white',
                padding: '14px 28px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 2px 4px rgba(39, 174, 96, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;