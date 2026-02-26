import React, { useState, useEffect } from 'react';
import { 
  Target, Plus, TrendingUp, Calendar, DollarSign, 
  AlertCircle, CheckCircle, Trash2, RefreshCw, Lightbulb,
  Car, Home, Heart, GraduationCap, Plane, PiggyBank, Briefcase, Gift
} from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';
import { plannerAPI } from '../services/api';

const FinancePlanner = () => {
  const [goals, setGoals] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Other',
    targetAmount: '',
    timelineMonths: '',
    priority: 'Medium',
    notes: ''
  });

  const categories = [
    { value: 'Car', icon: Car, color: 'bg-blue-500' },
    { value: 'House', icon: Home, color: 'bg-green-500' },
    { value: 'Wedding', icon: Heart, color: 'bg-pink-500' },
    { value: 'Education', icon: GraduationCap, color: 'bg-purple-500' },
    { value: 'Vacation', icon: Plane, color: 'bg-orange-500' },
    { value: 'Emergency Fund', icon: PiggyBank, color: 'bg-yellow-500' },
    { value: 'Business', icon: Briefcase, color: 'bg-indigo-500' },
    { value: 'Other', icon: Gift, color: 'bg-gray-500' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [goalsRes, insightsRes] = await Promise.all([
        plannerAPI.getAllGoals(),
        plannerAPI.getInsights()
      ]);

      if (goalsRes.data.success) setGoals(goalsRes.data.data);
      if (insightsRes.data.success) setInsights(insightsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await plannerAPI.createGoal({
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        timelineMonths: parseInt(formData.timelineMonths)
      });

      if (response.data.success) {
        setShowAddModal(false);
        resetForm();
        fetchData();
        alert('🎯 Goal created with AI recommendations!');
      }
    } catch (err) {
      console.error('Failed to create goal:', err);
      alert(err.response?.data?.message || 'Failed to create goal');
    }
  };

  const deleteGoal = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    
    try {
      await plannerAPI.deleteGoal(id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete goal:', err);
      alert('Failed to delete goal');
    }
  };

  const addContribution = async (goalId, amount) => {
    try {
      const response = await plannerAPI.addContribution(goalId, { amount: parseFloat(amount) });
      if (response.data.success) {
        fetchData();
        if (response.data.data.milestonesAchieved) {
          alert('🎉 Milestone achieved!');
        }
      }
    } catch (err) {
      console.error('Failed to add contribution:', err);
      alert('Failed to add contribution');
    }
  };

  const regenerateAI = async (goalId) => {
    try {
      await plannerAPI.regenerateAI(goalId);
      fetchData();
      alert('✅ AI recommendations updated!');
    } catch (err) {
      console.error('Failed to regenerate recommendations:', err);
      alert('Failed to regenerate recommendations');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Other',
      targetAmount: '',
      timelineMonths: '',
      priority: 'Medium',
      notes: ''
    });
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find((c) => c.value === category);
    return cat || categories[categories.length - 1];
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your financial goals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Future Finance Planner</h1>
              <p className="text-gray-600 mt-1">Plan your financial goals with AI-powered recommendations</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Goal
            </button>
          </div>
        </div>

        {/* Insights Cards */}
        {insights && (
          <div className="p-8 pb-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Goals</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{insights.totalActiveGoals}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Target</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">₹{(insights.totalTargetAmount || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Saved</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">₹{(insights.totalCurrentAmount || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <PiggyBank className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Monthly Required</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">₹{(insights.totalMonthlySavingRequired || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            {insights.recommendations && insights.recommendations.length > 0 && (
              <div className="bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary-600" />
                  AI Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 bg-white rounded-lg p-4">
                      <span className="text-2xl">{rec.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{rec.message}</p>
                        <p className="text-sm text-gray-600 mt-1">{rec.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Goals List */}
        <div className="p-8 pt-0">
          {goals.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Goals Yet</h3>
              <p className="text-gray-600 mb-6">Start planning your financial future by adding your first goal</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create First Goal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {goals.map((goal) => {
                const categoryInfo = getCategoryIcon(goal.category);
                const IconComponent = categoryInfo.icon;
                const progress = goal.targetAmount > 0 
                  ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
                  : 0;

                return (
                  <div key={goal._id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Goal Header */}
                    <div className={`${categoryInfo.color} p-6 text-white`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{goal.name}</h3>
                            <p className="text-white/80">{goal.category}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => regenerateAI(goal._id)}
                            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                            title="Regenerate AI recommendations"
                          >
                            <RefreshCw className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteGoal(goal._id)}
                            className="p-2 bg-white/20 rounded-lg hover:bg-red-500 transition-colors"
                            title="Delete goal"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Goal Body */}
                    <div className="p-6">
                      {/* Progress */}
                      <div className="mb-6">
                        <div className="flex justify-between items-end mb-2">
                          <div>
                            <p className="text-sm text-gray-600">Progress</p>
                            <p className="text-2xl font-bold text-gray-900">
                              ₹{goal.currentAmount.toLocaleString('en-IN')}
                              <span className="text-sm text-gray-500 font-normal">
                                {' '}/ ₹{goal.targetAmount.toLocaleString('en-IN')}
                              </span>
                            </p>
                          </div>
                          <p className="text-3xl font-bold text-primary-600">{progress}%</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${categoryInfo.color}`}
                            style={{ width: `${Math.min(100, progress)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs">Timeline</span>
                          </div>
                          <p className="font-semibold text-gray-900">{goal.timelineMonths} months</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs">Priority</span>
                          </div>
                          <p className="font-semibold text-gray-900">{goal.priority}</p>
                        </div>
                      </div>

                      {/* AI Recommendations */}
                      {goal.aiRecommendations && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-blue-600" />
                            AI Analysis
                          </h4>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Monthly Saving Required:</span>
                              <span className="font-semibold text-gray-900">
                                ₹{goal.aiRecommendations.monthlySavingRequired?.toLocaleString('en-IN') || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Risk Level:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(goal.aiRecommendations.riskLevel)}`}>
                                {goal.aiRecommendations.riskLevel}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Achievable:</span>
                              <span className={`flex items-center gap-1 ${goal.aiRecommendations.isAchievable ? 'text-green-600' : 'text-red-600'}`}>
                                {goal.aiRecommendations.isAchievable ? (
                                  <><CheckCircle className="w-4 h-4" /> Yes</>
                                ) : (
                                  <><AlertCircle className="w-4 h-4" /> Challenging</>
                                )}
                              </span>
                            </div>
                          </div>

                          {goal.aiRecommendations.bestPurchaseTime && (
                            <div className="mt-3 p-3 bg-white rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">💡 Best Time to Purchase:</p>
                              <p className="text-sm font-medium text-gray-900">{goal.aiRecommendations.bestPurchaseTime}</p>
                            </div>
                          )}

                          {goal.aiRecommendations.savingTips && goal.aiRecommendations.savingTips.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs text-gray-600 mb-2">📋 Tips:</p>
                              <ul className="space-y-1">
                                {goal.aiRecommendations.savingTips.slice(0, 2).map((tip, index) => (
                                  <li key={index} className="text-sm text-gray-700">{tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quick Add Contribution */}
                      <div className="flex gap-2">
                        {[1000, 5000, 10000].map((amount) => (
                          <button
                            key={amount}
                            onClick={() => addContribution(goal._id, amount)}
                            className="flex-1 py-2 px-3 bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            +₹{amount.toLocaleString('en-IN')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Create New Goal</h2>
              <button 
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Goal Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Buy New Car"
                  className="input-field"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {categories.map((cat) => {
                    const IconComp = cat.icon;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormData({...formData, category: cat.value})}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.category === cat.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <IconComp className={`w-6 h-6 mx-auto mb-1 ${
                          formData.category === cat.value ? 'text-primary-600' : 'text-gray-500'
                        }`} />
                        <p className="text-xs text-center truncate">{cat.value}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                  placeholder="e.g., 800000"
                  className="input-field"
                  min="1"
                  required
                />
              </div>

              {/* Timeline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeline (Months) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.timelineMonths}
                  onChange={(e) => setFormData({...formData, timelineMonths: e.target.value})}
                  placeholder="e.g., 24"
                  className="input-field"
                  min="1"
                  required
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <div className="flex gap-3">
                  {['Low', 'Medium', 'High'].map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setFormData({...formData, priority})}
                      className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                        formData.priority === priority
                          ? priority === 'High' ? 'bg-red-500 text-white'
                            : priority === 'Medium' ? 'bg-yellow-500 text-white'
                            : 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any additional notes..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Create Goal with AI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancePlanner;