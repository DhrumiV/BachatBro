import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Auth state in memory
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true); // Always dark mode by default

  useEffect(() => {
    // Load users from localStorage (structure only, NOT financial data)
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(storedUsers);

    // Load current user
    const currentUserName = localStorage.getItem('currentUser');
    if (currentUserName) {
      const user = storedUsers.find(u => u.name === currentUserName);
      setCurrentUser(user || null);
    }

    // Load theme preference - default to dark mode
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      setDarkMode(savedTheme === 'true');
    } else {
      setDarkMode(true); // Default to dark mode
      localStorage.setItem('darkMode', 'true');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  const saveUser = (userData) => {
    const updatedUsers = users.filter(u => u.name !== userData.name);
    updatedUsers.push(userData);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setCurrentUser(userData);
    localStorage.setItem('currentUser', userData.name);
  };

  const switchUser = (userName) => {
    const user = users.find(u => u.name === userName);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', userName);
      // Clear auth when switching users (security)
      setIsAuthenticated(false);
    }
  };

  const addUser = (userName) => {
    const newUser = {
      name: userName,
      sheetId: '',
      categories: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'],
      cards: ['Credit Card', 'Debit Card'],
      paymentMethods: ['Cash', 'UPI', 'Card', 'Net Banking'],
      types: ['Expense', 'EMI', 'Investment', 'Savings'],
      monthlyBudget: 0,
      categoryBudgets: {}
    };
    
    // Store creation timestamp
    const createdAt = new Date().toISOString();
    localStorage.setItem(`user_${userName}_createdAt`, createdAt);
    
    saveUser(newUser);
    return newUser;
  };

  const deleteUser = (userName) => {
    const updatedUsers = users.filter(u => u.name !== userName);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    if (currentUser?.name === userName) {
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      setIsAuthenticated(false);
    }
  };

  const clearError = () => setError(null);

  const value = {
    currentUser,
    users,
    isLoading,
    setIsLoading,
    isAuthenticated,
    setIsAuthenticated,
    error,
    setError,
    clearError,
    saveUser,
    switchUser,
    addUser,
    deleteUser,
    darkMode,
    toggleDarkMode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
