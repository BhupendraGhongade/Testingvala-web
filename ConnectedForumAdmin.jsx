import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Trash2, MessageSquare, User, RefreshCw, Eye, AlertCircle, Calendar, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

const ConnectedForumAdmin = () => {
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
      setDebugInfo('Fetching all posts...');

      // Method 1: Direct query without any filters
      const { data: allPosts, error } = await supabase
        .from('forum_posts')
        .select(`
          id,
          title,
          content,
          user_id,
          status,
          is_approved,
          created_at,
          updated_at,
          author_name,
          category_id,
          likes_count,
          replies_count
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        setDebugInfo(`Database error: ${error.message}`);
        
        // Fallback: Load from localStorage
        const localPosts = JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
        setPosts(localPosts);
        setDebugInfo(`Loaded ${localPosts.length} posts from localStorage (database failed)`);
        return;
      }

      // Combine database posts with local posts
      const localPosts = JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
      const combinedPosts = [...(allPosts || []), ...localPosts];
      
      // Remove duplicates based on ID
      const uniquePosts = combinedPosts.filter((post, index, self) => 
        index === self.findIndex(p => p.id === post.id)
      );

      setPosts(uniquePosts);
      setDebugInfo(`Loaded ${uniquePosts.length} total posts (${allPosts?.length || 0} from database, ${localPosts.length} local)`);
      
      if (uniquePosts.length > 0) {
        toast.success(`Found ${uniquePosts.length} posts`);
      } else {
        toast.info('No posts found');
      }

    } catch (error) {
      console.error('Critical error:', error);
      setDebugInfo(`Critical error: ${error.message}`);
      
      // Final fallback: localStorage only
      const localPosts = JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
      setPosts(localPosts);
      toast.error('Database connection failed, showing local posts only');
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId) => {
    if (!confirm('Delete this post permanently?')) return;
    
    try {
      // Delete from database if it's a database post
      if (!postId.startsWith('local-')) {
        const { error } = await supabase
          .from('forum_posts')
          .delete()
          .eq('id', postId);

        if (error) {
          console.error('Database delete error:', error);
          toast.error('Failed to delete from database, removing from view');
        }
      }

      // Delete from localStorage if it's a local post
      if (postId.startsWith('local-')) {
        const localPosts = JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
        const updatedPosts = localPosts.filter(post => post.id !== postId);
        localStorage.setItem('local_forum_posts', JSON.stringify(updatedPosts));
      }

      // Remove from UI
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
      post.author_name?.toLowerCase().includes(query) ||
      post.user_id?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="text-gray-600">Loading all forum posts...</p>
        {debugInfo && (
          <p className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded max-w-md text-center">{debugInfo}</p>
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
          <p className="text-sm text-gray-600">Connected to user community discussions</p>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                {new Set(posts.map(p => p.user_id || p.author_name)).size}
              </div>
              <div className="text-sm text-orange-700">Unique Users</div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-purple-900">
                {posts.reduce((sum, p) => sum + (p.likes_count || 0), 0)}
              </div>
              <div className="text-sm text-purple-700">Total Likes</div>
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
            placeholder="Search posts by title, content, author, or user ID..."
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
            <p className="text-gray-600 mb-4">
              {posts.length === 0 
                ? "No posts exist yet. Users can create posts from the community section." 
                : "No posts match your search criteria."
              }
            </p>
            <button
              onClick={fetchAllPosts}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
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
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {post.title || 'Untitled Post'}
                      </h4>
                      {post.id.startsWith('local-') && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Local
                        </span>
                      )}
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
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.content || 'No content available'}
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>
                          {post.author_name || post.user_id || 'Anonymous'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      {(post.likes_count || 0) > 0 && (
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{post.likes_count} likes</span>
                        </div>
                      )}
                      {(post.replies_count || 0) > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.replies_count} comments</span>
                        </div>
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
        {posts.length > 0 && (
          <span className="ml-2">
            • Last updated: {new Date().toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default ConnectedForumAdmin;