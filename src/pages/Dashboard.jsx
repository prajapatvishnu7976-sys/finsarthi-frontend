import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  MessageSquare,
  Target,
  Award
} from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';
import AddExpenseModal from '../components/Expense/AddExpenseModal';
import { analyticsAPI, expenseAPI } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    savings: 0,
    savingsRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [finScore, setFinScore] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const analyticsRes = await analyticsAPI.getDashboard();
      
      if (analyticsRes.data.success) {
        const data = analyticsRes.data.data;
        setStats(data);
        
        const categories = data.categoryBreakdown || [];
        setCategoryData(categories);
        
        calculateFinScore(data);
      }
      
      const expensesRes = await expenseAPI.getAll({ limit: 5, sort: '-date' });
      if (expensesRes.data.success) {
        setRecentTransactions(expensesRes.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFinScore = (data) => {
    const { totalIncome, totalExpense, savingsRate } = data;
    
    let score = 50;
    
    if (savingsRate >= 30) score += 40;
    else if (savingsRate >= 20) score += 30;
    else if (savingsRate >= 10) score += 20;
    else if (savingsRate >= 0) score += 10;
    else score -= 10;
    
    const spendingRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 100;
    if (spendingRatio < 50) score += 30;
    else if (spendingRatio < 60) score += 25;
    else if (spendingRatio < 70) score += 20;
    else if (spendingRatio < 80) score += 10;
    else if (spendingRatio < 90) score += 5;
    else score -= 10;
    
    score = Math.min(100, Math.max(0, Math.round(score)));
    
    let status, color, emoji, message;
    if (score >= 80) {
      status = 'Excellent';
      color = '#10B981';
      emoji = '🌟';
      message = 'Your finances are in great shape!';
    } else if (score >= 60) {
      status = 'Good';
      color = '#3B82F6';
      emoji = '😊';
      message = 'You\'re managing well, keep it up!';
    } else if (score >= 40) {
      status = 'Fair';
      color = '#F59E0B';
      emoji = '😐';
      message = 'Room for improvement. Try saving more.';
    } else {
      status = 'Critical';
      color = '#EF4444';
      emoji = '😟';
      message = 'Attention needed! Review your spending.';
    }
    
    setFinScore({ score, status, color, emoji, message, spendingRatio: Math.round(spendingRatio) });
  };

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's your financial overview.</p>
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Expense
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Fin-Score & Stats Row */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Fin-Score Widget */}
            {finScore && (
              <div className="lg:col-span-1">
                <div 
                  className="card h-full relative overflow-hidden"
                  style={{ 
                    background: `linear-gradient(135deg, ${finScore.color}15 0%, ${finScore.color}05 100%)`,
                    borderColor: finScore.color,
                    borderWidth: '2px'
                  }}
                >
                  <div className="text-center">
                    <p className="text-gray-600 text-sm font-medium mb-2">Your Fin-Score</p>
                    <div className="relative inline-block">
                      <div 
                        className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-3"
                        style={{ 
                          background: `conic-gradient(${finScore.color} ${finScore.score * 3.6}deg, #e5e7eb ${finScore.score * 3.6}deg)`,
                        }}
                      >
                        <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center">
                          <span className="text-3xl">{finScore.emoji}</span>
                          <span className="text-2xl font-bold" style={{ color: finScore.color }}>
                            {finScore.score}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-lg font-bold" style={{ color: finScore.color }}>
                      {finScore.status}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{finScore.message}</p>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Savings Rate</span>
                        <span className="font-medium" style={{ color: stats.savingsRate >= 20 ? '#10B981' : '#F59E0B' }}>
                          {stats.savingsRate}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-gray-500">Spent</span>
                        <span className="font-medium text-red-600">{finScore.spendingRatio}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Income Card */}
              <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-green-700 font-medium">Total Income</p>
                    <h3 className="text-2xl font-bold text-green-900 mt-2">
                      ₹{stats.totalIncome?.toLocaleString('en-IN') || 0}
                    </h3>
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4" />
                      This month
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Expense Card */}
              <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-red-700 font-medium">Total Expense</p>
                    <h3 className="text-2xl font-bold text-red-900 mt-2">
                      ₹{stats.totalExpense?.toLocaleString('en-IN') || 0}
                    </h3>
                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                      <ArrowDownRight className="w-4 h-4" />
                      This month
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Savings Card */}
              <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Savings</p>
                    <h3 className="text-2xl font-bold text-blue-900 mt-2">
                      ₹{stats.savings?.toLocaleString('en-IN') || 0}
                    </h3>
                    <p className="text-xs text-blue-600 mt-2">
                      {stats.savingsRate || 0}% of income
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="card hover:shadow-lg transition-shadow cursor-pointer flex items-center gap-3 p-4"
            >
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Smart Add</p>
                <p className="text-xs text-gray-500">Natural language</p>
              </div>
            </button>
            
            <a
              href="/chatbot"
              className="card hover:shadow-lg transition-shadow cursor-pointer flex items-center gap-3 p-4"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Ask FinBot</p>
                <p className="text-xs text-gray-500">Get AI advice</p>
              </div>
            </a>
            
            <a
              href="/planner"
              className="card hover:shadow-lg transition-shadow cursor-pointer flex items-center gap-3 p-4"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Plan Goals</p>
                <p className="text-xs text-gray-500">Future planning</p>
              </div>
            </a>
            
            <a
              href="/academy"
              className="card hover:shadow-lg transition-shadow cursor-pointer flex items-center gap-3 p-4"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Learn & Earn</p>
                <p className="text-xs text-gray-500">Earn points</p>
              </div>
            </a>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Category Breakdown */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense by Category</h3>
              {categoryData && categoryData.length > 0 ? (
                <div>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {categoryData.map((cat, index) => (
                      <div key={cat.name} className="flex items-center gap-2 text-sm">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-gray-700 truncate">{cat.name}</span>
                        <span className="text-gray-500 ml-auto text-xs">₹{cat.value.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-gray-500">
                  <p className="text-lg mb-2">No expense data available</p>
                  <p className="text-sm">Add some expenses to see breakdown</p>
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-4 btn-primary"
                  >
                    Add First Expense
                  </button>
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
              {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <IndianRupee className={`w-5 h-5 ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-xs text-gray-500">
                            {transaction.category} • {new Date(transaction.date).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <span className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-gray-500">
                  <p className="text-lg mb-2">No transactions yet</p>
                  <p className="text-sm">Add your first expense!</p>
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-4 btn-primary"
                  >
                    Add Expense
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
};

export default Dashboard;