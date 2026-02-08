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
        <div className="text-gray-500 mb-4">Please authenticate with Google to view analytics</div>
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

  // Loading state
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <div className="text-gray-500 mt-4">Loading from Google Sheets...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
        <strong>Error:</strong> {error}
        <button
          onClick={loadTransactions}
          className="ml-4 text-red-600 hover:text-red-700 underline"
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
        <div className="text-gray-500 mb-4">No transactions found in your Google Sheet</div>
        <button
          onClick={loadTransactions}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
        >
          🔄 Refresh from Sheet
        </button>
      </div>
    );
  }

  // No analytics calculated yet
  if (!analytics) {
    return <div className="text-center py-12">Calculating analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>
        <button
          onClick={loadTransactions}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
          title="Refresh data from Google Sheets"
        >
          {isLoading ? '⏳' : '🔄 Refresh'}
        </button>
      </div>

      {/* Month Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        >
          {uniqueMonths.map(month => (
            <option key={month} value={month}>
              {format(new Date(month + '-01'), 'MMMM yyyy')}
            </option>
          ))}
        </select>
      </div>

      {/* Budget vs Actual */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Budget vs Actual</h3>
        <div className="space-y-4">
          {Object.entries(analytics.budgetComparison)
            .filter(([_, data]) => data.budget > 0)
            .map(([category, data]) => (
              <div key={category}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-800">{category}</span>
                  <span className={`font-semibold ${data.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{data.spent.toFixed(2)} / ₹{data.budget.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      data.percentage <= 100 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(data.percentage, 100)}%` }}
                  />
                </div>
                {data.percentage > 100 && (
                  <div className="text-sm text-red-600 mt-1">
                    ⚠️ Over budget by ₹{Math.abs(data.difference).toFixed(2)}
                  </div>
                )}
              </div>
            ))}
          {Object.values(analytics.budgetComparison).every(d => d.budget === 0) && (
            <div className="text-center text-gray-500 py-4">
              No budgets set. Go to Settings to set category budgets.
            </div>
          )}
        </div>
      </div>

      {/* Top 3 Expenses */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Top 3 Expenses</h3>
        <div className="space-y-3">
          {analytics.topExpenses.map((expense, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-800">{expense.category}</div>
                <div className="text-sm text-gray-500">{expense.date}</div>
                {expense.notes && <div className="text-sm text-gray-600">{expense.notes}</div>}
              </div>
              <div className="text-xl font-bold text-red-600">₹{expense.amount.toFixed(2)}</div>
            </div>
          ))}
          {analytics.topExpenses.length === 0 && (
            <div className="text-center text-gray-500 py-4">No expenses this month</div>
          )}
        </div>
      </div>

      {/* Need vs Want */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Need vs Want Analysis</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 mb-1">Needs</div>
            <div className="text-2xl font-bold text-blue-800">₹{analytics.needSpent.toFixed(2)}</div>
            <div className="text-sm text-blue-600 mt-1">
              {analytics.totalSpent > 0 ? ((analytics.needSpent / analytics.totalSpent) * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-purple-600 mb-1">Wants</div>
            <div className="text-2xl font-bold text-purple-800">₹{analytics.wantSpent.toFixed(2)}</div>
            <div className="text-sm text-purple-600 mt-1">
              {analytics.totalSpent > 0 ? ((analytics.wantSpent / analytics.totalSpent) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          💡 Tip: Aim for 50% Needs, 30% Wants, 20% Savings
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly Comparison</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Previous Month</div>
            <div className="text-2xl font-bold text-gray-800">₹{analytics.previousMonthTotal.toFixed(2)}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Current Month</div>
            <div className="text-2xl font-bold text-gray-800">₹{analytics.totalSpent.toFixed(2)}</div>
          </div>
        </div>
        <div className={`mt-4 p-4 rounded-lg ${
          analytics.monthlyChange > 0 ? 'bg-red-50' : 'bg-green-50'
        }`}>
          <div className={`text-lg font-semibold ${
            analytics.monthlyChange > 0 ? 'text-red-800' : 'text-green-800'
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
