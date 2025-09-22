import { useState, useEffect } from 'react';

export const useUnifiedLikeCount = (postId, dbLikeCount = 0) => {
  const [totalCount, setTotalCount] = useState(dbLikeCount);

  useEffect(() => {
    // Get guest like counts from localStorage
    try {
      const guestCounts = JSON.parse(localStorage.getItem('guest_like_counts') || '{}');
      const guestLikesForPost = guestCounts[postId] || 0;
      
      // Combine database likes + guest likes
      setTotalCount((dbLikeCount || 0) + guestLikesForPost);
    } catch (error) {
      setTotalCount(dbLikeCount || 0);
    }
  }, [postId, dbLikeCount]);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const guestCounts = JSON.parse(localStorage.getItem('guest_like_counts') || '{}');
        const guestLikesForPost = guestCounts[postId] || 0;
        setTotalCount((dbLikeCount || 0) + guestLikesForPost);
      } catch (error) {
        setTotalCount(dbLikeCount || 0);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [postId, dbLikeCount]);

  return totalCount;
};