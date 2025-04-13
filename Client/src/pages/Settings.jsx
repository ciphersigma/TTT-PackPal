import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Settings.css';

const Settings = () => {
  const API_URL = 'http://localhost:5000/api';

  // User data state
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState('Member');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Profile settings state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    position: '',
    company: '',
    phone: ''
  });
  
  // Password settings state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    packageUpdates: true,
    teamChanges: true,
    announcementAlerts: true,
    dailyDigest: false,
    desktopNotifications: true
  });
  
  // Display settings state
  const [displaySettings, setDisplaySettings] = useState({
    theme: 'light',
    dashboardLayout: 'default',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  });
  
  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    showProfileInfo: true,
    sharePackageStats: true,
    twoFactorAuth: false,
    autoLogout: '30min'
  });
  
  // Packaging preferences state
  const [packagingPreferences, setPackagingPreferences] = useState({
    defaultPackageType: 'Standard',
    prioritizeSustainability: true,
    optimizeCost: true,
    sendShippingUpdates: true,
    defaultShippingMethod: 'Standard'
  });
  
  // Integration settings state
  const [integrationSettings, setIntegrationSettings] = useState({
    allowExcelExport: true,
    connectToShipping: false,
    apiAccessEnabled: false
  });
  
  // Accessibility settings state
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false,
    screenReaderOptimized: false
  });
  
  // Active settings tab
  const [activeTab, setActiveTab] = useState('profile');
  
  // Get auth config for API requests
  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("No authentication token found");
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }, []);

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get the current user from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!user || !user._id) {
        setError('No user data found. Please log in again.');
        setLoading(false);
        return false;
      }
      
      // Try to fetch latest user data from API
      try {
        const config = getAuthConfig();
        const response = await axios.get(`${API_URL}/users/me`, config);
        const updatedUser = response.data;
        
        setUserData(updatedUser);
        setUserRole(updatedUser.role || 'Member');
        
        // Pre-fill profile form
        setProfileForm({
          name: updatedUser.name || '',
          email: updatedUser.email || '',
          position: updatedUser.position || '',
          company: updatedUser.company || '',
          phone: updatedUser.phone || ''
        });
        
        // Get user settings if available
        if (updatedUser.settings) {
          const { 
            notifications, 
            display, 
            privacy, 
            packaging,
            integrations,
            accessibility
          } = updatedUser.settings;
          
          if (notifications) setNotificationSettings(notifications);
          if (display) setDisplaySettings(display);
          if (privacy) setPrivacySettings(privacy);
          if (packaging) setPackagingPreferences(packaging);
          if (integrations) setIntegrationSettings(integrations);
          if (accessibility) setAccessibilitySettings(accessibility);
        }
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (err) {
        console.error('Failed to fetch latest user data:', err);
        
        // Fallback to localStorage data
        setUserData(user);
        setUserRole(user.role || 'Member');
        
        // Pre-fill profile form with existing data
        setProfileForm({
          name: user.name || '',
          email: user.email || '',
          position: user.position || '',
          company: user.company || '',
          phone: user.phone || ''
        });
        
        // Try to get settings from localStorage
        const storedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
        if (Object.keys(storedSettings).length > 0) {
          const { 
            notifications, 
            display, 
            privacy, 
            packaging,
            integrations,
            accessibility
          } = storedSettings;
          
          if (notifications) setNotificationSettings(notifications);
          if (display) setDisplaySettings(display);
          if (privacy) setPrivacySettings(privacy);
          if (packaging) setPackagingPreferences(packaging);
          if (integrations) setIntegrationSettings(integrations);
          if (accessibility) setAccessibilitySettings(accessibility);
        }
      }
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError('Failed to load user data. Please refresh or try again later.');
      setLoading(false);
      return false;
    }
  }, [API_URL, getAuthConfig]);

  // Initial data load
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Show success message function
  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };
  
  // Show error message function
  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  // Handle profile form changes
  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };
  
  // Handle password form changes
  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };
  
  // Handle toggle changes
  const handleToggleChange = (settingType, field) => {
    switch (settingType) {
      case 'notifications':
        setNotificationSettings({
          ...notificationSettings,
          [field]: !notificationSettings[field]
        });
        break;
      case 'privacy':
        setPrivacySettings({
          ...privacySettings,
          [field]: !privacySettings[field]
        });
        break;
      case 'packaging':
        setPackagingPreferences({
          ...packagingPreferences,
          [field]: !packagingPreferences[field]
        });
        break;
      case 'integrations':
        setIntegrationSettings({
          ...integrationSettings,
          [field]: !integrationSettings[field]
        });
        break;
      case 'accessibility':
        setAccessibilitySettings({
          ...accessibilitySettings,
          [field]: !accessibilitySettings[field]
        });
        break;
      default:
        break;
    }
  };
  
  // Handle select changes
  const handleSelectChange = (settingType, field, value) => {
    switch (settingType) {
      case 'display':
        setDisplaySettings({
          ...displaySettings,
          [field]: value
        });
        break;
      case 'privacy':
        setPrivacySettings({
          ...privacySettings,
          [field]: value
        });
        break;
      case 'packaging':
        setPackagingPreferences({
          ...packagingPreferences,
          [field]: value
        });
        break;
      case 'accessibility':
        setAccessibilitySettings({
          ...accessibilitySettings,
          [field]: value
        });
        break;
      default:
        break;
    }
  };

  // Save profile changes
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const config = getAuthConfig();
      await axios.put(
        `${API_URL}/users/profile`, 
        profileForm,
        config
      );
      
      // Update local user data
      const updatedUser = { ...userData, ...profileForm };
      setUserData(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      showSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      showError('Failed to update profile. Please try again.');
      
      // Fallback: Update only in localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...storedUser, ...profileForm };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } finally {
      setSaving(false);
    }
  };
  
  // Change password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('New passwords do not match.');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      showError('Password must be at least 8 characters long.');
      return;
    }
    
    setSaving(true);
    
    try {
      const config = getAuthConfig();
      await axios.put(
        `${API_URL}/users/password`, 
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        config
      );
      
      showSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Failed to change password:', err);
      
      if (err.response && err.response.status === 401) {
        showError('Current password is incorrect.');
      } else {
        showError('Failed to change password. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };
  
  // Save notification settings
  const saveNotificationSettings = async () => {
    setSaving(true);
    
    try {
      const config = getAuthConfig();
      await axios.put(
        `${API_URL}/users/settings/notifications`, 
        notificationSettings,
        config
      );
      
      showSuccess('Notification settings saved successfully!');
      
      // Update local storage settings
      const storedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      localStorage.setItem('userSettings', JSON.stringify({
        ...storedSettings,
        notifications: notificationSettings
      }));
    } catch (err) {
      console.error('Failed to save notification settings:', err);
      showError('Failed to save notification settings. Changes will only be stored locally.');
      
      // Fallback: Save to localStorage
      const storedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      localStorage.setItem('userSettings', JSON.stringify({
        ...storedSettings,
        notifications: notificationSettings
      }));
    } finally {
      setSaving(false);
    }
  };
  
  // Save display settings
  const saveDisplaySettings = async () => {
    setSaving(true);
    
    try {
      const config = getAuthConfig();
      await axios.put(
        `${API_URL}/users/settings/display`, 
        displaySettings,
        config
      );
      
      // Apply theme immediately
      document.body.className = `theme-${displaySettings.theme}`;
      
      showSuccess('Display settings saved successfully!');
      
      // Update local storage settings
      const storedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      localStorage.setItem('userSettings', JSON.stringify({
        ...storedSettings,
        display: displaySettings
      }));
    } catch (err) {
      console.error('Failed to save display settings:', err);
      showError('Failed to save display settings. Changes will only be stored locally.');
      
      // Apply theme anyway
      document.body.className = `theme-${displaySettings.theme}`;
      
      // Fallback: Save to localStorage
      const storedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      localStorage.setItem('userSettings', JSON.stringify({
        ...storedSettings,
        display: displaySettings
      }));
    } finally {
      setSaving(false);
    }
  };
  
  // Save privacy settings
  const savePrivacySettings = async () => {
    setSaving(true);
    
    try {
      const config = getAuthConfig();
      await axios.put(
        `${API_URL}/users/settings/privacy`, 
        privacySettings,
        config
      );
      
      showSuccess('Privacy settings saved successfully!');
      
      // Update local storage settings
      const storedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      localStorage.setItem('userSettings', JSON.stringify({
        ...storedSettings,
        privacy: privacySettings
      }));
    } catch (err) {
      console.error('Failed to save privacy settings:', err);
      showError('Failed to save privacy settings. Changes will only be stored locally.');
      
      // Fallback: Save to localStorage
      const storedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      localStorage.setItem('userSettings', JSON.stringify({
        ...storedSettings,
        privacy: privacySettings
      }));
    } finally {
      setSaving(false);
    }
  };
  
  // Save packaging preferences
  const savePackagingPreferences = async () => {
    setSaving(true);
    
    try {
      const config = getAuthConfig();
      await axios.put(
        `${API_URL}/users/settings/packaging`, 
        packagingPreferences,
        config
      );
      
      showSuccess('Packaging preferences saved successfully!');
      
      // Update local storage settings
      const storedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      localStorage.setItem('userSettings', JSON.stringify({
        ...storedSettings,
        packaging: packagingPreferences
      }));
    } catch (err) {
      console.error('Failed to save packaging preferences:', err);
      showError('Failed to save packaging preferences. Changes will only be stored locally.');
      
      // Fallback: Save to localStorage
      const storedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      localStorage.setItem('userSettings', JSON.stringify({
        ...storedSettings,
        packaging: packagingPreferences
      }));
    } finally {
      setSaving(false);
    }
  };
  
  // Save integration settings
  const saveIntegrationSettings = async () => {
    setSaving(true);
    
    try {
      const config = getAuthConfig();
      await axios.put(
        `${API_URL}/users/settings/integrations`, 
        integrationSettings,
        config
      );
      
      showSuccess('Integration settings saved successfully!');
      
      // Update local storage settings
      const storedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      localStorage.setItem('userSettings', JSON.stringify({
        ...storedSettings,
        integrations: integrationSettings
      }));
    } catch (err) {
      console.error('Failed to save integration settings:', err);
      showError('Failed to save integration settings. Changes will only be stored locally.');
      
      // Fallback: Save to localStorage
      const storedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      localStorage.setItem('userSettings', JSON.stringify({
        ...storedSettings,
        integrations: integrationSettings
      }));
    } finally {
      setSaving(false);
    }
  };
  
  // Save accessibility settings
  const saveAccessibilitySettings = async () => {
    setSaving(true);
    
    try {
      const config = getAuthConfig();
      await axios.put(
        `${API_URL}/users/settings/accessibility`, 
        accessibilitySettings,
        config
      );
      
      // Apply accessibility settings immediately
      applyAccessibilitySettings();
      
      showSuccess('Accessibility settings saved successfully!');
      
      // Update local storage settings
      const storedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      localStorage.setItem('userSettings', JSON.stringify({
        ...storedSettings,
        accessibility: accessibilitySettings
      }));
    } catch (err) {
      console.error('Failed to save accessibility settings:', err);
      showError('Failed to save accessibility settings. Changes will only be stored locally.');
      
      // Apply settings anyway
      applyAccessibilitySettings();
      
      // Fallback: Save to localStorage
      const storedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      localStorage.setItem('userSettings', JSON.stringify({
        ...storedSettings,
        accessibility: accessibilitySettings
      }));
    } finally {
      setSaving(false);
    }
  };
  
  // Apply accessibility settings to document
  const applyAccessibilitySettings = () => {
    // Apply font size
    document.documentElement.style.setProperty(
      '--font-size-base', 
      accessibilitySettings.fontSize === 'small' ? '14px' : 
      accessibilitySettings.fontSize === 'large' ? '18px' : '16px'
    );
    
    // Apply high contrast
    if (accessibilitySettings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    // Apply reduced motion
    if (accessibilitySettings.reducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
    
    // Apply screen reader optimizations
    if (accessibilitySettings.screenReaderOptimized) {
      document.body.classList.add('screen-reader-optimized');
    } else {
      document.body.classList.remove('screen-reader-optimized');
    }
  };
  
  // Apply display settings on load
  useEffect(() => {
    document.body.className = `theme-${displaySettings.theme}`;
    applyAccessibilitySettings();
  }, [displaySettings.theme]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>
      
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <div className="settings-container">
        <div className="settings-sidebar">
          <div className="user-info">
            <div className="avatar">
              {userData?.name?.charAt(0) || 'U'}
            </div>
            <div className="user-details">
              <h3>{userData?.name || 'User'}</h3>
              <p>{userRole}</p>
            </div>
          </div>
          
          <nav className="settings-nav">
            <button 
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              <span className="nav-icon">👤</span>
              Profile Information
            </button>
            
            <button 
              className={activeTab === 'password' ? 'active' : ''}
              onClick={() => setActiveTab('password')}
            >
              <span className="nav-icon">🔒</span>
              Password
            </button>
            
            <button 
              className={activeTab === 'notifications' ? 'active' : ''}
              onClick={() => setActiveTab('notifications')}
            >
              <span className="nav-icon">🔔</span>
              Notifications
            </button>
            
            <button 
              className={activeTab === 'display' ? 'active' : ''}
              onClick={() => setActiveTab('display')}
            >
              <span className="nav-icon">🎨</span>
              Display & Appearance
            </button>
            
            <button 
              className={activeTab === 'privacy' ? 'active' : ''}
              onClick={() => setActiveTab('privacy')}
            >
              <span className="nav-icon">🛡️</span>
              Privacy & Security
            </button>
            
            <button 
              className={activeTab === 'packaging' ? 'active' : ''}
              onClick={() => setActiveTab('packaging')}
            >
              <span className="nav-icon">📦</span>
              Packaging Preferences
            </button>
            
            <button 
              className={activeTab === 'integrations' ? 'active' : ''}
              onClick={() => setActiveTab('integrations')}
            >
              <span className="nav-icon">🔗</span>
              Integrations
            </button>
            
            <button 
              className={activeTab === 'accessibility' ? 'active' : ''}
              onClick={() => setActiveTab('accessibility')}
            >
              <span className="nav-icon">♿</span>
              Accessibility
            </button>
          </nav>
        </div>
        
        <div className="settings-content">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile Information</h2>
              <p>Update your personal information</p>
              
              <form onSubmit={handleProfileSubmit} className="settings-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={profileForm.name} 
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={profileForm.email} 
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="position">Position/Title</label>
                  <input 
                    type="text" 
                    id="position" 
                    name="position" 
                    value={profileForm.position} 
                    onChange={handleProfileChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="company">Company/Organization</label>
                  <input 
                    type="text" 
                    id="company" 
                    name="company" 
                    value={profileForm.company} 
                    onChange={handleProfileChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    value={profileForm.phone} 
                    onChange={handleProfileChange}
                  />
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Password Settings */}
          {activeTab === 'password' && (
            <div className="settings-section">
              <h2>Change Password</h2>
              <p>Update your account password</p>
              
              <form onSubmit={handlePasswordSubmit} className="settings-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input 
                    type="password" 
                    id="currentPassword" 
                    name="currentPassword" 
                    value={passwordForm.currentPassword} 
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input 
                    type="password" 
                    id="newPassword" 
                    name="newPassword" 
                    value={passwordForm.newPassword} 
                    onChange={handlePasswordChange}
                    required
                    minLength="8"
                  />
                  <small>Must be at least 8 characters long</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    value={passwordForm.confirmPassword} 
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Settings</h2>
              <p>Configure how you would like to receive notifications</p>
              
              <div className="settings-options">
                <div className="settings-group">
                  <h3>Email Notifications</h3>
                  
                  <div className="toggle-option">
                    <div className="toggle-text">
                      <label htmlFor="emailNotifications">Receive email notifications</label>
                      <p className="option-description">Get important updates via email</p>
                    </div>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        id="emailNotifications" 
                        checked={notificationSettings.emailNotifications} 
                        onChange={() => handleToggleChange('notifications', 'emailNotifications')}
                      />
                      <label htmlFor="emailNotifications" className="toggle-label"></label>
                    </div>
                  </div>
                  
                  <div className="toggle-option">
                    <div className="toggle-text">
                      <label htmlFor="packageUpdates">Package status updates</label>
                      <p className="option-description">Receive emails when package status changes</p>
                    </div>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        id="packageUpdates" 
                        checked={notificationSettings.packageUpdates} 
                        onChange={() => handleToggleChange('notifications', 'packageUpdates')}
                      />
                      <label htmlFor="packageUpdates" className="toggle-label"></label>
                    </div>
                  </div>
                  
                  <div className="toggle-option">
                    <div className="toggle-text">
                      <label htmlFor="teamChanges">Team and role changes</label>
                      <p className="option-description">Get notified when team members or roles change</p>
                    </div>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        id="teamChanges" 
                        checked={notificationSettings.teamChanges} 
                        onChange={() => handleToggleChange('notifications', 'teamChanges')}
                      />
                      <label htmlFor="teamChanges" className="toggle-label"></label>
                    </div>
                  </div>
                  
                  <div className="toggle-option">
                    <div className="toggle-text">
                      <label htmlFor="announcementAlerts">Announcement alerts</label>
                      <p className="option-description">Receive emails for new announcements</p>
                    </div>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        id="announcementAlerts" 
                        checked={notificationSettings.announcementAlerts} 
                        onChange={() => handleToggleChange('notifications', 'announcementAlerts')}
                      />
                      <label htmlFor="announcementAlerts" className="toggle-label"></label>
                    </div>
                  </div>
                  
                  <div className="toggle-option">
                    <div className="toggle-text">
                      <label htmlFor="dailyDigest">Daily activity digest</label>
                      <p className="option-description">Get a daily summary of all activities</p>
                    </div>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        id="dailyDigest" 
                        checked={notificationSettings.dailyDigest} 
                        onChange={() => handleToggleChange('notifications', 'dailyDigest')}
                      />
                      <label htmlFor="dailyDigest" className="toggle-label"></label>
                    </div>
                  </div>
                </div>
                
                <div className="settings-group">
                  <h3>In-App Notifications</h3>
                  
                  <div className="toggle-option">
                    <div className="toggle-text">
                      <label htmlFor="desktopNotifications">Desktop notifications</label>
                      <p className="option-description">Show browser notifications for important updates</p>
                    </div>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        id="desktopNotifications" 
                        checked={notificationSettings.desktopNotifications} 
                        onChange={() => handleToggleChange('notifications', 'desktopNotifications')}
                      />
                      <label htmlFor="desktopNotifications" className="toggle-label"></label>
                    </div>
                  </div>
                </div>
                
                <div className="settings-actions">
                  <button 
                    className="btn-primary"
                    onClick={saveNotificationSettings}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Notification Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Display Settings */}
          {activeTab === 'display' && (
            <div className="settings-section">
              <h2>Display & Appearance</h2>
              <p>Customize how Packpal looks for you</p>
              
              <div className="settings-options">
                <div className="settings-group">
                  <h3>Theme Settings</h3>
                  
                  <div className="select-option">
                    <div className="select-text">
                      <label htmlFor="theme">Theme</label>
                      <p className="option-description">Choose your preferred theme</p>
                    </div>
                    <div className="select-control">
                      <select 
                        id="theme"
                        value={displaySettings.theme}
                        onChange={(e) => handleSelectChange('display', 'theme', e.target.value)}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System Default</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="select-option">
                    <div className="select-text">
                      <label htmlFor="dashboardLayout">Dashboard Layout</label>
                      <p className="option-description">Choose how your dashboard is organized</p>
                    </div>
                    <div className="select-control">
                      <select 
                        id="dashboardLayout"
                        value={displaySettings.dashboardLayout}
                        onChange={(e) => handleSelectChange('display', 'dashboardLayout', e.target.value)}
                      >
                        <option value="default">Default</option>
                        <option value="compact">Compact</option>
                        <option value="expanded">Expanded</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="settings-group">
                  <h3>Date & Time Format</h3>
                  
                  <div className="select-option">
                    <div className="select-text">
                      <label htmlFor="dateFormat">Date Format</label>
                      <p className="option-description">Choose your preferred date format</p>
                    </div>
                    <div className="select-control">
                      <select 
                        id="dateFormat"
                        value={displaySettings.dateFormat}
                        onChange={(e) => handleSelectChange('display', 'dateFormat', e.target.value)}
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="select-option">
                    <div className="select-text">
                      <label htmlFor="timeFormat">Time Format</label>
                      <p className="option-description">Choose your preferred time format</p>
                    </div>
                    <div className="select-control">
                      <select 
                        id="timeFormat"
                        value={displaySettings.timeFormat}
                        onChange={(e) => handleSelectChange('display', 'timeFormat', e.target.value)}
                      >
                        <option value="12h">12-hour (AM/PM)</option>
                        <option value="24h">24-hour</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="theme-previews">
                  <div className="theme-preview light">
                    <div className="preview-header">Light Theme</div>
                    <div className="preview-content"></div>
                  </div>
                  
                  <div className="theme-preview dark">
                    <div className="preview-header">Dark Theme</div>
                    <div className="preview-content"></div>
                  </div>
                </div>
                
                <div className="settings-actions">
                  <button 
                    className="btn-primary"
                    onClick={saveDisplaySettings}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Display Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h2>Privacy & Security</h2>
              <p>Manage your privacy and security settings</p>
              
              <div className="settings-options">
                <div className="settings-group">
                  <h3>Privacy Options</h3>
                  
                  <div className="toggle-option">
                    <div className="toggle-text">
                      <label htmlFor="showProfileInfo">Show profile information to team members</label>
                      <p className="option-description">Allow team members to see your contact information</p>
                    </div>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        id="showProfileInfo" 
                        checked={privacySettings.showProfileInfo} 
                        onChange={() => handleToggleChange('privacy', 'showProfileInfo')}
                      />
                      <label htmlFor="showProfileInfo" className="toggle-label"></label>
                    </div>
                  </div>
                  
                  <div className="toggle-option">
                    <div className="toggle-text">
                      <label htmlFor="sharePackageStats">Share package statistics anonymously</label>
                      <p className="option-description">Contribute your anonymized data to improve our services</p>
                    </div>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        id="sharePackageStats" 
                        checked={privacySettings.sharePackageStats} 
                        onChange={() => handleToggleChange('privacy', 'sharePackageStats')}
                      />
                      <label htmlFor="sharePackageStats" className="toggle-label"></label>
                    </div>
                  </div>
                </div>
                
                <div className="settings-group">
                  <h3>Security Options</h3>
                  
                  <div className="toggle-option">
                    <div className="toggle-text">
                      <label htmlFor="twoFactorAuth">Two-factor authentication</label>
                      <p className="option-description">Require a verification code in addition to your password</p>
                    </div>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        id="twoFactorAuth" 
                        checked={privacySettings.twoFactorAuth} 
                        onChange={() => handleToggleChange('privacy', 'twoFactorAuth')}
                      />
                      <label htmlFor="twoFactorAuth" className="toggle-label"></label>
                    </div>
                  </div>
                  
                  <div className="select-option">
                    <div className="select-text">
                      <label htmlFor="autoLogout">Auto logout after inactivity</label>
                      <p className="option-description">Automatically log out after a period of inactivity</p>
                    </div>
                    <div className="select-control">
                      <select 
                        id="autoLogout"
                        value={privacySettings.autoLogout}
                        onChange={(e) => handleSelectChange('privacy', 'autoLogout', e.target.value)}
                      >
                        <option value="never">Never</option>
                        <option value="15min">15 minutes</option>
                        <option value="30min">30 minutes</option>
                        <option value="1hour">1 hour</option>
                        <option value="4hours">4 hours</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="settings-group">
                  <h3>Data Management</h3>
                  
                  <div className="data-options">
                    <button className="btn-secondary">Download My Data</button>
                    <button className="btn-danger">Delete Account</button>
                  </div>
                </div>
                
                <div className="settings-actions">
                  <button 
                    className="btn-primary"
                    onClick={savePrivacySettings}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Privacy Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Packaging Preferences */}
          {activeTab === 'packaging' && (
            <div className="settings-section">
              <h2>Packaging Preferences</h2>
              <p>Configure your default packaging options</p>
              
              <div className="settings-options">
                <div className="settings-group">
                  <h3>Default Options</h3>
                  
                  <div className="select-option">
                    <div className="select-text">
                      <label htmlFor="defaultPackageType">Default Package Type</label>
                      <p className="option-description">Choose your preferred package type for new shipments</p>
                    </div>
                    <div className="select-control">
                      <select 
                        id="defaultPackageType"
                        value={packagingPreferences.defaultPackageType}
                        onChange={(e) => handleSelectChange('packaging', 'defaultPackageType', e.target.value)}
                      >
                        <option value="Standard">Standard</option>
                        <option value="Eco-friendly">Eco-friendly</option>
                        <option value="Compact">Compact</option>
                        <option value="Bulk">Bulk</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="select-option">
                    <div className="select-text">
                      <label htmlFor="defaultShippingMethod">Default Shipping Method</label>
                      <p className="option-description">Choose your preferred shipping method</p>
                    </div>
                    <div className="select-control">
                      <select 
                        id="defaultShippingMethod"
                        value={packagingPreferences.defaultShippingMethod}
                        onChange={(e) => handleSelectChange('packaging', 'defaultShippingMethod', e.target.value)}
                      >
                        <option value="Standard">Standard</option>
                        <option value="Express">Express</option>
                        <option value="Overnight">Overnight</option>
                        <option value="Economy">Economy</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="settings-group">
                  <h3>Optimization Preferences</h3>
                  
                  <div className="toggle-option">
                    <div className="toggle-text">
                      <label htmlFor="prioritizeSustainability">Prioritize sustainability</label>
                      <p className="option-description">Optimize packaging for environmental impact over cost</p>
                    </div>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        id="prioritizeSustainability" 
                        checked={packagingPreferences.prioritizeSustainability} 
                        onChange={() => handleToggleChange('packaging', 'prioritizeSustainability')}
                      />
                      <label htmlFor="prioritizeSustainability" className="toggle-label"></label>
                    </div>
                  </div>
                  
                  <div className="toggle-option">
                    <div className="toggle-text">
                      <label htmlFor="optimizeCost">Optimize for cost</label>
                      <p className="option-description">Find the most cost-effective packaging solution</p>
                    </div>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        id="optimizeCost" 
                        checked={packagingPreferences.optimizeCost} 
                        onChange={() => handleToggleChange('packaging', 'optimizeCost')}
                      />
                      <label htmlFor="optimizeCost" className="toggle-label"></label>
                    </div>
                  </div>
                  
                  <div className="toggle-option">
                    <div className="toggle-text">
                      <label htmlFor="sendShippingUpdates">Send shipping updates to recipients</label>
                      <p className="option-description">Automatically notify recipients of shipping status changes</p>
                    </div>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        id="sendShippingUpdates" 
                        checked={packagingPreferences.sendShippingUpdates} 
                        onChange={() => handleToggleChange('packaging', 'sendShippingUpdates')}
                      />
                      <label htmlFor="sendShippingUpdates" className="toggle-label"></label>
                    </div>
                  </div>
                </div>
                
                <div className="settings-actions">
                  <button 
                    className="btn-primary"
                    onClick={savePackagingPreferences}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Packaging Preferences'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Integration Settings */}
          {activeTab === 'integrations' && (
            <div className="settings-section">
              <h2>Integrations</h2>
              <p>Connect Packpal with other services</p>
              
              <div className="settings-options">
                <div className="settings-group">
                  <h3>Export & Import</h3>
                  
                  <div className="toggle-option">
                    <div className="toggle-text">
                      <label htmlFor="allowExcelExport">Excel export & import</label>
                      <p className="option-description">Enable exporting and importing data via Excel files</p>
                    </div>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        id="allowExcelExport" 
                        checked={integrationSettings.allowExcelExport} 
                        onChange={() => handleToggleChange('integrations', 'allowExcelExport')}
                      />
                      <label htmlFor="allowExcelExport" className="toggle-label"></label>
                    </div>
                  </div>
                </div>
                
                <div className="settings-group">
                  <h3>External Services</h3>
                  
                  <div className="toggle-option">
                    <div className="toggle-text">
                      <label htmlFor="connectToShipping">Connect to shipping providers</label>
                      <p className="option-description">Integrate with external shipping services (UPS, FedEx, etc.)</p>
                    </div>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        id="connectToShipping" 
                        checked={integrationSettings.connectToShipping} 
                        onChange={() => handleToggleChange('integrations', 'connectToShipping')}
                      />
                      <label htmlFor="connectToShipping" className="toggle-label"></label>
                    </div>
                  </div>
                </div>
                
                <div className="settings-group">
                  <h3>API Access</h3>
                  
                  <div className="toggle-option">
                    <div className="toggle-text">
                      <label htmlFor="apiAccessEnabled">Enable API access</label>
                      <p className="option-description">Allow access to Packpal data via API</p>
                    </div>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        id="apiAccessEnabled" 
                        checked={integrationSettings.apiAccessEnabled} 
                        onChange={() => handleToggleChange('integrations', 'apiAccessEnabled')}
                      />
                      <label htmlFor="apiAccessEnabled" className="toggle-label"></label>
                    </div>
                  </div>
                  
                  {integrationSettings.apiAccessEnabled && (
                    <div className="api-key-section">
                      <div className="api-key-display">
                        <span className="api-key-label">Your API Key:</span>
                        <span className="api-key-value">••••••••••••••••••••••••</span>
                        <button className="btn-text">Show</button>
                      </div>
                      <button className="btn-secondary">Generate New API Key</button>
                    </div>
                  )}
                </div>
                
                <div className="settings-actions">
                  <button 
                    className="btn-primary"
                    onClick={saveIntegrationSettings}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Integration Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Accessibility Settings */}
          {activeTab === 'accessibility' && (
            <div className="settings-section">
              <h2>Accessibility</h2>
              <p>Customize accessibility options</p>
              
              <div className="settings-options">
                <div className="settings-group">
                  <h3>Visual Settings</h3>
                  
                  <div className="select-option">
                    <div className="select-text">
                      <label htmlFor="fontSize">Font Size</label>
                      <p className="option-description">Adjust the size of text throughout the application</p>
                    </div>
                    <div className="select-control">
                      <select 
                        id="fontSize"
                        value={accessibilitySettings.fontSize}
                        onChange={(e) => handleSelectChange('accessibility', 'fontSize', e.target.value)}
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium (Default)</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="toggle-option">
                    <div className="toggle-text">
                      <label htmlFor="highContrast">High contrast mode</label>
                      <p className="option-description">Increase contrast for better visibility</p>
                    </div>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        id="highContrast" 
                        checked={accessibilitySettings.highContrast} 
                        onChange={() => handleToggleChange('accessibility', 'highContrast')}
                      />
                      <label htmlFor="highContrast" className="toggle-label"></label>
                    </div>
                  </div>
                </div>
                
                <div className="settings-group">
                  <h3>Motion & Animation</h3>
                  
                  <div className="toggle-option">
                    <div className="toggle-text">
                      <label htmlFor="reducedMotion">Reduced motion</label>
                      <p className="option-description">Minimize animations and motion effects</p>
                    </div>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        id="reducedMotion" 
                        checked={accessibilitySettings.reducedMotion} 
                        onChange={() => handleToggleChange('accessibility', 'reducedMotion')}
                      />
                      <label htmlFor="reducedMotion" className="toggle-label"></label>
                    </div>
                  </div>
                </div>
                
                <div className="settings-group">
                  <h3>Screen Reader</h3>
                  
                  <div className="toggle-option">
                    <div className="toggle-text">
                      <label htmlFor="screenReaderOptimized">Screen reader optimized</label>
                      <p className="option-description">Enhance compatibility with screen readers</p>
                    </div>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        id="screenReaderOptimized" 
                        checked={accessibilitySettings.screenReaderOptimized} 
                        onChange={() => handleToggleChange('accessibility', 'screenReaderOptimized')}
                      />
                      <label htmlFor="screenReaderOptimized" className="toggle-label"></label>
                    </div>
                  </div>
                </div>
                
                <div className="settings-actions">
                  <button 
                    className="btn-primary"
                    onClick={saveAccessibilitySettings}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Accessibility Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;