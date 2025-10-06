// In-memory store for development-only post persistence
let localPostStore = [];

export const initLocalPostStore = () => {
  if (import.meta.env.VITE_APP_ENV !== 'development') {
    return [];
  }
  
  const stored = localStorage.getItem('testingvala_posts');
  localPostStore = stored ? JSON.parse(stored) : [];
  return [...localPostStore];
};

export const addLocalPost = (post) => {
  if (import.meta.env.VITE_APP_ENV !== 'development') {
    return null;
  }
  
  const newPost = {
    ...post,
    id: post.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: post.created_at || new Date().toISOString(),
    isLocal: true
  };
  
  // Atomic operation: remove duplicates then add
  localPostStore = localPostStore.filter(p => p.id !== newPost.id);
  localPostStore.unshift(newPost);
  
  // Atomic localStorage write
  try {
    localStorage.setItem('testingvala_posts', JSON.stringify(localPostStore));
    console.log('[LocalPostStore] Atomic add:', newPost.id, 'Total:', localPostStore.length);
  } catch (error) {
    console.error('[LocalPostStore] Save error:', error);
  }
  
  // Multi-tab sync
  window.dispatchEvent(new Event('storage'));
  
  return newPost;
};

export const getLocalPostStore = () => {
  return import.meta.env.VITE_APP_ENV === 'development' ? [...localPostStore] : [];
};

export const syncLocalPostStore = () => {
  if (import.meta.env.VITE_APP_ENV !== 'development') return false;
  
  try {
    const stored = localStorage.getItem('testingvala_posts');
    const storedPosts = stored ? JSON.parse(stored) : [];
    
    // Defensive sync: only update if actually different
    if (JSON.stringify(localPostStore) !== JSON.stringify(storedPosts)) {
      console.log('[LocalPostStore] Syncing:', localPostStore.length, '→', storedPosts.length);
      localPostStore = storedPosts;
      return true;
    }
    return false;
  } catch (error) {
    console.error('[LocalPostStore] Sync error:', error);
    return false;
  }
};

// Enhanced development debug access
if (import.meta.env.VITE_APP_ENV === 'development') {
  window.localPostStore = { 
    get: getLocalPostStore, 
    add: addLocalPost,
    sync: syncLocalPostStore,
    clear: () => {
      localPostStore = [];
      localStorage.removeItem('testingvala_posts');
      console.log('[LocalPostStore] Cleared all posts');
    },
    info: () => ({
      inMemoryCount: localPostStore.length,
      localStorageCount: JSON.parse(localStorage.getItem('testingvala_posts') || '[]').length,
      posts: localPostStore.map(p => ({ id: p.id, title: p.title, created_at: p.created_at }))
    })
  };
}