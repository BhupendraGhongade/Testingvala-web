import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RefreshCw, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const MinimalForumAdmin = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching posts...');
      
      // Simple direct query - no joins, no filters
      const { data, error } = await supabase
        .from('forum_posts')
        .select('*');

      console.log('Query result:', { data, error });

      if (error) {
        setError(`Database error: ${error.message}`);
        console.error('Supabase error:', error);
        return;
      }

      setPosts(data || []);
      toast.success(`Found ${data?.length || 0} posts`);
      
    } catch (err) {
      setError(`Critical error: ${err.message}`);
      console.error('Critical error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Forum Posts</h2>
        <button
          onClick={fetchPosts}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white border rounded-lg">
        {posts.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Posts Found</h3>
            <p className="text-gray-600">No posts exist in the database.</p>
          </div>
        ) : (
          <div className="divide-y">
            {posts.map((post) => (
              <div key={post.id} className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {post.title || 'Untitled'}
                </h3>
                <p className="text-gray-600 mb-2">
                  {post.content || 'No content'}
                </p>
                <div className="text-sm text-gray-500">
                  <span>Author: {post.author_name || post.user_id || 'Unknown'}</span>
                  <span className="ml-4">
                    Date: {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500 text-center">
        Total posts: {posts.length}
      </div>
    </div>
  );
};

export default MinimalForumAdmin;