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
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">₹ BachatBro</h1>
          <p className="text-secondary-text">Personal Finance Manager</p>
        </div>

        {!showNewUser && users.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-white">Select User</h2>
            <div className="space-y-3">
              {users.map((user) => (
                <button
                  key={user.name}
                  onClick={() => handleSelectUser(user.name)}
                  className="w-full p-4 bg-input-bg hover:bg-white/10 border border-white/10 hover:border-accent rounded-xl transition-all text-left"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-lg font-medium text-white">{user.name}</span>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowNewUser(true)}
              className="w-full mt-4 p-3 bg-card-bg hover:bg-input-bg text-white rounded-xl font-medium border border-white/10 transition-all"
            >
              Add New User
            </button>
          </div>
        ) : (
          <form onSubmit={handleAddUser}>
            <h2 className="text-xl font-semibold mb-4 text-white">
              {users.length === 0 ? 'Create First User' : 'Add New User'}
            </h2>
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="Enter your name"
              className="input-field w-full mb-4"
              autoFocus
            />
            <button
              type="submit"
              className="btn-primary w-full"
            >
              Continue
            </button>
            {users.length > 0 && (
              <button
                type="button"
                onClick={() => setShowNewUser(false)}
                className="btn-secondary w-full mt-3"
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
