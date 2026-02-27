import React, { useState } from 'react';
import { X, DollarSign, Calendar, Tag, FileText, CreditCard, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { expenseAPI } from '../../services/api';

const AddExpenseModal = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState('smart'); // 'smart' or 'manual'
  const [smartInput, setSmartInput] = useState('');
  const [parsedExpense, setParsedExpense] = useState(null);
  const [parsing, setParsing] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food & Dining',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    paymentMethod: 'upi'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Investments',
    'Salary',
    'Freelance',
    'Business',
    'Rent',
    'EMI',
    'Insurance',
    'Gifts',
    'Other'
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'upi', label: 'UPI' },
    { value: 'net-banking', label: 'Net Banking' },
    { value: 'wallet', label: 'Wallet' },
    { value: 'other', label: 'Other' }
  ];

  // AI Parse Natural Language
  const parseNaturalLanguage = (text) => {
    const lowerText = text.toLowerCase();
    let amount = 0;
    let category = 'Other';
    let description = text;
    let type = 'expense';

    // Extract amount (supports: 500, ₹500, rs500, rs 500, 500rs, etc.)
    const amountMatch = text.match(/₹?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:rs|rupees|inr)?|(?:rs|rupees|inr)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i);
    if (amountMatch) {
      amount = parseFloat((amountMatch[1] || amountMatch[2]).replace(/,/g, ''));
    }

    // Detect type (income or expense)
    const incomeKeywords = ['salary', 'received', 'got', 'earned', 'income', 'bonus', 'freelance', 'payment received', 'credited'];
    if (incomeKeywords.some(keyword => lowerText.includes(keyword))) {
      type = 'income';
    }

    // Category detection based on keywords
    const categoryKeywords = {
      'Food & Dining': ['food', 'lunch', 'dinner', 'breakfast', 'restaurant', 'zomato', 'swiggy', 'cafe', 'coffee', 'tea', 'snacks', 'groceries', 'vegetables', 'fruits', 'khana', 'biryani', 'pizza', 'burger', 'chai', 'samosa'],
      'Transportation': ['uber', 'ola', 'cab', 'taxi', 'auto', 'rickshaw', 'metro', 'bus', 'train', 'petrol', 'diesel', 'fuel', 'parking', 'toll', 'travel'],
      'Shopping': ['shopping', 'amazon', 'flipkart', 'myntra', 'clothes', 'shoes', 'dress', 'shirt', 'jeans', 'bought', 'purchase', 'mall'],
      'Entertainment': ['movie', 'netflix', 'prime', 'hotstar', 'spotify', 'game', 'gaming', 'concert', 'show', 'entertainment', 'fun'],
      'Bills & Utilities': ['electricity', 'water', 'gas', 'internet', 'wifi', 'broadband', 'mobile', 'recharge', 'bill', 'airtel', 'jio', 'vi'],
      'Healthcare': ['medicine', 'doctor', 'hospital', 'medical', 'health', 'pharmacy', 'chemist', 'apollo', 'clinic', 'treatment'],
      'Education': ['book', 'course', 'udemy', 'education', 'school', 'college', 'tuition', 'fees', 'class', 'coaching', 'exam'],
      'Travel': ['flight', 'hotel', 'vacation', 'trip', 'holiday', 'booking', 'makemytrip', 'goibibo', 'airbnb', 'oyo'],
      'Rent': ['rent', 'house rent', 'pg', 'hostel', 'accommodation'],
      'EMI': ['emi', 'loan', 'installment', 'credit card bill'],
      'Insurance': ['insurance', 'lic', 'policy', 'premium'],
      'Gifts': ['gift', 'present', 'birthday', 'anniversary', 'wedding gift'],
      'Salary': ['salary', 'paycheck', 'monthly salary'],
      'Freelance': ['freelance', 'project payment', 'client payment', 'gig'],
      'Business': ['business', 'investment return', 'profit', 'dividend'],
      'Investments': ['mutual fund', 'stocks', 'sip', 'investment', 'fd', 'fixed deposit']
    };

    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        category = cat;
        break;
      }
    }

    // Update type based on category
    if (['Salary', 'Freelance', 'Business', 'Investments'].includes(category)) {
      type = 'income';
    }

    // Clean description
    description = text.replace(/₹?\s*\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:rs|rupees|inr)?/gi, '').trim();
    if (!description) description = `${category} expense`;

    return { amount, category, description, type };
  };

  const handleSmartParse = () => {
    if (!smartInput.trim()) return;
    
    setParsing(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const parsed = parseNaturalLanguage(smartInput);
      setParsedExpense(parsed);
      setFormData({
        ...formData,
        amount: parsed.amount.toString(),
        category: parsed.category,
        description: parsed.description,
        type: parsed.type
      });
      setParsing(false);
    }, 500);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await expenseAPI.create({
        ...formData,
        amount: parseFloat(formData.amount)
      });

      if (response.data.success) {
        onSuccess();
        onClose();
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      category: 'Food & Dining',
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      paymentMethod: 'upi'
    });
    setSmartInput('');
    setParsedExpense(null);
    setMode('smart');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add Transaction</h2>
            <p className="text-sm text-gray-500">Describe in natural language or enter manually</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="px-6 pt-4">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('smart')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'smart'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Smart Input
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'manual'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              Manual Entry
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Smart Input Mode */}
        {mode === 'smart' && (
          <div className="p-6">
            <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI-Powered Entry</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Just describe your expense naturally. Examples:
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• "Spent 500 on lunch at Zomato"</li>
                    <li>• "Uber ride to office ₹150"</li>
                    <li>• "Received salary 50000"</li>
                    <li>• "Netflix subscription 199rs"</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your transaction
                </label>
                <div className="relative">
                  <textarea
                    value={smartInput}
                    onChange={(e) => setSmartInput(e.target.value)}
                    placeholder="e.g., Bought groceries for 1500 rupees from BigBasket"
                    rows="3"
                    className="input-field resize-none pr-12"
                  />
                  <button
                    type="button"
                    onClick={handleSmartParse}
                    disabled={!smartInput.trim() || parsing}
                    className="absolute right-2 bottom-2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {parsing ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Parsed Result */}
              {parsedExpense && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-700 mb-3">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-medium">AI Detected:</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-xl font-bold text-gray-900">₹{parsedExpense.amount.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500">Type</p>
                      <p className={`text-lg font-bold ${parsedExpense.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {parsedExpense.type === 'income' ? '↑ Income' : '↓ Expense'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="text-lg font-medium text-gray-900">{parsedExpense.category}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500">Description</p>
                      <p className="text-sm text-gray-900 truncate">{parsedExpense.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setMode('manual')}
                    className="w-full mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Edit details manually →
                  </button>
                </div>
              )}
            </div>

            {/* Submit from Smart Mode */}
            {parsedExpense && parsedExpense.amount > 0 && (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="input-field"
                  >
                    {paymentMethods.map(method => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3"
                >
                  {loading ? 'Adding...' : `Add ${formData.type === 'income' ? 'Income' : 'Expense'}`}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Manual Entry Mode */}
        {mode === 'manual' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Type Toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  formData.type === 'expense'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  formData.type === 'income'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Income
              </button>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field pl-10"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
  name="description"
  value={formData.description}
  onChange={handleChange}
  placeholder={
    formData.type === 'expense'
      ? 'What did you spend on?'
      : 'Source of income'
  }
  rows="2"
  className="input-field pl-10 resize-none"
  required
/>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="input-field pl-10"
                >
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Adding...' : 'Add Transaction'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddExpenseModal;