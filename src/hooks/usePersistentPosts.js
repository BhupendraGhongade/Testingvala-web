// 🪝 usePersistentPosts - Hook for synchronized post state
import { useState, useEffect } from 'react';
import { postStore } from '../stores/PostStore';

export const usePersistentPosts = () => {
  const [posts, setPosts] = useState(() => postStore.getPosts());
  const [hydrated, setHydrated] = useState(true); // Always hydrated since we load synchronously

  useEffect(() => {
    // Subscribe to store changes
    const unsubscribe = postStore.subscribe((newPosts) => {
      setPosts([...newPosts]);
    });

    return unsubscribe;
  }, []);

  const addPost = (post) => {
    return postStore.addPost(post);
  };

  const removePost = (postId) => {
    return postStore.removePost(postId);
  };

  return {
    posts,
    addPost,
    removePost,
    hydrated
  };
};

export default usePersistentPosts;