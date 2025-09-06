import React, { useState, useEffect } from 'react';
import { Check, X, Eye, Clock, MessageSquare, User, Calendar, ThumbsUp, ThumbsDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const ForumModeration = () => {
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetail, setShowPostDetail] = useState(false);

  useEffect(() => {
    fetchPendingPosts();
  }, []);

  const fetchPendingPosts = async () => {
    try {
      setLoading(true);

      if (!supabase) {
        console.warn('ForumModeration: Supabase not configured — skipping fetchPendingPosts')
        toast('Supabase not configured — moderation disabled in local dev', { icon: '⚠️' })
        setPendingPosts([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('forum_posts')
        // .select(`
        //   *,
        //   user_profiles!forum_posts_user_id_fkey(username, full_name, avatar_url, qa_expertise_level),
        //   forum_categories!forum_posts_category_id_fkey(name as category_name, description as category_description)
        // `)
        .select(`
          *,
          forum_categories!foru_posts_category_id_fkey(name, description)
        `)
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPendingPosts(data || []);
    } catch (err) {
      console.error('Error fetching pending posts:', err);
      toast.error('Failed to load pending posts');
    } finally {
      setLoading(false);
    }
  };

  const approvePost = async (postId) => {
    try {
      if (!supabase) {
        toast.error('Supabase not configured — cannot approve posts in local dev')
        return
      }

      const { error } = await supabase
        .from('forum_posts')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (error) throw error;

      toast.success('Post approved successfully!');
      fetchPendingPosts();
    } catch (err) {
      console.error('Error approving post:', err);
      toast.error('Failed to approve post');
    }
  };

  const rejectPost = async (postId) => {
    try {
      if (!supabase) {
        toast.error('Supabase not configured — cannot reject posts in local dev')
        return
      }

      const { error } = await supabase
        .from('forum_posts')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (error) throw error;

      toast.success('Post rejected successfully!');
      fetchPendingPosts();
    } catch (err) {
      console.error('Error rejecting post:', err);
      toast.error('Failed to reject post');
    }
  };

  const viewPostDetail = (post) => {
    setSelectedPost(post);
    setShowPostDetail(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6600] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading pending posts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Forum Moderation</h2>
            <p className="text-gray-600">Review and approve pending forum posts</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-lg">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">{pendingPosts.length} Posts Pending</span>
          </div>
        </div>
      </div>

      {/* Pending Posts List */}
      {pendingPosts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
          <MessageSquare className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Posts Pending</h3>
          <p className="text-gray-600">All forum posts have been reviewed!</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {pendingPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col h-full">
              <div className="flex items-start gap-4">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FF6600] to-[#E55A00] rounded-full flex items-center justify-center overflow-hidden">
                    {post.user_profiles?.avatar_url ? (
                      <img
                        src={post.user_profiles.avatar_url}
                        alt={post.user_profiles.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {post.user_profiles?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">
                      {post.user_profiles?.full_name || post.user_profiles?.username || 'Anonymous'}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {post.category_name}
                    </span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      {(post.user_profiles?.qa_expertise_level || 'beginner').toString().toUpperCase()}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                  
                  <p className="text-gray-600 mb-3 line-clamp-3">
                    {post.content}
                  </p>

                  {/* Post Meta */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {post.replies_count || 0} replies
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {post.likes_count || 0} likes
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - aligned to bottom for consistent layout */}
              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => viewPostDetail(post)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                
                <button
                  onClick={() => approvePost(post.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
                
                <button
                  onClick={() => rejectPost(post.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Detail Modal */}
      {showPostDetail && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Post Review</h3>
              <button
                onClick={() => setShowPostDetail(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Post Content */}
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FF6600] to-[#E55A00] rounded-full flex items-center justify-center">
                  {selectedPost.user_profiles?.avatar_url ? (
                    <img
                      src={selectedPost.user_profiles.avatar_url}
                      alt={selectedPost.user_profiles.username}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-2xl">
                      {selectedPost.user_profiles?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedPost.title}</h1>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-medium text-gray-900">
                      {selectedPost.user_profiles?.full_name || selectedPost.user_profiles?.username || 'Anonymous'}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {selectedPost.category_name}
                    </span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      {selectedPost.user_profiles?.qa_expertise_level || 'beginner'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Submitted on {formatDate(selectedPost.created_at)}
                  </div>
                </div>
              </div>

              {selectedPost.image_url && (
                <div className="mb-6">
                  <img
                    src={selectedPost.image_url}
                    alt="Post image"
                    className="w-full max-h-96 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="prose max-w-none text-gray-700 leading-relaxed mb-6">
                {selectedPost.content}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    approvePost(selectedPost.id);
                    setShowPostDetail(false);
                  }}
                  className="flex items-center gap-2 px-8 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-semibold"
                >
                  <Check className="w-5 h-5" />
                  Approve Post
                </button>
                
                <button
                  onClick={() => {
                    rejectPost(selectedPost.id);
                    setShowPostDetail(false);
                  }}
                  className="flex items-center gap-2 px-8 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold"
                >
                  <X className="w-5 h-5" />
                  Reject Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumModeration;
