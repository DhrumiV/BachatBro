import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import googleSheetsService from '../../services/googleSheetsService';
import { format } from 'date-fns';
import CategoryChart from '../Charts/CategoryChart';
import PaymentChart from '../Charts/PaymentChart';
import TrendChart from '../Charts/TrendChart';
import ExpenseForm from '../ExpenseForm/ExpenseForm';

const Dashboard = () => {
  const { currentUser, isAuthenticated, setIsAuthenticated, setError: setGlobalError } = useApp();
  const [transactions, setTransactions] = useState([]); // Fetched from Google Sheets
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryChart, setShowCategoryChart] = useState(false);
  const [showRecentChart, setShowRecentChart] = useState(false);
  const [recentChartFilter, setRecentChartFilter] = useState('type'); // 'type' or 'category'
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    if (currentUser?.sheetId && isAuthenticated) {
      loadTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.sheetId, isAuthenticated]);

  const monthTransactions = transactions.filter(t => t.month === selectedMonth);

  const summary = {
    totalExpense: monthTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + (t.amount || 0), 0),
    totalEMI: monthTransactions.filter(t => t.type === 'EMI').reduce((sum, t) => sum + (t.amount || 0), 0),
    totalInvestment: monthTransactions.filter(t => t.type === 'Investment').reduce((sum, t) => sum + (t.amount || 0), 0),
    totalSavings: monthTransactions.filter(t => t.type === 'Savings').reduce((sum, t) => sum + (t.amount || 0), 0),
  };

  summary.totalSpent = summary.totalExpense + summary.totalEMI + summary.totalInvestment + summary.totalSavings;
  
  // Use monthlyBudget instead of monthlyIncome for balance calculation
  const monthlyBudget = currentUser?.monthlyBudget || currentUser?.monthlyIncome || 0;
  summary.balance = monthlyBudget - summary.totalSpent;

  // Category breakdown
  const categoryData = {};
  monthTransactions.forEach(t => {
    if (t.category) {
      if (!categoryData[t.category]) {
        categoryData[t.category] = 0;
      }
      categoryData[t.category] += (t.amount || 0);
    }
  });

  // Payment method breakdown
  const paymentData = {};
  monthTransactions.forEach(t => {
    const key = t.paymentMethod === 'Card' ? t.cardName || 'Card' : t.paymentMethod;
    if (key) {
      if (!paymentData[key]) {
        paymentData[key] = 0;
      }
      paymentData[key] += (t.amount || 0);
    }
  });

  // Get unique months from transactions
  const uniqueMonths = [...new Set(transactions.map(t => t.month))].sort().reverse();

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">Please authenticate with Google to view dashboard</div>
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
      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Add Expense</h2>
              <button
                onClick={() => setShowAddExpense(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            <ExpenseForm onSuccess={() => {
              setShowAddExpense(false);
              loadTransactions();
            }} />
          </div>
        </div>
      )}

      {/* Header with Add Expense Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 hidden md:block">Dashboard</h2>
        <button
          onClick={() => setShowAddExpense(true)}
          className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors md:ml-auto"
        >
          <span className="text-xl">➕</span>
          <span>Add Expense</span>
        </button>
      </div>

      {/* Month Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-200">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Month</label>
        <div className="flex space-x-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="flex-1 p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200"
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
          <button
            onClick={loadTransactions}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
            title="Refresh data from Google Sheets"
          >
            {isLoading ? '⏳' : '🔄'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg transition-colors duration-200">
          <strong>Error:</strong> {error}
          <button
            onClick={loadTransactions}
            className="ml-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <div className="text-gray-500 mt-4">Loading data from Google Sheets...</div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-200">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Expense</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">₹{summary.totalExpense.toFixed(2)}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-200">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">EMI</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">₹{summary.totalEMI.toFixed(2)}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-200">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Investment</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">₹{summary.totalInvestment.toFixed(2)}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-200">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Savings</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">₹{summary.totalSavings.toFixed(2)}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 col-span-2 md:col-span-3 lg:col-span-1 transition-colors duration-200">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Balance</div>
              <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                ₹{summary.balance.toFixed(2)}
              </div>
            </div>
          </div>

          {/* No Data Message */}
          {transactions.length === 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 p-4 rounded-lg text-center transition-colors duration-200">
              No transactions found. Start by adding your first expense!
            </div>
          )}

          {/* Recent Expenses */}
          {monthTransactions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Recent Expenses</h3>
                <button
                  onClick={() => setShowRecentChart(!showRecentChart)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium"
                >
                  {showRecentChart ? '📊 Show Table' : '📈 Show Chart'}
                </button>
              </div>

              {showRecentChart ? (
                <div>
                  {/* Chart Filters */}
                  <div className="mb-4 flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Group by:</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setRecentChartFilter('type')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          recentChartFilter === 'type'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        By Type
                      </button>
                      <button
                        onClick={() => setRecentChartFilter('category')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          recentChartFilter === 'category'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        By Category
                      </button>
                    </div>
                  </div>

                  {/* Bar Chart */}
                  <div className="space-y-3">
                    {recentChartFilter === 'type' ? (
                      // Group by Type
                      (() => {
                        const typeData = {};
                        monthTransactions.slice(0, 10).forEach(t => {
                          if (!typeData[t.type]) {
                            typeData[t.type] = { total: 0, count: 0 };
                          }
                          typeData[t.type].total += t.amount || 0;
                          typeData[t.type].count += 1;
                        });

                        const maxAmount = Math.max(...Object.values(typeData).map(d => d.total));
                        const typeColors = {
                          'Expense': 'bg-red-500',
                          'EMI': 'bg-orange-500',
                          'Investment': 'bg-purple-500',
                          'Savings': 'bg-green-500'
                        };

                        return Object.entries(typeData)
                          .sort((a, b) => b[1].total - a[1].total)
                          .map(([type, data]) => (
                            <div key={type} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{type}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-500 dark:text-gray-400">({data.count} transactions)</span>
                                  <span className="font-bold text-gray-900 dark:text-gray-100">₹{data.total.toFixed(2)}</span>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                                <div
                                  className={`h-8 rounded-full ${typeColors[type] || 'bg-blue-500'} flex items-center justify-end pr-3 transition-all duration-500`}
                                  style={{ width: `${(data.total / maxAmount) * 100}%` }}
                                >
                                  <span className="text-white text-xs font-medium">
                                    {((data.total / maxAmount) * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          ));
                      })()
                    ) : (
                      // Group by Category
                      (() => {
                        const categoryData = {};
                        monthTransactions.slice(0, 10).forEach(t => {
                          if (!categoryData[t.category]) {
                            categoryData[t.category] = { total: 0, count: 0 };
                          }
                          categoryData[t.category].total += t.amount || 0;
                          categoryData[t.category].count += 1;
                        });

                        const maxAmount = Math.max(...Object.values(categoryData).map(d => d.total));
                        const colors = [
                          'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
                          'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
                        ];

                        return Object.entries(categoryData)
                          .sort((a, b) => b[1].total - a[1].total)
                          .map(([category, data], index) => (
                            <div key={category} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{category}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-500 dark:text-gray-400">({data.count} transactions)</span>
                                  <span className="font-bold text-gray-900 dark:text-gray-100">₹{data.total.toFixed(2)}</span>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                                <div
                                  className={`h-8 rounded-full ${colors[index % colors.length]} flex items-center justify-end pr-3 transition-all duration-500`}
                                  style={{ width: `${(data.total / maxAmount) * 100}%` }}
                                >
                                  <span className="text-white text-xs font-medium">
                                    {((data.total / maxAmount) * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          ));
                      })()
                    )}
                  </div>

                  {/* Chart Summary */}
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200">
                    <strong>💡 Tip:</strong> {recentChartFilter === 'type' 
                      ? 'View spending distribution across transaction types (Expense, EMI, Investment, Savings).'
                      : 'View spending distribution across categories to identify where your money goes.'}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthTransactions
                        .slice()
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .slice(0, 10)
                        .map((transaction, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm">{transaction.date}</td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-800">{transaction.category}</div>
                              {transaction.subCategory && (
                                <div className="text-xs text-gray-500">{transaction.subCategory}</div>
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
                            <td className="py-3 px-4 text-right font-medium text-red-600">
                              ₹{transaction.amount.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {transaction.paymentMethod}
                              {transaction.cardName && ` - ${transaction.cardName}`}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                              {transaction.notes || '-'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  
                  {monthTransactions.length > 10 && (
                    <div className="mt-4 text-center text-sm text-gray-500">
                      Showing 10 most recent expenses. View all in History tab.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Category Analysis */}
          {Object.keys(categoryData).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Category Breakdown</h3>
                <button
                  onClick={() => setShowCategoryChart(!showCategoryChart)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium"
                >
                  {showCategoryChart ? '📊 Show Table' : '📈 Show Chart'}
                </button>
              </div>

              {showCategoryChart ? (
                <CategoryChart data={categoryData} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Spent</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Budget</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Remaining</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(categoryData)
                        .sort((a, b) => b[1] - a[1])
                        .map(([category, amount]) => {
                          const budget = currentUser?.categoryBudgets?.[category] || 0;
                          const remaining = budget - amount;
                          const percentage = budget > 0 ? (amount / budget) * 100 : 0;
                          
                          return (
                            <tr key={category} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">{category}</td>
                              <td className="py-3 px-4 text-right font-medium">
                                ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-3 px-4 text-right text-gray-600">
                                {budget > 0 ? `₹${budget.toFixed(2)}` : '-'}
                              </td>
                              <td className={`py-3 px-4 text-right font-medium ${
                                remaining >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {budget > 0 ? `₹${remaining.toFixed(2)}` : '-'}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {budget > 0 ? (
                                  <div className="flex items-center justify-end space-x-2">
                                    <span className={`font-medium ${
                                      percentage > 100 ? 'text-red-600' : 
                                      percentage > 80 ? 'text-orange-600' : 
                                      'text-green-600'
                                    }`}>
                                      {percentage.toFixed(1)}%
                                    </span>
                                    {percentage > 100 && <span className="text-red-600">⚠️</span>}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  
                  {Object.keys(currentUser?.categoryBudgets || {}).length === 0 && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                      <strong>💡 Tip:</strong> Set category budgets in Settings to track your spending better!
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Payment Method Analysis */}
          {Object.keys(paymentData).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Payment Method Analysis</h3>
              <PaymentChart data={paymentData} />
            </div>
          )}

          {/* Monthly Trend */}
          {uniqueMonths.length > 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Monthly Spending Trend</h3>
              <TrendChart transactions={transactions} months={uniqueMonths} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
