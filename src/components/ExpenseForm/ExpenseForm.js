import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import googleSheetsService from '../../services/googleSheetsService';
import { format } from 'date-fns';

const ExpenseForm = () => {
  const { currentUser, isAuthenticated, setIsAuthenticated, setError: setGlobalError } = useApp();
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    category: '',
    subCategory: '',
    paymentMethod: '',
    cardName: '',
    amount: '',
    type: 'Expense',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.category || !formData.amount) {
      showMessage('❌ Category and Amount are required', 'error');
      return;
    }

    if (!isAuthenticated) {
      showMessage('❌ Not authenticated. Please sign in with Google.', 'error');
      return;
    }

    if (!currentUser?.sheetId) {
      showMessage('❌ No sheet connected. Please connect a Google Sheet first.', 'error');
      return;
    }

    setIsSubmitting(true);
    setMessage('💾 Saving to Google Sheets...');
    setMessageType('info');

    try {
      const date = new Date(formData.date);
      const month = format(date, 'yyyy-MM'); // Format: 2026-02
      
      const transaction = {
        date: formData.date,
        month: month,
        category: formData.category,
        subCategory: formData.subCategory || '',
        paymentMethod: formData.paymentMethod || '',
        cardName: formData.cardName || '',
        amount: parseFloat(formData.amount),
        type: formData.type,
        notes: formData.notes || '',
      };

      // Write to Google Sheets
      await googleSheetsService.addTransaction(currentUser.sheetId, transaction);

      showMessage('✅ Expense added successfully to Google Sheets!', 'success');
      
      // Reset form
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        category: '',
        subCategory: '',
        paymentMethod: '',
        cardName: '',
        amount: '',
        type: 'Expense',
        notes: '',
      });
    } catch (error) {
      showMessage('❌ Failed to add expense: ' + error.message, 'error');
      setGlobalError(error.message);
      
      // If auth expired, update status
      if (error.message.includes('Authentication expired')) {
        setIsAuthenticated(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-6 rounded-lg text-center">
          <p className="mb-4">Please authenticate with Google to add expenses</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
          >
            Go to Connect Sheet
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser?.sheetId) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-6 rounded-lg text-center">
          <p>No sheet connected. Please connect a Google Sheet first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Expense</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              {(currentUser.types || ['Expense', 'EMI', 'Investment', 'Savings']).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              required
            >
              <option value="">Select Category</option>
              {currentUser.categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* SubCategory */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sub Category</label>
            <input
              type="text"
              name="subCategory"
              value={formData.subCategory}
              onChange={handleChange}
              placeholder="e.g., Groceries, Fuel"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select Method</option>
              {currentUser.paymentMethods.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {/* Card Name (conditional) */}
          {formData.paymentMethod === 'Card' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Name</label>
              <select
                name="cardName"
                value={formData.cardName}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Card</option>
                {currentUser.cards.map((card) => (
                  <option key={card} value={card}>{card}</option>
                ))}
              </select>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹) *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Optional notes"
              rows="3"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full p-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-lg transition-colors"
          >
            {isSubmitting ? '💾 Saving to Google Sheets...' : '💾 Add Expense'}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div className={`mt-4 p-4 rounded-lg ${
            messageType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
            messageType === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {message}
          </div>
        )}

        {/* Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <strong>💡 Tip:</strong> Data is saved directly to your Google Sheet. 
          Refresh the Dashboard to see updated totals.
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;
