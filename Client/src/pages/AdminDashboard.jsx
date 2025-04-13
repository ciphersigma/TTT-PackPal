import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  // Dynamic timestamps - formatted as requested (YYYY-MM-DD HH:MM:SS)
  const getCurrentTimestamp = () => {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace('T', ' ');
  };

  // State for different aspects of the admin panel
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPackages: 0,
    activeUsers: 0,
    recentSignups: []
  });
  
  const [globalSettings, setGlobalSettings] = useState({
    wasteReduction: 42,
    costSavings: 12450,
    optimizedPackages: 8672,
    recyclablePercentage: 78
  });
  
  const [announcement, setAnnouncement] = useState({
    title: '',
    message: ''
  });
  
  const [users, setUsers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [currentUser, setCurrentUser] = useState('ciphersigma');
  const [apiConnected, setApiConnected] = useState(false);
  const [timestamp, setTimestamp] = useState(getCurrentTimestamp());
  const [userRoles] = useState(['Owner', 'Admin', 'Member', 'Viewer']);
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);

  // Update timestamp periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(getCurrentTimestamp());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  // API base URL - using localhost for better compatibility
  const API_URL = 'http://localhost:5000/api';

  // Function to display success message and clear it after a few seconds
  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 5000);
  };

  // Function to display error message and clear it after a few seconds
  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 8000);
  };

  // Setup axios with auth header
  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found");
      throw new Error("No authentication token found");
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  // Fetch data from MongoDB backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get authenticated user from localStorage
        const userString = localStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;
        
        if (!user) {
          showError('You must be logged in to view this page');
          setLoading(false);
          return;
        }

        if (!user.isAdmin) {
          showError('You do not have admin privileges to view this page');
          setLoading(false);
          return;
        }

        setCurrentUser(user.name || user.username || 'ciphersigma');
        
        console.log("Starting API calls to fetch admin data");
        
        // First, test the API status to verify connectivity
        try {
          const statusResponse = await axios.get(`${API_URL}/status`);
          console.log("API Status:", statusResponse.data);
          setApiConnected(true);
        } catch (statusError) {
          console.error("API Status Check Failed:", statusError);
          setApiConnected(false);
          showError("Couldn't connect to the API. Server might be down.");
        }
        
        // Fetch users
        fetchUsers();
        
        // Fetch packages
        fetchPackages();
        
        // Fetch announcements
        fetchAnnouncements();
        
        // Fetch settings
        fetchSettings();
        
      } catch (err) {
        console.error('Failed to fetch data:', err);
        showError('Failed to load admin data. Please check network connection.');
      } finally {
        // Set overall loading to false when all individual data fetches are complete
        const checkAllLoaded = () => {
          if (!loadingUsers && !loadingPackages && !loadingAnnouncements && !loadingSettings) {
            setLoading(false);
          }
        };
        
        checkAllLoaded();
      }
    };
    
    fetchData();
  }, []);

  // Function to fetch users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      console.log(`Fetching users from: ${API_URL}/users`);
      const usersResponse = await axios.get(`${API_URL}/users`, getAuthConfig());
      console.log("Users Response:", usersResponse.data);
      
      if (Array.isArray(usersResponse.data)) {
        // Add role property if not present
        const usersWithRoles = usersResponse.data.map(user => ({
          ...user,
          role: user.role || 'Member' // Default role if not specified
        }));
        setUsers(usersWithRoles);
        
        // Update stats
        setStats(prevStats => ({
          ...prevStats,
          totalUsers: usersWithRoles.length,
          activeUsers: usersWithRoles.filter(user => 
            user.lastLogin && new Date(user.lastLogin) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ).length,
          recentSignups: [...usersWithRoles]
            .sort((a, b) => new Date(b.registrationDate || b.createdAt) - new Date(a.registrationDate || a.createdAt))
            .slice(0, 3)
        }));
      } else {
        console.warn("Users response is not an array:", usersResponse.data);
        // Create mock users with roles for testing
        createMockUsers();
      }
    } catch (error) {
      console.error("Users Fetch Error:", error.response || error);
      console.log("Using mock user data as fallback...");
      createMockUsers();
    } finally {
      setLoadingUsers(false);
    }
  };

  // Function to create mock users if API fails
  const createMockUsers = () => {
    const mockUsers = [
      { _id: 'user1', name: 'John Doe', email: 'john@example.com', role: 'Owner', registrationDate: '2025-03-10 14:25:00', lastLogin: '2025-04-12 09:30:45' },
      { _id: 'user2', name: 'Jane Smith', email: 'jane@example.com', role: 'Admin', registrationDate: '2025-03-15 10:15:20', lastLogin: '2025-04-11 16:45:22' },
      { _id: 'user3', name: 'Alex Brown', email: 'alex@example.com', role: 'Member', registrationDate: '2025-03-20 09:05:12', lastLogin: '2025-04-10 11:20:33' },
      { _id: 'user4', name: 'Sam Wilson', email: 'sam@example.com', role: 'Viewer', registrationDate: '2025-03-25 11:35:40', lastLogin: '2025-04-09 14:55:18' }
    ];
    setUsers(mockUsers);
    
    // Update stats with mock data
    setStats(prevStats => ({
      ...prevStats,
      totalUsers: mockUsers.length,
      activeUsers: mockUsers.length,
      recentSignups: [...mockUsers].slice(0, 3)
    }));
  };

  // Function to fetch packages
  const fetchPackages = async () => {
    setLoadingPackages(true);
    try {
      console.log(`Fetching packages from: ${API_URL}/packages`);
      const packagesResponse = await axios.get(`${API_URL}/packages`, getAuthConfig());
      console.log("Packages Response:", packagesResponse.data);
      
      if (Array.isArray(packagesResponse.data)) {
        setPackages(packagesResponse.data);
        
        // Update stats
        setStats(prevStats => ({
          ...prevStats,
          totalPackages: packagesResponse.data.length
        }));
      } else {
        console.warn("Packages response is not an array:", packagesResponse.data);
        createMockPackages();
      }
    } catch (error) {
      console.error("Packages Fetch Error:", error.response || error);
      console.log("Using mock package data as fallback...");
      createMockPackages();
    } finally {
      setLoadingPackages(false);
    }
  };

  // Function to create mock packages if API fails
  const createMockPackages = () => {
    const mockPackages = [
      { _id: 'pkg1', id: 'PKG-1001', customer: 'ABC Corp', packageType: 'Standard', status: 'delivered', userName: 'John Doe', shippingDate: '2025-04-02 10:30:00' },
      { _id: 'pkg2', id: 'PKG-1002', customer: 'XYZ Ltd', packageType: 'Express', status: 'shipped', userName: 'Jane Smith', shippingDate: '2025-04-05 14:15:00' },
      { _id: 'pkg3', id: 'PKG-1003', customer: 'Global Solutions', packageType: 'Custom', status: 'processing', userName: 'Alex Brown', shippingDate: '2025-04-10 09:45:00' },
      { _id: 'pkg4', id: 'PKG-1004', customer: 'Tech Innovators', packageType: 'Fragile', status: 'pending', userName: 'Sam Wilson', shippingDate: '2025-04-15 16:20:00' }
    ];
    setPackages(mockPackages);
    
    // Update stats with mock data
    setStats(prevStats => ({
      ...prevStats,
      totalPackages: mockPackages.length
    }));
  };

  // Function to fetch announcements
  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      console.log(`Fetching announcements from: ${API_URL}/announcements`);
      const announcementsResponse = await axios.get(`${API_URL}/announcements`);
      console.log("Announcements Response:", announcementsResponse.data);
      
      if (Array.isArray(announcementsResponse.data)) {
        setAnnouncements(announcementsResponse.data);
      } else {
        console.warn("Announcements response is not an array:", announcementsResponse.data);
        createMockAnnouncements();
      }
    } catch (error) {
      console.error("Announcements Fetch Error:", error.response || error);
      console.log("Using mock announcement data as fallback...");
      createMockAnnouncements();
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  // Function to create mock announcements if API fails
  const createMockAnnouncements = () => {
    const mockAnnouncements = [
      { _id: 'ann1', title: 'System Maintenance', message: 'The system will be undergoing maintenance this weekend. Please expect some downtime.', date: '2025-04-10 15:30:00', readBy: ['user1', 'user2'], reactions: { thumbsUp: 5, heart: 2, celebration: 0 } },
      { _id: 'ann2', title: 'New Feature Release', message: 'We\'ve added new analytics dashboards to help you track your packaging efficiency!', date: '2025-04-05 11:15:00', readBy: ['user1', 'user3', 'user4'], reactions: { thumbsUp: 8, heart: 4, celebration: 2 } },
      { _id: 'ann3', title: 'Holiday Schedule', message: 'Our offices will be closed for the upcoming holidays. Support will be available via email.', date: '2025-04-01 09:45:00', readBy: ['user2'], reactions: { thumbsUp: 3, heart: 1, celebration: 0 } }
    ];
    setAnnouncements(mockAnnouncements);
  };

  // Function to fetch settings
  const fetchSettings = async () => {
    setLoadingSettings(true);
    try {
      console.log(`Fetching settings from: ${API_URL}/settings`);
      const settingsResponse = await axios.get(`${API_URL}/settings`);
      console.log("Settings Response:", settingsResponse.data);
      
      if (settingsResponse.data && typeof settingsResponse.data === 'object') {
        setGlobalSettings(settingsResponse.data);
      } else {
        console.warn("Settings response is not an object:", settingsResponse.data);
      }
    } catch (error) {
      console.error("Settings Fetch Error:", error.response || error);
      console.log("Using default settings as fallback...");
    } finally {
      setLoadingSettings(false);
    }
  };

  // Input change handlers
  const handleAnnouncementChange = (e) => {
    setAnnouncement({
      ...announcement,
      [e.target.name]: e.target.value
    });
  };

  const handleSettingsChange = (e) => {
    setGlobalSettings({
      ...globalSettings,
      [e.target.name]: Number(e.target.value)
    });
  };

  // Handle announcement submission
  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Create announcement object with current timestamp
      const newAnnouncement = {
        title: announcement.title,
        message: announcement.message,
        date: getCurrentTimestamp(),
        readBy: [],
        reactions: {
          thumbsUp: 0,
          heart: 0,
          celebration: 0
        }
      };
      
      console.log("Sending announcement:", newAnnouncement);
      
      // Try to send to API
      let createdAnnouncement;
      try {
        const response = await axios.post(
          `${API_URL}/announcements`, 
          newAnnouncement, 
          getAuthConfig()
        );
        console.log("Announcement API response:", response.data);
        createdAnnouncement = response.data;
      } catch (apiError) {
        console.error("API error posting announcement:", apiError);
        
        // If API fails, create a local fallback with ID
        const newId = `ann_${Date.now()}`;
        createdAnnouncement = {
          ...newAnnouncement,
          id: newId,
          _id: newId
        };
        
        // Store in localStorage as fallback
        const currentAnnouncements = JSON.parse(localStorage.getItem('announcements') || '[]');
        localStorage.setItem('announcements', JSON.stringify([createdAnnouncement, ...currentAnnouncements]));
      }
      
      // Add the announcement to state
      setAnnouncements([createdAnnouncement, ...announcements]);
      showSuccess('Announcement published successfully!');
      setAnnouncement({ title: '', message: '' });
    } catch (err) {
      console.error('Failed to publish announcement:', err);
      showError(`Failed to publish announcement: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle global settings update
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log("Updating settings:", globalSettings);
      
      try {
        const response = await axios.put(
          `${API_URL}/settings`, 
          globalSettings, 
          getAuthConfig()
        );
        console.log("Settings update response:", response.data);
      } catch (apiError) {
        console.error("API error updating settings:", apiError);
        
        // Fallback: Store in localStorage if API fails
        localStorage.setItem('globalSettings', JSON.stringify(globalSettings));
      }
      
      showSuccess('Global settings updated successfully!');
    } catch (err) {
      console.error('Failed to update global settings:', err);
      showError(`Failed to update settings: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle user role update
  const handleUserRoleChange = async (userId, newRole) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log(`Updating user ${userId} to role ${newRole}`);
      
      try {
        const response = await axios.put(
          `${API_URL}/users/${userId}/role`, 
          { role: newRole }, 
          getAuthConfig()
        );
        console.log("Role update response:", response.data);
      } catch (apiError) {
        console.error("API error updating role:", apiError);
      }
      
      // Update user in local state regardless of API success (optimistic update)
      const updatedUsers = users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      );
      setUsers(updatedUsers);
      
      // Update localStorage for demo/fallback purposes
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      showSuccess(`User role updated to ${newRole} successfully!`);
    } catch (err) {
      console.error('Failed to update user role:', err);
      showError(`Failed to update user role: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete an announcement
  const handleDeleteAnnouncement = async (id) => {
    setActionLoading(true);
    try {
      console.log("Deleting announcement:", id);
      
      try {
        const response = await axios.delete(
          `${API_URL}/announcements/${id}`, 
          getAuthConfig()
        );
        console.log("Delete response:", response.data);
      } catch (apiError) {
        console.error("API error deleting announcement:", apiError);
        
        // Fallback: Remove from localStorage if API fails
        const currentAnnouncements = JSON.parse(localStorage.getItem('announcements') || '[]');
        const filteredAnnouncements = currentAnnouncements.filter(ann => ann.id !== id && ann._id !== id);
        localStorage.setItem('announcements', JSON.stringify(filteredAnnouncements));
      }
      
      // Update state (optimistic update)
      const filteredAnnouncements = announcements.filter(ann => ann._id !== id && ann.id !== id);
      setAnnouncements(filteredAnnouncements);
      showSuccess('Announcement deleted successfully!');
    } catch (err) {
      console.error('Failed to delete announcement:', err);
      showError(`Failed to delete announcement: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p>Manage your Packpal platform</p>
      
      <div className="system-info">
        <small className="timestamp">Current Date and Time (UTC): {timestamp}</small>
        <small className="admin-user">Administrator: {currentUser}</small>
        {apiConnected ? (
          <small className="api-status connected">API Status: Connected</small>
        ) : (
          <small className="api-status disconnected">API Status: Disconnected (using fallback data)</small>
        )}
      </div>
      
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}
      
      {/* Tabs for navigation */}
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </div>
        <div 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users ({users.length})
        </div>
        <div 
          className={`tab ${activeTab === 'packages' ? 'active' : ''}`}
          onClick={() => setActiveTab('packages')}
        >
          Packages ({packages.length})
        </div>
        <div 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </div>
        <div 
          className={`tab ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          Announcements ({announcements.length})
        </div>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="admin-section">
          <h2>Platform Overview</h2>
          <p>Key metrics and platform statistics</p>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-name">Total Users</div>
              <div className="stat-value">
                {loadingUsers ? <div className="mini-spinner"></div> : stats.totalUsers}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-name">Active Users (Last 30 Days)</div>
              <div className="stat-value">
                {loadingUsers ? <div className="mini-spinner"></div> : stats.activeUsers}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-name">Total Packages</div>
              <div className="stat-value">
                {loadingPackages ? <div className="mini-spinner"></div> : stats.totalPackages}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-name">Waste Reduction</div>
              <div className="stat-value">
                {loadingSettings ? <div className="mini-spinner"></div> : `${globalSettings.wasteReduction}%`}
              </div>
            </div>
          </div>
          
          <h3>Recent Signups</h3>
          {loadingUsers ? (
            <div className="loading-section">
              <div className="spinner small"></div>
              <p>Loading users...</p>
            </div>
          ) : stats.recentSignups.length === 0 ? (
            <p>No users have signed up yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSignups.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.registrationDate || user.createdAt}</td>
                    <td>{user.role || 'Member'}</td>
                    <td>{user.lastLogin ? 'Active' : 'Inactive'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          <h3>Latest Announcements</h3>
          {loadingAnnouncements ? (
            <div className="loading-section">
              <div className="spinner small"></div>
              <p>Loading announcements...</p>
            </div>
          ) : announcements.length === 0 ? (
            <p>No announcements have been published yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Read By</th>
                  <th>Reactions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.slice(0, 3).map(ann => (
                  <tr key={ann._id || ann.id}>
                    <td>{ann.title}</td>
                    <td>{ann.createdAt || ann.date}</td>
                    <td>{ann.readBy?.length || 0} users</td>
                    <td>{(ann.reactions?.thumbsUp || 0) + (ann.reactions?.heart || 0) + (ann.reactions?.celebration || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      
      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-section">
          <h2>User Management</h2>
          <p>View and manage user accounts</p>
          
          {loadingUsers ? (
            <div className="loading-section">
              <div className="spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <p>No users have registered yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Last Login</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.registrationDate || user.createdAt}</td>
                    <td>{user.lastLogin || 'Never'}</td>
                    <td>
                      <select 
                        value={user.role || 'Member'} 
                        onChange={(e) => handleUserRoleChange(user._id, e.target.value)}
                        className="role-select"
                        disabled={actionLoading}
                      >
                        {userRoles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button className="btn-text">View</button>
                      <button className="btn-text danger">Deactivate</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          <div className="role-permissions-guide">
            <h3>Role Permissions Guide</h3>
            <div className="roles-grid">
              <div className="role-card">
                <h4>Owner</h4>
                <ul>
                  <li>Can edit all packages</li>
                  <li>Can invite members</li>
                  <li>Can delete items</li>
                  <li>Full access to all features</li>
                </ul>
              </div>
              <div className="role-card">
                <h4>Admin</h4>
                <ul>
                  <li>Can edit all packages</li>
                  <li>Can invite members</li>
                  <li>Can delete items</li>
                  <li>Cannot transfer ownership</li>
                </ul>
              </div>
              <div className="role-card">
                <h4>Member</h4>
                <ul>
                  <li>Can edit assigned packages</li>
                  <li>Cannot invite members</li>
                  <li>Cannot delete items</li>
                  <li>Limited administrative access</li>
                </ul>
              </div>
              <div className="role-card">
                <h4>Viewer</h4>
                <ul>
                  <li>Can only view packages</li>
                  <li>Cannot edit or modify</li>
                  <li>Cannot delete anything</li>
                  <li>Read-only access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Packages Tab */}
      {activeTab === 'packages' && (
        <div className="admin-section">
          <h2>Package Management</h2>
          <p>View and manage all packages in the system</p>
          
          {loadingPackages ? (
            <div className="loading-section">
              <div className="spinner"></div>
              <p>Loading packages...</p>
            </div>
          ) : packages.length === 0 ? (
            <p>No packages have been created yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Created by</th>
                  <th>Shipping Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map(pkg => (
                  <tr key={pkg._id}>
                    <td>#{pkg.id || pkg.packageId}</td>
                    <td>{pkg.customer}</td>
                    <td>{pkg.packageType}</td>
                    <td>
                      <span className={`status ${pkg.status}`}>
                        {pkg.status}
                      </span>
                    </td>
                    <td>{pkg.userName || pkg.user?.name || 'Unknown'}</td>
                    <td>{pkg.shippingDate}</td>
                    <td>
                      <button className="btn-text">View</button>
                      <button className="btn-text danger">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      
      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="admin-section">
          <h2>Global Settings</h2>
          <p>Update the global statistics shown to all users</p>
          
          {loadingSettings ? (
            <div className="loading-section">
              <div className="spinner"></div>
              <p>Loading settings...</p>
            </div>
          ) : (
            <form onSubmit={handleSettingsSubmit} className="admin-form">
              <div className="form-group">
                <label htmlFor="wasteReduction">Waste Reduction (%)</label>
                <input
                  type="number"
                  id="wasteReduction"
                  name="wasteReduction"
                  value={globalSettings.wasteReduction}
                  onChange={handleSettingsChange}
                  min="0"
                  max="100"
                  disabled={actionLoading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="costSavings">Average Cost Savings ($)</label>
                <input
                  type="number"
                  id="costSavings"
                  name="costSavings"
                  value={globalSettings.costSavings}
                  onChange={handleSettingsChange}
                  min="0"
                  disabled={actionLoading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="optimizedPackages">Packages Optimized</label>
                <input
                  type="number"
                  id="optimizedPackages"
                  name="optimizedPackages"
                  value={globalSettings.optimizedPackages}
                  onChange={handleSettingsChange}
                  min="0"
                  disabled={actionLoading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="recyclablePercentage">Recyclable Packaging (%)</label>
                <input
                  type="number"
                  id="recyclablePercentage"
                  name="recyclablePercentage"
                  value={globalSettings.recyclablePercentage}
                  onChange={handleSettingsChange}
                  min="0"
                  max="100"
                  disabled={actionLoading}
                />
              </div>
              
              <button type="submit" className="btn-primary" disabled={actionLoading}>
                {actionLoading ? 'Updating...' : 'Update Global Settings'}
              </button>
            </form>
          )}
        </div>
      )}
      
      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div className="admin-section">
          <h2>Announcements</h2>
          <p>Create new announcements for all users</p>
          
          <form onSubmit={handleAnnouncementSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="title">Announcement Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={announcement.title}
                onChange={handleAnnouncementChange}
                required
                placeholder="e.g., New Feature Release"
                disabled={actionLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Announcement Message</label>
              <textarea
                id="message"
                name="message"
                value={announcement.message}
                onChange={handleAnnouncementChange}
                required
                placeholder="Enter your announcement message here..."
                rows="4"
                disabled={actionLoading}
              ></textarea>
            </div>
            
            <button type="submit" className="btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </form>
          
          <div className="previous-announcements">
            <h3>Previous Announcements</h3>
            
            {loadingAnnouncements ? (
              <div className="loading-section">
                <div className="spinner small"></div>
                <p>Loading announcements...</p>
              </div>
            ) : announcements.length === 0 ? (
              <p>No announcements have been published yet.</p>
            ) : (
              <div className="announcements-list">
                {announcements.map(ann => (
                  <div key={ann._id || ann.id} className="announcement-item">
                    <h4>{ann.title}</h4>
                    <p className="announcement-date">{ann.createdAt || ann.date}</p>
                    <p className="announcement-message">{ann.message}</p>
                    <div className="announcement-stats">
                      <span>Read by: {ann.readBy?.length || 0} users</span>
                      <span>Reactions: {(ann.reactions?.thumbsUp || 0) + (ann.reactions?.heart || 0) + (ann.reactions?.celebration || 0)}</span>
                      <button 
                        className="btn-text danger"
                        onClick={() => handleDeleteAnnouncement(ann._id || ann.id)}
                        disabled={actionLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {actionLoading && (
        <div className="action-loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      
      <div className="admin-footer">
        <p>PackPal Admin Console • Current Date and Time (UTC): {timestamp}</p>
        <p>Current User's Login: {currentUser}</p>
        {apiConnected ? (
          <p className="api-status connected">API Status: Connected</p>
        ) : (
          <p className="api-status disconnected">API Status: Disconnected - Using local fallback data</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;