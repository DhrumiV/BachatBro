import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const Settings = () => {
  const { currentUser, saveUser } = useApp();
  const [activeSection, setActiveSection] = useState('budget');
  const [newItem, setNewItem] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState(currentUser.monthlyBudget || currentUser.monthlyIncome || 0);
  const [categoryBudgets, setCategoryBudgets] = useState(currentUser.categoryBudgets || currentUser.budgets || {});

  const handleAddItem = (type) => {
    if (!newItem.trim()) return;

    const updated = { ...currentUser };
    if (type === 'category') {
      updated.categories = [...updated.categories, newItem.trim()];
    } else if (type === 'card') {
      updated.cards = [...updated.cards, newItem.trim()];
    } else if (type === 'payment') {
      updated.paymentMethods = [...updated.paymentMethods, newItem.trim()];
    } else if (type === 'type') {
      updated.types = [...(updated.types || ['Expense', 'EMI', 'Investment', 'Savings']), newItem.trim()];
    }

    saveUser(updated);
    setNewItem('');
  };

  const handleDeleteItem = (type, item) => {
    const updated = { ...currentUser };
    if (type === 'category') {
      updated.categories = updated.categories.filter(c => c !== item);
    } else if (type === 'card') {
      updated.cards = updated.cards.filter(c => c !== item);
    } else if (type === 'payment') {
      updated.paymentMethods = updated.paymentMethods.filter(p => p !== item);
    } else if (type === 'type') {
      updated.types = updated.types.filter(t => t !== item);
    }

    saveUser(updated);
  };

  const handleSaveBudget = () => {
    saveUser({ 
      ...currentUser, 
      monthlyBudget: parseFloat(monthlyBudget) || 0,
      categoryBudgets: categoryBudgets
    });
    alert('✅ Budget settings updated!');
  };

  const handleCategoryBudgetChange = (category, value) => {
    setCategoryBudgets({
      ...categoryBudgets,
      [category]: parseFloat(value) || 0
    });
  };

  const renderList = (items, type) => (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="font-medium text-gray-800">{item}</span>
          <button
            onClick={() => handleDeleteItem(type, item)}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
          >
            Delete
          </button>
        </div>
      ))}
      <div className="flex space-x-2 mt-4">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={`Add new ${type}`}
          className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          onKeyPress={(e) => e.key === 'Enter' && handleAddItem(type)}
        />
        <button
          onClick={() => handleAddItem(type)}
          className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
        >
          Add
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Settings</h2>

        {/* Section Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
          {[
            { id: 'budget', label: '💰 Monthly Budget' },
            { id: 'categories', label: '📁 Categories' },
            { id: 'types', label: '🏷️ Types' },
            { id: 'cards', label: '💳 Cards' },
            { id: 'payments', label: '💵 Payment Methods' },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeSection === 'budget' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Budget Settings</h3>
              <div className="space-y-6">
                {/* Total Monthly Budget */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Monthly Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    placeholder="Enter total monthly budget"
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none mb-3"
                  />
                  <div className="text-sm text-blue-700">
                    This is your total budget for the month. Set category-wise budgets below.
                  </div>
                </div>

                {/* Category-wise Budgets */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Category-wise Budget Allocation</h4>
                  <div className="space-y-3">
                    {currentUser.categories.map((category) => (
                      <div key={category} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {category}
                          </label>
                          <input
                            type="number"
                            value={categoryBudgets[category] || 0}
                            onChange={(e) => handleCategoryBudgetChange(category, e.target.value)}
                            placeholder="0"
                            className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="text-sm text-gray-600 min-w-[80px] text-right">
                          {monthlyBudget > 0 && categoryBudgets[category] > 0
                            ? `${((categoryBudgets[category] / monthlyBudget) * 100).toFixed(1)}%`
                            : '0%'}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Budget Summary */}
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">Total Allocated:</span>
                      <span className="font-bold text-gray-900">
                        ₹{Object.values(categoryBudgets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">Monthly Budget:</span>
                      <span className="font-bold text-gray-900">₹{parseFloat(monthlyBudget || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                      <span className="font-medium text-gray-700">Remaining:</span>
                      <span className={`font-bold ${
                        (parseFloat(monthlyBudget || 0) - Object.values(categoryBudgets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        ₹{(parseFloat(monthlyBudget || 0) - Object.values(categoryBudgets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveBudget}
                  className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
                >
                  Save Budget Settings
                </button>

                <div className="p-4 bg-green-50 rounded-lg text-sm text-green-800">
                  <strong>💡 Tip:</strong> Allocate your budget across categories to track spending better. 
                  The 50/30/20 rule suggests: 50% needs, 30% wants, 20% savings.
                </div>
              </div>
            </div>
          )}

          {activeSection === 'categories' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Manage Categories</h3>
              {renderList(currentUser.categories, 'category')}
            </div>
          )}

          {activeSection === 'types' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Manage Types</h3>
              {renderList(currentUser.types || ['Expense', 'EMI', 'Investment', 'Savings'], 'type')}
            </div>
          )}

          {activeSection === 'cards' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Manage Cards</h3>
              {renderList(currentUser.cards, 'card')}
            </div>
          )}

          {activeSection === 'payments' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Manage Payment Methods</h3>
              {renderList(currentUser.paymentMethods, 'payment')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
