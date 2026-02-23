import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import googleSheetsService from '../../services/googleSheetsService';

const GoogleSheetConnect = ({ onConnect }) => {
  const { currentUser, saveUser, setIsAuthenticated, setError: setGlobalError } = useApp();
  const [sheetId, setSheetId] = useState(currentUser?.sheetId || '');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
  const [authStatus, setAuthStatus] = useState({ isAuthenticated: false, isInitialized: false });

  const initializeAuth = async () => {
    try {
      await googleSheetsService.initClient();
      const status = googleSheetsService.getAuthStatus();
      setAuthStatus(status);
      
      if (status.isAuthenticated) {
        setIsAuthenticated(true);
        showMessage('Already authenticated with Google', 'success');
        
        // If user already has sheet ID and is authenticated, auto-connect
        if (currentUser?.sheetId) {
          showMessage('✅ Sheet already connected! Redirecting...', 'success');
          setTimeout(() => {
            onConnect();
          }, 1500);
        }
      }
    } catch (error) {
      showMessage('Failed to initialize Google API: ' + error.message, 'error');
      setGlobalError(error.message);
    }
  };

  useEffect(() => {
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    setMessageType(type);
  };

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    showMessage('Opening Google login...', 'info');

    try {
      await googleSheetsService.requestAccessToken();
      setAuthStatus({ isAuthenticated: true, isInitialized: true });
      setIsAuthenticated(true);
      showMessage('✅ Successfully authenticated with Google', 'success');
    } catch (error) {
      showMessage('❌ Authentication failed: ' + error.message, 'error');
      setGlobalError(error.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleTestConnection = async () => {
    const trimmedSheetId = sheetId.trim();
    
    if (!trimmedSheetId) {
      showMessage('❌ Please enter a Sheet ID', 'error');
      return;
    }

    if (!authStatus.isAuthenticated) {
      showMessage('❌ Please authenticate with Google first', 'error');
      return;
    }

    setIsConnecting(true);
    showMessage('Testing connection...', 'info');

    try {
      // Validate and setup sheet (creates headers if needed)
      const result = await googleSheetsService.validateAndSetupSheet(trimmedSheetId);
      
      // Save sheet ID to user profile AND localStorage for PWA persistence
      saveUser({ ...currentUser, sheetId: trimmedSheetId });
      localStorage.setItem('bachatbro_sheet_id', trimmedSheetId);
      
      showMessage(`✅ ${result.message}`, 'success');
      
      // Wait a moment then navigate to dashboard
      setTimeout(() => {
        onConnect();
      }, 1500);
    } catch (error) {
      showMessage('❌ ' + error.message, 'error');
      setGlobalError(error.message);
      
      // If auth expired, update status
      if (error.message.includes('Authentication expired')) {
        setAuthStatus({ ...authStatus, isAuthenticated: false });
        setIsAuthenticated(false);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'Date,Month,Category,SubCategory,PaymentMethod,CardName,Amount,Type,Notes\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finance-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getMessageStyle = () => {
    switch (messageType) {
      case 'success':
        return 'bg-success/10 text-success border border-success/20';
      case 'error':
        return 'bg-danger/10 text-danger border border-danger/20';
      default:
        return 'bg-accent/10 text-accent border border-accent/20';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Connect Google Sheet</h2>

        {/* Step 1: Google Authentication */}
        <div className="mb-6 p-4 bg-accent/10 rounded-xl border border-accent/20">
          <h3 className="font-semibold text-white mb-2">Step 1: Authenticate with Google</h3>
          <p className="text-sm text-secondary-text mb-3">
            Sign in to grant access to your Google Sheets. Your token is stored in memory only for security.
          </p>
          {!authStatus.isAuthenticated ? (
            <button
              onClick={handleGoogleLogin}
              disabled={isAuthenticating || !authStatus.isInitialized}
              className="w-full md:w-auto px-6 py-3 bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium text-gray-800">
                {isAuthenticating ? 'Authenticating...' : 'Sign in with Google'}
              </span>
            </button>
          ) : (
            <div className="flex items-center space-x-2 text-success font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Authenticated with Google</span>
            </div>
          )}
        </div>

        {/* Step 2: Sheet ID */}
        {authStatus.isAuthenticated && (
          <div className="mb-6">
            <h3 className="font-semibold text-white mb-3">Step 2: Enter Google Sheet ID</h3>
            <div className="mb-3">
              <label className="block text-sm text-secondary-text mb-2">
                Sheet ID (from URL: docs.google.com/spreadsheets/d/<span className="font-mono text-accent">SHEET_ID</span>/edit)
              </label>
              <input
                type="text"
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
                placeholder="1AbC2dEfG3hIjK4lMnO5pQrS6tUvW7xYz"
                className="input-field w-full"
                disabled={isConnecting}
              />
            </div>
            <button
              onClick={handleTestConnection}
              disabled={isConnecting || !sheetId.trim()}
              className="btn-primary"
            >
              {isConnecting ? 'Connecting...' : 'Test Connection & Setup'}
            </button>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-xl mb-4 ${getMessageStyle()}`}>
            {message}
          </div>
        )}

        {/* Download Template */}
        <div className="mt-6 pt-6 border-t border-white/5">
          <h3 className="font-semibold text-white mb-2">Need a template?</h3>
          <button
            onClick={downloadTemplate}
            className="text-accent hover:text-accent/80 font-medium flex items-center space-x-1 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-white/5 rounded-xl text-sm text-secondary-text">
          <h4 className="font-semibold text-white mb-2">Setup Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li>Create a new Google Sheet</li>
            <li>Copy the Sheet ID from the URL</li>
            <li>Paste it above and click "Test Connection & Setup"</li>
            <li>Headers will be created automatically if sheet is empty</li>
            <li>Keep sheet sharing set to "Only Me" for security</li>
          </ol>
        </div>

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-xl text-sm text-success">
          <strong>🔒 Security:</strong> Your authentication token is stored locally for PWA functionality. 
          Token expires in 1 hour. Full persistent auth (refresh tokens) is planned in future updates.
        </div>
      </div>
    </div>
  );
};

export default GoogleSheetConnect;
