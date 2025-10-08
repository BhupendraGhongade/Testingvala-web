<<<<<<< HEAD
import { isProduction } from './environment';

// This entire module is a no-op in production to ensure zero conflicts.
// It provides a safe, localStorage-backed post store for local development.

=======
// Bulletproof post store - single source of truth for development
>>>>>>> origin/main
let devPostStore = [];
let isHydrated = false;

export const bulletproofPostStore = {
<<<<<<< HEAD
  hydrate() {
    if (isProduction || isHydrated) {
      return [...devPostStore]; // Already hydrated or in production
    }
    try {
      const stored = localStorage.getItem('testingvala_posts');
      devPostStore = stored ? JSON.parse(stored) : [];

      if (devPostStore.length === 0 && !isHydrated) {
=======
  // Synchronous hydration - never fails
  hydrate() {
    try {
      const stored = localStorage.getItem('testingvala_posts');
      devPostStore = stored ? JSON.parse(stored) : [];
      
      // Add demo post if no posts exist (works in all environments)
      if (devPostStore.length === 0) {
>>>>>>> origin/main
        const demoPost = {
          id: 'demo-post-1',
          title: 'Welcome to TestingVala Community! 🚀',
          content: `Hey QA professionals! 👋\n\nWelcome to our vibrant testing community where we share knowledge, discuss best practices, and grow together.\n\n🔥 **What you can do here:**\n• Share your testing experiences and insights\n• Ask questions and get help from experts\n• Discuss automation frameworks and tools\n• Network with fellow QA professionals\n• Participate in monthly contests with prizes\n\n💡 **Pro tip:** Use the search and filter options to find discussions relevant to your interests!\n\nFeel free to introduce yourself and let us know what testing challenges you're currently facing. Our community is here to help! 🤝\n\n#QACommunity #Testing #QualityAssurance`,
          author_name: 'TestingVala Team',
          category_id: 'general-discussion',
          category_name: 'General Discussion',
          experience_years: 'Expert',
          created_at: new Date().toISOString(),
          likes_count: 12,
          replies_count: 5,
          isLocal: true,
          isPermanent: true,
          user_profiles: {
            email: 'team@testingvala.com',
            username: 'testingvala-team'
          }
        };
        devPostStore.push(demoPost);
        localStorage.setItem('testingvala_posts', JSON.stringify(devPostStore));
        console.log('[BulletproofStore] Added demo post');
      }
<<<<<<< HEAD
      isHydrated = true;
      console.log(`[BulletproofStore] Hydrated with ${devPostStore.length} local posts.`);
=======
      
      isHydrated = true;
      console.log('[BulletproofStore] Hydrated:', devPostStore.length, 'posts');
>>>>>>> origin/main
      return [...devPostStore];
    } catch (error) {
      console.error('[BulletproofStore] Hydration error:', error);
      devPostStore = [];
      isHydrated = true;
      return [];
    }
  },

<<<<<<< HEAD
  add(post) {
    if (isProduction) return; // Safety check
=======
  // Atomic add - never loses posts
  add(post) {
    
>>>>>>> origin/main
    const newPost = {
      ...post,
      id: post.id || `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: post.created_at || new Date().toISOString(),
      isLocal: true
    };

    // Atomic operation: remove duplicates + add
    devPostStore = devPostStore.filter(p => p.id !== newPost.id);
    devPostStore.unshift(newPost);
<<<<<<< HEAD

    // Immediate persist
    try {
      localStorage.setItem('testingvala_posts', JSON.stringify(devPostStore));
=======
    
    // Immediate persist
    try {
      localStorage.setItem('testingvala_posts', JSON.stringify(devPostStore));
      window.dispatchEvent(new Event('storage'));
>>>>>>> origin/main
      console.log('[BulletproofStore] Added:', newPost.id, 'Total:', devPostStore.length);
    } catch (error) {
      console.error('[BulletproofStore] Persist error:', error);
    }
<<<<<<< HEAD

    return newPost;
  },

  get() {
    if (isProduction) return [];
    this.hydrate(); // Ensure store is hydrated before getting
    return [...devPostStore];
  },

  getMergedPosts(dbPosts) {
    if (isProduction) return dbPosts || []; // In production, ONLY return database posts.

    const localPosts = this.get(); // Get hydrated local posts
    const merged = [...localPosts];

=======
    
    return newPost;
  },

  // Get current posts
  get() {
    return [...devPostStore];
  },

  // Defensive merge with DB posts - local posts always win
  mergeWithDB(dbPosts) {
    const merged = [...devPostStore]; // Local posts first (including demo post)
    
>>>>>>> origin/main
    if (dbPosts && Array.isArray(dbPosts)) {
      dbPosts.forEach(dbPost => {
        if (!merged.find(p => p.id === dbPost.id)) {
          merged.push(dbPost);
        }
      });
    }
<<<<<<< HEAD

    merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    console.log(`[BulletproofStore] Merged - Local: ${localPosts.length}, DB: ${(dbPosts || []).length}, Total: ${merged.length}`);
    return merged;
  }
};
=======
    
    merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    console.log('[BulletproofStore] Merged - Local:', devPostStore.length, 'DB:', dbPosts?.length || 0, 'Total:', merged.length);
    
    return merged;
  },

  // Self-healing sync
  sync() {
    
    try {
      const stored = localStorage.getItem('testingvala_posts');
      const storedPosts = stored ? JSON.parse(stored) : [];
      
      if (JSON.stringify(devPostStore) !== JSON.stringify(storedPosts)) {
        console.log('[BulletproofStore] Syncing from localStorage');
        devPostStore = storedPosts;
        return true;
      }
    } catch (error) {
      console.error('[BulletproofStore] Sync error:', error);
    }
    
    return false;
  },

  // Check if hydrated
  isHydrated() {
    return isHydrated;
  }
};

// Debug access
if (typeof window !== 'undefined') {
  window.bulletproofPostStore = bulletproofPostStore;
}
>>>>>>> origin/main
