import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { WebSocketProvider } from './context/WebSocketContext';

// Layout Components
import Layout from './components/common/Layout';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import FeaturesPage from './pages/FeaturesPage';
import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserSetup from './pages/AdminUserSetup';
import Settings from '../src/pages/Settings';

// New Pages (will need to be created)
import Checklists from './pages/Checklists';
import ChecklistDetail from './pages/ChecklistDetail';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      const authFlag = localStorage.getItem('isAuthenticated');
      
      if ((token && userData) || authFlag === 'true') {
        setIsAuthenticated(true);
        if (userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (err) {
            console.error('Error parsing user data:', err);
          }
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };
    
    checkAuth();
    
    // Listen for storage events (when localStorage changes in other tabs)
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);
  
  // Enhanced protected route component with role-based access
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    console.log('Protected route check - isAuthenticated:', isAuthenticated);
    
    // Basic authentication check
    if (!localStorage.getItem('token')) {
      return <Navigate to="/login" />;
    }
    
    // Role-based access control
    if (allowedRoles.length > 0) {
      const userData = localStorage.getItem('user');
      let userRole = 'member'; // Default role
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          // Use existing 'isAdmin' field or new 'role' field if available
          if (parsedUser.isAdmin === true) {
            userRole = 'admin';
          } else if (parsedUser.role) {
            userRole = parsedUser.role;
          }
          
          // If user role is not in allowed roles, redirect to dashboard
          if (!allowedRoles.includes(userRole)) {
            console.log(`Access denied: Role ${userRole} not in allowed roles:`, allowedRoles);
            return <Navigate to="/dashboard" />;
          }
        } catch (err) {
          console.error('Error parsing user data for role check:', err);
          return <Navigate to="/dashboard" />;
        }
      }
    }
    
    return children;
  };

  // Admin route component (for backward compatibility)
  const AdminRoute = ({ children }) => {
    const userData = localStorage.getItem('user');
    let isAdmin = false;
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        // Check both isAdmin flag and role field
        isAdmin = parsedUser?.isAdmin === true || parsedUser?.role === 'admin' || parsedUser?.role === 'owner';
      } catch (err) {
        console.error('Error parsing user data for admin check:', err);
      }
    }
    
    if (!isAuthenticated || !isAdmin) {
      return <Navigate to="/dashboard" />;
    }
    return children;
  };

  return (
    <WebSocketProvider>
      <Router>
        <Routes>
          {/* Public routes with header and footer */}
          <Route path="/" element={
            <Layout>
              <Landing />
            </Layout>
          } />
          <Route path="/features" element={
            <Layout>
              <FeaturesPage />
            </Layout>
          } />
          <Route path="/about" element={
            <Layout>
              <AboutPage />
            </Layout>
          } />
          <Route path="/pricing" element={
            <Layout>
              <PricingPage />
            </Layout>
          } />
          <Route path="/contact" element={
            <Layout>
              <ContactPage />
            </Layout>
          } />
          
          {/* Authentication routes without layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-setup" element={<AdminUserSetup />} />
          
          {/* Protected routes with layout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Admin routes with role-based access */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['owner', 'admin']}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* New checklist routes */}
          <Route path="/checklists" element={
            <ProtectedRoute>
              <Layout>
                <Checklists />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/checklists/:id" element={
            <ProtectedRoute>
              <Layout>
                <ChecklistDetail />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Additional protected routes */}
          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={['owner', 'admin', 'member']}>
              <Layout>
                <div>Analytics Page</div>
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/shipments" element={
            <ProtectedRoute>
              <Layout>
                <div>Shipments Page</div>
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="./Settings" element={
            <ProtectedRoute allowedRoles={['owner', 'admin']}>
              <Layout>
                <div>Settings Page</div>
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Catch all route - redirect to landing page */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </WebSocketProvider>
  );
}

export default App;