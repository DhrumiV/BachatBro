import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const Auth = ({ onAuthenticate }) => {
  const { users, addUser, switchUser } = useApp();
  const [showNewUser, setShowNewUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');

  useEffect(() => {
    if (users.length === 0) {
      setShowNewUser(true);
    }
  }, [users]);

  const handleSelectUser = (userName) => {
    switchUser(userName);
    onAuthenticate();
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (newUserName.trim()) {
      addUser(newUserName.trim());
      setNewUserName('');
      setShowNewUser(false);
      onAuthenticate();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">💰 Finance Dashboard</h1>
          <p className="text-gray-600">Manage your personal finances</p>
        </div>

        {!showNewUser && users.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Select User</h2>
            <div className="space-y-3">
              {users.map((user) => (
                <button
                  key={user.name}
                  onClick={() => handleSelectUser(user.name)}
                  className="w-full p-4 bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-500 rounded-lg transition-all duration-200 text-left"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-lg font-medium text-gray-800">{user.name}</span>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowNewUser(true)}
              className="w-full mt-4 p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
            >
              + Add New User
            </button>
          </div>
        ) : (
          <form onSubmit={handleAddUser}>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              {users.length === 0 ? 'Create First User' : 'Add New User'}
            </h2>
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none mb-4"
              autoFocus
            />
            <button
              type="submit"
              className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Continue
            </button>
            {users.length > 0 && (
              <button
                type="button"
                onClick={() => setShowNewUser(false)}
                className="w-full mt-3 p-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Back
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
