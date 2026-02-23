import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const Settings = ({ initialSection = 'budget' }) => {
  const { currentUser, saveUser, darkMode, toggleDarkMode } = useApp();
  const [activeSection, setActiveSection] = useState(initialSection);
  const [newItem, setNewItem] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState(currentUser.monthlyBudget || 0);
  const [categoryBudgets, setCategoryBudgets] = useState(currentUser.categoryBudgets || {});

  const handleAddItem = (type) => {
    if (!newItem.trim()) return;

    const updated = { ...currentUser };
    if (type === 'category') {
      updated.categories = [...updated.categories, newItem.trim()];
    } else if (type === 'card') {
      updated.cards = [...updated.cards, newItem.trim()];
    } else if (type === 'payment') {
      updated.paymentMethods = [...updated.paymentMethods, newItem.trim()];
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

  const renderList = (items, type, emoji) => (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item} className="flex items-center justify-between p-4 bg-input-bg rounded-xl border border-white/10">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{emoji}</span>
            <span className="font-medium text-white">{item}</span>
          </div>
          <button
            onClick={() => handleDeleteItem(type, item)}
            className="text-danger hover:text-danger/80 text-sm"
          >
            🗑️ Delete
          </button>
        </div>
      ))}
      <div className="flex space-x-2 mt-4">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={`Add new ${type}`}
          className="input-field flex-1"
          onKeyPress={(e) => e.key === 'Enter' && handleAddItem(type)}
        />
        <button
          onClick={() => handleAddItem(type)}
          className="btn-primary"
        >
          Add
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
        <p className="text-secondary-text">Manage your preferences and categories</p>
      </div>

      {/* Section Tabs */}
      <div className="card p-2">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'budget', label: 'Monthly Budget' },
            { id: 'categories', label: 'Categories' },
            { id: 'payments', label: 'Payment Methods' },
            { id: 'preferences', label: 'Preferences' },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeSection === section.id
                  ? 'bg-accent text-white'
                  : 'text-secondary-text hover:text-white hover:bg-white/5'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="card p-6">
        {activeSection === 'budget' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Monthly Budget Settings</h3>
            
            {/* Total Monthly Budget */}
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
              <label className="block text-sm font-medium text-secondary-text mb-2">
                Total Monthly Budget (₹)
              </label>
              <input
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                placeholder="Enter total monthly budget"
                className="input-field w-full text-xl"
              />
            </div>

            {/* Category-wise Budgets */}
            <div>
              <h4 className="font-semibold text-white mb-3">Category Budget Allocation</h4>
              <div className="space-y-3">
                {currentUser.categories.map((category) => {
                  const budget = categoryBudgets[category] || 0;
                  const percentage = monthlyBudget > 0 ? (budget / monthlyBudget) * 100 : 0;
                  
                  return (
                    <div key={category} className="bg-input-bg rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-white font-medium">{category}</label>
                        <span className="text-secondary-text text-sm">{percentage.toFixed(1)}%</span>
                      </div>
                      <input
                        type="number"
                        value={budget}
                        onChange={(e) => handleCategoryBudgetChange(category, e.target.value)}
                        placeholder="0"
                        className="input-field w-full"
                      />
                    </div>
                  );
                })}
              </div>
              
              {/* Budget Summary */}
              <div className="mt-4 bg-white/5 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-secondary-text">Total Allocated:</span>
                  <span className="font-bold text-white">
                    ₹{Object.values(categoryBudgets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-secondary-text">Monthly Budget:</span>
                  <span className="font-bold text-white">₹{parseFloat(monthlyBudget || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-secondary-text">Remaining:</span>
                  <span className={`font-bold ${
                    (parseFloat(monthlyBudget || 0) - Object.values(categoryBudgets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)) >= 0
                      ? 'text-success'
                      : 'text-danger'
                  }`}>
                    ₹{(parseFloat(monthlyBudget || 0) - Object.values(categoryBudgets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button onClick={handleSaveBudget} className="btn-primary w-full">
              Save Budget Settings
            </button>
          </div>
        )}

        {activeSection === 'categories' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Manage Categories</h3>
            {renderList(currentUser.categories, 'category', '📁')}
          </div>
        )}

        {activeSection === 'payments' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Payment Methods</h3>
              {renderList(currentUser.paymentMethods, 'payment', '💳')}
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Cards</h3>
              {renderList(currentUser.cards, 'card', '💳')}
            </div>
          </div>
        )}

        {activeSection === 'preferences' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Preferences</h3>
            
            {/* Currency */}
            <div className="bg-input-bg rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Currency</div>
                  <div className="text-secondary-text text-sm">Indian Rupee (₹)</div>
                </div>
                <span className="text-2xl">₹</span>
              </div>
            </div>

            {/* Dark Mode */}
            <div className="bg-input-bg rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Dark Mode</div>
                  <div className="text-secondary-text text-sm">Currently enabled</div>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`w-14 h-8 rounded-full transition-all ${
                    darkMode ? 'bg-accent' : 'bg-white/20'
                  } relative`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all ${
                    darkMode ? 'right-1' : 'left-1'
                  }`}></div>
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-input-bg rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Notifications</div>
                  <div className="text-secondary-text text-sm">Budget alerts and reminders</div>
                </div>
                <button className="w-14 h-8 rounded-full bg-white/20 relative">
                  <div className="w-6 h-6 bg-white rounded-full absolute top-1 left-1"></div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
