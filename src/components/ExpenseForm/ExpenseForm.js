import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import googleSheetsService from '../../services/googleSheetsService';
import { format } from 'date-fns';

const ExpenseForm = ({ onSuccess }) => {
  const { currentUser, isAuthenticated, setIsAuthenticated, setError: setGlobalError } = useApp();
  const [transactionType, setTransactionType] = useState('Expense');
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    category: '',
    subCategory: '',
    paymentMethod: '',
    cardName: '',
    amount: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

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
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.amount) {
      showMessage('Category and Amount are required', 'error');
      return;
    }

    if (!isAuthenticated || !currentUser?.sheetId) {
      showMessage('Not authenticated. Please sign in with Google.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const date = new Date(formData.date);
      const month = format(date, 'yyyy-MM');
      
      const transaction = {
        date: formData.date,
        month: month,
        category: formData.category,
        subCategory: formData.subCategory || '',
        paymentMethod: formData.paymentMethod || '',
        cardName: formData.cardName || '',
        amount: parseFloat(formData.amount),
        type: transactionType,
        notes: formData.notes || '',
      };

      const result = await googleSheetsService.addTransaction(currentUser.sheetId, transaction);

      // Check if saved offline
      if (result.offline) {
        showMessage(result.message || 'Saved offline · Will sync when connected', 'warning');
      } else {
        showMessage('Transaction added successfully!', 'success');
      }
      
      // Reset form
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        category: '',
        subCategory: '',
        paymentMethod: '',
        cardName: '',
        amount: '',
        notes: '',
      });

      if (onSuccess) {
        setTimeout(() => onSuccess(), 1000);
      }
    } catch (error) {
      showMessage('Failed to add transaction: ' + error.message, 'error');
      setGlobalError(error.message);
      
      if (error.message.includes('Authentication expired')) {
        setIsAuthenticated(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || !currentUser?.sheetId) {
    return (
      <div className="text-center py-12">
        <div className="text-secondary-text mb-4">Please connect your Google Sheet to add transactions</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Record Transaction</h2>

        {/* Type Toggle */}
        <div className="flex bg-input-bg rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => setTransactionType('Income')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              transactionType === 'Income'
                ? 'bg-success text-white'
                : 'text-secondary-text hover:text-white'
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => setTransactionType('Expense')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              transactionType === 'Expense'
                ? 'bg-danger text-white'
                : 'text-secondary-text hover:text-white'
            }`}
          >
            Expense
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-secondary-text mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-xl">₹</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="input-field w-full pl-10 text-2xl"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-secondary-text mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field w-full"
              required
            >
              <option value="">Select Category</option>
              {currentUser.categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-secondary-text mb-2">Payment Method</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="input-field w-full"
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
              <label className="block text-sm font-medium text-secondary-text mb-2">Card Name</label>
              <select
                name="cardName"
                value={formData.cardName}
                onChange={handleChange}
                className="input-field w-full"
              >
                <option value="">Select Card</option>
                {currentUser.cards.map((card) => (
                  <option key={card} value={card}>{card}</option>
                ))}
              </select>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-secondary-text mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="input-field w-full"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-secondary-text mb-2">Note</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Optional notes"
              rows="3"
              className="input-field w-full resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full text-lg py-4"
          >
            {isSubmitting ? 'Saving...' : `Log ${transactionType}`}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div className={`mt-4 p-4 rounded-xl ${
            messageType === 'success' 
              ? 'bg-success/10 text-success border border-success/20' 
              : messageType === 'warning'
              ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
              : 'bg-danger/10 text-danger border border-danger/20'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseForm;
