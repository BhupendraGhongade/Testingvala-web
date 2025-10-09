import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Trash2, MessageSquare, Heart, Calendar, User, RefreshCw, Eye, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const RefactoredForumAdmin = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    fetchAllPosts();
  }, []);

  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      setDebugInfo('Fetching posts...');

      // Try multiple approaches to get posts
      let data = null;
      let error = null;

      // Approach 1: Direct query without RLS
      try {
        const result = await supabase
          .from('forum_posts')
          .select('*')
          .order('created_at', { ascending: false });
        
        data = result.data;
        error = result.error;
        setDebugInfo(`Approach 1: Found ${data?.length || 0} posts`);
      } catch (err) {
        setDebugInfo(`Approach 1 failed: ${err.message}`);
      }

      // Approach 2: If first fails, try with service role
      if (!data || data.length === 0) {
        try {
          const result = await supabase
            .from('forum_posts')
            .select(`
              id,
              title,
              content,
              user_id,
              status,
              created_at,
              updated_at
            `)
            .order('created_at', { ascending: false });
          
          data = result.data;
          error = result.error;
          setDebugInfo(`Approach 2: Found ${data?.length || 0} posts`);
        } catch (err) {
          setDebugInfo(`Approach 2 failed: ${err.message}`);
        }
      }

      // Approach 3: Raw SQL query
      if (!data || data.length === 0) {
        try {
          const result = await supabase.rpc('get_all_forum_posts');
          data = result.data;
          error = result.error;
          setDebugInfo(`Approach 3: Found ${data?.length || 0} posts`);
        } catch (err) {
          setDebugInfo(`Approach 3 failed: ${err.message}`);
        }
      }

      if (error) {
        console.error('Error fetching posts:', error);
        toast.error(`Failed to load posts: ${error.message}`);
        setDebugInfo(`Error: ${error.message}`);
      } else {
        setPosts(data || []);
        toast.success(`Loaded ${data?.length || 0} posts`);
        setDebugInfo(`Success: Loaded ${data?.length || 0} posts`);
      }

    } catch (error) {
      console.error('Critical error:', error);
      toast.error('Critical error loading posts');
      setDebugInfo(`Critical error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId) => {
    if (!confirm('Delete this post permanently?')) return;
    
    try {
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Post deleted');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title?.toLowerCase().includes(query) ||
      post.content?.toLowerCase().includes(query) ||
      post.user_id?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="text-gray-600">Loading forum posts...</p>
        {debugInfo && (
          <p className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded">{debugInfo}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Forum Management</h3>
          <p className="text-sm text-gray-600">Manage all forum posts and user content</p>
        </div>
        <button
          onClick={fetchAllPosts}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Debug Info */}
      {debugInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800">{debugInfo}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-blue-900">{posts.length}</div>
              <div className="text-sm text-blue-700">Total Posts</div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-900">{filteredPosts.length}</div>
              <div className="text-sm text-green-700">Visible Posts</div>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-orange-600" />
            <div>
              <div className="text-2xl font-bold text-orange-900">
                {new Set(posts.map(p => p.user_id)).size}
              </div>
              <div className="text-sm text-orange-700">Unique Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search posts by title, content, or user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {filteredPosts.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Posts Found</h3>
            <p className="text-gray-600">
              {posts.length === 0 
                ? "No posts exist in the database yet." 
                : "No posts match your search criteria."
              }
            </p>
            <button
              onClick={fetchAllPosts}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Reload Posts
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPosts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {post.title || 'Untitled Post'}
                    </h4>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.content || 'No content available'}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>User: {post.user_id || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      {post.status && (
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          post.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => deletePost(post.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        Showing {filteredPosts.length} of {posts.length} posts
      </div>
    </div>
  );
};

export default RefactoredForumAdmin;