import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import googleSheetsService from '../../services/googleSheetsService';
import { format } from 'date-fns';

const History = () => {
  const { currentUser, isAuthenticated, setIsAuthenticated, setError: setGlobalError } = useApp();
  
  // LOCAL STATE - Fetched from Google Sheets ONLY
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filters, setFilters] = useState({
    month: '',
    category: '',
    paymentMethod: '',
  });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch transactions from Google Sheets on mount
  useEffect(() => {
    if (currentUser?.sheetId && isAuthenticated) {
      loadTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.sheetId, isAuthenticated]);

  // Apply filters whenever transactions or filters change
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, filters]);

  const loadTransactions = async () => {
    if (!currentUser?.sheetId) {
      setError('No sheet connected');
      return;
    }

    if (!isAuthenticated) {
      setError('Not authenticated. Please sign in with Google.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // FETCH FROM GOOGLE SHEETS - Single source of truth
      const data = await googleSheetsService.getTransactions(currentUser.sheetId);
      setTransactions(data);
    } catch (err) {
      setError(err.message);
      setGlobalError(err.message);
      
      // If auth expired, update status
      if (err.message.includes('Authentication expired')) {
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filters.month) {
      filtered = filtered.filter(t => t.month === filters.month);
    }
    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }
    if (filters.paymentMethod) {
      filtered = filtered.filter(t => t.paymentMethod === filters.paymentMethod);
    }

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    setFilteredTransactions(filtered);
  };

  const handleDelete = async (transaction) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // DELETE FROM GOOGLE SHEETS
      await googleSheetsService.deleteTransaction(currentUser.sheetId, transaction.rowIndex);
      
      // RE-FETCH from Google Sheets to get updated data
      await loadTransactions();
      
      alert('✅ Transaction deleted from Google Sheets');
    } catch (err) {
      setError(err.message);
      alert('❌ Failed to delete: ' + err.message);
      
      if (err.message.includes('Authentication expired')) {
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction({ ...transaction });
  };

  const handleSaveEdit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Auto-calculate month from date
      const date = new Date(editingTransaction.date);
      const month = format(date, 'yyyy-MM');
      editingTransaction.month = month;

      // UPDATE IN GOOGLE SHEETS
      await googleSheetsService.updateTransaction(
        currentUser.sheetId,
        editingTransaction.rowIndex,
        editingTransaction
      );
      
      // RE-FETCH from Google Sheets to get updated data
      await loadTransactions();
      
      setEditingTransaction(null);
      alert('✅ Transaction updated in Google Sheets');
    } catch (err) {
      setError(err.message);
      alert('❌ Failed to update: ' + err.message);
      
      if (err.message.includes('Authentication expired')) {
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const uniqueMonths = [...new Set(transactions.map(t => t.month))].sort().reverse();

  // Auth check
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">Please authenticate with Google to view history</div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
        >
          Go to Connect Sheet
        </button>
      </div>
    );
  }

  if (!currentUser?.sheetId) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">No sheet connected. Please connect a Google Sheet first.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={loadTransactions}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
          title="Refresh data from Google Sheets"
        >
          {isLoading ? '⏳ Loading...' : '🔄 Refresh from Sheet'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          <strong>Error:</strong> {error}
          <button
            onClick={loadTransactions}
            className="ml-4 text-red-600 hover:text-red-700 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <div className="text-gray-500 mt-4">Loading from Google Sheets...</div>
        </div>
      )}

      {/* Filters */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <select
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Months</option>
              {uniqueMonths.map(month => (
                <option key={month} value={month}>
                  {format(new Date(month + '-01'), 'MMMM yyyy')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {currentUser.categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Methods</option>
              {currentUser.paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
        </div>
        </div>
      )}

      {/* Transactions Table */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Transactions ({filteredTransactions.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.rowIndex} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{transaction.date}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{transaction.category}</div>
                    {transaction.subCategory && (
                      <div className="text-sm text-gray-500">{transaction.subCategory}</div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      transaction.type === 'Expense' ? 'bg-red-100 text-red-800' :
                      transaction.type === 'EMI' ? 'bg-orange-100 text-orange-800' :
                      transaction.type === 'Investment' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">₹{transaction.amount.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    {transaction.paymentMethod}
                    {transaction.cardName && ` - ${transaction.cardName}`}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(transaction)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No transactions found
            </div>
          )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Transaction</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={editingTransaction.date}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, date: e.target.value })}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={editingTransaction.category}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, category: e.target.value })}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  {currentUser.categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  value={editingTransaction.amount}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, amount: parseFloat(e.target.value) })}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <button
                  onClick={handleSaveEdit}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg font-medium"
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditingTransaction(null)}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
