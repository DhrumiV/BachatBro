import React from 'react';
import { useApp } from '../../context/AppContext';
import googleSheetsService from '../../services/googleSheetsService';
import { Lock, LogOut } from 'lucide-react';
import { format } from 'date-fns';

const Profile = ({ onLogout }) => {
  const { currentUser, setIsAuthenticated } = useApp();

  const handleLockSession = () => {
    onLogout();
  };

  const handleFullLogout = () => {
    googleSheetsService.signOut();
    setIsAuthenticated(false);
    onLogout();
  };

  if (!currentUser) return null;

  // Get member since date
  const getMemberSince = () => {
    const createdAt = localStorage.getItem(`user_${currentUser.name}_createdAt`);
    if (createdAt) {
      try {
        return format(new Date(createdAt), 'MMMM yyyy');
      } catch (e) {
        return 'Recently';
      }
    }
    return 'Recently';
  };

  // Get email from user data or show username
  const getEmail = () => {
    if (currentUser.email) return currentUser.email;
    return `${currentUser.name.toLowerCase().replace(/\s+/g, '')}@bachatbro.local`;
  };

  // Check if sheet is connected
  const isSheetConnected = () => {
    return currentUser.sheetId && currentUser.sheetId.trim() !== '';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-8">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{currentUser.name}</h2>
          <p className="text-secondary-text">Personal Account</p>
        </div>

        {/* Info Rows */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-secondary-text">Email</span>
            <span className="text-white">{getEmail()}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-secondary-text">Account Type</span>
            <span className="text-white">Google Account</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-secondary-text">Member Since</span>
            <span className="text-white">{getMemberSince()}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-secondary-text">Sheet Connected</span>
            <span className={isSheetConnected() ? 'text-success' : 'text-danger'}>
              {isSheetConnected() ? 'Yes' : 'No'}
            </span>
          </div>
        </div>

        {/* Logout Options */}
        <div className="space-y-3">
          {/* Lock Session */}
          <button
            onClick={handleLockSession}
            className="w-full bg-card-bg hover:bg-input-bg text-white rounded-xl px-6 py-4 font-medium border border-white/10 hover:border-white/20 transition-all flex items-start space-x-4"
          >
            <Lock className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-left flex-1">
              <div className="font-semibold mb-1">Lock Session</div>
              <div className="text-xs text-secondary-text">Keep Google auth, return to login screen</div>
            </div>
          </button>

          {/* Sign Out */}
          <button
            onClick={handleFullLogout}
            className="w-full bg-[#1a0a0a] hover:bg-[#250a0a] text-danger rounded-xl px-6 py-4 font-medium border border-danger/20 hover:border-danger/40 transition-all flex items-start space-x-4"
          >
            <LogOut className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-left flex-1">
              <div className="font-semibold mb-1">Sign Out</div>
              <div className="text-xs text-danger/70">Clear everything, requires re-login</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
