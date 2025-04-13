// src/components/home/HeroSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="container hero-container">
        <div className="hero-content">
          <h1>
            <span className="highlight">Smart</span> Packaging <br/>
            <span className="gradient-text">Solutions</span>
          </h1>
          <p className="hero-description">
            Streamline your packaging operations with AI-powered tools and analytics to optimize costs, reduce waste, and enhance sustainability.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-primary">Get Started Free</Link>
            <Link to="/demo" className="btn-outline">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 18.3333C14.6024 18.3333 18.3334 14.6024 18.3334 10C18.3334 5.39763 14.6024 1.66667 10 1.66667C5.39765 1.66667 1.66669 5.39763 1.66669 10C1.66669 14.6024 5.39765 18.3333 10 18.3333Z" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.33331 6.66667L13.3333 10L8.33331 13.3333V6.66667Z" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Watch Demo
            </Link>
          </div>
          
          <div className="trusted-by">
            <span>Trusted by:</span>
            <div className="company-logos">
              <div className="company-logo">Acme Inc</div>
              <div className="company-logo">TechCorp</div>
              <div className="company-logo">GlobalSolutions</div>
              <div className="company-logo">InnovateCo</div>
            </div>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="hero-image-wrapper">
            <div className="hero-image"></div>
            <div className="blob-shape"></div>
            <div className="dots-pattern"></div>
            
            <div className="floating-card card-1">
              <div className="card-icon">📦</div>
              <div className="card-content">
                <div className="card-title">Cost Savings</div>
                <div className="card-value">-37%</div>
              </div>
            </div>
            
            <div className="floating-card card-2">
              <div className="card-icon">🌱</div>
              <div className="card-content">
                <div className="card-title">Sustainability</div>
                <div className="card-value">+42%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="wave-shape">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L48 110C96 100 192 80 288 75C384 70 480 80 576 80C672 80 768 70 864 65C960 60 1056 60 1152 70C1248 80 1344 100 1392 110L1440 120V0H1392C1344 0 1248 0 1152 0C1056 0 960 0 864 0C768 0 672 0 576 0C480 0 384 0 288 0C192 0 96 0 48 0H0V120Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;