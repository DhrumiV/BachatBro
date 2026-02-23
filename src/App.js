import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Auth from './components/Auth/Auth';
import MainLayout from './components/Layout/MainLayout';
import LandingPage from './components/Landing/LandingPage';
import OfflineBanner from './components/Common/OfflineBanner';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user exists and has valid auth token
    const currentUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('bachatbro_auth_token');
    const savedExpiry = localStorage.getItem('bachatbro_token_expiry');
    const savedSheetId = localStorage.getItem('bachatbro_sheet_id');
    
    if (currentUser && savedToken && savedExpiry && savedSheetId) {
      const expiryTime = parseInt(savedExpiry, 10);
      const now = Date.now();
      
      // Check if token is still valid (with 5 min buffer)
      if (expiryTime > now + 300000) {
        // Token is valid, skip sign-in
        setIsAuthenticated(true);
        console.log('✅ Auto-authenticated from localStorage');
      } else {
        // Token expired, clear it
        console.log('⚠️ Token expired, clearing auth');
        localStorage.removeItem('bachatbro_auth_token');
        localStorage.removeItem('bachatbro_token_expiry');
        setIsAuthenticated(false);
      }
    } else if (currentUser) {
      // User exists but no valid token
      setIsAuthenticated(true);
    }
  }, []);

  // Always apply dark mode class
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-dark-bg">
        <OfflineBanner />
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* App Routes */}
          <Route 
            path="/app" 
            element={
              !isAuthenticated ? (
                <Auth onAuthenticate={() => setIsAuthenticated(true)} />
              ) : (
                <MainLayout onLogout={() => setIsAuthenticated(false)} />
              )
            } 
          />
          
          {/* Redirect any unknown routes to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
