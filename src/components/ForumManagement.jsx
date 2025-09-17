import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Filter, Trash2, Edit2, Eye, EyeOff, MessageSquare, Heart, Calendar, User, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ForumManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    reported: 0
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          user_profiles(username, full_name, email),
          forum_categories(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPosts(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const active = total;
      const reported = data?.filter(p => p.reported_count > 0).length || 0;
      
      setStats({ total, active, reported });
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };



  const deletePost = async (postId) => {
    if (!confirm('Are you sure you want to permanently delete this post?')) return;
    
    try {
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Post deleted permanently');
      fetchPosts(); // Refresh stats
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const bulkDelete = async () => {
    if (selectedPosts.size === 0) {
      toast.error('No posts selected');
      return;
    }

    if (!confirm(`Delete ${selectedPosts.size} selected posts permanently?`)) return;

    try {
      const postIds = Array.from(selectedPosts);
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .in('id', postIds);

      if (error) throw error;

      setPosts(prev => prev.filter(post => !selectedPosts.has(post.id)));
      setSelectedPosts(new Set());
      toast.success(`${postIds.length} posts deleted`);
      fetchPosts();
    } catch (error) {
      console.error('Error bulk deleting posts:', error);
      toast.error('Failed to delete posts');
    }
  };

  const filteredPosts = posts.filter(post => {
    return post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
           post.user_profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const togglePostSelection = (postId) => {
    setSelectedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const selectAllPosts = () => {
    if (selectedPosts.size === filteredPosts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(filteredPosts.map(p => p.id)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6600]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Forum Management</h3>
        <button
          onClick={fetchPosts}
          className="px-4 py-2 bg-[#FF6600] text-white rounded-lg hover:bg-[#E55A00] transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
              <div className="text-sm text-blue-700">Total Posts</div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-900">{stats.active}</div>
              <div className="text-sm text-green-700">Active Posts</div>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <div className="text-2xl font-bold text-red-900">{stats.reported}</div>
              <div className="text-sm text-red-700">Reported Posts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search posts, content, or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
              />
            </div>
          </div>
          

        </div>

        {/* Bulk Actions */}
        {selectedPosts.size > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedPosts.size} post{selectedPosts.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={bulkDelete}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Posts Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedPosts.size === filteredPosts.length && filteredPosts.length > 0}
                    onChange={selectAllPosts}
                    className="rounded border-gray-300 text-[#FF6600] focus:ring-[#FF6600]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Post</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Author</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>

                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Engagement</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No posts found
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedPosts.has(post.id)}
                        onChange={() => togglePostSelection(post.id)}
                        className="rounded border-gray-300 text-[#FF6600] focus:ring-[#FF6600]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <div className="font-medium text-gray-900 truncate">{post.title}</div>
                        <div className="text-sm text-gray-500 truncate">{post.content}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {post.user_profiles?.full_name || post.user_profiles?.username || 'Anonymous'}
                          </div>
                          <div className="text-xs text-gray-500">{post.user_profiles?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {post.forum_categories?.name || 'Uncategorized'}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {post.likes_count || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {post.replies_count || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => deletePost(post.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-500 text-center">
        Showing {filteredPosts.length} of {posts.length} posts
      </div>
    </div>
  );
};

export default ForumManagement;