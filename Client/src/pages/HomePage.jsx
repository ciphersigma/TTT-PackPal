// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

// You might need to create these dashboard components
import DashboardStats from '../components/dashboard/DashboardStats';
import RecentActivity from '../components/dashboard/RecentActivity';
import PackagingMetrics from '../components/dashboard/PackagingMetrics';
import SustainabilityChart from '../components/dashboard/SustainabilityChart';

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch user data on component mount
  useEffect(() => {
    // Get user from storage
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="homepage">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.name || 'User'}</h1>
          <p className="subtitle">Here's an overview of your packaging operations</p>
        </div>
        <div className="actions">
          <button className="btn-secondary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Add Package
          </button>
          <button className="btn-primary">Generate Report</button>
        </div>
      </div>

      {/* Dashboard Stats Row */}
      <div className="dashboard-stats">
        <DashboardStats />
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="card">
            <div className="card-header">
              <h2>Packaging Efficiency</h2>
              <div className="time-filter">
                <button className="active">Weekly</button>
                <button>Monthly</button>
                <button>Yearly</button>
              </div>
            </div>
            <div className="card-body">
              <PackagingMetrics />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Sustainability Impact</h2>
              <button className="btn-text">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Details
              </button>
            </div>
            <div className="card-body">
              <SustainabilityChart />
            </div>
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="card">
            <div className="card-header">
              <h2>Recent Activity</h2>
              <Link to="/activity" className="btn-text">View All</Link>
            </div>
            <div className="card-body">
              <RecentActivity />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="card-body">
              <div className="quick-actions">
                <Link to="/new-package" className="quick-action-item">
                  <div className="quick-action-icon package-icon"></div>
                  <span>New Package</span>
                </Link>
                <Link to="/shipping" className="quick-action-item">
                  <div className="quick-action-icon shipping-icon"></div>
                  <span>Shipping</span>
                </Link>
                <Link to="/analytics" className="quick-action-item">
                  <div className="quick-action-icon analytics-icon"></div>
                  <span>Analytics</span>
                </Link>
                <Link to="/settings" className="quick-action-item">
                  <div className="quick-action-icon settings-icon"></div>
                  <span>Settings</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="card sustainability-tips">
            <div className="card-header">
              <h2>Sustainability Tips</h2>
            </div>
            <div className="card-body">
              <div className="tip">
                <div className="tip-icon"></div>
                <div className="tip-content">
                  <h3>Reduce Void Fill</h3>
                  <p>Optimize your box sizes to reduce the need for void fill materials by up to 40%.</p>
                </div>
              </div>
              <div className="tip">
                <div className="tip-icon"></div>
                <div className="tip-content">
                  <h3>Eco-friendly Materials</h3>
                  <p>Switch to recycled cardboard to reduce your carbon footprint.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Shipments Section */}
      <div className="upcoming-shipments">
        <div className="section-header">
          <h2>Upcoming Shipments</h2>
          <Link to="/shipments" className="btn-text">View All Shipments</Link>
        </div>
        <div className="shipments-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Package Type</th>
                <th>Status</th>
                <th>Shipping Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#PAK-2023-001</td>
                <td>Acme Corp</td>
                <td>Standard Box (12x10x8)</td>
                <td><span className="status pending">Pending</span></td>
                <td>Nov 15, 2023</td>
                <td>
                  <button className="btn-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4V11H11V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20 4H13V11H20V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20 13H13V20H20V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M11 13H4V20H11V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className="btn-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </td>
              </tr>
              <tr>
                <td>#PAK-2023-002</td>
                <td>TechCorp Inc</td>
                <td>Large Box (18x14x12)</td>
                <td><span className="status approved">Approved</span></td>
                <td>Nov 16, 2023</td>
                <td>
                  <button className="btn-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4V11H11V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20 4H13V11H20V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20 13H13V20H20V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M11 13H4V20H11V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className="btn-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </td>
              </tr>
              <tr>
                <td>#PAK-2023-003</td>
                <td>Global Merchants</td>
                <td>Custom Package</td>
                <td><span className="status processing">Processing</span></td>
                <td>Nov 17, 2023</td>
                <td>
                  <button className="btn-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4V11H11V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20 4H13V11H20V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20 13H13V20H20V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M11 13H4V20H11V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className="btn-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HomePage;