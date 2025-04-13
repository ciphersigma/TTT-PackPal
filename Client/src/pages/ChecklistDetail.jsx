import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ChecklistDetail.css';

const ChecklistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [checklist, setChecklist] = useState(null);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    status: 'to_pack'
  });
  const [newCategory, setNewCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [alerts, setAlerts] = useState([]);

  const STATUS_LABELS = {
    to_pack: 'To Pack',
    packed: 'Packed',
    delivered: 'Delivered'
  };

  const STATUS_COLORS = {
    to_pack: '#ff9800',
    packed: '#2196f3',
    delivered: '#4caf50'
  };

  // Fetch checklist data from API
  useEffect(() => {
    const fetchChecklistData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch checklist details
        const checklistResponse = await axios.get(`http://127.0.0.1:5000/api/checklists/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setChecklist(checklistResponse.data);
        setItems(checklistResponse.data.items || []);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(checklistResponse.data.items.map(item => item.category))];
        setCategories(uniqueCategories);
        
        // Fetch collaborators
        const collaboratorsResponse = await axios.get(`http://127.0.0.1:5000/api/checklists/${id}/collaborators`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setCollaborators(collaboratorsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching checklist data:', err);
        setError('Failed to load checklist. Please try again later.');
        setLoading(false);
        
        // Fallback to demo data if API fails
        const demoChecklist = {
          _id: id,
          name: 'Demo Checklist',
          description: 'This is a demo checklist with sample items',
          owner: {
            _id: 'owner123',
            name: 'Demo Owner'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const demoItems = [
          {
            _id: 'item1',
            name: 'Laptop',
            category: 'Electronics',
            status: 'packed',
            assignedTo: { _id: 'user1', name: 'User 1' },
            notes: 'Include charger'
          },
          {
            _id: 'item2',
            name: 'Projector',
            category: 'Electronics',
            status: 'to_pack',
            assignedTo: { _id: 'user2', name: 'User 2' },
            notes: 'Check if venue has HDMI'
          },
          {
            _id: 'item3',
            name: 'Brochures',
            category: 'Marketing',
            status: 'delivered',
            assignedTo: { _id: 'user1', name: 'User 1' },
            notes: '100 copies'
          },
          {
            _id: 'item4',
            name: 'Banners',
            category: 'Marketing',
            status: 'packed',
            assignedTo: { _id: 'user3', name: 'User 3' },
            notes: 'Company logo banners'
          },
          {
            _id: 'item5',
            name: 'Chairs',
            category: 'Furniture',
            status: 'to_pack',
            assignedTo: { _id: 'user2', name: 'User 2' },
            notes: '20 chairs needed'
          }
        ];
        
        const demoCollaborators = [
          { _id: 'user1', name: 'User 1', email: 'user1@example.com' },
          { _id: 'user2', name: 'User 2', email: 'user2@example.com' },
          { _id: 'user3', name: 'User 3', email: 'user3@example.com' }
        ];
        
        const demoCategories = [...new Set(demoItems.map(item => item.category))];
        
        setChecklist(demoChecklist);
        setItems(demoItems);
        setCategories(demoCategories);
        setCollaborators(demoCollaborators);
      }
    };
    
    fetchChecklistData();
  }, [id]);

  // Handle input change for new item form
  const handleItemInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create new item
  const handleAddItem = async (e) => {
    e.preventDefault();
    
    if (!newItem.name.trim()) {
      setError('Item name is required');
      return;
    }
    
    // Check for duplicate items
    const isDuplicate = items.some(item => 
      item.name.toLowerCase() === newItem.name.toLowerCase() && item.category === newItem.category
    );
    
    if (isDuplicate) {
      // Add an alert instead of preventing the action
      setAlerts([
        ...alerts, 
        { 
          id: Date.now(),
          type: 'warning',
          message: `Duplicate item detected: "${newItem.name}" already exists in ${newItem.category}`,
          timestamp: new Date().toISOString()
        }
      ]);
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://127.0.0.1:5000/api/checklists/${id}/items`,
        newItem,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update items list
      setItems([...items, response.data]);
      
      // Update categories if needed
      if (!categories.includes(newItem.category)) {
        setCategories([...categories, newItem.category]);
      }
      
      // Reset form
      setNewItem({
        name: '',
        category: newItem.category, // keep the same category for convenience
        status: 'to_pack'
      });
      
      setShowAddModal(false);
      setLoading(false);
    } catch (err) {
      console.error('Error adding item:', err);
      setError('Failed to add item. Please try again.');
      setLoading(false);
    }
  };

  // Update item status
  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://127.0.0.1:5000/api/checklists/${id}/items/${itemId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update the item in the local state
      setItems(items.map(item => 
        item._id === itemId ? { ...item, status: newStatus } : item
      ));
    } catch (err) {
      console.error('Error updating item status:', err);
      setError('Failed to update item status. Please try again.');
    }
  };

  // Add new category
  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      setError('Category name is required');
      return;
    }
    
    // Check if category already exists
    if (categories.includes(newCategory)) {
      setError('This category already exists');
      return;
    }
    
    setCategories([...categories, newCategory]);
    setNewItem({ ...newItem, category: newCategory });
    setNewCategory('');
  };

  // Add new collaborator
  const handleAddCollaborator = async () => {
    if (!newCollaboratorEmail.trim()) {
      setError('Email is required');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://127.0.0.1:5000/api/checklists/${id}/collaborators`,
        { email: newCollaboratorEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setCollaborators([...collaborators, response.data]);
      setNewCollaboratorEmail('');
    } catch (err) {
      console.error('Error adding collaborator:', err);
      setError('Failed to add collaborator. Please check if the email is valid.');
    }
  };

  // Calculate counts for each status
  const getStatusCounts = () => {
    return {
      total: items.length,
      to_pack: items.filter(item => item.status === 'to_pack').length,
      packed: items.filter(item => item.status === 'packed').length,
      delivered: items.filter(item => item.status === 'delivered').length
    };
  };

  // Group items by category
  const getItemsByCategory = () => {
    const grouped = {};
    categories.forEach(category => {
      grouped[category] = items.filter(item => item.category === category);
    });
    return grouped;
  };

  // Close alert
  const closeAlert = (alertId) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  if (loading && !checklist) {
    return (
      <div className="checklist-detail-loading">
        <div className="spinner"></div>
        <p>Loading checklist...</p>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="checklist-not-found">
        <h2>Checklist Not Found</h2>
        <p>The checklist you're looking for doesn't exist or you don't have permission to view it.</p>
        <button onClick={() => navigate('/checklists')} className="btn-primary">
          Back to Checklists
        </button>
      </div>
    );
  }

  const statusCounts = getStatusCounts();
  const itemsByCategory = getItemsByCategory();

  return (
    <div className="checklist-detail-container">
      <div className="checklist-detail-header">
        <div className="header-left">
          <button 
            onClick={() => navigate('/checklists')}
            className="back-button"
          >
            ← Back to Checklists
          </button>
          <h1>{checklist.name}</h1>
          <p className="checklist-description">{checklist.description}</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowCollaboratorsModal(true)}
            className="btn-secondary"
          >
            Collaborators ({collaborators.length})
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            Add Item
          </button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* Alerts */}
      <div className="alerts-container">
        {alerts.map(alert => (
          <div key={alert.id} className={`alert alert-${alert.type}`}>
            <span>{alert.message}</span>
            <button onClick={() => closeAlert(alert.id)} className="alert-close">×</button>
          </div>
        ))}
      </div>
      
      {/* Progress Summary */}
      <div className="progress-summary">
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(statusCounts.packed + statusCounts.delivered) / statusCounts.total * 100}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {statusCounts.packed + statusCounts.delivered} of {statusCounts.total} items packed or delivered
          </div>
        </div>
        <div className="status-counts">
          <div className="status-count">
            <div className="status-dot" style={{ backgroundColor: STATUS_COLORS.to_pack }}></div>
            <span>To Pack: {statusCounts.to_pack}</span>
          </div>
          <div className="status-count">
            <div className="status-dot" style={{ backgroundColor: STATUS_COLORS.packed }}></div>
            <span>Packed: {statusCounts.packed}</span>
          </div>
          <div className="status-count">
            <div className="status-dot" style={{ backgroundColor: STATUS_COLORS.delivered }}></div>
            <span>Delivered: {statusCounts.delivered}</span>
          </div>
        </div>
      </div>
      
      {/* Items by Category */}
      <div className="checklist-items-container">
        {categories.map(category => (
          <div key={category} className="category-section">
            <h2>{category}</h2>
            <div className="items-list">
              {itemsByCategory[category]?.length > 0 ? (
                itemsByCategory[category].map(item => (
                  <div key={item._id} className={`item-card status-${item.status}`}>
                    <div className="item-header">
                      <h3>{item.name}</h3>
                      <div className="item-status">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item._id, e.target.value)}
                          className={`status-select status-${item.status}`}
                        >
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {item.notes && (
                      <p className="item-notes">{item.notes}</p>
                    )}
                    <div className="item-footer">
                      {item.assignedTo && (
                        <div className="assigned-to">
                          Assigned to: <span>{item.assignedTo.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-items">No items in this category</p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Add Item Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Item</h2>
            <form onSubmit={handleAddItem}>
              <div className="form-group">
                <label htmlFor="name">Item Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newItem.name}
                  onChange={handleItemInputChange}
                  required
                  placeholder="e.g., Laptop, Brochures"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <div className="category-select-container">
                  <select
                    id="category"
                    name="category"
                    value={newItem.category}
                    onChange={handleItemInputChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    className="btn-small"
                    onClick={() => document.getElementById('new-category-container').style.display = 'flex'}
                  >
                    + New
                  </button>
                </div>
              </div>
              
              <div id="new-category-container" className="form-group" style={{ display: 'none' }}>
                <label htmlFor="newCategory">New Category</label>
                <div className="category-input-container">
                  <input
                    type="text"
                    id="newCategory"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g., Electronics, Marketing"
                  />
                  <button 
                    type="button" 
                    className="btn-small"
                    onClick={handleAddCategory}
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={newItem.status}
                  onChange={handleItemInputChange}
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Notes (Optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={newItem.notes || ''}
                  onChange={handleItemInputChange}
                  placeholder="Any special instructions or details"
                  rows="2"
                ></textarea>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Collaborators Modal */}
      {showCollaboratorsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Collaborators</h2>
            <div className="collaborators-list">
              {collaborators.length > 0 ? (
                collaborators.map(collaborator => (
                  <div key={collaborator._id} className="collaborator-item">
                    <div className="collaborator-info">
                      <span className="collaborator-name">{collaborator.name}</span>
                      <span className="collaborator-email">{collaborator.email}</span>
                    </div>
                    {checklist.owner?._id !== collaborator._id && (
                      <button className="btn-icon remove-collaborator">×</button>
                    )}
                  </div>
                ))
              ) : (
                <p>No collaborators yet</p>
              )}
            </div>
            
            <div className="add-collaborator">
              <h3>Add Collaborator</h3>
              <div className="collaborator-input-container">
                <input
                  type="email"
                  value={newCollaboratorEmail}
                  onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                  placeholder="Enter email address"
                />
                <button 
                  className="btn-primary"
                  onClick={handleAddCollaborator}
                >
                  Add
                </button>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-primary"
                onClick={() => setShowCollaboratorsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChecklistDetail;