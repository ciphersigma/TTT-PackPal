import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Checklists.css';

const Checklists = () => {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newChecklist, setNewChecklist] = useState({
    name: '',
    description: ''
  });
  const [showModal, setShowModal] = useState(false);

  // Fetch checklists from API
  useEffect(() => {
    const fetchChecklists = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:5000/api/checklists', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setChecklists(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching checklists:', err);
        setError('Failed to load checklists. Please try again later.');
        setLoading(false);
        
        // Fallback to demo data if API fails
        setChecklists([
          {
            _id: 'demo1',
            name: 'Office Supplies',
            description: 'Items needed for the new office',
            itemCount: 15,
            completedCount: 8,
            collaborators: 3,
            updatedAt: new Date().toISOString()
          },
          {
            _id: 'demo2',
            name: 'Event Materials',
            description: 'Everything for the upcoming conference',
            itemCount: 24,
            completedCount: 5,
            collaborators: 5,
            updatedAt: new Date().toISOString()
          },
          {
            _id: 'demo3',
            name: 'Warehouse Inventory',
            description: 'Current inventory status',
            itemCount: 42,
            completedCount: 42,
            collaborators: 2,
            updatedAt: new Date().toISOString()
          }
        ]);
      }
    };
    
    fetchChecklists();
  }, []);

  // Handle input change for new checklist form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewChecklist(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create new checklist
  const handleCreateChecklist = async (e) => {
    e.preventDefault();
    
    if (!newChecklist.name.trim()) {
      setError('Checklist name is required');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://127.0.0.1:5000/api/checklists',
        newChecklist,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setChecklists([response.data, ...checklists]);
      setNewChecklist({ name: '', description: '' });
      setShowModal(false);
      setLoading(false);
    } catch (err) {
      console.error('Error creating checklist:', err);
      setError('Failed to create checklist. Please try again.');
      setLoading(false);
    }
  };

  // Calculate progress percentage
  const calculateProgress = (itemCount, completedCount) => {
    if (itemCount === 0) return 0;
    return Math.round((completedCount / itemCount) * 100);
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading && checklists.length === 0) {
    return (
      <div className="checklists-loading">
        <div className="spinner"></div>
        <p>Loading checklists...</p>
      </div>
    );
  }

  return (
    <div className="checklists-container">
      <div className="checklists-header">
        <h1>Packing Checklists</h1>
        <button 
          className="btn-primary create-checklist-btn"
          onClick={() => setShowModal(true)}
        >
          Create New Checklist
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {checklists.length === 0 ? (
        <div className="no-checklists">
          <p>You don't have any checklists yet. Create your first one to get started!</p>
        </div>
      ) : (
        <div className="checklists-grid">
          {checklists.map(checklist => (
            <Link 
              to={`/checklists/${checklist._id}`} 
              key={checklist._id}
              className="checklist-card"
            >
              <div className="checklist-header">
                <h3>{checklist.name}</h3>
                <span className="collaborator-count">{checklist.collaborators} collaborators</span>
              </div>
              <p className="checklist-description">{checklist.description}</p>
              <div className="checklist-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${calculateProgress(checklist.itemCount, checklist.completedCount)}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  {checklist.completedCount} of {checklist.itemCount} items complete
                </span>
              </div>
              <div className="checklist-footer">
                <span className="updated-at">Last updated: {formatDate(checklist.updatedAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {/* Create Checklist Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Checklist</h2>
            <form onSubmit={handleCreateChecklist}>
              <div className="form-group">
                <label htmlFor="name">Checklist Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newChecklist.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Office Supplies, Event Materials"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={newChecklist.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of this checklist"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Checklist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checklists;