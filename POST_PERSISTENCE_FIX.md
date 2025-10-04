# Post Persistence Fix - Hard Reload Issue

## Problem Identified
Posts were disappearing after hard reload because:

1. **Caching Issue**: The `getForumPosts()` method was caching the entire result (including merged posts)
2. **Cache Key Conflict**: Both database and local posts were cached under the same key `forum_posts`
3. **Stale Cache**: On hard reload, the cached result didn't include newly created local posts

## Solution Applied

### 1. Fixed dataService.js
- **Separated Caching**: Database posts now cached under `forum_posts_db` key
- **Fresh Local Posts**: localStorage is read fresh on every call (never cached)
- **Proper Merging**: Database posts are cached, but merging with local posts happens on every call

### 2. Fixed GlobalDataContext.jsx
- **Removed Duplicate Logic**: Removed redundant post merging in context
- **Single Source**: Posts are now merged only in dataService, not in multiple places

## How It Works Now

```javascript
async getForumPosts() {
  // 1. Get database posts (cached for 5 minutes)
  const dbPosts = await this.request('forum_posts_db', async () => {
    // Database query with caching
  });
  
  // 2. Always get fresh local posts (never cached)
  const localPosts = JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
  
  // 3. Merge and return (happens on every call)
  return mergedAndSortedPosts;
}
```

## Testing Steps

1. **Create a post** - Should appear immediately
2. **Hard reload (Ctrl+F5)** - Post should still be visible
3. **Navigate away and back** - Post should persist
4. **Clear cache manually** - Post should still be there (from localStorage)

## Key Changes

- ✅ Database posts cached separately from local posts
- ✅ localStorage always read fresh (no caching)
- ✅ Merging happens on every call to ensure consistency
- ✅ Removed duplicate merging logic from context
- ✅ Single source of truth for post merging

## Expected Result
Posts created locally will now persist through:
- Hard page refresh (Ctrl+F5)
- Browser restart
- Navigation away and back
- Cache clearing

The fix ensures that local posts are always included in the feed, regardless of cache state.