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
  }, []);

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
      monthlyIncome: 0,
      budgets: {}
    };
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
