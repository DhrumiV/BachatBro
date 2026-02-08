import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Auth from './components/Auth/Auth';
import MainLayout from './components/Layout/MainLayout';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { darkMode } = useApp();

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {!isAuthenticated ? (
        <Auth onAuthenticate={() => setIsAuthenticated(true)} />
      ) : (
        <MainLayout onLogout={() => setIsAuthenticated(false)} />
      )}
    </div>
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
