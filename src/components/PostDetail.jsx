import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, MessageSquare, ThumbsUp, ThumbsDown, Reply, Share2, Flag, User, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const PostDetail = ({ postId, onBack }) => {
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [showReplyForm, setShowReplyForm] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchReplies();
      checkUserVote();
    }
  }, [postId, fetchPost, fetchReplies, checkUserVote]);

  const fetchPost = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          forum_categories!foru_posts_category_id_fkey(name,description),
        `)
        // .select(`
        //   *,
        //   user_profiles!forum_posts_user_id_fkey(username, full_name, avatar_url, reputation_points),
        //   forum_categories!foru_posts_category_id_fkey(name as category_name, description as category_description)
        // `)
        .eq('id', postId)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (err) {
      console.error('Error fetching post:', err);
      toast.error('Failed to load post');
    }
  }, [postId]);

  const fetchReplies = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('forum_replies')
        .select(`
          *,
          user_profiles!forum_replies_user_id_fkey(username, full_name, avatar_url, reputation_points)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (err) {
      console.error('Error fetching replies:', err);
      toast.error('Failed to load replies');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const checkUserVote = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('post_votes')
        .select('vote_type')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setUserVote(data.vote_type);
      }
    } catch (err) {
      console.error('Error checking user vote:', err);
    }
  }, [postId]);

  const isUserVerified = (user) => {
  if (!user) return false;
  if (typeof user.user_metadata?.is_verified !== 'undefined') return Boolean(user.user_metadata.is_verified);
  if (typeof user.app_metadata?.is_verified !== 'undefined') return Boolean(user.app_metadata.is_verified);
  if (user?.email_confirmed_at || user?.confirmed_at) return true;
  return true;
  };

  const toggleSavePostLocal = (postId) => {
    try {
      const raw = localStorage.getItem('saved_posts') || '[]';
      const list = JSON.parse(raw);
      const exists = list.includes(postId);
      const updated = exists ? list.filter(id => id !== postId) : [postId, ...list];
      localStorage.setItem('saved_posts', JSON.stringify(updated));
      toast.success(exists ? 'Removed from saved posts' : 'Saved for later');
    } catch (err) {
      console.error('Failed to toggle saved post', err);
      toast.error('Failed to save post');
    }
  };

  // If Supabase is not configured, show a friendly message — forum features require backend
  if (!supabase) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-700">Forum detail requires Supabase. Running in local fallback mode.</p>
        <button onClick={onBack} className="mt-4 text-[#FF6600] hover:underline">Go back</button>
      </div>
    )
  }

  const handleVote = async (voteType) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to vote');
        return;
      }

      // Remove existing vote if same type
      if (userVote === voteType) {
        const { error } = await supabase
          .from('post_votes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        setUserVote(null);
        
        // Update post vote count
        const newCount = voteType === 'upvote' ? post.likes_count - 1 : post.dislikes_count - 1;
        await updatePostVoteCount(voteType === 'upvote' ? 'likes_count' : 'dislikes_count', newCount);
      } else {
        // Insert or update vote
        const { error } = await supabase
          .from('post_votes')
          .upsert({
            post_id: postId,
            user_id: user.id,
            vote_type: voteType
          });

        if (error) throw error;
        setUserVote(voteType);

        // Update post vote count
        if (userVote) {
          // Remove previous vote count
          const prevCount = userVote === 'upvote' ? post.likes_count - 1 : post.dislikes_count - 1;
          await updatePostVoteCount(userVote === 'upvote' ? 'likes_count' : 'dislikes_count', prevCount);
        }
        
        // Add new vote count
        const newCount = voteType === 'upvote' ? post.likes_count + 1 : post.dislikes_count + 1;
        await updatePostVoteCount(voteType === 'upvote' ? 'likes_count' : 'dislikes_count', newCount);
      }

      // Refresh post data
      fetchPost();
    } catch (error) {
      console.error('Error handling vote:', error);
      toast.error('Failed to submit vote');
    }
  };

  const updatePostVoteCount = async (field, count) => {
    const { error } = await supabase
      .from('forum_posts')
      .update({ [field]: Math.max(0, count) })
      .eq('id', postId);

    if (error) throw error;
  };

  const handleReply = async (e) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      setSubmittingReply(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to reply');
        return;
      }

      // Only verified users can post replies
      if (!isUserVerified(user)) {
        toast.error('Only verified users can post replies. Please verify your account.');
        return;
      }

      const { error } = await supabase
        .from('forum_replies')
        .insert([{
          post_id: postId,
          user_id: user.id,
          content: replyContent.trim()
        }]);

      if (error) throw error;

      // Update reply count
      await supabase
        .from('forum_posts')
        .update({ replies_count: (post.replies_count || 0) + 1 })
        .eq('id', postId);

      toast.success('Reply posted successfully!');
      setReplyContent('');
      setShowReplyForm(false);
      fetchReplies();
      fetchPost();
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6600] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Post not found</p>
        <button
          onClick={onBack}
          className="mt-4 text-[#FF6600] hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#FF6600] hover:text-[#E55A00] mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Community
      </button>

      {/* Main Post */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
        {/* Post Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start gap-4">
            {/* User Avatar */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF6600] to-[#E55A00] rounded-full flex items-center justify-center">
                {post.user_profiles?.avatar_url ? (
                  <img
                    src={post.user_profiles.avatar_url}
                    alt={post.user_profiles.username}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-2xl">
                    {post.user_profiles?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
            </div>

            {/* Post Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-semibold text-gray-900">
                  {post.user_profiles?.full_name || post.user_profiles?.username || 'Anonymous'}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {post.category_name}
                </span>
                {post.user_profiles?.reputation_points && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {post.user_profiles.reputation_points} pts
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(post.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {post.replies_count || 0} replies
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
          
          {post.image_url && (
            <div className="mb-4">
              <img
                src={post.image_url}
                alt="Post image"
                className="w-full max-h-96 object-cover rounded-lg"
              />
            </div>
          )}
          
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            {post.content}
          </div>
        </div>

        {/* Post Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Upvote */}
              <button
                onClick={() => handleVote('upvote')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  userVote === 'upvote'
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-green-50'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${userVote === 'upvote' ? 'text-green-600' : ''}`} />
                <span className="font-medium">{post.likes_count || 0}</span>
              </button>

              {/* Downvote */}
              <button
                onClick={() => handleVote('downvote')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  userVote === 'downvote'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-red-50'
                }`}
              >
                <ThumbsDown className={`w-4 h-4 ${userVote === 'downvote' ? 'text-red-600' : ''}`} />
                <span className="font-medium">{post.dislikes_count || 0}</span>
              </button>

              {/* Reply Button */}
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-2 px-4 py-2 bg-[#FF6600] text-white rounded-lg hover:bg-[#E55A00] transition-colors"
              >
                <Reply className="w-4 h-4" />
                Reply
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Flag className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleSavePostLocal(post.id)}
                aria-label="Save post"
                title="Save for later"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <User className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Post a Reply</h3>
          <form onSubmit={handleReply}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent resize-none mb-4"
              maxLength={1000}
              required
            />
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {replyContent.length}/1000 characters
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowReplyForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReply}
                  className="px-6 py-2 bg-[#FF6600] text-white rounded-lg hover:bg-[#E55A00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submittingReply ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Posting...
                    </>
                  ) : (
                    <>
                      <Reply className="w-4 h-4" />
                      Post Reply
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Replies */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Replies ({replies.length})
        </h3>
        
        {replies.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-gray-100">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No replies yet. Be the first to respond!</p>
          </div>
        ) : (
          replies.map((reply) => (
            <div key={reply.id} className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-start gap-4">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0057B7] to-[#004494] rounded-full flex items-center justify-center">
                    {reply.user_profiles?.avatar_url ? (
                      <img
                        src={reply.user_profiles.avatar_url}
                        alt={reply.user_profiles.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {reply.user_profiles?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Reply Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900">
                      {reply.user_profiles?.full_name || reply.user_profiles?.username || 'Anonymous'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(reply.created_at).toLocaleDateString()}
                    </span>
                    {reply.user_profiles?.reputation_points && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {reply.user_profiles.reputation_points} pts
                      </span>
                    )}
                  </div>
                  
                  <div className="text-gray-700 leading-relaxed">
                    {reply.content}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PostDetail;
