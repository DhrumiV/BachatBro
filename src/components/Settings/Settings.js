import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const Settings = () => {
  const { currentUser, saveUser } = useApp();
  const [activeSection, setActiveSection] = useState('categories');
  const [newItem, setNewItem] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState(currentUser.monthlyIncome || 0);

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

  const handleSaveIncome = () => {
    saveUser({ ...currentUser, monthlyIncome: parseFloat(monthlyIncome) || 0 });
    alert('✅ Monthly income updated!');
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
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>

        {/* Section Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
          {[
            { id: 'categories', label: '📁 Categories' },
            { id: 'types', label: '🏷️ Types' },
            { id: 'cards', label: '💳 Cards' },
            { id: 'payments', label: '💰 Payment Methods' },
            { id: 'income', label: '💵 Monthly Income' },
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

          {activeSection === 'income' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Set Monthly Income</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Income (₹)
                  </label>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="Enter monthly income"
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleSaveIncome}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
                >
                  Save Income
                </button>
                <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
                  Current Monthly Income: <span className="font-bold">₹{currentUser.monthlyIncome.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
