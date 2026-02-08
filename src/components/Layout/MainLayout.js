import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import googleSheetsService from '../../services/googleSheetsService';
import GoogleSheetConnect from '../GoogleSheet/GoogleSheetConnect';
import Dashboard from '../Dashboard/Dashboard';
import ExpenseForm from '../ExpenseForm/ExpenseForm';
import Settings from '../Settings/Settings';
import History from '../History/History';
import Analytics from '../Analytics/Analytics';

const MainLayout = ({ onLogout }) => {
  const { currentUser, isAuthenticated, setIsAuthenticated, darkMode, toggleDarkMode } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthAndSheet = async () => {
      setIsCheckingAuth(true);
      
      try {
        // Initialize Google API client
        await googleSheetsService.initClient();
        
        // Check if we have a valid token in sessionStorage
        const authStatus = googleSheetsService.getAuthStatus();
        
        if (authStatus.isAuthenticated) {
          setIsAuthenticated(true);
          
          // If user has sheet ID, go to dashboard
          if (currentUser?.sheetId) {
            setActiveTab('dashboard');
          } else {
            // Has auth but no sheet - go to connect
            setActiveTab('connect');
          }
        } else {
          // No auth - go to connect
          setIsAuthenticated(false);
          setActiveTab('connect');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setActiveTab('connect');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthAndSheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch for changes in auth or sheet connection
  useEffect(() => {
    if (!isCheckingAuth) {
      if (!isAuthenticated || !currentUser?.sheetId) {
        setActiveTab('connect');
      } else if (activeTab === 'connect') {
        // If we're on connect page but now have auth + sheet, go to dashboard
        setActiveTab('dashboard');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentUser?.sheetId, isCheckingAuth]);

  const handleLogout = () => {
    // Sign out from Google (clears token from sessionStorage)
    googleSheetsService.signOut();
    setIsAuthenticated(false);
    onLogout();
  };

  if (!currentUser) {
    return null;
  }

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-gray-600">Checking authentication...</div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', show: currentUser.sheetId && isAuthenticated },
    { id: 'add', label: '➕ Add Expense', show: currentUser.sheetId && isAuthenticated },
    { id: 'history', label: '📜 History', show: currentUser.sheetId && isAuthenticated },
    { id: 'analytics', label: '📈 Analytics', show: currentUser.sheetId && isAuthenticated },
    { id: 'settings', label: '⚙️ Settings', show: true },
    { id: 'connect', label: '🔗 Connect Sheet', show: !currentUser.sheetId || !isAuthenticated },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'connect':
        return <GoogleSheetConnect onConnect={() => setActiveTab('dashboard')} />;
      case 'dashboard':
        return <Dashboard />;
      case 'add':
        return <ExpenseForm />;
      case 'settings':
        return <Settings />;
      case 'history':
        return <History />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">{currentUser.name}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isAuthenticated ? '🟢 Authenticated' : '🔴 Not Authenticated'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? (
                  <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="hidden md:block px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`bg-white dark:bg-gray-800 border-b dark:border-gray-700 md:block transition-colors duration-200 ${showMobileMenu ? 'block' : 'hidden'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:space-x-1 py-2">
            {tabs.filter(tab => tab.show).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowMobileMenu(false);
                }}
                className={`px-4 py-3 rounded-lg font-medium transition-colors text-left md:text-center ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="md:hidden px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium text-left"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Auth Warning */}
      {!isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 p-3 rounded-lg text-sm">
            <strong>⚠️ Not Authenticated:</strong> Please connect your Google Sheet to continue.
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {renderContent()}
      </main>

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>🔒 Your auth token persists during browser session. Close browser = Re-login (by design for security)</p>
      </footer>
    </div>
  );
};

export default MainLayout;
