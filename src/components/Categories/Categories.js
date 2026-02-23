import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import googleSheetsService from '../../services/googleSheetsService';
import { format } from 'date-fns';
import { Pencil } from 'lucide-react';

const Categories = () => {
  const { currentUser, isAuthenticated, setIsAuthenticated, saveUser } = useApp();
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isLoading, setIsLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editBudget, setEditBudget] = useState(0);

  useEffect(() => {
    if (currentUser?.sheetId && isAuthenticated) {
      loadTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.sheetId, isAuthenticated]);

  const loadTransactions = async () => {
    if (!currentUser?.sheetId || !isAuthenticated) return;
    setIsLoading(true);
    try {
      const data = await googleSheetsService.getTransactions(currentUser.sheetId);
      setTransactions(data);
    } catch (err) {
      console.error(err);
      if (err.message.includes('Authentication expired')) {
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const monthTransactions = transactions.filter(t => t.month === selectedMonth && t.type !== 'Income');
  const uniqueMonths = [...new Set(transactions.map(t => t.month))].sort().reverse();

  // Calculate spending per category
  const categorySpending = {};
  monthTransactions.forEach(t => {
    if (t.category) {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + (t.amount || 0);
    }
  });

  const handleEditBudget = (category) => {
    setEditingCategory(category);
    setEditBudget(currentUser?.categoryBudgets?.[category] || 0);
  };

  const handleSaveBudget = () => {
    const updatedBudgets = {
      ...currentUser.categoryBudgets,
      [editingCategory]: parseFloat(editBudget) || 0
    };
    saveUser({ ...currentUser, categoryBudgets: updatedBudgets });
    setEditingCategory(null);
  };

  const formatCurrency = (amount) => {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (!isAuthenticated || !currentUser?.sheetId) {
    return (
      <div className="text-center py-12">
        <div className="text-secondary-text">Please connect your Google Sheet to view categories</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Categories & Budgets</h1>
        <p className="text-secondary-text">Track your savings by category</p>
      </div>

      {/* Month Selector */}
      <div className="card p-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="input-field w-full"
        >
          {uniqueMonths.length > 0 ? (
            uniqueMonths.map(month => (
              <option key={month} value={month}>
                {format(new Date(month + '-01'), 'MMMM yyyy')}
              </option>
            ))
          ) : (
            <option value={selectedMonth}>
              {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
            </option>
          )}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {currentUser.categories.map((category) => {
            const budget = currentUser?.categoryBudgets?.[category] || 0;
            const spent = categorySpending[category] || 0;
            const saved = budget - spent;
            const isOverBudget = budget > 0 && spent > budget;
            const savedPercentage = budget > 0 ? ((saved / budget) * 100) : 0;
            const spentPercentage = budget > 0 ? ((spent / budget) * 100) : 0;

            return (
              <div key={category} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{category}</h3>
                    {budget > 0 ? (
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-secondary-text">Budget: {formatCurrency(budget)}</span>
                        <span className="text-danger">Spent: {formatCurrency(spent)}</span>
                        <span className={isOverBudget ? 'text-danger' : 'text-success'}>
                          {isOverBudget ? `Over by ${formatCurrency(Math.abs(saved))}` : `Saved: ${formatCurrency(saved)}`}
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm text-secondary-text">
                        No budget set · Spent: {formatCurrency(spent)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditBudget(category)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      title="Edit budget"
                    >
                      <Pencil className="w-4 h-4 text-accent" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar - Inverted: Green (saved) on left, Red (spent) on right */}
                {budget > 0 && (
                  <div className="space-y-2">
                    <div className="w-full bg-white/10 rounded-full h-8 overflow-hidden flex">
                      {!isOverBudget ? (
                        <>
                          {/* Saved portion - GREEN on left */}
                          <div 
                            className="bg-success flex items-center justify-center text-white text-xs font-medium"
                            style={{ width: `${Math.max(savedPercentage, 0)}%` }}
                          >
                            {savedPercentage > 15 && `${savedPercentage.toFixed(0)}% saved`}
                          </div>
                          {/* Spent portion - RED on right */}
                          <div 
                            className="bg-danger flex items-center justify-center text-white text-xs font-medium"
                            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                          >
                            {spentPercentage > 15 && `${spentPercentage.toFixed(0)}% spent`}
                          </div>
                        </>
                      ) : (
                        // Over budget - full RED
                        <div className="bg-danger w-full flex items-center justify-center text-white text-xs font-medium">
                          Over budget by {Math.abs(savedPercentage).toFixed(0)}%
                        </div>
                      )}
                    </div>

                    {/* Spending pace warning/encouragement */}
                    {!isOverBudget && saved > 0 && (
                      <div className="text-xs text-success">
                        ✓ You're on track to save {formatCurrency(saved)} this month
                      </div>
                    )}
                    {isOverBudget && (
                      <div className="text-xs text-danger">
                        ⚠ Spending too fast, reduce by ₹{(Math.abs(saved) / 30).toFixed(0)}/day
                      </div>
                    )}
                  </div>
                )}

                {budget === 0 && (
                  <button
                    onClick={() => handleEditBudget(category)}
                    className="text-sm text-accent hover:text-accent/80"
                  >
                    Set budget for this category →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Budget Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="card p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Set Budget for {editingCategory}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-secondary-text mb-2">Monthly Budget (₹)</label>
                <input
                  type="number"
                  value={editBudget}
                  onChange={(e) => setEditBudget(e.target.value)}
                  className="input-field w-full text-xl"
                  placeholder="0"
                  autoFocus
                />
              </div>
              <div className="flex space-x-2">
                <button onClick={handleSaveBudget} className="btn-primary flex-1">
                  Save Budget
                </button>
                <button onClick={() => setEditingCategory(null)} className="btn-secondary flex-1">
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

export default Categories;
