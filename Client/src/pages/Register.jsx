import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [connectionError, setConnectionError] = useState(false);
  const navigate = useNavigate();
  
  // Check backend status on component mount
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/status', { timeout: 5000 });
        console.log('Backend status:', response.data);
        setConnectionError(false);
      } catch (error) {
        console.error('Backend connection error:', error);
        setConnectionError(true);
      }
    };
    
    checkServerStatus();
  }, []);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };
  
  const validateForm = () => {
    // Name validation
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Password validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    // Terms agreement validation
    if (!formData.agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    // Validate form
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }
    
    // Current system info
    const registrationDate = new Date().toISOString();
    const username = formData.name.toLowerCase().replace(/\s+/g, '');
    
    // Check if we should use server or demo mode
    if (!connectionError) {
      try {
        // Call register API endpoint with timeout
        const response = await axios.post('http://127.0.0.1:5000/api/users/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password
        }, { timeout: 10000 });
        
        console.log('Registration successful:', response.data);
        
        // Store the token in localStorage
        localStorage.setItem('token', response.data.token);
        
        // Store user info
        localStorage.setItem('user', JSON.stringify({
          id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          isAdmin: response.data.isAdmin || false,
          registrationDate: registrationDate
        }));
        
        localStorage.setItem('isAuthenticated', 'true');
        
        // Show success message
        setSuccess('Account created successfully! Redirecting to dashboard...');
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } catch (err) {
        console.error('Registration error:', err);
        if (err.code === 'ECONNABORTED' || !err.response) {
          setConnectionError(true);
          setError('Server connection timed out. Try demo mode below.');
        } else {
          setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
        setIsLoading(false);
      }
    } else {
      // Create a mock registration with a delay to simulate API call
      setTimeout(() => {
        try {
          // Create mock user data
          const mockUser = {
            id: 'user_' + Date.now(),
            name: formData.name,
            email: formData.email,
            password: formData.password, // In a real app, never store plain passwords
            username: username,
            registrationDate: registrationDate,
            isAdmin: false
          };
          
          // Create mock token
          const mockToken = 'mock_token_' + Date.now();
          
          // Store in localStorage
          localStorage.setItem('token', mockToken);
          localStorage.setItem('user', JSON.stringify(mockUser));
          
          // IMPORTANT: Also store a mock users array for login functionality
          const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
          existingUsers.push({
            email: formData.email,
            password: formData.password,
            user: mockUser
          });
          localStorage.setItem('mockUsers', JSON.stringify(existingUsers));
          
          // Explicitly set authentication state
          localStorage.setItem('isAuthenticated', 'true');
          
          console.log('Registration successful with mock data:', mockUser);
          console.log('Authentication state set to:', localStorage.getItem('isAuthenticated'));
          
          // Show success message
          setSuccess('Account created successfully (DEMO MODE)! Redirecting to dashboard...');
          
          // Redirect to dashboard after short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } catch (err) {
          console.error('Mock registration error:', err);
          setError('Registration failed. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }, 1000); // Simulate network delay
    }
  };
  
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-content">
          <div className="login-header">
            <Link to="/" className="login-logo">
              <svg className="logo-icon" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="36" height="36" rx="8" fill="#2563EB"/>
                <path d="M9 18L18 9L27 18H23V27H13V18H9Z" fill="white"/>
              </svg>
              <span>Packpal</span>
            </Link>
            <h1>Create your account</h1>
            <p>Join Packpal to streamline your packaging operations</p>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              {success}
            </div>
          )}
          
          {connectionError && (
            <div className="warning-message">
              Server connection issue detected. Registration will work in demo mode.
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password (min. 8 characters)"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>
            
            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="agreeToTerms">
                  I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
                </label>
              </div>
            </div>
            
            <button 
              type="submit" 
              className={`login-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
            
            <div className="social-login">
              <div className="divider">
                <span>Or sign up with</span>
              </div>
              
              <div className="social-buttons">
                <button type="button" className="social-button google">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107"/>
                    <path d="M3.15295 7.3455L6.43845 9.755C7.32745 7.554 9.48045 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15895 2 4.82795 4.1685 3.15295 7.3455Z" fill="#FF3D00"/>
                    <path d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5718 17.5742 13.3038 18.001 12 18C9.39903 18 7.19053 16.3415 6.35853 14.027L3.09753 16.5395C4.75253 19.778 8.11353 22 12 22Z" fill="#4CAF50"/>
                    <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2"/>
                  </svg>
                  <span>Google</span>
                </button>
                
                <button type="button" className="social-button github">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12C0 17.31 3.435 21.795 8.205 23.385C8.805 23.49 9.03 23.13 9.03 22.815C9.03 22.53 9.015 21.585 9.015 20.58C6 21.135 5.22 19.845 4.98 19.17C4.845 18.825 4.26 17.76 3.75 17.475C3.33 17.25 2.73 16.695 3.735 16.68C4.68 16.665 5.355 17.55 5.58 17.91C6.66 19.725 8.385 19.215 9.075 18.9C9.18 18.12 9.495 17.595 9.84 17.295C7.17 16.995 4.38 15.96 4.38 11.37C4.38 10.065 4.845 8.985 5.61 8.145C5.49 7.845 5.07 6.615 5.73 4.965C5.73 4.965 6.735 4.65 9.03 6.195C9.99 5.925 11.01 5.79 12.03 5.79C13.05 5.79 14.07 5.925 15.03 6.195C17.325 4.635 18.33 4.965 18.33 4.965C18.99 6.615 18.57 7.845 18.45 8.145C19.215 8.985 19.68 10.05 19.68 11.37C19.68 15.975 16.875 16.995 14.205 17.295C14.64 17.67 15.015 18.39 15.015 19.515C15.015 21.12 15 22.41 15 22.815C15 23.13 15.225 23.505 15.825 23.385C18.2072 22.5807 20.2772 21.0497 21.7437 19.0074C23.2101 16.965 23.9993 14.5143 24 12C24 5.37 18.63 0 12 0Z" fill="currentColor"/>
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>
            </div>
          </form>
          
          <div className="signup-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
          
          <div className="footer-note">
            <small>© 2025 Packpal. All rights reserved.</small>
          </div>
        </div>
        
        <div className="login-image">
          <div className="image-overlay">
            <div className="testimonial">
              <p>"Since implementing Packpal, we've decreased our packaging waste by 42% and improved our customer satisfaction ratings."</p>
              <div className="testimonial-author">
                <div className="author-avatar"></div>
                <div className="author-info">
                  <h4>Michael Torres</h4>
                  <p>Operations Director, GreenShip</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;