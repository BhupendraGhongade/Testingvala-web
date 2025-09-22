import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Generate session ID for non-verified users
const getSessionId = () => {
  let sessionId = localStorage.getItem('guest_session_id');
  if (!sessionId) {
    sessionId = 'guest_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('guest_session_id', sessionId);
  }
  return sessionId;
};

export const useLikeSystem = (postId, user = null) => {
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const sessionId = !user ? getSessionId() : null;

  // Load initial like data
  const loadLikeData = useCallback(async () => {
    if (!postId) return;

    try {
      // Get like count
      const { data: countData, error: countError } = await supabase
        .rpc('get_post_like_count', { post_uuid: postId });

      if (countError) throw countError;
      setLikeCount(countData || 0);

      // Check if user liked
      const { data: likedData, error: likedError } = await supabase
        .rpc('user_liked_post', {
          post_uuid: postId,
          user_uuid: user?.id || null,
          session_token: sessionId
        });

      if (likedError) throw likedError;
      setIsLiked(likedData || false);

    } catch (error) {
      console.error('Error loading like data:', error);
    }
  }, [postId, user?.id, sessionId]);

  // Toggle like
  const toggleLike = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .match({
            post_id: postId,
            ...(user ? { user_id: user.id } : { session_id: sessionId })
          });

        if (error) throw error;
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user?.id || null,
            session_id: sessionId,
            is_verified: !!user
          });

        if (error) throw error;
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update
      await loadLikeData();
    } finally {
      setLoading(false);
    }
  }, [isLiked, loading, postId, user, sessionId, loadLikeData]);

  // Setup realtime subscription
  useEffect(() => {
    loadLikeData();

    const subscription = supabase
      .channel(`post_likes_${postId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'post_likes',
        filter: `post_id=eq.${postId}`
      }, () => {
        loadLikeData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [postId, loadLikeData]);

  return {
    likeCount,
    isLiked,
    loading,
    toggleLike
  };
};