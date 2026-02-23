import React from 'react';
import { LayoutDashboard, ArrowLeftRight, Plus, Tag, Settings } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, currentUser, isAuthenticated }) => {

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, show: currentUser?.sheetId && isAuthenticated },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight, show: currentUser?.sheetId && isAuthenticated },
    { id: 'add', label: 'Add Transaction', icon: Plus, show: currentUser?.sheetId && isAuthenticated },
    { id: 'categories', label: 'Categories', icon: Tag, show: currentUser?.sheetId && isAuthenticated },
    { id: 'settings', label: 'Settings', icon: Settings, show: true },
    { id: 'connect', label: 'Connect Sheet', icon: Settings, show: !currentUser?.sheetId || !isAuthenticated },
  ];

  const visibleItems = navItems.filter(item => item.show);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex flex-col bg-sidebar-bg border-r border-white/5 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } fixed left-0 top-0 h-screen z-40`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          {!isCollapsed && (
            <>
              <div className="text-2xl font-bold text-white mb-1">₹ BachatBro</div>
              <div className="text-sm text-secondary-text">Personal Finance</div>
            </>
          )}
          {isCollapsed && (
            <div className="text-2xl font-bold text-white text-center">₹</div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={activeTab === item.id ? 'sidebar-item-active w-full' : 'sidebar-item w-full'}
                title={isCollapsed ? item.label : ''}
              >
                <Icon className="w-5 h-5" />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        {currentUser && (
          <div className="p-4 border-t border-white/5">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full ${
                activeTab === 'profile' 
                  ? 'bg-accent/20 border-accent' 
                  : 'bg-card-bg border-white/10 hover:border-white/20'
              } border rounded-xl p-3 transition-all`}
            >
              {!isCollapsed ? (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-white font-medium text-sm truncate">{currentUser.name}</div>
                    <div className="text-secondary-text text-xs truncate">
                      {currentUser.email || 'Personal Account'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold mx-auto">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar-bg border-t border-white/5 z-50">
        <div className="flex justify-around items-center py-2">
          {visibleItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all ${
                  activeTab === item.id 
                    ? 'text-accent' 
                    : 'text-secondary-text'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
