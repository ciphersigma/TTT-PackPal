import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on a dashboard page
  const isDashboardPage = location.pathname.includes('/dashboard') || 
                         location.pathname.includes('/admin') ||
                         location.pathname.includes('/settings');
  
  // Check authentication status and get user data on component mount
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
  
  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleLogout = () => {
    // Clear all auth data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    
    // Update state
    setIsAuthenticated(false);
    setUser(null);
    
    // Redirect to home page
    navigate('/');
    
    // Close mobile menu if open
    setIsMenuOpen(false);
  };

  // Inline styles for the component
  const styles = {
    header: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
      boxShadow: scrolled ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
      zIndex: 1000,
      transition: 'all 0.3s ease',
      backdropFilter: scrolled ? 'blur(10px)' : 'none',
    },
    headerContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      color: '#111827',
    },
    logoSpan: {
      marginLeft: '0.5rem',
      fontSize: '1.25rem',
      fontWeight: '600',
    },
    mobileToggle: {
      display: 'none',
      flexDirection: 'column',
      justifyContent: 'space-around',
      width: '30px',
      height: '21px',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      zIndex: 10,
      '@media (max-width: 768px)': {
        display: 'flex',
      }
    },
    mobileToggleSpan: {
      width: '30px',
      height: '3px',
      background: '#111827',
      borderRadius: '10px',
      transition: 'all 0.3s linear',
      transformOrigin: '1px',
    },
    navMenu: {
      display: 'flex',
      alignItems: 'center',
      '@media (max-width: 768px)': {
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        width: '100%',
        maxWidth: '300px',
        padding: '3rem 2rem',
        backgroundColor: 'white',
        transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out',
        boxShadow: '-4px 0 10px rgba(0, 0, 0, 0.1)',
        zIndex: 5,
        alignItems: 'flex-start',
      }
    },
    navLink: {
      margin: '0 1rem',
      color: '#4b5563',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'color 0.2s',
      ':hover': {
        color: '#111827',
      },
      '@media (max-width: 768px)': {
        margin: '1rem 0',
      }
    },
    navButtons: {
      display: 'flex',
      alignItems: 'center',
      marginLeft: '1rem',
      '@media (max-width: 768px)': {
        flexDirection: 'column',
        alignItems: 'flex-start',
        margin: '1rem 0',
        width: '100%',
      }
    },
    btnSecondary: {
      padding: '0.5rem 1rem',
      backgroundColor: 'transparent',
      color: '#2563eb',
      border: '1px solid #2563eb',
      borderRadius: '6px',
      fontWeight: '500',
      textDecoration: 'none',
      transition: 'all 0.2s',
      marginRight: '0.5rem',
      cursor: 'pointer',
      ':hover': {
        backgroundColor: '#dbeafe',
      },
      '@media (max-width: 768px)': {
        marginBottom: '1rem',
        width: '100%',
        textAlign: 'center',
      }
    },
    btnPrimary: {
      padding: '0.5rem 1rem',
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontWeight: '500',
      textDecoration: 'none',
      transition: 'all 0.2s',
      cursor: 'pointer',
      ':hover': {
        backgroundColor: '#1d4ed8',
      },
      '@media (max-width: 768px)': {
        width: '100%',
        textAlign: 'center',
      }
    },
    navUserSection: {
      display: 'flex',
      alignItems: 'center',
      marginLeft: 'auto',
      paddingLeft: '1rem',
      borderLeft: '1px solid #e5e7eb',
      '@media (max-width: 768px)': {
        flexDirection: 'column',
        alignItems: 'flex-start',
        borderLeft: 'none',
        borderTop: '1px solid #e5e7eb',
        paddingLeft: 0,
        paddingTop: '1rem',
        marginTop: '1rem',
        width: '100%',
      }
    },
    userProfile: {
      display: 'flex',
      flexDirection: 'column',
      marginRight: '1rem',
      textAlign: 'right',
      '@media (max-width: 768px)': {
        marginRight: 0,
        marginBottom: '1rem',
        textAlign: 'left',
      }
    },
    userName: {
      fontWeight: 600,
      color: '#111827',
      fontSize: '0.875rem',
    },
    userLogin: {
      color: '#6b7280',
      fontSize: '0.75rem',
    },
    adminLink: {
      backgroundColor: '#fef3c7',
      color: '#92400e',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.75rem',
      textDecoration: 'none',
      marginRight: '1rem',
      fontWeight: 500,
      '@media (max-width: 768px)': {
        marginBottom: '1rem',
      }
    },
    logoutBtn: {
      whiteSpace: 'nowrap',
      '@media (max-width: 768px)': {
        width: '100%',
      }
    }
  };

  return (
    <header style={{
      ...styles.header,
      backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
      boxShadow: scrolled ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
      backdropFilter: scrolled ? 'blur(10px)' : 'none',
    }}>
      <div style={styles.headerContainer}>
        <div style={styles.logo}>
          <Link to={isAuthenticated ? '/dashboard' : '/'} style={styles.logo}>
            <svg className="logo-icon" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="8" fill="#2563EB"/>
              <path d="M9 18L18 9L27 18H23V27H13V18H9Z" fill="white"/>
            </svg>
            <span style={styles.logoSpan}>Packpal</span>
          </Link>
        </div>
        
        <div 
          onClick={toggleMenu}
          style={{
            ...styles.mobileToggle,
            display: window.innerWidth <= 768 ? 'flex' : 'none'
          }}
        >
          <span style={{
            ...styles.mobileToggleSpan,
            transform: isMenuOpen ? 'rotate(45deg)' : 'rotate(0)'
          }}></span>
          <span style={{
            ...styles.mobileToggleSpan,
            opacity: isMenuOpen ? 0 : 1,
            transform: isMenuOpen ? 'translateX(20px)' : 'translateX(0)'
          }}></span>
          <span style={{
            ...styles.mobileToggleSpan,
            transform: isMenuOpen ? 'rotate(-45deg)' : 'rotate(0)'
          }}></span>
        </div>
        
        <nav style={{
          ...styles.navMenu,
          transform: isMenuOpen || window.innerWidth > 768 ? 'translateX(0)' : 'translateX(100%)'
        }}>
          {/* Different navigation options based on authentication status */}
          {isAuthenticated ? (
            // Logged in user navigation
            <>
              {/* Show these links on all pages */}
              <Link to="/dashboard" style={styles.navLink} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              
              {/* Only show these links if we're already on a dashboard page */}
              {isDashboardPage && (
                <>
                  <Link to="/analytics" style={styles.navLink} onClick={() => setIsMenuOpen(false)}>Analytics</Link>
                  <Link to="/shipments" style={styles.navLink} onClick={() => setIsMenuOpen(false)}>Shipments</Link>
                  <Link to="/settings" style={styles.navLink} onClick={() => setIsMenuOpen(false)}>Settings</Link>
  </>
              )}
              
              {/* Show these links on non-dashboard pages */}
              {!isDashboardPage && (
                <>
                  <Link to="/features" style={styles.navLink} onClick={() => setIsMenuOpen(false)}>Features</Link>
                  <Link to="/pricing" style={styles.navLink} onClick={() => setIsMenuOpen(false)}>Pricing</Link>
                  <Link to="/contact" style={styles.navLink} onClick={() => setIsMenuOpen(false)}>Contact</Link>
                </>
              )}
              
              {/* User menu and logout */}
              <div style={styles.navUserSection}>
                <div style={styles.userProfile}>
                  <span style={styles.userName}>{user?.name || 'User'}</span>
                  <span style={styles.userLogin}>@{user?.username || 'ciphersigma'}</span>
                </div>
                {user?.isAdmin && (
                  <Link to="/admin" style={styles.adminLink} onClick={() => setIsMenuOpen(false)}>Admin</Link>
                )}
                <button 
                  onClick={handleLogout} 
                  style={{...styles.btnSecondary, ...styles.logoutBtn}}
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            // Non-authenticated navigation
            <>
              <Link to="/features" style={styles.navLink} onClick={() => setIsMenuOpen(false)}>Features</Link>
              <Link to="/about" style={styles.navLink} onClick={() => setIsMenuOpen(false)}>About</Link>
              <Link to="/pricing" style={styles.navLink} onClick={() => setIsMenuOpen(false)}>Pricing</Link>
              <Link to="/contact" style={styles.navLink} onClick={() => setIsMenuOpen(false)}>Contact</Link>
              <div style={styles.navButtons}>
                <Link to="/login" style={styles.btnSecondary} onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                <Link to="/register" style={styles.btnPrimary} onClick={() => setIsMenuOpen(false)}>Get Started</Link>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;