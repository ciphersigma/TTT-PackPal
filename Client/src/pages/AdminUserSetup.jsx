import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// This component creates an admin user for testing
const AdminUserSetup = () => {
  const [message, setMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const createAdminUser = () => {
    setIsCreating(true);
    
    try {
      // Create admin user data
      const adminUser = {
        id: 'admin_' + Date.now(),
        name: 'Admin User',
        email: 'admin@packpal.com',
        password: 'adminpassword123', // In a real app, never store plain passwords
        username: 'ciphersigma',
        registrationDate: '2025-04-12 10:05:01', // Updated timestamp
        isAdmin: true
      };
      
      // Create mock token
      const mockToken = 'admin_token_' + Date.now();
      
      // Get existing users
      const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      
      // Check if admin already exists
      const adminExists = existingUsers.some(user => 
        user.user.isAdmin === true || user.email === 'admin@packpal.com'
      );
      
      if (adminExists) {
        setMessage('Admin user already exists!');
        setIsCreating(false);
        return;
      }
      
      // Add admin to users array
      existingUsers.push({
        email: 'admin@packpal.com',
        password: 'adminpassword123',
        user: adminUser
      });
      
      // Save to localStorage
      localStorage.setItem('mockUsers', JSON.stringify(existingUsers));
      setMessage('Admin user created successfully! You can now login with admin@packpal.com / adminpassword123');
    } catch (err) {
      console.error('Error creating admin user:', err);
      setMessage('Failed to create admin user: ' + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '5rem auto',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      backgroundColor: 'white'
    }}>
      <h2 style={{ marginBottom: '1rem' }}>Admin User Setup</h2>
      <p style={{ marginBottom: '1.5rem' }}>
        This will create an admin user with the following credentials:
      </p>
      
      <div style={{ 
        backgroundColor: '#f3f4f6', 
        padding: '1rem', 
        borderRadius: '6px',
        marginBottom: '1.5rem'
      }}>
        <p><strong>Email:</strong> admin@packpal.com</p>
        <p><strong>Password:</strong> adminpassword123</p>
        <p><strong>Username:</strong> ciphersigma</p>
        <p><strong>Registration Date:</strong> 2025-04-12 10:05:01</p>
      </div>
      
      {message && (
        <div style={{
          padding: '0.75rem',
          marginBottom: '1.5rem',
          borderRadius: '6px',
          backgroundColor: message.includes('Failed') ? '#fee2e2' : '#d1fae5',
          color: message.includes('Failed') ? '#b91c1c' : '#065f46'
        }}>
          {message}
        </div>
      )}
      
      <button 
        onClick={createAdminUser}
        disabled={isCreating}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontWeight: '500',
          cursor: isCreating ? 'not-allowed' : 'pointer',
          opacity: isCreating ? 0.7 : 1
        }}
      >
        {isCreating ? 'Creating Admin User...' : 'Create Admin User'}
      </button>
      
      {message && message.includes('successfully') && (
        <div style={{ marginTop: '1.5rem' }}>
          <a 
            href="/login" 
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              color: '#2563eb',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Go to Login Page
          </a>
        </div>
      )}
    </div>
  );
};

export default AdminUserSetup;