import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import googleSheetsService from '../../services/googleSheetsService';
import { format } from 'date-fns';

const History = () => {
  const { currentUser, isAuthenticated, setIsAuthenticated, setError: setGlobalError } = useApp();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    paymentMethod: '',
    type: '',
  });
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [dataFromCache, setDataFromCache] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [lastSynced, setLastSynced] = useState(null);

  useEffect(() => {
    if (currentUser?.sheetId && isAuthenticated) {
      loadTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.sheetId, isAuthenticated]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, filters, sortField, sortDirection]);

  const loadTransactions = async () => {
    if (!currentUser?.sheetId || !isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await googleSheetsService.getTransactions(currentUser.sheetId);
      
      // Handle new response format with cache info
      if (data.transactions) {
        setTransactions(data.transactions);
        setDataFromCache(data.fromCache || false);
        setLastSynced(data.lastSynced || null);
      } else {
        // Fallback for old format (array directly)
        setTransactions(data);
        setDataFromCache(false);
      }
    } catch (err) {
      setError(err.message);
      setGlobalError(err.message);
      if (err.message.includes('Authentication expired')) {
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }
    if (filters.paymentMethod) {
      filtered = filtered.filter(t => t.paymentMethod === filters.paymentMethod);
    }
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (sortField === 'amount') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredTransactions(filtered);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleDelete = async (transaction) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;

    setIsLoading(true);
    try {
      await googleSheetsService.deleteTransaction(currentUser.sheetId, transaction.rowIndex);
      await loadTransactions();
      alert('✅ Transaction deleted');
    } catch (err) {
      alert('❌ Failed to delete: ' + err.message);
      if (err.message.includes('Authentication expired')) {
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    setIsLoading(true);
    try {
      const date = new Date(editingTransaction.date);
      editingTransaction.month = format(date, 'yyyy-MM');

      await googleSheetsService.updateTransaction(
        currentUser.sheetId,
        editingTransaction.rowIndex,
        editingTransaction
      );
      
      await loadTransactions();
      setEditingTransaction(null);
      alert('✅ Transaction updated');
    } catch (err) {
      alert('❌ Failed to update: ' + err.message);
      if (err.message.includes('Authentication expired')) {
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (!isAuthenticated || !currentUser?.sheetId) {
    return (
      <div className="text-center py-12">
        <div className="text-secondary-text">Please connect your Google Sheet to view transactions</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Transactions</h1>
        <p className="text-secondary-text">View and manage all your transactions</p>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="input-field"
          >
            <option value="">All Categories</option>
            {currentUser.categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filters.paymentMethod}
            onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
            className="input-field"
          >
            <option value="">All Methods</option>
            {currentUser.paymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="input-field"
          >
            <option value="">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
            <option value="EMI">EMI</option>
            <option value="Investment">Investment</option>
            <option value="Savings">Savings</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Transactions Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                <th 
                  className="text-left py-4 px-4 font-semibold text-secondary-text cursor-pointer hover:text-white"
                  onClick={() => handleSort('date')}
                >
                  Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left py-4 px-4 font-semibold text-secondary-text">Description</th>
                <th className="text-left py-4 px-4 font-semibold text-secondary-text">Category</th>
                <th className="text-left py-4 px-4 font-semibold text-secondary-text">Payment</th>
                <th className="text-left py-4 px-4 font-semibold text-secondary-text">Type</th>
                <th 
                  className="text-right py-4 px-4 font-semibold text-secondary-text cursor-pointer hover:text-white"
                  onClick={() => handleSort('amount')}
                >
                  Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-right py-4 px-4 font-semibold text-secondary-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => {
                const isIncome = transaction.type === 'Income';
                return (
                  <tr key={transaction.rowIndex} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-4 px-4 text-white text-sm">{transaction.date}</td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">{transaction.notes || transaction.category}</div>
                      {transaction.subCategory && (
                        <div className="text-xs text-secondary-text">{transaction.subCategory}</div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-white">{transaction.category}</td>
                    <td className="py-4 px-4 text-secondary-text text-sm">
                      {transaction.paymentMethod}
                      {transaction.cardName && ` - ${transaction.cardName}`}
                    </td>
                    <td className="py-4 px-4">
                      <span className={isIncome ? 'badge-income' : 'badge-expense'}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className={`py-4 px-4 text-right font-semibold ${isIncome ? 'text-success' : 'text-danger'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setEditingTransaction({ ...transaction })}
                        className="text-accent hover:text-accent/80 mr-3 text-sm"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(transaction)}
                        className="text-danger hover:text-danger/80 text-sm"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredTransactions.length === 0 && !isLoading && (
            <div className="text-center py-12 text-secondary-text">
              No transactions found
            </div>
          )}

          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="card p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Edit Transaction</h3>
            <div className="space-y-3">
              <input
                type="date"
                value={editingTransaction.date}
                onChange={(e) => setEditingTransaction({ ...editingTransaction, date: e.target.value })}
                className="input-field w-full"
              />
              <select
                value={editingTransaction.category}
                onChange={(e) => setEditingTransaction({ ...editingTransaction, category: e.target.value })}
                className="input-field w-full"
              >
                {currentUser.categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="number"
                value={editingTransaction.amount}
                onChange={(e) => setEditingTransaction({ ...editingTransaction, amount: parseFloat(e.target.value) })}
                className="input-field w-full"
              />
              <div className="flex space-x-2 pt-4">
                <button onClick={handleSaveEdit} disabled={isLoading} className="btn-primary flex-1">
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setEditingTransaction(null)} className="btn-secondary flex-1">
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
