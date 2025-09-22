import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useRealtimeLikes = (postId, initialDbCount = 0) => {
  const [dbLikeCount, setDbLikeCount] = useState(initialDbCount);
  const [isUserLiked, setIsUserLiked] = useState(false);
  const [authUser, setAuthUser] = useState(null);

  // Get current auth user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load initial like state
  useEffect(() => {
    const loadInitialState = async () => {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('post_likes')
            .select('id, user_email, session_id, is_verified')
            .eq('post_id', postId);

          if (!error && data) {
            setDbLikeCount(data.length);
            
            // Check if current user liked this post
            if (authUser?.email) {
              const userLiked = data.some(like => like.user_email === authUser.email && like.is_verified);
              setIsUserLiked(userLiked);
            } else {
              // Check guest likes
              const sessionId = localStorage.getItem('guest_session_id');
              if (sessionId) {
                const guestLiked = data.some(like => like.session_id === sessionId && !like.is_verified);
                setIsUserLiked(guestLiked);
              }
            }
          }
        } catch (error) {
          console.warn('Failed to load initial like state:', error);
        }
      }
    };

    loadInitialState();
  }, [postId, authUser]);

  // Real-time subscription - refresh full state on any change
  useEffect(() => {
    if (!supabase) return;

    const subscription = supabase
      .channel(`post_likes_${postId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'post_likes',
        filter: `post_id=eq.${postId}`
      }, async () => {
        // Refresh complete state from database
        try {
          const { data, error } = await supabase
            .from('post_likes')
            .select('id, user_email, session_id, is_verified')
            .eq('post_id', postId);

          if (!error && data) {
            setDbLikeCount(data.length);
            
            // Update user like state
            if (authUser?.email) {
              const userLiked = data.some(like => like.user_email === authUser.email && like.is_verified);
              setIsUserLiked(userLiked);
            } else {
              const sessionId = localStorage.getItem('guest_session_id');
              if (sessionId) {
                const guestLiked = data.some(like => like.session_id === sessionId && !like.is_verified);
                setIsUserLiked(guestLiked);
              }
            }
          }
        } catch (error) {
          console.warn('Failed to refresh like state:', error);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [postId, authUser]);

  // Toggle like function
  const toggleLike = useCallback(async () => {
    if (!supabase) return false;

    try {
      if (authUser) {
        // Verified user
        if (isUserLiked) {
          // Unlike
          const { error } = await supabase
            .from('post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_email', authUser.email)
            .eq('is_verified', true);

          if (error) throw error;
          return false;
        } else {
          // Like
          const { error } = await supabase
            .from('post_likes')
            .insert({
              post_id: postId,
              user_email: authUser.email,
              is_verified: true
            });

          if (error) throw error;
          return true;
        }
      } else {
        // Guest user
        const sessionId = localStorage.getItem('guest_session_id') || (() => {
          const id = 'guest_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('guest_session_id', id);
          return id;
        })();

        if (isUserLiked) {
          // Unlike
          const { error } = await supabase
            .from('post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('session_id', sessionId)
            .eq('is_verified', false);

          if (error) throw error;

          // Update localStorage
          const guestLikes = JSON.parse(localStorage.getItem('guest_likes') || '[]');
          const updatedLikes = guestLikes.filter(id => id !== postId);
          localStorage.setItem('guest_likes', JSON.stringify(updatedLikes));

          return false;
        } else {
          // Like
          const { error } = await supabase
            .from('post_likes')
            .insert({
              post_id: postId,
              session_id: sessionId,
              is_verified: false
            });

          if (error) throw error;

          // Update localStorage
          const guestLikes = JSON.parse(localStorage.getItem('guest_likes') || '[]');
          guestLikes.push(postId);
          localStorage.setItem('guest_likes', JSON.stringify(guestLikes));

          return true;
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }, [postId, authUser, isUserLiked]);

  return {
    totalLikes: dbLikeCount,
    isLiked: isUserLiked,
    toggleLike,
    isLoading: false
  };
};