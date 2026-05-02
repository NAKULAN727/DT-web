import React, { useState } from 'react';

const EmergencyContacts = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [clickedButton, setClickedButton] = useState(null);
  
  const contacts = [
    { name: 'Police', number: '100', description: 'Law enforcement and security', color: '#3498db' },
    { name: 'Fire Department', number: '101', description: 'Fire emergencies and rescue', color: '#e67e22' },
    { name: 'Ambulance', number: '102', description: 'Medical emergencies', color: '#e74c3c' },
    { name: 'Tourist Helpline', number: '1363', description: 'Tourist assistance and information', color: '#27ae60' }
  ];

  const handleCall = (number) => {
    setClickedButton(number);
    setTimeout(() => setClickedButton(null), 200);
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 60px)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '30px', fontSize: '28px', fontWeight: '300' }}>Emergency Contacts</h2>
        <div style={{ display: 'grid', gap: '20px' }}>
          {contacts.map((contact, index) => (
            <div 
              key={index} 
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '25px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: hoveredCard === index ? '0 8px 25px rgba(0, 0, 0, 0.15)' : '0 4px 6px rgba(0, 0, 0, 0.07)',
                transform: hoveredCard === index ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                borderLeft: `4px solid ${contact.color}`
              }}
            >
              <div>
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  color: contact.color,
                  transition: 'color 0.3s ease'
                }}>
                  {contact.name}
                </h3>
                <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>
                  {contact.description}
                </p>
              </div>
              <a 
                href={`tel:${contact.number}`}
                onClick={() => handleCall(contact.number)}
                style={{
                  backgroundColor: clickedButton === contact.number ? '#c0392b' : contact.color,
                  color: 'white',
                  padding: '12px 24px',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '16px',
                  boxShadow: `0 2px 4px ${contact.color}50`,
                  transition: 'all 0.2s ease',
                  transform: clickedButton === contact.number ? 'scale(0.95)' : 'scale(1)'
                }}
              >
                Call {contact.number}
              </a>
            </div>
          ))}
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '25px',
          marginTop: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
          border: '1px solid #ecf0f1'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>
            Quick Tips
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#7f8c8d', fontSize: '14px', lineHeight: '1.8' }}>
            <li>Save these numbers in your phone for quick access</li>
            <li>In life-threatening emergencies, call 100 (Police) immediately</li>
            <li>For medical emergencies, call 102 (Ambulance)</li>
            <li>Tourist Helpline (1363) is available 24/7 for assistance</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContacts;