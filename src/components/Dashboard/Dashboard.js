import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import googleSheetsService from '../../services/googleSheetsService';
import { format } from 'date-fns';
import CategoryChart from '../Charts/CategoryChart';
import TrendChart from '../Charts/TrendChart';
import ExpenseForm from '../ExpenseForm/ExpenseForm';

const Dashboard = () => {
  const { currentUser, isAuthenticated, setIsAuthenticated, setError: setGlobalError } = useApp();
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isLoading, setIsLoading] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [error, setError] = useState(null);
  const [dataFromCache, setDataFromCache] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

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

  useEffect(() => {
    if (currentUser?.sheetId && isAuthenticated) {
      loadTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.sheetId, isAuthenticated]);

  const monthTransactions = transactions.filter(t => t.month === selectedMonth);
  const uniqueMonths = [...new Set(transactions.map(t => t.month))].sort().reverse();

  // Calculate summary
  const income = monthTransactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + (t.amount || 0), 0);
  const expenses = monthTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + (t.amount || 0), 0);
  const emi = monthTransactions.filter(t => t.type === 'EMI').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpenses = expenses + emi;
  const balance = income - totalExpenses;
  const monthlyBudget = currentUser?.monthlyBudget || 0;
  const budgetUtilization = monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0;

  // Category data
  const categoryData = {};
  monthTransactions.forEach(t => {
    if (t.category && t.type !== 'Income') {
      categoryData[t.category] = (categoryData[t.category] || 0) + (t.amount || 0);
    }
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatCurrency = (amount) => {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (!isAuthenticated || !currentUser?.sheetId) {
    return (
      <div className="text-center py-12">
        <div className="text-secondary-text mb-4">Please connect your Google Sheet to view dashboard</div>
      </div>
    );
  }

  // Show helpful empty state if offline and no cache
  if (!navigator.onLine && transactions.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-secondary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">No cached data available</h2>
          <p className="text-secondary-text mb-6">
            Connect to internet to load your transactions. Once loaded, your data will be available offline.
          </p>
          <button
            onClick={loadTransactions}
            className="btn-primary"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Record Transaction</h2>
              <button
                onClick={() => setShowAddExpense(false)}
                className="text-secondary-text hover:text-white text-3xl leading-none"
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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            {getGreeting()}, {currentUser.name}
          </h1>
          <p className="text-secondary-text">
            Your financial overview for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
          </p>
          {dataFromCache && lastSynced && (
            <div className="mt-2 inline-flex items-center space-x-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-secondary-text">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span>Cached · Last synced {(() => {
                const diff = Date.now() - lastSynced;
                const minutes = Math.floor(diff / 60000);
                const hours = Math.floor(diff / 3600000);
                if (minutes < 1) return 'just now';
                if (minutes < 60) return `${minutes} min ago`;
                return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
              })()}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowAddExpense(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <span>Record Expense</span>
        </button>
      </div>

      {/* Month Selector */}
      <div className="card p-4">
        <div className="flex items-center space-x-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input-field flex-1"
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
            className="btn-secondary"
          >
            {isLoading ? '⏳' : '🔄'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl">
          <strong>Error:</strong> {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Balance */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="text-secondary-text text-sm">Total Balance</div>
                <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                  <span className="text-accent text-xl">💰</span>
                </div>
              </div>
              <div className={`text-3xl font-bold mb-2 ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(balance)}
              </div>
              <div className={`text-sm ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
                {balance >= 0 ? '↑' : '↓'} Net amount
              </div>
            </div>

            {/* Monthly Income */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="text-secondary-text text-sm">Monthly Income</div>
                <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center">
                  <span className="text-success text-xl">📈</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-success mb-2">
                {formatCurrency(income)}
              </div>
              <div className="text-sm text-secondary-text">
                Total earnings
              </div>
            </div>

            {/* Monthly Expenses */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="text-secondary-text text-sm">Monthly Expenses</div>
                <div className="w-10 h-10 bg-danger/20 rounded-xl flex items-center justify-center">
                  <span className="text-danger text-xl">📉</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-danger mb-2">
                {formatCurrency(totalExpenses)}
              </div>
              <div className="text-sm text-secondary-text">
                Total spending
              </div>
            </div>
          </div>

          {/* Summary Cards Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Saved This Month */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="text-secondary-text text-sm">Saved This Month</div>
                <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center">
                  <span className="text-success text-xl">💰</span>
                </div>
              </div>
              {income > 0 ? (
                <>
                  <div className={`text-3xl font-bold mb-2 ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatCurrency(Math.abs(balance))}
                  </div>
                  <div className={`text-sm ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
                    {balance >= 0 ? 'Great job saving!' : 'Spent more than earned'}
                  </div>
                </>
              ) : (
                <div>
                  <div className="text-2xl font-bold text-white">₹0.00</div>
                  <div className="text-xs text-secondary-text mt-1">Add income transactions to track savings</div>
                </div>
              )}
            </div>

            {/* Budget Status */}
            <div className="card p-6">
              <div className="text-secondary-text text-sm mb-2">Budget Status</div>
              {monthlyBudget > 0 ? (
                <>
                  <div className={`text-3xl font-bold mb-3 ${budgetUtilization <= 100 ? 'text-success' : 'text-danger'}`}>
                    {budgetUtilization <= 100 
                      ? `${(100 - budgetUtilization).toFixed(1)}% saved`
                      : `Over by ${(budgetUtilization - 100).toFixed(1)}%`
                    }
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    {budgetUtilization <= 100 ? (
                      // Show saved portion in green, spent in red
                      <div className="h-2 rounded-full flex">
                        <div 
                          className="bg-success rounded-l-full"
                          style={{ width: `${100 - budgetUtilization}%` }}
                        ></div>
                        <div 
                          className="bg-danger rounded-r-full"
                          style={{ width: `${budgetUtilization}%` }}
                        ></div>
                      </div>
                    ) : (
                      // Over budget - full red
                      <div className="h-2 rounded-full bg-danger w-full"></div>
                    )}
                  </div>
                  <div className="text-xs text-secondary-text mt-2">
                    {budgetUtilization <= 100 
                      ? `On track to save ₹${formatCurrency(monthlyBudget - totalExpenses).replace('₹', '')}`
                      : `Over budget by ₹${formatCurrency(totalExpenses - monthlyBudget).replace('₹', '')}`
                    }
                  </div>
                </>
              ) : (
                <button
                  onClick={() => window.location.hash = '#settings'}
                  className="text-left hover:text-accent transition-colors"
                >
                  <div className="text-sm text-secondary-text">Set up budget in Settings →</div>
                </button>
              )}
            </div>
          </div>

          {/* Category Trends */}
          {Object.keys(categoryData).length > 0 && (
            <div className="card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Category Savings</h3>
              <div className="space-y-3">
                {Object.entries(categoryData)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([category, amount]) => {
                    const budget = currentUser?.categoryBudgets?.[category] || 0;
                    const saved = budget - amount;
                    const isOverBudget = budget > 0 && amount > budget;
                    const isOnTrack = budget > 0 && amount <= budget;
                    
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-white">{category}</span>
                        <div className="flex items-center space-x-2">
                          {isOnTrack ? (
                            <>
                              <span className="text-success">
                                ✓ Saved ₹{saved.toFixed(0)}
                              </span>
                            </>
                          ) : isOverBudget ? (
                            <>
                              <span className="text-danger">
                                Over by ₹{Math.abs(saved).toFixed(0)}
                              </span>
                            </>
                          ) : (
                            <span className="text-secondary-text">{formatCurrency(amount)}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Charts */}
          {monthTransactions.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Income vs Expenses Chart */}
              {uniqueMonths.length > 1 && (
                <div className="card p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Income vs Expenses</h3>
                  <TrendChart transactions={transactions} months={uniqueMonths} />
                </div>
              )}

              {/* Spending by Category */}
              {Object.keys(categoryData).length > 0 && (
                <div className="card p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Spending by Category</h3>
                  <CategoryChart data={categoryData} />
                </div>
              )}
            </div>
          )}

          {/* No Data Message */}
          {transactions.length === 0 && (
            <div className="card p-8 text-center">
              <div className="text-secondary-text">
                No transactions found. Start by adding your first expense!
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
