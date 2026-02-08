// Utility functions for the Finance Dashboard

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getMonthName = (monthString) => {
  const date = new Date(monthString + '-01');
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
  });
};

export const downloadCSV = (data, filename) => {
  const csv = data.map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const validateSheetId = (sheetId) => {
  // Google Sheet ID is typically 44 characters long
  const regex = /^[a-zA-Z0-9-_]{40,50}$/;
  return regex.test(sheetId);
};

export const getTypeColor = (type) => {
  const colors = {
    Expense: 'bg-red-100 text-red-800',
    EMI: 'bg-orange-100 text-orange-800',
    Investment: 'bg-purple-100 text-purple-800',
    Savings: 'bg-green-100 text-green-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(1);
};
