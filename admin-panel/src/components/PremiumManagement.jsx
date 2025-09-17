import React, { useState, useEffect } from 'react';
import { Crown, Settings, Users, Activity, CheckCircle, XCircle, Clock, Edit3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const PremiumManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [requests, setRequests] = useState([]);
  const [premiumUsers, setPremiumUsers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeUsers: 0,
    pendingRequests: 0,
    expiredUsers: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      if (!supabase) {
        toast.error('Database not configured');
        return;
      }

      const [configResult, requestsResult, usersResult, logsResult] = await Promise.all([
        supabase.from('payment_config').select('*').single(),
        supabase.from('payment_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('premium_users').select('*').order('created_at', { ascending: false }),
        supabase.from('premium_activity_logs').select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      if (configResult.data) setPaymentConfig(configResult.data);
      if (requestsResult.data) {
        setRequests(requestsResult.data);
        calculateStats(requestsResult.data, usersResult.data || []);
      }
      if (usersResult.data) setPremiumUsers(usersResult.data);
      if (logsResult.data) setActivityLogs(logsResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (requests, users) => {
    const now = new Date();
    const stats = {
      totalRequests: requests.length,
      activeUsers: users.filter(u => new Date(u.expires_at) > now).length,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
      expiredUsers: users.filter(u => new Date(u.expires_at) <= now).length
    };
    setStats(stats);
  };

  const updatePaymentConfig = async (config) => {
    try {
      const { error } = await supabase
        .from('payment_config')
        .update({ ...config, updated_at: new Date().toISOString() })
        .eq('id', 1);

      if (error) throw error;
      setPaymentConfig({ ...paymentConfig, ...config });
      toast.success('Payment configuration updated');
    } catch (error) {
      console.error('Error updating config:', error);
      toast.error('Failed to update configuration');
    }
  };

  const approveRequest = async (requestId, userEmail, userName) => {
    try {
      // Update request status
      await supabase.from('payment_requests')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      // Create premium user
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await supabase.from('premium_users').insert({
        user_email: userEmail,
        user_name: userName,
        expires_at: expiresAt,
        approved_by: 'admin'
      });

      // Log activity
      await supabase.from('premium_activity_logs').insert({
        user_email: userEmail,
        action: 'request_approved',
        performed_by: 'admin',
        details: { expires_at: expiresAt }
      });

      loadData();
      toast.success('Premium access granted successfully');
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const rejectRequest = async (requestId, userEmail) => {
    try {
      await supabase.from('payment_requests')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      await supabase.from('premium_activity_logs').insert({
        user_email: userEmail,
        action: 'request_rejected',
        performed_by: 'admin',
        details: {}
      });

      loadData();
      toast.success('Request rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const extendAccess = async (userEmail, userName) => {
    try {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      await supabase.from('premium_users')
        .update({ expires_at: expiresAt, updated_at: new Date().toISOString() })
        .eq('user_email', userEmail);

      await supabase.from('premium_activity_logs').insert({
        user_email: userEmail,
        action: 'access_extended',
        performed_by: 'admin',
        details: { new_expires_at: expiresAt }
      });

      loadData();
      toast.success('Premium access extended');
    } catch (error) {
      console.error('Error extending access:', error);
      toast.error('Failed to extend access');
    }
  };

  const revokeAccess = async (userEmail) => {
    try {
      await supabase.from('premium_users')
        .delete()
        .eq('user_email', userEmail);

      await supabase.from('premium_activity_logs').insert({
        user_email: userEmail,
        action: 'access_revoked',
        performed_by: 'admin',
        details: {}
      });

      loadData();
      toast.success('Premium access revoked');
    } catch (error) {
      console.error('Error revoking access:', error);
      toast.error('Failed to revoke access');
    }
  };

  const PaymentConfigTab = () => {
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState(paymentConfig || {});

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Payment Configuration
            </h3>
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                <input
                  type="text"
                  value={formData.upi_id || ''}
                  onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Price (₹)</label>
                <input
                  type="number"
                  value={formData.monthly_price || ''}
                  onChange={(e) => setFormData({ ...formData, monthly_price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    updatePaymentConfig(formData);
                    setEditing(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setFormData(paymentConfig);
                    setEditing(false);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  {paymentConfig?.upi_id || 'Not configured'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Price</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  ₹{paymentConfig?.monthly_price || 0}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const RequestsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Premium Requests</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {requests.filter(r => r.status === 'pending').map((req) => (
            <div key={req.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{req.user_name}</h4>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Email: {req.user_email}</p>
                    <p>Phone: {req.user_phone}</p>
                    <p>Transaction ID: {req.transaction_id}</p>
                    <p>Submitted: {new Date(req.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveRequest(req.id, req.user_email, req.user_name)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectRequest(req.id, req.user_email)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const UsersTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Premium Users</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {premiumUsers.map((user) => {
            const isExpired = new Date(user.expires_at) <= new Date();
            return (
              <div key={user.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">{user.user_name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {isExpired ? 'Expired' : 'Active'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Email: {user.user_email}</p>
                      <p>Expires: {new Date(user.expires_at).toLocaleDateString()}</p>
                      <p>Approved: {new Date(user.approved_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => extendAccess(user.user_email, user.user_name)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Extend
                    </button>
                    <button
                      onClick={() => revokeAccess(user.user_email)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading premium management...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Crown className="w-8 h-8 text-yellow-500" />
            Premium Management
          </h3>
          <p className="text-gray-600 mt-1">Manage AI Resume Builder premium subscriptions</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Requests</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalRequests}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Active Users</p>
              <p className="text-2xl font-bold text-green-900">{stats.activeUsers}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pendingRequests}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Expired</p>
              <p className="text-2xl font-bold text-red-900">{stats.expiredUsers}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Overview', icon: Crown },
          { id: 'requests', label: 'Requests', icon: Clock },
          { id: 'users', label: 'Premium Users', icon: Users },
          { id: 'config', label: 'Payment Config', icon: Settings },
          { id: 'activity', label: 'Activity Logs', icon: Activity }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'config' && <PaymentConfigTab />}
      {activeTab === 'requests' && <RequestsTab />}
      {activeTab === 'users' && <UsersTab />}
      
      {activeTab === 'activity' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Activity Logs</h3>
          <div className="space-y-3">
            {activityLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{log.action.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-gray-600">by {log.performed_by}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumManagement;