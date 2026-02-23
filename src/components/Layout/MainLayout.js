import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import googleSheetsService from '../../services/googleSheetsService';
import Sidebar from './Sidebar';
import GoogleSheetConnect from '../GoogleSheet/GoogleSheetConnect';
import Dashboard from '../Dashboard/Dashboard';
import ExpenseForm from '../ExpenseForm/ExpenseForm';
import Settings from '../Settings/Settings';
import History from '../History/History';
import Analytics from '../Analytics/Analytics';
import Profile from '../Profile/Profile';
import Categories from '../Categories/Categories';

const MainLayout = ({ onLogout }) => {
  const { currentUser, isAuthenticated, setIsAuthenticated } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkAuthAndSheet = async () => {
      setIsCheckingAuth(true);
      
      try {
        await googleSheetsService.initClient();
        const authStatus = googleSheetsService.getAuthStatus();
        
        if (authStatus.isAuthenticated) {
          setIsAuthenticated(true);
          if (currentUser?.sheetId) {
            setActiveTab('dashboard');
          } else {
            setActiveTab('connect');
          }
        } else {
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

  useEffect(() => {
    if (!isCheckingAuth) {
      if (!isAuthenticated || !currentUser?.sheetId) {
        setActiveTab('connect');
      } else if (activeTab === 'connect') {
        setActiveTab('dashboard');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentUser?.sheetId, isCheckingAuth]);

  if (!currentUser) {
    return null;
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
          <div className="text-secondary-text">Checking authentication...</div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'connect':
        return <GoogleSheetConnect onConnect={() => setActiveTab('dashboard')} />;
      case 'dashboard':
        return <Dashboard />;
      case 'add':
        return <ExpenseForm />;
      case 'transactions':
        return <History />;
      case 'categories':
        return <Categories />;
      case 'settings':
        return <Settings />;
      case 'analytics':
        return <Analytics />;
      case 'profile':
        return <Profile onLogout={onLogout} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
      />

      {/* Main Content */}
      <main className={`transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} pb-20 md:pb-0`}>
        {/* Top Bar */}
        <div className="bg-sidebar-bg border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:block p-2 hover:bg-white/5 rounded-xl transition-all"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Mobile Logo */}
          <div className="md:hidden">
            <div className="text-xl font-bold text-white">₹ BachatBro</div>
          </div>

          {/* Auth Status - only show if not on connect page */}
          {activeTab !== 'connect' && (
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-success' : 'bg-secondary-text'}`}></div>
              <span className="text-secondary-text text-sm hidden md:block">
                {isAuthenticated ? 'Connected' : 'Setup required'}
              </span>
            </div>
          )}
        </div>

        {/* Page Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
