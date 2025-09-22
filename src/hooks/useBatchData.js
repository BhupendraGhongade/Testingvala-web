import { useState, useEffect } from 'react';
import { batchApiService } from '../services/batchApiService';
import { useAuth } from '../contexts/AuthContext';

export const useBatchData = () => {
  const { user, userRole } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Single API call for ALL page data
        const completeData = await batchApiService.loadCompletePageData(
          userRole || 'guest', 
          user?.id
        );
        
        if (mounted) {
          setData(completeData);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          console.error('Batch data load error:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [user?.id, userRole]);

  // Optimized like toggle
  const toggleLike = async (postId) => {
    if (!user) return false;
    
    try {
      const result = await batchApiService.toggleLike(postId, user.id, user.email);
      
      // Optimistic update
      setData(prev => ({
        ...prev,
        posts: prev.posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes_count: result ? post.likes_count + 1 : post.likes_count - 1,
                user_liked: result
              }
            : post
        ),
        userLikes: result 
          ? [...prev.userLikes, postId]
          : prev.userLikes.filter(id => id !== postId)
      }));
      
      return result;
    } catch (error) {
      console.error('Toggle like error:', error);
      throw error;
    }
  };

  // Optimized comment add
  const addComment = async (postId, content) => {
    if (!user) return null;
    
    try {
      const comment = await batchApiService.addComment(postId, content, user.id, user.email);
      
      // Optimistic update
      setData(prev => ({
        ...prev,
        posts: prev.posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                comments: [...post.comments, comment],
                replies_count: post.replies_count + 1
              }
            : post
        )
      }));
      
      return comment;
    } catch (error) {
      console.error('Add comment error:', error);
      throw error;
    }
  };

  return {
    data,
    loading,
    error,
    toggleLike,
    addComment,
    refresh: () => {
      batchApiService.invalidateCache();
      window.location.reload();
    }
  };
};