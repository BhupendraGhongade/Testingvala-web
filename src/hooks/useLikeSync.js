import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useLikeSync = (postId, authUser) => {
  const [totalLikes, setTotalLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const sessionId = !authUser ? localStorage.getItem('guest_session_id') || 
    (() => {
      const id = 'guest_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('guest_session_id', id);
      return id;
    })() : null;

  const loadLikeData = useCallback(async () => {
    if (!postId || !supabase) return;

    try {
      // Get total count from both verified and non-verified
      const { data: allLikes, error } = await supabase
        .from('post_likes')
        .select('user_email, session_id')
        .eq('post_id', postId);

      if (error) throw error;

      setTotalLikes(allLikes?.length || 0);

      // Check if current user liked
      const userLiked = allLikes?.some(like => 
        authUser ? like.user_email === authUser.email : like.session_id === sessionId
      );
      setIsLiked(userLiked || false);

    } catch (error) {
      console.error('Error loading like data:', error);
    }
  }, [postId, authUser?.email, sessionId]);

  // Real-time subscription
  useEffect(() => {
    if (!postId || !supabase) return;

    loadLikeData();

    const subscription = supabase
      .channel(`likes_${postId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'post_likes',
        filter: `post_id=eq.${postId}`
      }, () => {
        loadLikeData();
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [postId, loadLikeData]);

  return { totalLikes, isLiked, sessionId };
};