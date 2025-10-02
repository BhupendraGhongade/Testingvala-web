import React, { useState, useEffect } from 'react';
import { Users, Activity, Mail, TrendingUp, Filter, Download, RefreshCw, Building, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';


const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    module: 'all',
    action: 'all',
    email: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadRecentActivity()
      ]);
    } catch (error) {
      console.error('Dashboard load error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_stats');
      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Stats load error:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      let query = supabase
        .from('user_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply filters
      if (filters.module !== 'all') {
        query = query.eq('module', filters.module);
      }
      if (filters.action !== 'all') {
        query = query.eq('action_type', filters.action);
      }
      if (filters.email) {
        query = query.ilike('email', `%${filters.email}%`);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo + 'T23:59:59');
      }

      const { data, error } = await query;
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Activity load error:', error);
    }
  };

  const exportData = async () => {
    try {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      const csv = [
        'Email,Module,Action,Resource ID,Timestamp,Metadata',
        ...data.map(row => [
          row.email,
          row.module,
          row.action_type,
          row.resource_id || '',
          row.created_at,
          JSON.stringify(row.metadata || {})
        ].join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Activity log exported');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    }
  };

  const getModuleColor = (module) => {
    const colors = {
      resume: 'bg-blue-100 text-blue-800',
      board: 'bg-green-100 text-green-800',
      community: 'bg-purple-100 text-purple-800',
      events: 'bg-orange-100 text-orange-800',
      auth: 'bg-gray-100 text-gray-800'
    };
    return colors[module] || 'bg-gray-100 text-gray-800';
  };

  const getActionIcon = (action) => {
    const icons = {
      create: '➕',
      edit: '✏️',
      delete: '🗑️',
      like: '❤️',
      comment: '💬',
      pin: '📌',
      view: '👁️',
      click: '🖱️',
      download: '⬇️',
      login: '🔐',
      logout: '🚪',
      magic_link_request: '✉️'
    };
    return icons[action] || '📝';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Monitor user activity and manage platform operations</p>
          </div>
          {activeTab === 'overview' && (
            <div className="flex gap-3">
              <button
                onClick={loadDashboardData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            Overview & Activity
          </button>
          <button
            onClick={() => setActiveTab('partnerships')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'partnerships'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building className="w-4 h-4" />
            Partnership Inquiries
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'events'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Events Management
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold">{stats.total_users}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-3">
                    <Mail className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Verified Users</p>
                      <p className="text-2xl font-bold">{stats.verified_users}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Users Today</p>
                      <p className="text-2xl font-bold">{stats.users_today}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-3">
                    <Activity className="w-8 h-8 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Active (7d)</p>
                      <p className="text-2xl font-bold">{stats.active_users_7d}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold">Filters</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <select
                  value={filters.module}
                  onChange={(e) => setFilters(prev => ({ ...prev, module: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Modules</option>
                  <option value="resume">Resume Builder</option>
                  <option value="board">Boards</option>
                  <option value="community">Community</option>
                  <option value="events">Events</option>
                  <option value="auth">Authentication</option>
                </select>

                <select
                  value={filters.action}
                  onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Actions</option>
                  <option value="create">Create</option>
                  <option value="edit">Edit</option>
                  <option value="like">Like</option>
                  <option value="comment">Comment</option>
                  <option value="view">View</option>
                  <option value="download">Download</option>
                </select>

                <input
                  type="email"
                  placeholder="Filter by email"
                  value={filters.email}
                  onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />

                <button
                  onClick={loadRecentActivity}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <p className="text-gray-600">Latest user actions across all modules</p>
              </div>

              <div className="divide-y">
                {activities.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No activity found matching your filters
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getActionIcon(activity.action_type)}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{activity.email}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${getModuleColor(activity.module)}`}>
                                {activity.module}
                              </span>
                              <span className="text-gray-600">{activity.action_type}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {activity.resource_id && `Resource: ${activity.resource_id}`}
                              {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                                <span className="ml-2">
                                  {Object.entries(activity.metadata).map(([key, value]) => (
                                    <span key={key} className="mr-2">
                                      {key}: {typeof value === 'string' ? value : JSON.stringify(value)}
                                    </span>
                                  ))}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(activity.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'partnerships' && (
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Partnership Management</h3>
            <p className="text-gray-600">Partnership inquiries are managed in the dedicated admin panel.</p>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Events Management</h3>
            <p className="text-gray-600">Events management functionality coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;