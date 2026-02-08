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
  const { currentUser, isAuthenticated, setIsAuthenticated } = useApp();
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">{currentUser.name}</h2>
                <p className="text-xs text-gray-500">
                  {isAuthenticated ? '🟢 Authenticated' : '🔴 Not Authenticated'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </header>

      {/* Navigation */}
      <nav className={`bg-white border-b md:block ${showMobileMenu ? 'block' : 'hidden'}`}>
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
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="md:hidden px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium text-left"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Auth Warning */}
      {!isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg text-sm">
            <strong>⚠️ Not Authenticated:</strong> Please connect your Google Sheet to continue.
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {renderContent()}
      </main>

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
        <p>🔒 Your auth token persists during browser session. Close browser = Re-login (by design for security)</p>
      </footer>
    </div>
  );
};

export default MainLayout;
