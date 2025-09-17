import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Eye, EyeOff, Search, Filter, Calendar, User, AlertTriangle, CheckCircle, XCircle, MoreHorizontal, Edit2, Pin, Flag, TrendingUp, Users, Clock, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const ForumModeration = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    flagged: 0,
    today: 0
  });

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      if (!supabase) {
        // Load local posts from localStorage only
        const localPosts = JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
        setPosts(localPosts);
        setLoading(false);
        return;
      }

      // Fetch from database - NO FILTERS, NO DEMO POSTS, NO JOINS
      const { data, error } = await supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        // Fallback to local posts only
        const localPosts = JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
        setPosts(localPosts);
      } else {
        // Combine database posts with local posts (NO DEMO POSTS)
        const localPosts = JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
        const allPosts = [...(data || []), ...localPosts];
        setPosts(allPosts);
      }
    } catch (error) {
      console.error('Error in fetchPosts:', error);
      // Fallback to empty array - NO DEMO POSTS
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (!supabase) {
        // Calculate stats from actual posts
        const localPosts = JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
        const today = new Date().toISOString().split('T')[0];
        setStats({
          total: localPosts.length,
          active: localPosts.filter(p => p.status === 'active').length,
          flagged: localPosts.filter(p => p.is_flagged).length,
          today: localPosts.filter(p => p.created_at.startsWith(today)).length
        });
        return;
      }

      const [totalResult, activeResult, flaggedResult, todayResult] = await Promise.all([
        supabase.from('forum_posts').select('id', { count: 'exact', head: true }),
        supabase.from('forum_posts').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('forum_posts').select('id', { count: 'exact', head: true }).eq('is_flagged', true),
        supabase.from('forum_posts').select('id', { count: 'exact', head: true }).gte('created_at', today)
      ]);

      setStats({
        total: totalResult.count || 0,
        active: activeResult.count || 0,
        flagged: flaggedResult.count || 0,
        today: todayResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({ total: 0, active: 0, flagged: 0, today: 0 });
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      // Delete from database first (for UUID posts)
      if (supabase && !postId.startsWith('local-') && !postId.startsWith('demo-')) {
        const { error } = await supabase
          .from('forum_posts')
          .delete()
          .eq('id', postId);
        
        if (error) {
          console.error('Database delete error:', error);
          toast.error('Failed to delete from database');
          return;
        }
      }
      
      // Delete from localStorage (for local posts)
      if (postId.startsWith('local-') || postId.startsWith('demo-')) {
        const localPosts = JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
        const updatedPosts = localPosts.filter(post => post.id !== postId);
        localStorage.setItem('local_forum_posts', JSON.stringify(updatedPosts));
        
        // Trigger storage event to notify user-side
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'local_forum_posts',
          newValue: JSON.stringify(updatedPosts),
          oldValue: JSON.stringify(localPosts)
        }));
      }
      
      // Trigger custom event for same-tab communication
      window.dispatchEvent(new CustomEvent('postsUpdated', { detail: { deletedPostId: postId } }));

      // Remove from UI
      setPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Post deleted successfully');
      fetchStats();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleTogglePostStatus = async (postId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'hidden' : 'active';
      
      if (postId.startsWith('demo-') || postId.startsWith('local-')) {
        setPosts(prev => prev.map(post => 
          post.id === postId ? { ...post, status: newStatus } : post
        ));
        toast.success(`Post ${newStatus === 'active' ? 'activated' : 'hidden'}`);
        return;
      }

      if (!supabase) {
        toast.error('Cannot update: Database not available');
        return;
      }

      const { error } = await supabase
        .from('forum_posts')
        .update({ status: newStatus })
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, status: newStatus } : post
      ));
      
      toast.success(`Post ${newStatus === 'active' ? 'activated' : 'hidden'}`);
      fetchStats();
    } catch (error) {
      console.error('Error updating post status:', error);
      toast.error('Failed to update post status');
    }
  };

  const clearAllUserPosts = async () => {
    if (!confirm('This will delete ALL posts from both database and user localStorage. Are you sure?')) {
      return;
    }

    try {
      // Clear localStorage and set flag
      localStorage.removeItem('local_forum_posts');
      localStorage.setItem('posts_cleared_by_admin', Date.now().toString());
      
      // Delete all from database
      if (supabase) {
        const { error } = await supabase
          .from('forum_posts')
          .delete()
          .neq('id', 'impossible-id');
        
        if (error) {
          console.error('Database clear error:', error);
        }
      }
      
      // Trigger custom event
      window.dispatchEvent(new CustomEvent('postsUpdated', { detail: { action: 'clearAll' } }));

      setPosts([]);
      setSelectedPosts(new Set());
      toast.success('All posts cleared');
      fetchStats();
    } catch (error) {
      console.error('Error clearing all posts:', error);
      toast.error('Failed to clear all posts');
    }
  };

  const forceResetAllPosts = async () => {
    if (!confirm('FORCE RESET: This will completely reset all posts and clear all user localStorage. This action cannot be undone!')) {
      return;
    }

    try {
      // Set multiple flags to ensure cleanup
      const clearTimestamp = Date.now();
      localStorage.setItem('posts_cleared_by_admin', clearTimestamp.toString());
      localStorage.setItem('force_clear_posts', 'true');
      localStorage.removeItem('local_forum_posts');
      
      // Delete all from database
      if (supabase) {
        const { error } = await supabase
          .from('forum_posts')
          .delete()
          .neq('id', 'impossible-id');
        
        if (error) {
          console.error('Database clear error:', error);
        }
      }
      
      // Trigger custom event for immediate cleanup
      window.dispatchEvent(new CustomEvent('postsUpdated', { detail: { action: 'forceReset' } }));
      
      setPosts([]);
      setSelectedPosts(new Set());
      toast.success('Force reset completed - all posts cleared immediately');
      fetchStats();
    } catch (error) {
      console.error('Error in force reset:', error);
      toast.error('Failed to force reset posts');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.size === 0) {
      toast.error('No posts selected');
      return;
    }

    try {
      const postIds = Array.from(selectedPosts);
      
      // Delete ALL posts from localStorage (user-side)
      const localPosts = JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
      const updatedPosts = localPosts.filter(post => !postIds.includes(post.id));
      localStorage.setItem('local_forum_posts', JSON.stringify(updatedPosts));
      
      // Trigger storage event to notify user-side
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'local_forum_posts',
        newValue: JSON.stringify(updatedPosts),
        oldValue: JSON.stringify(localPosts)
      }));

      // Delete from database
      const dbPostIds = postIds.filter(id => !id.startsWith('demo-') && !id.startsWith('local-'));
      if (dbPostIds.length > 0 && supabase) {
        const { error } = await supabase
          .from('forum_posts')
          .delete()
          .in('id', dbPostIds);
        
        if (error) {
          console.error('Database bulk delete error:', error);
        }
      }

      setPosts(prev => prev.filter(post => !selectedPosts.has(post.id)));
      setSelectedPosts(new Set());
      toast.success(`${postIds.length} posts deleted from both admin and user side`);
      fetchStats();
    } catch (error) {
      console.error('Error bulk deleting posts:', error);
      toast.error('Failed to delete some posts');
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && post.status === 'active') ||
      (filterStatus === 'hidden' && post.status === 'hidden') ||
      (filterStatus === 'flagged' && post.is_flagged);
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#0057B7] to-[#FF6600] rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            Forum Post Management
          </h2>
          <p className="text-gray-600 mt-1">Monitor and manage community posts</p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-orange-50 px-4 py-2 rounded-lg border border-blue-200">
          <span className="text-sm font-semibold text-blue-700">🛡️ Admin Control Panel</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Posts</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Flagged Posts</p>
              <p className="text-2xl font-bold text-red-600">{stats.flagged}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Flag className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Posts</p>
              <p className="text-2xl font-bold text-[#FF6600]">{stats.today}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#FF6600]" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search posts by title, content, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0057B7] focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0057B7] focus:border-transparent"
            >
              <option value="all">All Posts</option>
              <option value="active">Active Posts</option>
              <option value="hidden">Hidden Posts</option>
              <option value="flagged">Flagged Posts</option>
            </select>
          </div>

          <div className="flex gap-2">
            {selectedPosts.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedPosts.size})
              </button>
            )}
            <button
              onClick={clearAllUserPosts}
              className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Posts
            </button>
            <button
              onClick={forceResetAllPosts}
              className="px-4 py-3 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Force Reset
            </button>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0057B7] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Posts Found</h3>
            <p className="text-gray-600">No posts match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedPosts.size === filteredPosts.length && filteredPosts.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPosts(new Set(filteredPosts.map(p => p.id)));
                        } else {
                          setSelectedPosts(new Set());
                        }
                      }}
                      className="rounded border-gray-300 text-[#0057B7] focus:ring-[#0057B7]"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Post Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engagement
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedPosts.has(post.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedPosts);
                          if (e.target.checked) {
                            newSelected.add(post.id);
                          } else {
                            newSelected.delete(post.id);
                          }
                          setSelectedPosts(newSelected);
                        }}
                        className="rounded border-gray-300 text-[#0057B7] focus:ring-[#0057B7]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className={expandedPosts.has(post.id) ? 'max-w-2xl' : 'max-w-xs'}>
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {post.title}
                        </h4>
                        
                        {/* Post Image */}
                        {post.image_url && expandedPosts.has(post.id) && (
                          <div className="mt-2 mb-3">
                            <img
                              src={post.image_url}
                              alt="Post image"
                              className="w-full max-w-md h-32 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        )}
                        
                        {/* Post Content */}
                        <p className={`text-sm text-gray-600 mt-1 ${
                          expandedPosts.has(post.id) ? '' : 'truncate'
                        }`} style={{
                          display: expandedPosts.has(post.id) ? 'block' : '-webkit-box',
                          WebkitLineClamp: expandedPosts.has(post.id) ? 'unset' : 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: expandedPosts.has(post.id) ? 'visible' : 'hidden'
                        }}>
                          {post.content}
                        </p>
                        
                        {/* View More/Less Button */}
                        {post.content && post.content.length > 100 && (
                          <button
                            onClick={() => {
                              setExpandedPosts(prev => {
                                const newSet = new Set(prev);
                                if (newSet.has(post.id)) {
                                  newSet.delete(post.id);
                                } else {
                                  newSet.add(post.id);
                                }
                                return newSet;
                              });
                            }}
                            className="text-[#0057B7] hover:text-[#FF6600] text-xs font-medium mt-1 transition-colors inline-block"
                          >
                            {expandedPosts.has(post.id) ? 'View Less' : 'View More'}
                          </button>
                        )}
                        
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {post.category_name || 'General'}
                          </span>
                          {post.image_url && !expandedPosts.has(post.id) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">
                              📷 Has Image
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#0057B7] to-[#FF6600] rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {(post.author_name || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {post.user_profiles?.full_name || post.author_name || 'Anonymous'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {post.user_profiles?.email || post.user_email || 'No email'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{post.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.replies_count || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          post.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {post.status === 'active' ? 'Active' : 'Hidden'}
                        </span>
                        {post.is_flagged && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Flagged
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(post.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePostStatus(post.id, post.status)}
                          className={`p-2 rounded-lg transition-colors ${
                            post.status === 'active'
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={post.status === 'active' ? 'Hide post' : 'Show post'}
                        >
                          {post.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setPostToDelete(post);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && postToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Post</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-1">{postToDelete.title}</h4>
              <p className="text-sm text-gray-600 line-clamp-2">{postToDelete.content}</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPostToDelete(null);
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeletePost(postToDelete.id);
                  setShowDeleteModal(false);
                  setPostToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumModeration;