import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MessageSquare, TrendingUp, Plus, Search, Filter, Pin, Heart, MoreHorizontal, Edit2, Trash2, Share2, X, Bookmark } from 'lucide-react';
import { unifiedDataService } from '../services/unifiedDataService';
import { useAuth } from '../contexts/AuthContext';
import { useModalScrollLock } from '../hooks/useModalScrollLock';
import { getTimeAgo } from '../utils/timeUtils';
import toast from 'react-hot-toast';

// Optimized Like Button Component
const OptimizedLikeButton = ({ postId, initialCount = 0, userLiked = false, onToggle }) => {
  const [isLiked, setIsLiked] = useState(userLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;
    
    setLoading(true);
    const newLikedState = !isLiked;
    
    // Optimistic update
    setIsLiked(newLikedState);
    setCount(prev => newLikedState ? prev + 1 : prev - 1);
    
    try {
      await onToggle(postId, newLikedState);
      toast.success(newLikedState ? 'Post liked!' : 'Like removed', { duration: 1500 });
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(!newLikedState);
      setCount(prev => newLikedState ? prev - 1 : prev + 1);
      toast.error('Failed to update like');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`group flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
        isLiked
          ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm'
          : 'text-gray-600 hover:bg-gray-50 hover:text-rose-600 border border-transparent hover:border-gray-200'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Heart 
        className={`w-4 h-4 transition-all duration-200 ${
          isLiked ? 'fill-rose-500 text-rose-500' : 'group-hover:text-rose-500'
        } ${loading ? 'animate-pulse' : ''}`} 
      />
      <span className="font-semibold tabular-nums">{count}</span>
      <span className="hidden sm:inline">Like{count !== 1 ? 's' : ''}</span>
      
      {isLiked && (
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></div>
      )}
    </button>
  );
};

// Post Content Component with Read More/Less
const PostContent = ({ content, postId, expandedPosts, setExpandedPosts }) => {
  const isExpanded = expandedPosts.has(postId);
  const maxChars = 280;
  
  if (!content || content.trim().length === 0) {
    return <p className="text-gray-500 italic mb-3">No content available</p>;
  }
  
  const shouldTruncate = content.length > maxChars;
  const displayContent = shouldTruncate && !isExpanded 
    ? content.slice(0, maxChars).trim()
    : content;
  
  const toggleExpanded = () => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (isExpanded) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };
  
  return (
    <div className="mb-3">
      <div className="text-gray-700 leading-relaxed transition-all duration-300">
        {displayContent}
        {shouldTruncate && !isExpanded && (
          <span className="text-gray-400">...</span>
        )}
      </div>
      
      {shouldTruncate && (
        <button
          onClick={toggleExpanded}
          className="mt-2 text-[#0057B7] hover:text-[#FF6600] font-semibold text-sm transition-all duration-200 flex items-center gap-1.5 group bg-blue-50 hover:bg-orange-50 px-3 py-1.5 rounded-full border border-blue-200 hover:border-orange-200"
        >
          {isExpanded ? (
            <>
              <span>Show less</span>
              <svg className="w-3.5 h-3.5 transform rotate-180 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          ) : (
            <>
              <span>Read more</span>
              <svg className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );
};

const OptimizedCommunityHub = () => {
  // State management
  const { user, isVerified } = useAuth();
  const [data, setData] = useState({ categories: [], posts: [], userLikes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('recent');
  const [activeTab, setActiveTab] = useState('feed');
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Modal states
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showShareModal, setShowShareModal] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [showDropdown, setShowDropdown] = useState({});
  
  // User interaction states
  const [userPinnedPostIds, setUserPinnedPostIds] = useState(new Set());
  const [editingPost, setEditingPost] = useState(null);
  const [editText, setEditText] = useState('');

  // Prevent background scrolling for modals
  useModalScrollLock(expandedImage || showShareModal);

  // Determine user role
  const userRole = useMemo(() => {
    if (!user) return 'guest';
    const adminEmails = ['admin@testingvala.com', 'owner@testingvala.com'];
    return adminEmails.includes(user.email) ? 'admin' : 'user';
  }, [user]);

  // Load initial data using unified service
  useEffect(() => {
    loadCommunityData();
  }, [user]);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const communityData = await unifiedDataService.loadPageData(
        'community', 
        userRole, 
        user?.id
      );
      
      setData({
        categories: communityData.categories || [],
        posts: communityData.posts || [],
        userLikes: communityData.userLikes || []
      });
      
    } catch (err) {
      console.error('Error loading community data:', err);
      setError(err.message);
      
      // Fallback to local data
      try {
        const localPosts = JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
        setData({
          categories: [
            { id: 'local-general', name: 'General QA', slug: 'general' },
            { id: 'local-automation', name: 'Test Automation', slug: 'automation' }
          ],
          posts: localPosts,
          userLikes: []
        });
      } catch (localError) {
        console.error('Failed to load local data:', localError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let filtered = [...data.posts];

    // Apply search filter
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title?.toLowerCase().includes(searchLower) ||
        post.content?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category_id === selectedCategory);
    }
    
    // Apply sorting
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    switch (filterType) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      
      case 'trending':
        const recentPosts = filtered.filter(post => new Date(post.created_at) >= sevenDaysAgo);
        const olderPosts = filtered.filter(post => new Date(post.created_at) < sevenDaysAgo)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        recentPosts.sort((a, b) => {
          const aEngagement = (a.likes_count || 0) + (a.comments?.length || 0);
          const bEngagement = (b.likes_count || 0) + (b.comments?.length || 0);
          return bEngagement - aEngagement;
        });
        
        filtered = [...recentPosts, ...olderPosts];
        break;
      
      case 'hot':
        filtered = filtered.filter(post => new Date(post.created_at) >= oneDayAgo)
          .sort((a, b) => {
            const aEngagement = (a.likes_count || 0) + (a.comments?.length || 0);
            const bEngagement = (b.likes_count || 0) + (b.comments?.length || 0);
            return bEngagement - aEngagement;
          });
        break;
      
      case 'my-posts':
        if (user) {
          filtered = filtered.filter(post => 
            post.user_id === user.id || 
            post.user_profiles?.email === user.email
          ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else {
          filtered = [];
        }
        break;
      
      default:
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    return filtered;
  }, [data.posts, selectedCategory, filterType, searchQuery, user]);

  // Update displayed posts when filtered posts change
  useEffect(() => {
    setDisplayedPosts(filteredPosts.slice(0, 10));
    setHasMore(filteredPosts.length > 10);
  }, [filteredPosts]);

  // Load more posts
  const loadMorePosts = useCallback(() => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    setTimeout(() => {
      const currentLength = displayedPosts.length;
      const nextPosts = filteredPosts.slice(currentLength, currentLength + 10);
      setDisplayedPosts(prev => [...prev, ...nextPosts]);
      setHasMore(currentLength + 10 < filteredPosts.length);
      setLoadingMore(false);
    }, 300);
  }, [loadingMore, hasMore, displayedPosts.length, filteredPosts]);

  // Optimized like toggle
  const handleLikeToggle = useCallback(async (postId, newLikedState) => {
    if (!user) {
      toast.error('Please sign in to like posts');
      return;
    }

    await unifiedDataService.toggleLike(postId, user.id, user.email);
    
    // Update local state
    setData(prev => ({
      ...prev,
      posts: prev.posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes_count: newLikedState 
                ? (post.likes_count || 0) + 1 
                : Math.max(0, (post.likes_count || 0) - 1),
              user_liked: newLikedState
            }
          : post
      ),
      userLikes: newLikedState 
        ? [...prev.userLikes, postId]
        : prev.userLikes.filter(id => id !== postId)
    }));
  }, [user]);

  // Post creation handler
  const handlePostCreated = useCallback(async () => {
    // Refresh community data
    await loadCommunityData();
    toast.success('Post created successfully!');
  }, []);

  // Pin post handler
  const handlePinPost = useCallback((post) => {
    if (!user) {
      toast.error('Please sign in to pin posts');
      return;
    }

    const isCurrentlyPinned = userPinnedPostIds.has(post.id);
    
    if (isCurrentlyPinned) {
      setUserPinnedPostIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(post.id);
        return newSet;
      });
      toast.success('Post unpinned!');
    } else {
      setUserPinnedPostIds(prev => new Set([...prev, post.id]));
      toast.success('Post pinned!');
    }
  }, [user, userPinnedPostIds]);

  // Check if user can edit/delete post
  const canModifyPost = useCallback((post) => {
    if (!user) return false;
    return post.user_id === user.id || 
           post.user_profiles?.email === user.email || 
           userRole === 'admin';
  }, [user, userRole]);

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-gray-50 via-white to-orange-50 pt-2 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6600] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading community posts...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gradient-to-br from-gray-50 via-white to-orange-50 pt-2 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">⚠️ Error loading community data</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={loadCommunityData}
              className="bg-[#FF6600] text-white px-6 py-2 rounded-lg hover:bg-[#E55A00] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="community" className="bg-gradient-to-br from-gray-50 via-white to-orange-50 pt-2 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
            <MessageSquare className="w-4 h-4" />
            Community Discussions
          </div>
          {userRole === 'admin' && (
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium mb-2">
              🛡️ Admin Mode Active - You can moderate all posts
            </div>
          )}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-gray-900 via-[#0057B7] to-[#FF6600] bg-clip-text text-transparent">
            Community Discussions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join the conversation with QA professionals worldwide. Share your expertise, ask questions, and learn from the community.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search posts and discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
              >
                <option value="recent">Recent</option>
                <option value="trending">Trending (7 days)</option>
                <option value="hot">Hot Today</option>
                {user && <option value="my-posts">My Posts</option>}
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {data.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({data.posts.filter(p => p.category_id === category.id).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Create Post Button */}
            <button
              onClick={() => setShowCreatePost(true)}
              className="bg-[#FF6600] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E55A00] transition-colors duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Post
            </button>
          </div>
        </div>

        {/* Posts List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {displayedPosts.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {filterType === 'my-posts' && !user 
                  ? 'Sign in to view your posts' 
                  : 'No Posts Found'
                }
              </h3>
              <p className="text-gray-600">
                {filterType === 'my-posts' && !user 
                  ? 'Please sign in to see posts you\'ve created.' 
                  : 'Be the first to start a discussion in this category!'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {displayedPosts.map((post) => (
                <div key={post.id} className="p-6 transition-all duration-500 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {post.user_profiles?.avatar_url ? (
                        <img
                          src={post.user_profiles.avatar_url}
                          alt={post.user_profiles.username || post.author_name}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-medium text-sm">
                            {(post.author_name || post.user_profiles?.username || 'User')
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Post Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-gray-900">
                                {post.author_name || post.user_profiles?.full_name || post.user_profiles?.username || 'Anonymous'}
                              </span>
                              {userRole === 'admin' && post.user_profiles?.email?.includes('admin') && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-md font-medium">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{getTimeAgo(post.created_at)}</span>
                              <span>•</span>
                              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                                {post.category_name || 'Uncategorized'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Post Actions Dropdown */}
                        {canModifyPost(post) && (
                          <div className="relative">
                            <button
                              onClick={() => setShowDropdown(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            
                            {showDropdown[post.id] && (
                              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                                <button
                                  onClick={() => {
                                    setEditingPost(post.id);
                                    setEditText(post.content);
                                    setShowDropdown({});
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    // Handle delete
                                    setShowDropdown({});
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  {userRole === 'admin' ? 'Admin Delete' : 'Delete'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Post Title */}
                      <h3 className="text-lg font-semibold mb-3 mt-2 text-gray-900 hover:text-[#FF6600] transition-colors cursor-pointer">
                        {post.title}
                      </h3>
                      
                      {/* Post Image */}
                      {post.image_url && (
                        <div className="mb-3 group">
                          <div 
                            className="relative inline-block cursor-pointer rounded-lg overflow-hidden border border-gray-200 bg-gray-50 hover:shadow-md transition-all duration-200"
                            onClick={() => setExpandedImage(post.image_url)}
                          >
                            <img
                              src={post.image_url}
                              alt="Post image"
                              className="max-w-sm h-auto max-h-80 object-cover block"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-medium">
                                Click to expand
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Post Content */}
                      {editingPost === post.id ? (
                        <div className="mb-3">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={4}
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => {
                                // Handle save edit
                                setEditingPost(null);
                              }}
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingPost(null)}
                              className="px-4 py-2 text-gray-600 text-sm hover:text-gray-800 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <PostContent 
                          content={post.content} 
                          postId={post.id}
                          expandedPosts={expandedPosts}
                          setExpandedPosts={setExpandedPosts}
                        />
                      )}

                      {/* Post Actions */}
                      <div className="mt-6 pt-5 border-t border-gray-200">
                        <div className="flex items-center space-x-1">
                          {/* Like Button */}
                          <OptimizedLikeButton 
                            postId={post.id}
                            initialCount={post.likes_count || 0}
                            userLiked={post.user_liked || data.userLikes.includes(post.id)}
                            onToggle={handleLikeToggle}
                          />

                          {/* Comment Button */}
                          <button className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 border border-transparent hover:border-blue-200 transition-all duration-200">
                            <MessageSquare className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
                            <span className="font-semibold tabular-nums">{post.comments?.length || 0}</span>
                            <span className="hidden sm:inline">Comment{(post.comments?.length || 0) !== 1 ? 's' : ''}</span>
                          </button>

                          {/* Share Button */}
                          <button
                            onClick={() => setShowShareModal(post.id)}
                            className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent hover:border-emerald-200 transition-all duration-200"
                          >
                            <Share2 className="w-4 h-4 group-hover:text-emerald-600 transition-colors" />
                            <span className="hidden sm:inline">Share</span>
                          </button>

                          {/* Pin Button */}
                          <button
                            onClick={() => handlePinPost(post)}
                            className={`group relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                              userPinnedPostIds.has(post.id)
                                ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm'
                                : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600 border border-transparent hover:border-amber-200'
                            }`}
                          >
                            <Pin className={`w-4 h-4 transition-all duration-200 ${
                              userPinnedPostIds.has(post.id) ? 'fill-amber-500 text-amber-500 rotate-12' : 'group-hover:rotate-12'
                            }`} />
                            <span className="hidden sm:inline">{userPinnedPostIds.has(post.id) ? 'Pinned' : 'Pin'}</span>
                            {userPinnedPostIds.has(post.id) && (
                              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></div>
                            )}
                          </button>

                          {/* Save Button */}
                          <button className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm text-gray-600 hover:bg-violet-50 hover:text-violet-600 border border-transparent hover:border-violet-200 transition-all duration-200">
                            <Bookmark className="w-4 h-4 group-hover:-rotate-6 transition-all duration-200" />
                            <span className="hidden sm:inline">Save</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Load More Button */}
          {hasMore && displayedPosts.length > 0 && (
            <div className="text-center py-6 border-t border-gray-100">
              <button
                onClick={loadMorePosts}
                disabled={loadingMore}
                className="bg-[#FF6600] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#E55A00] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Loading more posts...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    Load More Posts
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Image Expansion Modal */}
        {expandedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 overflow-hidden" onClick={() => setExpandedImage(null)}>
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setExpandedImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              <img
                src={expandedImage}
                alt="Expanded view"
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Share Post</h3>
                <button
                  onClick={() => setShowShareModal(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Share functionality coming soon!</p>
                <button
                  onClick={() => setShowShareModal(null)}
                  className="mt-4 bg-[#FF6600] text-white px-6 py-2 rounded-lg hover:bg-[#E55A00] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default OptimizedCommunityHub;