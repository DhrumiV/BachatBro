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

  useEffect(() => {
    // If not authenticated or no sheet, show connect screen
    if (!isAuthenticated || !currentUser?.sheetId) {
      setActiveTab('connect');
    }
  }, [isAuthenticated, currentUser?.sheetId]);

  const handleLogout = () => {
    // Sign out from Google (clears token from memory)
    googleSheetsService.signOut();
    setIsAuthenticated(false);
    onLogout();
  };

  if (!currentUser) {
    return null;
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
        <p>🔒 Your auth token is stored in memory only. Refresh = Re-login (by design for security)</p>
      </footer>
    </div>
  );
};

export default MainLayout;
