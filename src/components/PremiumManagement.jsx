import React, { useState, useEffect } from 'react';
import { Crown, Users, CreditCard, Settings, CheckCircle, X, Edit, Save, Eye, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const PremiumManagement = () => {
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [subscriptions, setSubscriptions] = useState([]);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editConfig, setEditConfig] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, revenue: 0 });

  useEffect(() => {
    loadSubscriptions();
    loadPaymentConfig();
    loadStats();
  }, []);

  const loadSubscriptions = async () => {
    const { data } = await supabase
      .from('premium_subscriptions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setSubscriptions(data);
  };

  const loadStats = async () => {
    const { data } = await supabase
      .from('premium_subscriptions')
      .select('status, amount');
    
    if (data) {
      const total = data.length;
      const active = data.filter(s => s.status === 'active').length;
      const pending = data.filter(s => s.status === 'pending').length;
      const revenue = data.filter(s => s.status === 'active').reduce((sum, s) => sum + (s.amount || 0), 0);
      
      setStats({ total, active, pending, revenue });
    }
  };

  const loadPaymentConfig = async () => {
    const { data } = await supabase
      .from('payment_config')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (data) {
      setPaymentConfig(data);
      setEditConfig(data);
    }
  };

  const updateSubscriptionStatus = async (id, status) => {
    try {
      const updates = { status, updated_at: new Date().toISOString() };
      
      if (status === 'active') {
        updates.starts_at = new Date().toISOString();
        updates.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }

      await supabase
        .from('premium_subscriptions')
        .update(updates)
        .eq('id', id);

      toast.success(`Subscription ${status === 'active' ? 'activated' : 'updated'} successfully`);
      loadSubscriptions();
      loadStats();
    } catch (error) {
      toast.error('Failed to update subscription');
    }
  };

  const deleteSubscription = async (id) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;
    
    try {
      await supabase
        .from('premium_subscriptions')
        .delete()
        .eq('id', id);

      toast.success('Subscription deleted successfully');
      loadSubscriptions();
      loadStats();
    } catch (error) {
      toast.error('Failed to delete subscription');
    }
  };

  const savePaymentConfig = async () => {
    try {
      // Check if config exists, if not create it
      const { data: existing } = await supabase
        .from('payment_config')
        .select('id')
        .eq('id', 1)
        .single();

      const configData = {
        upi_id: editConfig.upi_id,
        monthly_price: editConfig.monthly_price,
        payment_instructions: editConfig.payment_instructions,
        updated_at: new Date().toISOString()
      };

      if (existing) {
        await supabase
          .from('payment_config')
          .update(configData)
          .eq('id', 1);
      } else {
        await supabase
          .from('payment_config')
          .insert({ id: 1, ...configData, created_at: new Date().toISOString() });
      }

      setPaymentConfig(editConfig);
      setIsEditing(false);
      toast.success('Payment configuration updated successfully');
    } catch (error) {
      toast.error('Failed to update configuration');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
          <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Premium Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage subscriptions and payment settings</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Subscriptions</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Active Users</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending Approvals</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">₹{stats.revenue}</div>
          <div className="text-sm text-gray-600">Monthly Revenue</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6 sm:mb-8">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-md font-medium transition-all text-sm sm:text-base ${
            activeTab === 'subscriptions'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Subscriptions</span>
          <span className="sm:hidden">Users</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-md font-medium transition-all text-sm sm:text-base ${
            activeTab === 'settings'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Payment Settings</span>
          <span className="sm:hidden">Settings</span>
        </button>
      </div>

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Premium Subscriptions</h2>
              <p className="text-gray-600 text-sm sm:text-base">Manage user subscriptions and payments</p>
            </div>
            <button
              onClick={() => { loadSubscriptions(); loadStats(); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Expires</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 text-sm break-all">{sub.user_email}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(sub.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-900">₹{sub.amount || 99}</td>
                    <td className="px-3 sm:px-6 py-4">{getStatusBadge(sub.status)}</td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 hidden sm:table-cell">
                      {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        {sub.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateSubscriptionStatus(sub.id, 'active')}
                              className="bg-green-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateSubscriptionStatus(sub.id, 'cancelled')}
                              className="bg-red-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {sub.payment_screenshot_url && (
                          <button
                            onClick={() => setSelectedImage(sub.payment_screenshot_url)}
                            className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-blue-700 flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span className="hidden sm:inline">View</span>
                          </button>
                        )}
                        <button
                          onClick={() => deleteSubscription(sub.id)}
                          className="bg-gray-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-gray-700 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {subscriptions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No subscriptions found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Payment Configuration</h2>
              <p className="text-gray-600 text-sm sm:text-base">Configure UPI details and pricing</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
          
          <div className="p-4 sm:p-6 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editConfig.upi_id || ''}
                    onChange={(e) => setEditConfig({...editConfig, upi_id: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Enter UPI ID"
                  />
                ) : (
                  <div className="bg-gray-50 px-4 py-3 rounded-lg font-mono text-sm break-all">
                    {paymentConfig?.upi_id || 'Not configured'}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Price (₹)</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editConfig.monthly_price || 99}
                    onChange={(e) => setEditConfig({...editConfig, monthly_price: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    min="1"
                  />
                ) : (
                  <div className="bg-gray-50 px-4 py-3 rounded-lg text-sm">
                    ₹{paymentConfig?.monthly_price || 99}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Instructions</label>
              {isEditing ? (
                <textarea
                  value={editConfig.payment_instructions || ''}
                  onChange={(e) => setEditConfig({...editConfig, payment_instructions: e.target.value})}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter payment instructions for users"
                />
              ) : (
                <div className="bg-gray-50 px-4 py-3 rounded-lg text-sm">
                  {paymentConfig?.payment_instructions || 'No instructions configured'}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex justify-end">
                <button
                  onClick={savePaymentConfig}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 text-sm"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Payment Screenshot</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={selectedImage}
              alt="Payment Screenshot"
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumManagement;