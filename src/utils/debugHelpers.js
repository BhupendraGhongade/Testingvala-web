// Debug helpers for troubleshooting CreatePostModal and category issues

export const debugCreatePost = () => {
  console.log('=== CREATE POST DEBUG ===');
  
  // Check if CreatePostModal is available
  const modal = document.querySelector('[data-testid="create-post-modal"]');
  console.log('Modal element:', modal);
  
  // Check categories in localStorage
  const localCategories = localStorage.getItem('local_forum_categories');
  console.log('Local categories:', localCategories);
  
  // Check global context
  if (window.__GLOBAL_DATA_CONTEXT__) {
    console.log('Global context categories:', window.__GLOBAL_DATA_CONTEXT__.categories);
    console.log('Global context posts:', window.__GLOBAL_DATA_CONTEXT__.posts?.length);
  }
  
  // Check supabase connection
  console.log('Supabase available:', !!window.supabase);
  
  return {
    modal: !!modal,
    categories: localCategories ? JSON.parse(localCategories).length : 0,
    globalContext: !!window.__GLOBAL_DATA_CONTEXT__,
    supabase: !!window.supabase
  };
};

export const debugCategoryFilter = () => {
  console.log('=== CATEGORY FILTER DEBUG ===');
  
  // Check category dropdown
  const dropdown = document.querySelector('[data-testid="category-dropdown"]');
  console.log('Category dropdown:', dropdown);
  
  // Check available categories
  if (window.__GLOBAL_DATA_CONTEXT__) {
    const { categories, posts } = window.__GLOBAL_DATA_CONTEXT__;
    console.log('Available categories:', categories?.map(c => ({ id: c.id, name: c.name })));
    console.log('Posts with categories:', posts?.map(p => ({ id: p.id, category_id: p.category_id, category_name: p.category_name })));
  }
  
  return {
    dropdown: !!dropdown,
    categoriesCount: window.__GLOBAL_DATA_CONTEXT__?.categories?.length || 0,
    postsCount: window.__GLOBAL_DATA_CONTEXT__?.posts?.length || 0
  };
};

export const testCreatePost = async () => {
  console.log('=== TESTING CREATE POST ===');
  
  try {
    // Simulate creating a post
    const testPost = {
      id: `test-${Date.now()}`,
      title: 'Test Post',
      content: 'This is a test post to verify the create post functionality works.',
      category_id: 'general-discussion',
      category_name: 'General Discussion',
      author_name: 'Test User',
      created_at: new Date().toISOString(),
      likes_count: 0,
      replies_count: 0,
      status: 'active'
    };
    
    // Try to add via global context
    if (window.__GLOBAL_DATA_CONTEXT__?.addPost) {
      const result = window.__GLOBAL_DATA_CONTEXT__.addPost(testPost);
      console.log('Post creation result:', result);
      return { success: true, postId: result?.id };
    } else {
      console.error('addPost function not available');
      return { success: false, error: 'addPost function not available' };
    }
  } catch (error) {
    console.error('Test create post failed:', error);
    return { success: false, error: error.message };
  }
};

export const fixCommonIssues = () => {
  console.log('=== FIXING COMMON ISSUES ===');
  
  const fixes = [];
  
  // Fix 1: Ensure categories exist
  if (!localStorage.getItem('local_forum_categories')) {
    const fallbackCategories = [
      { id: 'general-discussion', name: 'General Discussion', slug: 'general-discussion', is_active: true },
      { id: 'manual-testing', name: 'Manual Testing', slug: 'manual-testing', is_active: true },
      { id: 'automation-testing', name: 'Automation Testing', slug: 'automation-testing', is_active: true },
      { id: 'api-testing', name: 'API Testing', slug: 'api-testing', is_active: true }
    ];
    localStorage.setItem('local_forum_categories', JSON.stringify(fallbackCategories));
    fixes.push('Added fallback categories to localStorage');
  }
  
  // Fix 2: Clear any corrupted post data
  try {
    const posts = localStorage.getItem('testingvala_posts');
    if (posts) {
      const parsed = JSON.parse(posts);
      if (!Array.isArray(parsed)) {
        localStorage.removeItem('testingvala_posts');
        fixes.push('Cleared corrupted posts data');
      }
    }
  } catch (error) {
    localStorage.removeItem('testingvala_posts');
    fixes.push('Cleared invalid posts data');
  }
  
  // Fix 3: Reset any error flags
  localStorage.removeItem('last_post_error');
  localStorage.removeItem('force_clear_posts');
  fixes.push('Cleared error flags');
  
  console.log('Applied fixes:', fixes);
  return fixes;
};

export const testModalVisibility = () => {
  console.log('=== TESTING MODAL VISIBILITY ===');
  
  // Check if modal elements exist
  const modals = document.querySelectorAll('[class*="fixed inset-0"]');
  console.log('Found modals:', modals.length);
  
  modals.forEach((modal, index) => {
    const styles = window.getComputedStyle(modal);
    console.log(`Modal ${index}:`, {
      display: styles.display,
      visibility: styles.visibility,
      opacity: styles.opacity,
      zIndex: styles.zIndex,
      position: styles.position
    });
  });
  
  // Check for CreatePost button
  const createButtons = document.querySelectorAll('button');
  const createPostButtons = Array.from(createButtons).filter(btn => 
    btn.textContent.includes('Create Post') || btn.textContent.includes('Create')
  );
  console.log('Create Post buttons found:', createPostButtons.length);
  
  return {
    modalsFound: modals.length,
    createButtonsFound: createPostButtons.length
  };
};

// Make functions available globally for console debugging
if (typeof window !== 'undefined') {
  window.debugCreatePost = debugCreatePost;
  window.debugCategoryFilter = debugCategoryFilter;
  window.testCreatePost = testCreatePost;
  window.fixCommonIssues = fixCommonIssues;
  window.testModalVisibility = testModalVisibility;
}