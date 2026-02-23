import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import googleSheetsService from '../../services/googleSheetsService';
import { format } from 'date-fns';

const Analytics = () => {
  const { currentUser, isAuthenticated, setIsAuthenticated, setError: setGlobalError } = useApp();
  
  // LOCAL STATE - Fetched from Google Sheets ONLY
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch transactions from Google Sheets on mount
  useEffect(() => {
    if (currentUser?.sheetId && isAuthenticated) {
      loadTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.sheetId, isAuthenticated]);

  // Recalculate analytics when transactions or month changes
  useEffect(() => {
    if (transactions.length > 0) {
      calculateAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, transactions]);

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
      
      if (err.message.includes('Authentication expired')) {
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAnalytics = () => {
    // Filter transactions for selected month
    const monthTransactions = transactions.filter(t => t.month === selectedMonth);
    const totalSpent = monthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    // Budget vs Actual - Compare with user's category budgets
    const budgetComparison = {};
    currentUser.categories.forEach(cat => {
      const spent = monthTransactions
        .filter(t => t.category === cat)
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      const budget = currentUser.categoryBudgets?.[cat] || currentUser.budgets?.[cat] || 0;
      budgetComparison[cat] = {
        budget,
        spent,
        difference: budget - spent,
        percentage: budget > 0 ? (spent / budget) * 100 : 0,
      };
    });

    // Top 3 expenses - Sort by amount descending
    const sortedTransactions = [...monthTransactions].sort((a, b) => (b.amount || 0) - (a.amount || 0));
    const topExpenses = sortedTransactions.slice(0, 3);

    // Need vs Want - Categorize based on category type
    const needCategories = ['Food', 'Bills', 'Health', 'Transport'];
    const needSpent = monthTransactions
      .filter(t => needCategories.includes(t.category))
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const wantSpent = totalSpent - needSpent;

    // Monthly comparison - Current vs previous month
    const currentMonthDate = new Date(selectedMonth + '-01');
    const prevDate = new Date(currentMonthDate);
    prevDate.setMonth(prevDate.getMonth() - 1);
    const previousMonth = format(prevDate, 'yyyy-MM');
    
    const previousMonthTransactions = transactions.filter(t => t.month === previousMonth);
    const previousMonthTotal = previousMonthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const monthlyChange = totalSpent - previousMonthTotal;
    const monthlyChangePercent = previousMonthTotal > 0 ? (monthlyChange / previousMonthTotal) * 100 : 0;

    setAnalytics({
      budgetComparison,
      topExpenses,
      needSpent,
      wantSpent,
      totalSpent,
      previousMonthTotal,
      monthlyChange,
      monthlyChangePercent,
    });
  };

  const uniqueMonths = [...new Set(transactions.map(t => t.month))].sort().reverse();

  // Auth check
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 mb-4">Please authenticate with Google to view analytics</div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
        >
          Go to Connect Sheet
        </button>
      </div>
    );
  }

  if (!currentUser?.sheetId) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400">No sheet connected. Please connect a Google Sheet first.</div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <div className="text-gray-500 dark:text-gray-400 mt-4">Loading from Google Sheets...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg transition-colors duration-200">
        <strong>Error:</strong> {error}
        <button
          onClick={loadTransactions}
          className="ml-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 mb-4">No transactions found in your Google Sheet</div>
        <button
          onClick={loadTransactions}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
        >
          🔄 Refresh from Sheet
        </button>
      </div>
    );
  }

  // No analytics calculated yet
  if (!analytics) {
    return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Calculating analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Analytics</h1>
          <p className="text-secondary-text">Track your savings and spending patterns</p>
        </div>
        <button
          onClick={loadTransactions}
          disabled={isLoading}
          className="btn-primary"
          title="Refresh data from Google Sheets"
        >
          {isLoading ? '⏳' : '🔄 Refresh'}
        </button>
      </div>

      {/* Month Selector */}
      <div className="card p-4">
        <label className="block text-sm font-medium text-secondary-text mb-2">Select Month</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="input-field w-full"
        >
          {uniqueMonths.map(month => (
            <option key={month} value={month}>
              {format(new Date(month + '-01'), 'MMMM yyyy')}
            </option>
          ))}
        </select>
      </div>

      {/* Budget vs Actual */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Category Savings Tracker</h3>
        <div className="space-y-4">
          {Object.entries(analytics.budgetComparison)
            .filter(([_, data]) => data.budget > 0)
            .map(([category, data]) => {
              const saved = data.difference;
              const isOverBudget = saved < 0;
              
              return (
                <div key={category}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-white">{category}</span>
                    <span className={`font-semibold ${saved >= 0 ? 'text-success' : 'text-danger'}`}>
                      {saved >= 0 
                        ? `Saved ₹${saved.toFixed(0)}` 
                        : `Over by ₹${Math.abs(saved).toFixed(0)}`
                      }
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 flex overflow-hidden">
                    {!isOverBudget ? (
                      <>
                        {/* Saved portion - GREEN */}
                        <div
                          className="bg-success"
                          style={{ width: `${(saved / data.budget) * 100}%` }}
                        />
                        {/* Spent portion - RED */}
                        <div
                          className="bg-danger"
                          style={{ width: `${(data.spent / data.budget) * 100}%` }}
                        />
                      </>
                    ) : (
                      <div className="bg-danger w-full" />
                    )}
                  </div>
                  {!isOverBudget && saved > 0 ? (
                    <div className="text-sm text-success mt-1">
                      ✓ You're on track to save ₹{saved.toFixed(0)} this month
                    </div>
                  ) : isOverBudget ? (
                    <div className="text-sm text-danger mt-1">
                      ⚠ Spending too fast, slow down by ₹{(Math.abs(saved) / 30).toFixed(0)}/day
                    </div>
                  ) : null}
                </div>
              );
            })}
          {Object.values(analytics.budgetComparison).every(d => d.budget === 0) && (
            <div className="text-center text-secondary-text py-4">
              No budgets set. Go to Settings to set category budgets.
            </div>
          )}
        </div>
      </div>

      {/* Top 3 Expenses */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Top 3 Expenses</h3>
        <div className="space-y-3">
          {analytics.topExpenses.map((expense, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-input-bg rounded-lg border border-white/10">
              <div>
                <div className="font-medium text-white">{expense.category}</div>
                <div className="text-sm text-secondary-text">{expense.date}</div>
                {expense.notes && <div className="text-sm text-secondary-text">{expense.notes}</div>}
              </div>
              <div className="text-xl font-bold text-danger">₹{expense.amount.toFixed(2)}</div>
            </div>
          ))}
          {analytics.topExpenses.length === 0 && (
            <div className="text-center text-secondary-text py-4">No expenses this month</div>
          )}
        </div>
      </div>

      {/* Need vs Want */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Need vs Want Analysis</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-accent/10 rounded-xl border border-accent/20">
            <div className="text-sm text-accent mb-1">Needs</div>
            <div className="text-2xl font-bold text-white">₹{analytics.needSpent.toFixed(2)}</div>
            <div className="text-sm text-accent mt-1">
              {analytics.totalSpent > 0 ? ((analytics.needSpent / analytics.totalSpent) * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div className="p-4 bg-success/10 rounded-xl border border-success/20">
            <div className="text-sm text-success mb-1">Wants</div>
            <div className="text-2xl font-bold text-white">₹{analytics.wantSpent.toFixed(2)}</div>
            <div className="text-sm text-success mt-1">
              {analytics.totalSpent > 0 ? ((analytics.wantSpent / analytics.totalSpent) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-white/5 rounded-lg text-sm text-secondary-text">
          💡 Tip: Aim for 50% Needs, 30% Wants, 20% Savings
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Monthly Comparison</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-input-bg rounded-xl border border-white/10">
            <div className="text-sm text-secondary-text mb-1">Previous Month</div>
            <div className="text-2xl font-bold text-white">₹{analytics.previousMonthTotal.toFixed(2)}</div>
          </div>
          <div className="p-4 bg-input-bg rounded-xl border border-white/10">
            <div className="text-sm text-secondary-text mb-1">Current Month</div>
            <div className="text-2xl font-bold text-white">₹{analytics.totalSpent.toFixed(2)}</div>
          </div>
        </div>
        <div className={`mt-4 p-4 rounded-xl ${
          analytics.monthlyChange > 0 ? 'bg-danger/10 border border-danger/20' : 'bg-success/10 border border-success/20'
        }`}>
          <div className={`text-lg font-semibold ${
            analytics.monthlyChange > 0 ? 'text-danger' : 'text-success'
          }`}>
            {analytics.monthlyChange > 0 ? '📈 Increased' : '📉 Decreased'} by ₹{Math.abs(analytics.monthlyChange).toFixed(2)}
            {analytics.previousMonthTotal > 0 && (
              <span className="ml-2">({Math.abs(analytics.monthlyChangePercent).toFixed(1)}%)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
