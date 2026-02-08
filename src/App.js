import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import Auth from './components/Auth/Auth';
import MainLayout from './components/Layout/MainLayout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        {!isAuthenticated ? (
          <Auth onAuthenticate={() => setIsAuthenticated(true)} />
        ) : (
          <MainLayout onLogout={() => setIsAuthenticated(false)} />
        )}
      </div>
    </AppProvider>
  );
}

export default App;
