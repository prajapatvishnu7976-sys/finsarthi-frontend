import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Calendar, 
  DollarSign, 
  Sparkles,
  ArrowLeft,
  Info,
  Zap,
  Tag,
  CreditCard,
  Clock,
  TrendingUp,
  Gift
} from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';
import { advisorAPI } from '../services/api';

const PurchaseAdvisor = () => {
  const [formData, setFormData] = useState({
    itemName: '',
    itemPrice: '',
    category: 'electronics',
    urgency: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState(null);
  const [error, setError] = useState(null);
  const [healthScore, setHealthScore] = useState(null);

  const categories = [
    { value: 'electronics', label: 'Electronics', icon: '📱' },
    { value: 'clothing', label: 'Clothing', icon: '👕' },
    { value: 'appliances', label: 'Appliances', icon: '🔌' },
    { value: 'furniture', label: 'Furniture', icon: '🛋️' },
    { value: 'travel', label: 'Travel', icon: '✈️' },
    { value: 'other', label: 'Other', icon: '📦' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low', desc: 'Can wait 3+ months' },
    { value: 'medium', label: 'Medium', desc: 'Can wait 1-2 months' },
    { value: 'high', label: 'High', desc: 'Need within 1 month' },
    { value: 'urgent', label: 'Urgent', desc: 'Need immediately' }
  ];

  useEffect(() => {
    fetchHealthScore();
  }, []);

  const fetchHealthScore = async () => {
    try {
      const response = await advisorAPI.getHealthScore();
      if (response.data.success) {
        setHealthScore(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch health score:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAdvice(null);

    try {
      const response = await advisorAPI.analyzePurchase({
        itemName: formData.itemName,
        itemPrice: parseFloat(formData.itemPrice),
        category: formData.category,
        urgency: formData.urgency
      });

      console.log('📊 API Response:', response.data);

      if (response.data.success) {
        setAdvice(response.data.data);
      } else {
        setError('Analysis failed. Please try again.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAdvice(null);
    setError(null);
    setFormData({
      itemName: '',
      itemPrice: '',
      category: 'electronics',
      urgency: 'medium'
    });
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'buy': return 'bg-green-100 border-green-500 text-green-800';
      case 'wait': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'emi': return 'bg-blue-100 border-blue-500 text-blue-800';
      case 'caution': return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'avoid': return 'bg-red-100 border-red-500 text-red-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <ShoppingCart className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Smart Purchase Advisor</h1>
                  <p className="text-purple-100 mt-1">AI-powered shopping guidance with real-time offers 💰</p>
                </div>
              </div>
              
              {/* Health Score Badge */}
              {healthScore && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <p className="text-purple-100 text-xs">Financial Health</p>
                  <p className="text-3xl font-bold">{healthScore.emoji} {healthScore.score}</p>
                  <p className="text-sm text-purple-100">Budget: ₹{healthScore.availableBudget?.toLocaleString('en-IN')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto p-8">
          
          {/* Show Result */}
          {advice ? (
            <div className="space-y-6">
              {/* Back Button */}
              <button
                onClick={resetForm}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Check Another Item
              </button>

              {/* Item Info & Main Action */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className={`card border-2 ${getActionColor(advice.actionType)}`}>
                    <div className="flex items-start gap-4">
                      <div className="text-5xl">
                        {advice.actionType === 'buy' ? '✅' : 
                         advice.actionType === 'wait' ? '⏳' : 
                         advice.actionType === 'emi' ? '💳' :
                         advice.actionType === 'caution' ? '⚠️' : '🚫'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h2 className="text-2xl font-bold text-gray-900">{advice.itemName}</h2>
                          <span className="text-2xl font-bold">₹{(advice.itemPrice || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-lg">{advice.bestAction}</p>
                        
                        {/* Potential Savings */}
                        {advice.potentialSavings > 0 && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-green-700 font-medium flex items-center gap-2">
                              <Gift className="w-5 h-5" />
                              Potential Savings: ₹{advice.potentialSavings.toLocaleString('en-IN')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-4">Your Budget</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Income</span>
                      <span className="font-medium">₹{(advice.analysis?.monthlyIncome || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Spent</span>
                      <span className="font-medium text-red-600">₹{(advice.analysis?.totalExpense || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining</span>
                      <span className={`font-bold ${(advice.analysis?.remainingBudget || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{(advice.analysis?.remainingBudget || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="pt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Risk Level</span>
                        <span className={`font-bold capitalize ${
                          advice.analysis?.riskLevel === 'low' ? 'text-green-600' :
                          advice.analysis?.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                        }`}>{advice.analysis?.riskLevel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Sales */}
              {advice.upcomingSales && advice.upcomingSales.length > 0 && (
                <div className="card border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-orange-500" />
                    🔥 Upcoming Sales - Don't Miss!
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {advice.upcomingSales.map((sale, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">🏷️</span>
                          <div>
                            <p className="font-bold text-gray-900">{sale.name}</p>
                            <p className="text-xs text-gray-500">{sale.platform}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1 text-orange-600">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">{sale.daysUntil} days</span>
                          </div>
                          <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                            {sale.discount} OFF
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cashback Offers */}
              {advice.cashbackOffers && advice.cashbackOffers.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    💳 Available Cashback Offers
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {advice.cashbackOffers.map((offer, index) => (
                      <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                        <p className="font-bold text-gray-900">{offer.method}</p>
                        <p className="text-2xl font-bold text-blue-600 my-2">{offer.cashback} Cashback</p>
                        <p className="text-sm text-gray-600">
                          Save up to <span className="font-bold text-green-600">₹{offer.potentialSavings?.toLocaleString('en-IN')}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-2">Valid on: {offer.validOn?.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Trend */}
              {advice.priceTrend && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    📈 Price Trend Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className={`p-4 rounded-lg ${advice.priceTrend.isGoodMonth ? 'bg-green-50 border border-green-200' : advice.priceTrend.isBadMonth ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}>
                        <p className="text-sm text-gray-600">Current Month: <span className="font-bold">{advice.priceTrend.currentMonth}</span></p>
                        <p className={`text-lg font-bold mt-1 ${advice.priceTrend.isGoodMonth ? 'text-green-600' : advice.priceTrend.isBadMonth ? 'text-red-600' : 'text-gray-600'}`}>
                          {advice.priceTrend.isGoodMonth ? '✅ Good time to buy!' : advice.priceTrend.isBadMonth ? '⚠️ Prices are higher' : '➖ Average pricing'}
                        </p>
                      </div>
                      <p className="mt-3 text-sm text-gray-600">{advice.priceTrend.tip}</p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Best Months to Buy</p>
                        <p className="font-medium text-green-600">{advice.priceTrend.bestMonths?.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Average Sale Discount</p>
                        <p className="font-bold text-2xl text-green-600">{advice.priceTrend.festivalDiscount}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* EMI Options */}
              {advice.emiOptions && advice.emiOptions.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    📅 EMI Options
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {advice.emiOptions.map((emi, index) => (
                      <div 
                        key={index} 
                        className={`p-4 rounded-lg border-2 text-center ${
                          emi.isNoCostEMI ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        {emi.isNoCostEMI && (
                          <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded mb-2">No Cost EMI</span>
                        )}
                        <p className="text-sm text-gray-600">{emi.months} Months</p>
                        <p className="text-2xl font-bold text-gray-900">₹{emi.monthlyEMI?.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-gray-500">per month</p>
                        <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                          emi.affordability === 'comfortable' ? 'bg-green-100 text-green-700' :
                          emi.affordability === 'manageable' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {emi.affordability === 'comfortable' ? '✓ Comfortable' : 
                           emi.affordability === 'manageable' ? '○ Manageable' : '⚠ Tight'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights */}
              {advice.insights && advice.insights.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    💡 Smart Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {advice.insights.map((insight, index) => (
                      <div 
                        key={index} 
                        className={`flex items-start gap-3 p-4 rounded-lg ${
                          insight.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                          insight.type === 'success' ? 'bg-green-50 border border-green-200' :
                          insight.type === 'danger' ? 'bg-red-50 border border-red-200' :
                          insight.type === 'money' ? 'bg-emerald-50 border border-emerald-200' :
                          insight.type === 'tip' ? 'bg-purple-50 border border-purple-200' :
                          'bg-blue-50 border border-blue-200'
                        }`}
                      >
                        <span className="text-2xl">{insight.icon}</span>
                        <div>
                          <p className="font-medium text-gray-900">{insight.title}</p>
                          <p className="text-sm text-gray-700">{insight.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="flex gap-4">
                <button
                  onClick={resetForm}
                  className="btn-primary flex-1 py-3"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Check Another Item
                </button>
              </div>
            </div>
          ) : (
            /* Input Form */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-6">What do you want to buy?</h2>
                
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Item Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={formData.itemName}
                      onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                      placeholder="e.g., iPhone 15 Pro, Samsung TV, Nike Shoes"
                      className="input-field"
                      required
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.itemPrice}
                        onChange={(e) => setFormData({ ...formData, itemPrice: e.target.value })}
                        placeholder="Enter price"
                        className="input-field pl-10"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {categories.map(cat => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat.value })}
                          className={`p-3 rounded-lg border-2 transition-all text-center ${
                            formData.category === cat.value
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-1">{cat.icon}</div>
                          <div className="text-xs font-medium text-gray-700">{cat.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How urgent is this purchase?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {urgencyLevels.map(level => (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, urgency: level.value })}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            formData.urgency === level.value
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <p className="font-medium text-gray-900">{level.label}</p>
                          <p className="text-xs text-gray-500">{level.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !formData.itemName || !formData.itemPrice}
                    className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Analyzing with AI...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Get Smart Recommendation
                      </span>
                    )}
                  </button>
                </form>
              </div>

              {/* Info Section */}
              <div className="space-y-6">
                {/* Health Score Card */}
                {healthScore && (
                  <div className="card bg-gradient-to-br from-primary-50 to-purple-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Financial Status</h3>
                    <div className="text-center mb-4">
                      <p className="text-5xl font-bold">{healthScore.emoji}</p>
                      <p className="text-3xl font-bold text-primary-600 mt-2">{healthScore.score}/100</p>
                      <p className={`text-sm font-medium mt-1`} style={{ color: healthScore.color }}>{healthScore.category}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Monthly Income</span>
                        <span className="font-medium">₹{healthScore.metrics?.monthlyIncome?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Spent This Month</span>
                        <span className="font-medium text-red-600">₹{healthScore.metrics?.totalExpense?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Available for Shopping</span>
                        <span className="font-bold text-green-600">₹{healthScore.availableBudget?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* How it works */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">What You'll Get</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Upcoming sales & best time to buy</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Credit card cashback offers</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">No-cost EMI options</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Budget impact analysis</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Price trend predictions</span>
                    </li>
                  </ul>
                </div>

                {/* Promo */}
                <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingDown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Save More Money! 💰</h4>
                      <p className="text-sm text-gray-700">Our AI helps you find the best deals, upcoming sales, and cashback offers to maximize your savings!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseAdvisor;