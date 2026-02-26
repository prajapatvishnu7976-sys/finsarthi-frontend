import React, { useState, useEffect } from 'react';
import { Building2, TrendingUp, Shield, Percent, Calendar, ExternalLink, Search, Filter } from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';
import { schemesAPI } from '../services/api';

const Schemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBank, setFilterBank] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedScheme, setSelectedScheme] = useState(null);

  useEffect(() => {
    fetchSchemes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [schemes, searchTerm, filterBank, filterCategory]);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const response = await schemesAPI.getAll();
      if (response.data.success) {
        setSchemes(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...schemes];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(scheme =>
        scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Bank filter
    if (filterBank !== 'all') {
      filtered = filtered.filter(scheme => scheme.bank === filterBank);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(scheme => scheme.category === filterCategory);
    }

    setFilteredSchemes(filtered);
  };

  const banks = [...new Set(schemes.map(s => s.bank))];
  const categories = [...new Set(schemes.map(s => s.category))];

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading schemes...</p>
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
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-12 h-12" />
              <div>
                <h1 className="text-4xl font-bold">Finance Schemes Hub</h1>
                <p className="text-white/80 mt-2 text-lg">
                  Explore government and banking schemes to maximize your savings
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8" />
                  <div>
                    <p className="text-2xl font-bold">{schemes.length}</p>
                    <p className="text-sm text-white/80">Total Schemes</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Building2 className="w-8 h-8" />
                  <div>
                    <p className="text-2xl font-bold">{banks.length}</p>
                    <p className="text-sm text-white/80">Banks & Institutions</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8" />
                  <div>
                    <p className="text-2xl font-bold">{categories.length}</p>
                    <p className="text-sm text-white/80">Categories</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-4 z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search schemes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>

              {/* Bank Filter */}
              <select
                value={filterBank}
                onChange={(e) => setFilterBank(e.target.value)}
                className="input-field"
              >
                <option value="all">All Banks</option>
                {banks.map(bank => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input-field"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Schemes Grid */}
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            {filteredSchemes.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Schemes Found</h3>
                <p className="text-gray-600">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSchemes.map(scheme => (
                  <div
                    key={scheme.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => setSelectedScheme(scheme)}
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-primary-500 to-purple-500 p-6 text-white">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-4xl">{scheme.icon}</span>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                          {scheme.bank}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold leading-tight">{scheme.name}</h3>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {scheme.description}
                      </p>

                      <div className="space-y-3">
                        {/* Interest Rate */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Percent className="w-4 h-4" />
                            <span className="text-sm">Interest</span>
                          </div>
                          <span className="font-semibold text-green-600">{scheme.interest}</span>
                        </div>

                        {/* Tenure */}
                        {scheme.tenure && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">Tenure</span>
                            </div>
                            <span className="font-semibold text-gray-900">{scheme.tenure}</span>
                          </div>
                        )}

                        {/* Category */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Filter className="w-4 h-4" />
                            <span className="text-sm">Category</span>
                          </div>
                          <span className="text-sm font-medium text-primary-600">{scheme.category}</span>
                        </div>

                        {/* Min/Max Deposit */}
                        {scheme.minDeposit && (
                          <div className="bg-gray-50 rounded-lg p-3 mt-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Min Deposit:</span>
                              <span className="font-semibold text-gray-900">₹{scheme.minDeposit.toLocaleString('en-IN')}</span>
                            </div>
                            {scheme.maxDeposit && (
                              <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-600">Max Deposit:</span>
                                <span className="font-semibold text-gray-900">₹{scheme.maxDeposit.toLocaleString('en-IN')}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* View Details Button */}
                      <button className="w-full mt-4 py-2 px-4 bg-primary-50 text-primary-600 rounded-lg font-medium hover:bg-primary-100 transition-colors flex items-center justify-center gap-2">
                        View Details
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-purple-600 text-white px-8 py-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <span className="text-5xl">{selectedScheme.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedScheme.name}</h2>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                        {selectedScheme.bank}
                      </span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                        {selectedScheme.category}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedScheme(null)}
                  className="text-white/80 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Scheme</h3>
                <p className="text-gray-700 leading-relaxed">{selectedScheme.description}</p>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-700 mb-1">Interest Rate</p>
                  <p className="text-2xl font-bold text-green-600">{selectedScheme.interest}</p>
                </div>
                {selectedScheme.tenure && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-700 mb-1">Tenure</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedScheme.tenure}</p>
                  </div>
                )}
                {selectedScheme.minDeposit && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <p className="text-sm text-purple-700 mb-1">Min Deposit</p>
                    <p className="text-2xl font-bold text-purple-600">₹{selectedScheme.minDeposit.toLocaleString('en-IN')}</p>
                  </div>
                )}
                {selectedScheme.maxDeposit && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <p className="text-sm text-orange-700 mb-1">Max Deposit</p>
                    <p className="text-2xl font-bold text-orange-600">₹{selectedScheme.maxDeposit.toLocaleString('en-IN')}</p>
                  </div>
                )}
              </div>

              {/* Features */}
              {selectedScheme.features && selectedScheme.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
                  <ul className="space-y-2">
                    {selectedScheme.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-green-500 text-xl">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tax Benefit */}
              {selectedScheme.taxBenefit && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">💰 Tax Benefit</h4>
                  <p className="text-gray-700">{selectedScheme.taxBenefit}</p>
                </div>
              )}

              {/* Eligibility */}
              {selectedScheme.eligibility && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Eligibility</h3>
                  <p className="text-gray-700">{selectedScheme.eligibility}</p>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex gap-4">
                {selectedScheme.link && (
                  <a
                    href={selectedScheme.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    Visit Official Website
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
                <button
                  onClick={() => setSelectedScheme(null)}
                  className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schemes;