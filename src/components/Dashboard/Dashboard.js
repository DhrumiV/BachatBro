import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import googleSheetsService from '../../services/googleSheetsService';
import { format } from 'date-fns';
import CategoryChart from '../Charts/CategoryChart';
import PaymentChart from '../Charts/PaymentChart';
import TrendChart from '../Charts/TrendChart';

const Dashboard = () => {
  const { currentUser, isAuthenticated, setIsAuthenticated, setError: setGlobalError } = useApp();
  const [transactions, setTransactions] = useState([]); // Fetched from Google Sheets
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryChart, setShowCategoryChart] = useState(false);
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
  summary.balance = (currentUser?.monthlyIncome || 0) - summary.totalSpent;

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
      {/* Month Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
        <div className="flex space-x-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
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

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <div className="text-gray-500 mt-4">Loading data from Google Sheets...</div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 mb-1">Total Expense</div>
              <div className="text-2xl font-bold text-red-600">₹{summary.totalExpense.toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 mb-1">EMI</div>
              <div className="text-2xl font-bold text-orange-600">₹{summary.totalEMI.toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 mb-1">Investment</div>
              <div className="text-2xl font-bold text-purple-600">₹{summary.totalInvestment.toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 mb-1">Savings</div>
              <div className="text-2xl font-bold text-green-600">₹{summary.totalSavings.toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 col-span-2 md:col-span-3 lg:col-span-1">
              <div className="text-sm text-gray-600 mb-1">Balance</div>
              <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{summary.balance.toFixed(2)}
              </div>
            </div>
          </div>

          {/* No Data Message */}
          {transactions.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg text-center">
              No transactions found. Start by adding your first expense!
            </div>
          )}

          {/* Category Analysis */}
          {Object.keys(categoryData).length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Category Breakdown</h3>
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
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(categoryData)
                        .sort((a, b) => b[1] - a[1])
                        .map(([category, amount]) => (
                          <tr key={category} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">{category}</td>
                            <td className="py-3 px-4 text-right font-medium">₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="py-3 px-4 text-right text-gray-600">
                              {summary.totalSpent > 0 ? ((amount / summary.totalSpent) * 100).toFixed(1) : '0.0'}%
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Payment Method Analysis */}
          {Object.keys(paymentData).length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Payment Method Analysis</h3>
              <PaymentChart data={paymentData} />
            </div>
          )}

          {/* Monthly Trend */}
          {uniqueMonths.length > 1 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly Spending Trend</h3>
              <TrendChart transactions={transactions} months={uniqueMonths} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
