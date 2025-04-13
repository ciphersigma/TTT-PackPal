import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import './Dashboard.css';

// Import the AI Packing Assistant styles
// Make sure to create this CSS file
import '../components/AIPackingAssistant.css';

const Dashboard = () => {
  // API base URL
  const API_URL = 'http://localhost:5000/api';
  
  // Format current timestamp in UTC (YYYY-MM-DD HH:MM:SS)
  const formatCurrentTimestamp = () => {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace('T', ' ');
  };

  // State for user dashboard data
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState('Member');
  const [globalStats, setGlobalStats] = useState({
    wasteReduction: 0,
    costSavings: 0,
    optimizedPackages: 0,
    recyclablePercentage: 0
  });
  const [userPackages, setUserPackages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [readAnnouncements, setReadAnnouncements] = useState([]);
  const [currentTimestamp, setCurrentTimestamp] = useState(formatCurrentTimestamp());
  const [rolePermissions, setRolePermissions] = useState({
    canEditPackages: false,
    canInviteMembers: false,
    canViewStats: true,
    canDeleteItems: false
  });
  
  // State for collaborative features
  const [checklists, setChecklists] = useState([]);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('General');
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [duplicateAlerts, setDuplicateAlerts] = useState([]);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [progressStats, setProgressStats] = useState({
    total: 0,
    toPack: 0,
    packed: 0,
    delivered: 0
  });

  // State for AI Packing Assistant
  const [destination, setDestination] = useState('');
  const [month, setMonth] = useState('');
  const [aiChecklist, setAiChecklist] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);

  // Poll interval reference
  const pollingIntervalRef = useRef(null);

  // Store axios cancel tokens to prevent race conditions
  const cancelTokensRef = useRef({});

  // Reset error state after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Update timestamp every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTimestamp(formatCurrentTimestamp());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Get auth config for API requests with token
  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("No authentication token found");
    }
    
    // Create a cancel token for this request
    const source = axios.CancelToken.source();
    
    return {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cancelToken: source.token
    };
  }, []);

  // AI Packing Assistant functions
  const sampleChecklists = {
    summer: ['Sunglasses', 'Sunscreen', 'Hat', 'Water Bottle', 'Shorts', 'Light T-Shirts'],
    winter: ['Jacket', 'Thermal Wear', 'Woolen Socks', 'Gloves', 'Beanie', 'Moisturizer'],
    rainy: ['Raincoat', 'Umbrella', 'Waterproof Bag', 'Flip-flops', 'Dry Bag']
  };

  const getSeasonFromMonth = (month) => {
    const lower = month.toLowerCase();
    if (['december', 'january', 'february'].includes(lower)) return 'winter';
    if (['june', 'july', 'august'].includes(lower)) return 'rainy';
    return 'summer';
  };

  const generateChecklist = () => {
    if (!destination || !month) return;
    const season = getSeasonFromMonth(month);
    const items = sampleChecklists[season] || [];
    setAiChecklist(items);
    setCheckedItems([]);
  };

  const toggleItem = (item) => {
    setCheckedItems((prev) =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  // Fetch current user data
  const fetchUserData = useCallback(async () => {
    // Cancel any existing requests
    if (cancelTokensRef.current.userData) {
      cancelTokensRef.current.userData.cancel('Cancelled due to new request');
    }
    
    try {
      const source = axios.CancelToken.source();
      cancelTokensRef.current.userData = source;
      
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        cancelToken: source.token
      };
      
      const response = await axios.get(`${API_URL}/users/me`, config);
      const user = response.data;
      
      setUserData(user);
      setUserRole(user.role || 'Member');
      
      // Update role permissions based on user role
      updateRolePermissions(user.role);
      
      return user;
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error('Failed to fetch user data:', err);
        
        // Try to use stored user data
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser && storedUser._id) {
          setUserData(storedUser);
          setUserRole(storedUser.role || 'Member');
          updateRolePermissions(storedUser.role);
          return storedUser;
        }
        
        if (!err.response) {
          setError("Network error. Please check your connection.");
        } else if (err.response.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          setError("Failed to load user data.");
        }
      }
      return null;
    }
  }, [API_URL]);

  // Update role permissions based on user role
  const updateRolePermissions = useCallback((role) => {
    switch(role) {
      case "Owner":
        setRolePermissions({
          canEditPackages: true,
          canInviteMembers: true,
          canViewStats: true,
          canDeleteItems: true
        });
        break;
      case "Admin":
        setRolePermissions({
          canEditPackages: true,
          canInviteMembers: true,
          canViewStats: true,
          canDeleteItems: true
        });
        break;
      case "Member":
        setRolePermissions({
          canEditPackages: true,
          canInviteMembers: false,
          canViewStats: true,
          canDeleteItems: false
        });
        break;
      case "Viewer":
      default:
        setRolePermissions({
          canEditPackages: false,
          canInviteMembers: false,
          canViewStats: true,
          canDeleteItems: false
        });
        break;
    }
  }, []);

  // Fetch global settings from admin
  const fetchGlobalSettings = useCallback(async () => {
    // Cancel any existing requests
    if (cancelTokensRef.current.settings) {
      cancelTokensRef.current.settings.cancel('Cancelled due to new request');
    }
    
    try {
      const source = axios.CancelToken.source();
      cancelTokensRef.current.settings = source;
      
      const response = await axios.get(`${API_URL}/settings`, {
        cancelToken: source.token
      });
      
      const settings = response.data;
      setGlobalStats({
        wasteReduction: settings.wasteReduction || 0,
        costSavings: settings.costSavings || 0,
        optimizedPackages: settings.optimizedPackages || 0,
        recyclablePercentage: settings.recyclablePercentage || 0
      });
      
      return settings;
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error('Failed to fetch global settings:', err);
      }
      return null;
    }
  }, [API_URL]);

  // Fetch user packages
  const fetchUserPackages = useCallback(async (userId) => {
    if (!userId) return [];
    
    // Cancel any existing requests
    if (cancelTokensRef.current.packages) {
      cancelTokensRef.current.packages.cancel('Cancelled due to new request');
    }
    
    try {
      const source = axios.CancelToken.source();
      cancelTokensRef.current.packages = source;
      
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        cancelToken: source.token
      };
      
      const response = await axios.get(`${API_URL}/packages/user/${userId}`, config);
      const packages = response.data;
      
      setUserPackages(packages);
      return packages;
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error('Failed to fetch user packages:', err);
      }
      return [];
    }
  }, [API_URL]);

  // Fetch announcements
  const fetchAnnouncements = useCallback(async () => {
    // Cancel any existing requests
    if (cancelTokensRef.current.announcements) {
      cancelTokensRef.current.announcements.cancel('Cancelled due to new request');
    }
    
    try {
      const source = axios.CancelToken.source();
      cancelTokensRef.current.announcements = source;
      
      const response = await axios.get(`${API_URL}/announcements`, {
        cancelToken: source.token
      });
      
      const announcements = response.data;
      setAnnouncements(announcements);
      
      // Fetch which announcements are read by this user
      if (userData && userData._id) {
        try {
          const readResponse = await axios.get(
            `${API_URL}/users/${userData._id}/announcements/read`, 
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              },
              cancelToken: source.token
            }
          );
          
          setReadAnnouncements(readResponse.data.map(item => item.announcementId));
        } catch (readErr) {
          if (!axios.isCancel(readErr)) {
            console.error('Failed to fetch read announcements:', readErr);
          }
        }
      }
      
      return announcements;
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error('Failed to fetch announcements:', err);
      }
      return [];
    }
  }, [API_URL, userData]);

  // Fetch collaborative checklists
  const fetchChecklists = useCallback(async (userId) => {
    if (!userId) return [];
    
    // Cancel any existing requests
    if (cancelTokensRef.current.checklists) {
      cancelTokensRef.current.checklists.cancel('Cancelled due to new request');
    }
    
    try {
      const source = axios.CancelToken.source();
      cancelTokensRef.current.checklists = source;
      
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        cancelToken: source.token
      };
      
      const response = await axios.get(`${API_URL}/checklists`, config);
      const checklists = response.data;
      
      setChecklists(checklists);
      
      // Calculate progress stats
      if (Array.isArray(checklists) && checklists.length > 0) {
        const totalItems = checklists.reduce((acc, list) => 
          acc + (list.items ? list.items.length : 0), 0);
          
        const toPack = checklists.reduce((acc, list) => 
          acc + (list.items ? list.items.filter(item => item.status === 'To Pack').length : 0), 0);
          
        const packed = checklists.reduce((acc, list) => 
          acc + (list.items ? list.items.filter(item => item.status === 'Packed').length : 0), 0);
          
        const delivered = checklists.reduce((acc, list) => 
          acc + (list.items ? list.items.filter(item => item.status === 'Delivered').length : 0), 0);
        
        setProgressStats({
          total: totalItems,
          toPack,
          packed,
          delivered
        });
        
        // Set default selected checklist if none is selected
        if (!selectedChecklist && checklists.length > 0) {
          setSelectedChecklist(checklists[0]._id);
        }
      }
      
      return checklists;
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error('Failed to fetch checklists:', err);
      }
      return [];
    }
  }, [API_URL, selectedChecklist]);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    
    try {
      // Fetch user data first
      const user = await fetchUserData();
      
      if (user && user._id) {
        // Fetch all other data in parallel
        await Promise.all([
          fetchGlobalSettings(),
          fetchUserPackages(user._id),
          fetchAnnouncements(),
          fetchChecklists(user._id)
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError("Failed to load dashboard data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [fetchUserData, fetchGlobalSettings, fetchUserPackages, fetchAnnouncements, fetchChecklists]);

  // Setup polling for real-time updates
  useEffect(() => {
    // Initial data fetch
    fetchDashboardData();
    
    // Setup polling interval (every 30 seconds)
    pollingIntervalRef.current = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    // Cleanup on unmount
    return () => {
      clearInterval(pollingIntervalRef.current);
      
      // Cancel all pending requests
      Object.values(cancelTokensRef.current).forEach(source => {
        if (source) {
          source.cancel('Component unmounted');
        }
      });
    };
  }, [fetchDashboardData]);

  // Mark announcement as read
  const markAsRead = async (announcementId) => {
    if (!userData || !userData._id) return;
    
    // Optimistically update UI first
    if (!readAnnouncements.includes(announcementId)) {
      setReadAnnouncements([...readAnnouncements, announcementId]);
    }
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      await axios.post(`${API_URL}/announcements/${announcementId}/read`, {}, config);
    } catch (err) {
      console.error('Failed to mark announcement as read:', err);
      // Revert optimistic update if needed
    }
  };

  // Add reaction to announcement
  const addReaction = async (announcementId, reactionType) => {
    if (!userData || !userData._id) return;
    
    // Optimistically update UI first
    const updatedAnnouncements = announcements.map(ann => {
      if (ann._id === announcementId) {
        const updatedReactions = { ...ann.reactions };
        updatedReactions[reactionType] = (updatedReactions[reactionType] || 0) + 1;
        
        return {
          ...ann,
          reactions: updatedReactions
        };
      }
      return ann;
    });
    
    setAnnouncements(updatedAnnouncements);
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      await axios.post(
        `${API_URL}/announcements/${announcementId}/react`,
        { reactionType },
        config
      );
    } catch (err) {
      console.error('Failed to add reaction to announcement:', err);
      // Revert optimistic update
      fetchAnnouncements();
    }
  };

  // Create a new checklist
  const createChecklist = async () => {
    if (!newChecklistName.trim() || !userData || !userData._id) return;
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      const response = await axios.post(
        `${API_URL}/checklists`,
        { name: newChecklistName },
        config
      );
      
      // Update state with new checklist
      setChecklists([...checklists, response.data]);
      setSelectedChecklist(response.data._id);
      setNewChecklistName('');
    } catch (err) {
      console.error('Failed to create checklist:', err);
      setError("Failed to create new checklist. Please try again.");
    }
  };

  // Add item to checklist
  const addItemToChecklist = async () => {
    if (!newItemText.trim() || !selectedChecklist || !userData || !userData._id) return;
    
    // Check for duplicate items
    const currentChecklist = checklists.find(list => list._id === selectedChecklist);
    if (currentChecklist && currentChecklist.items) {
      const duplicateItem = currentChecklist.items.find(
        item => item.text.toLowerCase() === newItemText.toLowerCase()
      );
      
      if (duplicateItem) {
        setDuplicateAlerts([...duplicateAlerts, {
          text: newItemText,
          checklist: currentChecklist.name,
          timestamp: new Date().toISOString()
        }]);
        setShowDuplicateAlert(true);
        
        // Auto-hide the alert after 5 seconds
        setTimeout(() => {
          setShowDuplicateAlert(false);
        }, 5000);
        
        return;
      }
    }
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      const response = await axios.post(
        `${API_URL}/checklists/${selectedChecklist}/items`,
        {
          text: newItemText,
          category: newItemCategory,
          status: 'To Pack'
        },
        config
      );
      
      // Optimistically update UI
      const updatedChecklists = checklists.map(list => {
        if (list._id === selectedChecklist) {
          return {
            ...list,
            items: [...(list.items || []), response.data]
          };
        }
        return list;
      });
      
      setChecklists(updatedChecklists);
      setNewItemText('');
      
      // Update progress stats
      setProgressStats({
        ...progressStats,
        total: progressStats.total + 1,
        toPack: progressStats.toPack + 1
      });
    } catch (err) {
      console.error('Failed to add item to checklist:', err);
      setError("Failed to add item. Please try again.");
    }
  };

  // Update item status
  const updateItemStatus = async (checklistId, itemId, newStatus) => {
    if (!userData || !userData._id) return;
    
    // Find current status for progress stats update
    const checklist = checklists.find(list => list._id === checklistId);
    const item = checklist?.items?.find(item => item._id === itemId);
    const currentStatus = item ? item.status : null;
    
    // Optimistically update UI
    const updatedChecklists = checklists.map(list => {
      if (list._id === checklistId) {
        const updatedItems = (list.items || []).map(item => {
          if (item._id === itemId) {
            return { ...item, status: newStatus };
          }
          return item;
        });
        
        return { ...list, items: updatedItems };
      }
      return list;
    });
    
    setChecklists(updatedChecklists);
    
    // Update progress stats
    const updatedStats = { ...progressStats };
    
    if (currentStatus === 'To Pack') {
      updatedStats.toPack--;
    } else if (currentStatus === 'Packed') {
      updatedStats.packed--;
    } else if (currentStatus === 'Delivered') {
      updatedStats.delivered--;
    }
    
    if (newStatus === 'To Pack') {
      updatedStats.toPack++;
    } else if (newStatus === 'Packed') {
      updatedStats.packed++;
    } else if (newStatus === 'Delivered') {
      updatedStats.delivered++;
    }
    
    setProgressStats(updatedStats);
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      await axios.put(
        `${API_URL}/checklists/${checklistId}/items/${itemId}`,
        { status: newStatus },
        config
      );
    } catch (err) {
      console.error('Failed to update item status:', err);
      setError("Failed to update item status. Please try again.");
      
      // Revert optimistic update
      fetchChecklists(userData._id);
    }
  };

  // Save AI checklist as a real checklist
  const saveAiChecklistToSystem = async () => {
    if (!destination || !month || aiChecklist.length === 0 || !userData || !userData._id) return;
    
    try {
      // First create a new checklist
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      const response = await axios.post(
        `${API_URL}/checklists`,
        { name: `Trip to ${destination} in ${month}` },
        config
      );
      
      const newChecklistId = response.data._id;
      
      // Add all items to the checklist
      const itemPromises = aiChecklist.map(item => 
        axios.post(
          `${API_URL}/checklists/${newChecklistId}/items`,
          {
            text: item,
            category: 'Trip',
            status: checkedItems.includes(item) ? 'Packed' : 'To Pack'
          },
          config
        )
      );
      
      await Promise.all(itemPromises);
      
      // Refresh checklists
      fetchChecklists(userData._id);
      
      // Switch to checklists tab
      setActiveTab('checklists');
      setSelectedChecklist(newChecklistId);
      
      // Clear AI checklist form
      setDestination('');
      setMonth('');
      setAiChecklist([]);
      setCheckedItems([]);
      
      setError({ type: 'success', message: "Trip checklist created successfully!" });
    } catch (err) {
      console.error('Failed to save AI checklist:', err);
      setError("Failed to save trip checklist. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {userData?.name || 'User'}!</h1>
        <div className="user-meta">
          <p>Role: <span className="user-role">{userRole}</span></p>
          <p>Last updated: {currentTimestamp}</p>
        </div>
      </div>
      
      {error && (
        <div className={`message-box ${error.type === 'success' ? 'success-message' : 'error-message'}`}>
          <span>{typeof error === 'object' ? error.message : error}</span>
          <button className="close-btn" onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      {/* Duplicate item alert */}
      {showDuplicateAlert && duplicateAlerts.length > 0 && (
        <div className="duplicate-alert">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <strong>Duplicate Item Detected</strong>
            <p>"{duplicateAlerts[duplicateAlerts.length - 1].text}" already exists in the "{duplicateAlerts[duplicateAlerts.length - 1].checklist}" checklist.</p>
          </div>
          <button className="close-alert" onClick={() => setShowDuplicateAlert(false)}>×</button>
        </div>
      )}
      
      {/* Tabs for navigation */}
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </div>
        <div 
          className={`tab ${activeTab === 'packages' ? 'active' : ''}`}
          onClick={() => setActiveTab('packages')}
        >
          My Packages ({userPackages.length})
        </div>
        <div 
          className={`tab ${activeTab === 'checklists' ? 'active' : ''}`}
          onClick={() => setActiveTab('checklists')}
        >
          Checklists ({checklists.length})
        </div>
        <div 
          className={`tab ${activeTab === 'ai-assistant' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-assistant')}
        >
          AI Packing Assistant
        </div>
        <div 
          className={`tab ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          Announcements {announcements.length > 0 && 
            <span className="notification-badge">
              {announcements.filter(a => !readAnnouncements.includes(a._id)).length}
            </span>
          }
        </div>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="dashboard-section">
          <div className="welcome-message">
            <h2>Your Packaging Impact</h2>
            <p>See how your sustainable packaging choices are making a difference</p>
          </div>
          
          {/* AI Packing Assistant in Overview */}
          <div className="ai-assistant-box">
            <h2>🧠 AI Packing Assistant</h2>
            <p>Just tell us where and when you're going — we'll handle the checklist!</p>
            
            <div className="form-group">
              <input
                type="text"
                placeholder="Destination (e.g., Goa)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
              <input
                type="text"
                placeholder="Month of travel (e.g., January)"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
              <button onClick={generateChecklist}>Generate Checklist</button>
            </div>
            
            {aiChecklist.length > 0 && (
              <div className="checklist">
                <h3>Checklist for {destination} in {month}</h3>
                <ul>
                  {aiChecklist.map((item, index) => (
                    <li key={index}>
                      <label>
                        <input
                          type="checkbox"
                          checked={checkedItems.includes(item)}
                          onChange={() => toggleItem(item)}
                        />
                        {item}
                      </label>
                    </li>
                  ))}
                </ul>
                <div className="checklist-actions">
                  <button 
                    className="btn-primary"
                    onClick={saveAiChecklistToSystem}
                  >
                    Save to My Checklists
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-name">Waste Reduction</div>
              <div className="stat-value">{globalStats.wasteReduction}%</div>
              <div className="stat-description">Less waste compared to standard packaging</div>
            </div>
            <div className="stat-card">
              <div className="stat-name">Cost Savings</div>
              <div className="stat-value">${globalStats.costSavings.toLocaleString()}</div>
              <div className="stat-description">Average savings per user</div>
            </div>
            <div className="stat-card">
              <div className="stat-name">Packages Optimized</div>
              <div className="stat-value">{globalStats.optimizedPackages.toLocaleString()}</div>
              <div className="stat-description">Through our platform</div>
            </div>
            <div className="stat-card">
              <div className="stat-name">Recyclable Materials</div>
              <div className="stat-value">{globalStats.recyclablePercentage}%</div>
              <div className="stat-description">Of our packaging is recyclable</div>
            </div>
          </div>
          
          <div className="dashboard-row">
            <div className="recent-activity">
              <h3>Your Recent Packages</h3>
              {userPackages.length === 0 ? (
                <p>You haven't created any packages yet.</p>
              ) : (
                <div className="recent-packages">
                  {userPackages.slice(0, 3).map(pkg => (
                    <div key={pkg._id} className="package-card">
                      <h4>Package #{pkg.packageId || pkg._id.substring(0, 8)}</h4>
                      <div className="package-details">
                        <p><strong>Type:</strong> {pkg.packageType}</p>
                        <p><strong>Status:</strong> 
                          <span className={`status ${pkg.status.toLowerCase()}`}>
                            {pkg.status}
                          </span>
                        </p>
                        <p><strong>Shipping Date:</strong> {pkg.shippingDate 
                          ? new Date(pkg.shippingDate).toLocaleDateString() 
                          : "Not set"}
                        </p>
                        <p><strong>Waste Reduced:</strong> {pkg.wasteReduced || 0}g</p>
                        <p><strong>Cost Saved:</strong> ${pkg.costSaved || 0}</p>
                      </div>
                      {rolePermissions.canEditPackages && (
                        <div className="package-actions">
                          <button className="btn-secondary">Edit Package</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="latest-announcement">
              <h3>Latest Announcement</h3>
              {announcements.length === 0 ? (
                <p>No announcements available.</p>
              ) : (
                <div className="announcement-preview">
                  <h4>{announcements[0].title}</h4>
                  <p className="announcement-date">
                    {new Date(announcements[0].createdAt || announcements[0].date).toLocaleString()}
                  </p>
                  <p className="announcement-message">{announcements[0].message}</p>
                  <button 
                    className="btn-text"
                    onClick={() => {
                      setActiveTab('announcements');
                      markAsRead(announcements[0]._id);
                    }}
                  >
                    Read more announcements
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Packing Progress */}
          <div className="packing-progress">
            <h3>Packing Progress</h3>
            <div className="progress-bar-container">
              <div className="progress-stats">
                <div className="progress-stat">
                  <div className="stat-value">{progressStats.total}</div>
                  <div className="stat-label">Total Items</div>
                </div>
                <div className="progress-stat">
                  <div className="stat-value">{progressStats.toPack}</div>
                  <div className="stat-label">To Pack</div>
                </div>
                <div className="progress-stat">
                  <div className="stat-value">{progressStats.packed}</div>
                  <div className="stat-label">Packed</div>
                </div>
                <div className="progress-stat">
                  <div className="stat-value">{progressStats.delivered}</div>
                  <div className="stat-label">Delivered</div>
                </div>
              </div>
              
              <div className="progress-bar">
                {progressStats.total > 0 ? (
                  <>
                    <div 
                      className="progress-segment to-pack"
                      style={{ width: `${(progressStats.toPack / progressStats.total) * 100}%` }}
                      title={`To Pack: ${progressStats.toPack} items`}
                    ></div>
                    <div 
                      className="progress-segment packed"
                      style={{ width: `${(progressStats.packed / progressStats.total) * 100}%` }}
                      title={`Packed: ${progressStats.packed} items`}
                    ></div>
                    <div 
                      className="progress-segment delivered"
                      style={{ width: `${(progressStats.delivered / progressStats.total) * 100}%` }}
                      title={`Delivered: ${progressStats.delivered} items`}
                    ></div>
                  </>
                ) : (
                  <div className="progress-empty">No items yet</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="user-info-card">
            <h3>Account Information</h3>
            <div className="user-info-grid">
              <div className="info-item">
                <span className="info-label">Username:</span>
                <span className="info-value">{userData?.username || ''}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Login:</span>
                <span className="info-value">
                  {userData?.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Account Type:</span>
                <span className="info-value">Business</span>
              </div>
              <div className="info-item">
                <span className="info-label">Role:</span>
                <span className="info-value">{userRole}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{userData?.email || ''}</span>
              </div>
            </div>
          </div>
          
          {/* Permissions information based on role */}
          <div className="role-permissions">
            <h3>Your Role Permissions</h3>
            <div className="permissions-grid">
              <div className="permission-item">
                <span className="permission-name">Edit Packages:</span>
                <span className={`permission-value ${rolePermissions.canEditPackages ? 'allowed' : 'denied'}`}>
                  {rolePermissions.canEditPackages ? 'Allowed' : 'Not Allowed'}
                </span>
              </div>
              <div className="permission-item">
                <span className="permission-name">Invite Members:</span>
                <span className={`permission-value ${rolePermissions.canInviteMembers ? 'allowed' : 'denied'}`}>
                  {rolePermissions.canInviteMembers ? 'Allowed' : 'Not Allowed'}
                </span>
              </div>
              <div className="permission-item">
                <span className="permission-name">Delete Items:</span>
                <span className={`permission-value ${rolePermissions.canDeleteItems ? 'allowed' : 'denied'}`}>
                  {rolePermissions.canDeleteItems ? 'Allowed' : 'Not Allowed'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Packages Tab */}
      {activeTab === 'packages' && (
        <div className="dashboard-section">
          <h2>My Packages</h2>
          <p>Track and manage your sustainable packaging</p>
          
          {userPackages.length === 0 ? (
            <div className="empty-state">
              <p>You haven't created any packages yet.</p>
              {rolePermissions.canEditPackages && (
                <button className="btn-primary">Create New Package</button>
              )}
            </div>
          ) : (
            <div className="packages-list">
              <div className="package-controls">
                {rolePermissions.canEditPackages && (
                  <button className="btn-primary">Create New Package</button>
                )}
                <div className="package-filters">
                  <select defaultValue="all">
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>
              
              <table className="packages-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Shipping Date</th>
                    <th>Waste Reduced</th>
                    <th>Cost Saved</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userPackages.map(pkg => (
                    <tr key={pkg._id}>
                      <td>#{pkg.packageId || pkg._id.substring(0, 8)}</td>
                      <td>{pkg.packageType}</td>
                      <td>
                        <span className={`status ${pkg.status.toLowerCase()}`}>
                          {pkg.status}
                        </span>
                      </td>
                      <td>
                        {pkg.shippingDate 
                          ? new Date(pkg.shippingDate).toLocaleDateString() 
                          : "Not set"}
                      </td>
                      <td>{pkg.wasteReduced || 0}g</td>
                      <td>${pkg.costSaved || 0}</td>
                      <td>
                        <button className="btn-text">View Details</button>
                        {rolePermissions.canEditPackages && (
                          <button className="btn-text btn-edit">Edit</button>
                        )}
                        {rolePermissions.canDeleteItems && (
                          <button className="btn-text btn-delete">Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Checklists Tab - Collaborative Feature */}
      {activeTab === 'checklists' && (
        <div className="dashboard-section">
          <h2>Collaborative Checklists</h2>
          <p>Organize and track your items with your team</p>
          
          <div className="checklists-container">
            <div className="checklists-sidebar">
              <div className="create-checklist">
                <input 
                  type="text" 
                  placeholder="New checklist name" 
                  value={newChecklistName}
                  onChange={(e) => setNewChecklistName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createChecklist()}
                />
                <button 
                  className="btn-primary" 
                  onClick={createChecklist} 
                  disabled={!newChecklistName.trim()}
                >
                  Create
                </button>
              </div>
              
              <div className="checklists-list">
                <h3>Your Checklists</h3>
                {checklists.length === 0 ? (
                  <p className="empty-message">No checklists yet</p>
                ) : (
                  <ul>
                    {checklists.map(list => (
                      <li 
                        key={list._id} 
                        className={selectedChecklist === list._id ? 'active' : ''}
                        onClick={() => setSelectedChecklist(list._id)}
                      >
                        {list.name}
                        <span className="item-count">{list.items?.length || 0}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <div className="checklist-content">
              {selectedChecklist ? (
                <>
                  <div className="checklist-header">
                    <h3>{checklists.find(list => list._id === selectedChecklist)?.name || 'Checklist'}</h3>
                    
                    {rolePermissions.canEditPackages && (
                      <div className="add-item-form">
                        <input 
                          type="text" 
                          placeholder="Add new item" 
                          value={newItemText}
                          onChange={(e) => setNewItemText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addItemToChecklist()}
                        />
                        <select 
                          value={newItemCategory}
                          onChange={(e) => setNewItemCategory(e.target.value)}
                        >
                          <option value="General">General</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Furniture">Furniture</option>
                          <option value="Documents">Documents</option>
                          <option value="Fragile">Fragile</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Products">Products</option>
                          <option value="Trip">Trip</option>
                        </select>
                        <button 
                          className="btn-primary" 
                          onClick={addItemToChecklist}
                          disabled={!newItemText.trim()}
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="checklist-items">
                    {!checklists.find(list => list._id === selectedChecklist)?.items?.length ? (
                      <p className="empty-message">No items in this checklist yet</p>
                    ) : (
                      <div className="items-by-category">
                        {/* Group items by category */}
                        {Array.from(new Set(
                          checklists.find(list => list._id === selectedChecklist)?.items?.map(item => item.category)
                        )).map(category => (
                          <div key={category} className="category-group">
                            <h4>{category}</h4>
                            <ul className="items-list">
                              {checklists.find(list => list._id === selectedChecklist)?.items
                                ?.filter(item => item.category === category)
                                .map(item => (
                                <li key={item._id} className={`status-${item.status.toLowerCase().replace(' ', '-')}`}>
                                  <div className="item-content">
                                    <span className="item-text">{item.text}</span>
                                    <span className="item-status">{item.status}</span>
                                  </div>
                                  
                                  {rolePermissions.canEditPackages && (
                                    <div className="item-actions">
                                      <select 
                                        value={item.status}
                                        onChange={(e) => updateItemStatus(selectedChecklist, item._id, e.target.value)}
                                        className={`status-select ${item.status.toLowerCase().replace(' ', '-')}`}
                                      >
                                        <option value="To Pack">To Pack</option>
                                        <option value="Packed">Packed</option>
                                        <option value="Delivered">Delivered</option>
                                      </select>
                                      
                                      {rolePermissions.canDeleteItems && (
                                        <button className="btn-text btn-delete">Delete</button>
                                      )}
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="no-checklist-selected">
                  <p>Select a checklist or create a new one to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* AI Packing Assistant Tab */}
      {activeTab === 'ai-assistant' && (
        <div className="dashboard-section">
          <h2>AI Packing Assistant</h2>
          <p>Smart packing recommendations for your trips</p>
          
          <div className="ai-assistant-box full-page">
            <h2>🧠 AI Packing Assistant</h2>
            <p>Just tell us where and when you're going — we'll handle the checklist!</p>
            
            <div className="form-group">
              <input
                type="text"
                placeholder="Destination (e.g., Goa)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
              <input
                type="text"
                placeholder="Month of travel (e.g., January)"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
              <button 
                className="btn-primary" 
                onClick={generateChecklist}
                disabled={!destination || !month}
              >
                Generate Checklist
              </button>
            </div>
            
            {aiChecklist.length > 0 && (
              <div className="checklist">
                <h3>Checklist for {destination} in {month}</h3>
                <div className="progress-bar-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-segment packed"
                      style={{ width: `${(checkedItems.length / aiChecklist.length) * 100}%` }}
                    ></div>
                  </div>
                  <div className="progress-label">
                    {checkedItems.length} of {aiChecklist.length} items packed ({Math.round((checkedItems.length / aiChecklist.length) * 100)}%)
                  </div>
                </div>
                
                <ul className="ai-checklist-items">
                  {aiChecklist.map((item, index) => (
                    <li key={index} className={checkedItems.includes(item) ? 'checked' : ''}>
                      <label>
                        <input
                          type="checkbox"
                          checked={checkedItems.includes(item)}
                          onChange={() => toggleItem(item)}
                        />
                        {item}
                      </label>
                    </li>
                  ))}
                </ul>
                
                <div className="checklist-actions">
                  <button 
                    className="btn-primary"
                    onClick={saveAiChecklistToSystem}
                  >
                    Save to My Checklists
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      setDestination('');
                      setMonth('');
                      setAiChecklist([]);
                      setCheckedItems([]);
                    }}
                  >
                    Clear List
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => window.print()}
                  >
                    Print Checklist
                  </button>
                </div>
              </div>
            )}
            
            {!aiChecklist.length && (
              <div className="ai-tips">
                <h3>Travel Packing Tips</h3>
                <ul>
                  <li>Roll clothes instead of folding to save space and reduce wrinkles</li>
                  <li>Pack heavier items at the bottom of your suitcase</li>
                  <li>Use packing cubes to organize different categories of items</li>
                  <li>Wear your bulkiest items during travel to save luggage space</li>
                  <li>Pack a small first-aid kit for emergencies</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div className="dashboard-section">
          <h2>Announcements</h2>
          <p>Stay updated with the latest platform news</p>
          
          {announcements.length === 0 ? (
            <p>No announcements available at this time.</p>
          ) : (
            <div className="announcements-list">
              {announcements.map(ann => {
                const isRead = readAnnouncements.includes(ann._id);
                
                return (
                  <div 
                    key={ann._id} 
                    className={`announcement-item ${!isRead ? 'unread' : ''}`}
                    onClick={() => markAsRead(ann._id)}
                  >
                    <div className="announcement-header">
                      <h3>{ann.title}</h3>
                      {!isRead && <span className="unread-badge">New</span>}
                    </div>
                    <p className="announcement-date">
                      {new Date(ann.createdAt || ann.date).toLocaleString()}
                    </p>
                    <p className="announcement-message">{ann.message}</p>
                    
                    <div className="announcement-actions">
                      <div className="reaction-buttons">
                        <button onClick={(e) => {
                          e.stopPropagation();
                          addReaction(ann._id, 'thumbsUp');
                        }}>
                          👍 {ann.reactions?.thumbsUp || 0}
                        </button>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          addReaction(ann._id, 'heart');
                        }}>
                          ❤️ {ann.reactions?.heart || 0}
                        </button>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          addReaction(ann._id, 'celebration');
                        }}>
                          🎉 {ann.reactions?.celebration || 0}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;