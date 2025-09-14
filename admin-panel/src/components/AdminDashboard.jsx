import React, { useState, useEffect } from 'react';
import { 
  Users, Crown, BarChart3, Settings, CheckCircle, XCircle, 
  Clock, AlertTriangle, LogOut, Briefcase, FileText, 
  TrendingUp, Activity, Shield, RefreshCw, MessageSquare 
} from 'lucide-react';
import { supabase, getForumAnalytics, getUserProfiles, getJobPostings, getCandidates } from '../lib/supabase';
import JobManagement from './JobManagement';
import toast from 'react-hot-toast';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [forumStats, setForumStats] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchJobs(),
        fetchCandidates(),
        fetchAuditLogs(),
        fetchForumStats(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getUserProfiles({ limit: 100 });
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const data = await getJobPostings();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const data = await getCandidates({ limit: 50 });
      setCandidates(data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      if (!supabase) return;
      
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const fetchForumStats = async () => {
    try {
      const data = await getForumAnalytics();
      setForumStats(data);
    } catch (error) {
      console.error('Error fetching forum stats:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const userStats = {
        totalUsers: users.length,
        regularUsers: users.filter(u => !u.is_admin && !u.is_moderator).length,
        moderators: users.filter(u => u.is_moderator).length,
        admins: users.filter(u => u.is_admin).length
      };

      const jobStats = {
        totalJobs: jobs.length,
        activeJobs: jobs.filter(j => j.status === 'active').length,
        pausedJobs: jobs.filter(j => j.status === 'paused').length,
        closedJobs: jobs.filter(j => j.status === 'closed').length
      };

      const candidateStats = {
        totalCandidates: candidates.length,
        activeCandidates: candidates.filter(c => c.status === 'active').length,
        hiredCandidates: candidates.filter(c => c.status === 'hired').length
      };

      setStats({
        ...userStats,
        ...jobStats,
        ...candidateStats,
        ...forumStats
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const handleActivateHR = async (userId, planType) => {
    try {
      const plans = {
        basic: { job_quota: 5, screening_quota: 50 },
        pro: { job_quota: 15, screening_quota: 200 },
        enterprise: { job_quota: -1, screening_quota: -1 }
      };

      const plan = plans[planType];
      if (!plan) throw new Error('Invalid plan type');

      const { error } = await supabase
        .from('users')
        .update({
          is_hr: true,
          hr_plan_type: planType,
          hr_verified: true, // Auto-verify for admin activation
          monthly_job_quota: plan.job_quota,
          monthly_screening_quota: plan.screening_quota
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`HR plan activated successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to activate HR plan: ' + error.message);
    }
  };

  const handleRemoveHR = async (userId) => {
    if (!confirm('Remove HR access for this user? This cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_hr: false,
          hr_plan_type: null,
          hr_verified: false,
          monthly_job_quota: 0,
          monthly_screening_quota: 0,
          used_job_quota: 0,
          used_screening_quota: 0
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success('HR access removed successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to remove HR access: ' + error.message);
    }
  };

  const handleResetQuotas = async (userId) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          used_job_quota: 0,
          used_screening_quota: 0
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Quotas reset successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to reset quotas: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Enhanced Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary via-secondary to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Platform Analytics</h1>
                  <p className="text-slate-500 text-sm font-medium">Real-time insights & management</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={fetchAllData}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all duration-200 font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-6">
        {/* Enhanced Navigation Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'jobs', label: 'Jobs', icon: Briefcase },
              { id: 'candidates', label: 'Candidates', icon: FileText },

              { id: 'audit', label: 'Audit', icon: Activity }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <OverviewTab stats={stats} />
        )}

        {activeTab === 'users' && (
          <UsersTab 
            users={users} 
            onActivateHR={handleActivateHR}
            onRemoveHR={handleRemoveHR}
            onResetQuotas={handleResetQuotas}
          />
        )}

        {activeTab === 'jobs' && (
          <JobManagement />
        )}

        {activeTab === 'candidates' && (
          <CandidatesTab candidates={candidates} />
        )}

        {activeTab === 'forum' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Forum Management Removed</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 justify-center">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
                <p className="text-blue-800 font-medium">
                  Forum functionality has been simplified and moved to the main website
                </p>
              </div>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Users can now manage their own posts directly on the main website without complex approval workflows.
            </p>
          </div>
        )}

        {activeTab === 'audit' && (
          <AuditTab auditLogs={auditLogs} />
        )}
      </div>
    </div>
  );
};

const OverviewTab = ({ stats }) => (
  <div className="space-y-6">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatsCard
        title="Total Users"
        value={stats.totalUsers || 0}
        subtitle={`${stats.admins || 0} admins, ${stats.moderators || 0} moderators`}
        icon={Users}
        color="text-blue-600"
      />

      <StatsCard
        title="Job Postings"
        value={stats.totalJobs || 0}
        subtitle={`${stats.activeJobs || 0} active`}
        icon={Briefcase}
        color="text-green-600"
      />
      <StatsCard
        title="Candidates"
        value={stats.totalCandidates || 0}
        subtitle={`${stats.hiredCandidates || 0} hired`}
        icon={FileText}
        color="text-orange-600"
      />
    </div>

    {/* Platform Overview */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-6 text-slate-900">Job Portal Activity</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Active Jobs</span>
            <span className="font-semibold text-green-600">{stats.activeJobs || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Paused Jobs</span>
            <span className="font-semibold text-yellow-600">{stats.pausedJobs || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Total Candidates</span>
            <span className="font-semibold text-slate-900">{stats.totalCandidates || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Hired Candidates</span>
            <span className="font-semibold text-blue-600">{stats.hiredCandidates || 0}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const UsersTab = ({ users, onActivateHR, onRemoveHR, onResetQuotas }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">User Management ({users.length})</h2>
    </div>
    
    <div className="grid gap-4">
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onActivateHR={onActivateHR}
          onRemoveHR={onRemoveHR}
          onResetQuotas={onResetQuotas}
        />
      ))}
    </div>
  </div>
);

const JobsTab = ({ jobs }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Job Management ({jobs.length})</h2>
    </div>
    
    <div className="grid gap-4">
      {jobs.map(job => (
        <div key={job.id} className="bg-white border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{job.title}</h3>
              <p className="text-gray-600">{job.company_name}</p>
              <p className="text-sm text-gray-500">{job.city}, {job.state}</p>
              <p className="text-sm text-gray-500">Posted by: {job.users?.email}</p>
            </div>
            <div className="text-right">
              <StatusBadge status={job.status} />
              <p className="text-sm text-gray-500 mt-1">
                {new Date(job.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CandidatesTab = ({ candidates }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Candidates ({candidates.length})</h2>
    </div>
    
    <div className="grid gap-4">
      {candidates.map(candidate => (
        <div key={candidate.id} className="bg-white border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{candidate.name}</h3>
              <p className="text-gray-600">{candidate.email}</p>
              <p className="text-sm text-gray-500">
                Applied for: {candidate.job_postings?.title}
              </p>
              {candidate.ai_score && (
                <p className="text-sm text-blue-600">AI Score: {candidate.ai_score}/100</p>
              )}
            </div>
            <div className="text-right">
              <StatusBadge status={candidate.hr_status} />
              <p className="text-sm text-gray-500 mt-1">
                {new Date(candidate.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AuditTab = ({ auditLogs }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Audit Logs ({auditLogs.length})</h2>
    </div>
    
    <div className="space-y-2">
      {auditLogs.map(log => (
        <div key={log.id} className="bg-white border rounded p-3 text-sm">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              {log.success ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
              <div>
                <span className="font-medium">{log.user_email}</span>
                <span className="text-gray-600 ml-2">{log.action}</span>
                {log.resource_type && (
                  <span className="text-gray-500 ml-1">({log.resource_type})</span>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(log.created_at).toLocaleString()}
            </div>
          </div>
          {!log.success && log.error_message && (
            <div className="text-red-600 text-xs mt-1">
              Error: {log.error_message}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

const StatsCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
        <p className={`text-3xl font-bold ${color} group-hover:scale-105 transition-transform duration-200`}>{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('-600', '-100')} group-hover:scale-110 transition-transform duration-200`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
    </div>
  </div>
);

const UserCard = ({ user, onActivateHR, onRemoveHR, onResetQuotas }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
          <span className="text-slate-600 font-semibold text-sm">
            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{user.name || 'Unnamed User'}</h3>
          <p className="text-sm text-slate-600">{user.email}</p>
          {user.is_hr && (
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                user.hr_plan_type === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                user.hr_plan_type === 'pro' ? 'bg-blue-100 text-blue-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {user.hr_plan_type?.toUpperCase() || 'NO PLAN'}
              </span>
              {user.hr_verified ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Clock className="w-4 h-4 text-amber-500" />
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="text-right text-sm">
        {user.is_hr ? (
          <div className="space-y-1">
            <div className="text-slate-600 font-medium">Jobs: <span className="text-slate-900">{user.used_job_quota}/{user.monthly_job_quota === -1 ? '∞' : user.monthly_job_quota}</span></div>
            <div className="text-slate-600 font-medium">Screenings: <span className="text-slate-900">{user.used_screening_quota}/{user.monthly_screening_quota === -1 ? '∞' : user.monthly_screening_quota}</span></div>
          </div>
        ) : (
          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">Regular User</span>
        )}
      </div>
    </div>

    <div className="flex gap-2">
      {!user.is_hr ? (
        <HRActivationDropdown
          userId={user.id}
          onActivate={onActivateHR}
        />
      ) : (
        <>
          <button
            onClick={() => onResetQuotas(user.id)}
            className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Reset Quotas
          </button>
          
          <button
            onClick={() => onRemoveHR(user.id)}
            className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            <XCircle className="w-3 h-3" />
            Remove HR
          </button>
        </>
      )}
    </div>
  </div>
);

const HRActivationDropdown = ({ userId, onActivate }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
      >
        <Crown className="w-3 h-3 inline mr-1" />
        Activate HR
      </button>
      
      {showDropdown && (
        <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10">
          <button
            onClick={() => {
              onActivate(userId, 'basic');
              setShowDropdown(false);
            }}
            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
          >
            Basic Plan (₹999/mo)
          </button>
          <button
            onClick={() => {
              onActivate(userId, 'pro');
              setShowDropdown(false);
            }}
            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
          >
            Pro Plan (₹1,999/mo)
          </button>
          <button
            onClick={() => {
              onActivate(userId, 'enterprise');
              setShowDropdown(false);
            }}
            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
          >
            Enterprise Plan (₹3,999/mo)
          </button>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    paused: 'bg-gray-100 text-gray-800',
    closed: 'bg-red-100 text-red-800',
    new: 'bg-blue-100 text-blue-800',
    shortlisted: 'bg-green-100 text-green-800',
    reviewed: 'bg-gray-100 text-gray-800',
    deleted: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status?.toUpperCase()}
    </span>
  );
};

export default AdminDashboard;