import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MessageSquare, TrendingUp, Plus, Search, Filter, Heart, MoreHorizontal, Edit2, Trash2, Share2, X, Bookmark, Pin, Zap, Clipboard, Briefcase, BookOpen, Code, Layers, Calendar, Clock, Trophy, Check, Download, Linkedin, MessageCircle, Star, MapPin, Users, DollarSign, ExternalLink, RefreshCw } from 'lucide-react';
import LoadingSkeleton from './LoadingSkeleton';
import { bulletproofPostStore } from '../utils/bulletproofPostStore';
import StickyActionBar from './StickyActionBar';
import { smartCache } from '../utils/smartCacheManager';
import { StorageCleanup } from '../utils/storageCleanup';
import { useAuth } from '../contexts/AuthContext';
import ConnectionDiagnostics from './ConnectionDiagnostics';

import ThreadedComments from './ThreadedComments';
import MentionInput from './MentionInput';
import ProfessionalAvatar from './ProfessionalAvatar';
import { TwitterIcon, FacebookIcon, LinkedInIcon, WhatsAppIcon, CopyIcon } from './SocialIcons';
import { supabase } from '../lib/supabase';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

// Working Like Button Component
const RealtimeLikeButton = ({ postId, initialDbCount }) => {
  const [likeCount, setLikeCount] = useState(initialDbCount || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      if (isLiked) {
        setLikeCount(prev => Math.max(0, prev - 1));
        setIsLiked(false);
      } else {
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Like error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`group flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
        isLiked
          ? 'bg-red-50 text-red-700 border border-red-200 shadow-sm'
          : 'text-gray-600 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-200'
      }`}
    >
      <Heart className={`w-4 h-4 transition-all duration-200 ${
        isLiked ? 'fill-red-500 text-red-500 scale-110' : 'group-hover:scale-110'
      }`} />
      <span className="font-semibold tabular-nums">{likeCount}</span>
      <span className="hidden sm:inline">Like{likeCount !== 1 ? 's' : ''}</span>
    </button>
  );
};
import { trackUserEvent } from '../services/enterpriseAnalytics';

import AuthModal from './AuthModal';
import SavePostModal from './SavePostModal';
import ConfirmationModal from './ConfirmationModal';
import Winners from './Winners';
import ErrorBoundary from './ErrorBoundary';
import PartnershipModal from './PartnershipModal';
import ContestSubmissionForm from './ContestSubmissionForm';
import CreatePostModal from './CreatePostModal';
import { useGlobalData, useWebsiteData, useCommunityData, useWinnersData, useEventsData } from '../contexts/GlobalDataContext';
import { getTimeAgo } from '../utils/timeUtils';
import toast from 'react-hot-toast';

import CategoryDropdown from './CategoryDropdown';
import FilterDropdown from './FilterDropdown';

// Professional Post Content Component with Read More/Less functionality
const PostContent = ({ content, postId, expandedPosts, setExpandedPosts }) => {
  const isExpanded = expandedPosts.has(postId);
  const maxChars = 280; // Similar to Twitter's approach
  
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
      <div 
        className="text-gray-700 leading-relaxed transition-all duration-300"
        style={{
          display: shouldTruncate && !isExpanded ? '-webkit-box' : 'block',
          WebkitLineClamp: shouldTruncate && !isExpanded ? 3 : 'unset',
          WebkitBoxOrient: 'vertical',
          overflow: shouldTruncate && !isExpanded ? 'hidden' : 'visible',
          lineHeight: '1.6'
        }}
      >
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

const CommunityHub = () => {
  // Immediate cleanup on component initialization
  useMemo(() => {
    try {
      const forceClear = localStorage.getItem('force_clear_posts');
      const adminClearTime = localStorage.getItem('posts_cleared_by_admin');
      
      if (forceClear) {
        localStorage.removeItem('local_forum_posts');
        localStorage.removeItem('force_clear_posts');
        console.log('Force cleared localStorage posts');
      }
      
      if (adminClearTime) {
        const clearTimestamp = parseInt(adminClearTime);
        const now = Date.now();
        
        if (now - clearTimestamp < 24 * 60 * 60 * 1000) {
          localStorage.removeItem('local_forum_posts');
          localStorage.removeItem('posts_cleared_by_admin');
          console.log('Admin cleared localStorage posts');
        }
      }
    } catch (err) {
      console.warn('Cleanup error:', err);
    }
  }, []);
  
  const { data: siteData } = useWebsiteData();
  const { posts, categories, loading: contextLoading } = useCommunityData();
  const { winners: winnersData, loading: winnersLoading } = useWinnersData();
  const { events: eventsData, loading: eventsLoading } = useEventsData();
  const { hydrated, removePost } = useGlobalData();
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [fallbackCategories, setFallbackCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { user: authUser, isVerified } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState('comment');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [showCommentBox, setShowCommentBox] = useState({});
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [editingPost, setEditingPost] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', content: '', category_id: '', experience_years: '', author_name: '' });
  const [showDropdown, setShowDropdown] = useState({});
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [showShareModal, setShowShareModal] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(null);
  const [showDeleteReplyModal, setShowDeleteReplyModal] = useState(null);
  const [guestLikeCounts, setGuestLikeCounts] = useState({});
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  // Prevent background scrolling for inline modals
  useModalScrollLock(showDeleteModal || expandedImage || showShareModal);

  const [filterType, setFilterType] = useState('recent');
  const [activeTab, setActiveTab] = useState('feed');

  const [userPinnedPostIds, setUserPinnedPostIds] = useState(new Set());
  const [highlightedPostId, setHighlightedPostId] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [showPartnershipModal, setShowPartnershipModal] = useState(false);
  const [showContestForm, setShowContestForm] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const [stickyPost, setStickyPost] = useState(null);

  const [postIndexMap, setPostIndexMap] = useState(new Map());
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Mobile state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const getIconForCategory = (category) => {
    const id = (category?.id || '').toString().toLowerCase();
    const slug = (category?.slug || '').toLowerCase();
    const name = (category?.name || '').toLowerCase();
    if (id.includes('auto') || slug.includes('auto') || name.includes('automation') || name.includes('auto')) return <Zap className="w-4 h-4 text-white" />;
    if (id.includes('manual') || slug.includes('manual') || name.includes('manual')) return <Clipboard className="w-4 h-4 text-white" />;
    if (id.includes('career') || slug.includes('career') || name.includes('career') || name.includes('interview')) return <Briefcase className="w-4 h-4 text-white" />;
    if (id.includes('docs') || slug.includes('docs') || name.includes('docs') || name.includes('documentation')) return <BookOpen className="w-4 h-4 text-white" />;
    if (id.includes('dev') || slug.includes('dev') || name.includes('dev') || name.includes('code')) return <Code className="w-4 h-4 text-white" />;
    if (id.includes('tools') || slug.includes('tools') || name.includes('tools') || name.includes('framework')) return <Layers className="w-4 h-4 text-white" />;
    return <MessageSquare className="w-4 h-4 text-white" />;
  };

  const loadLocalPosts = () => {
    try {
      // Check for admin clear timestamp first
      const adminClearTime = localStorage.getItem('posts_cleared_by_admin');
      if (adminClearTime) {
        const clearTimestamp = parseInt(adminClearTime);
        const now = Date.now();
        
        // If admin cleared posts recently (within 24 hours), remove all local posts
        if (now - clearTimestamp < 24 * 60 * 60 * 1000) {
          localStorage.removeItem('local_forum_posts');
          localStorage.removeItem('posts_cleared_by_admin'); // Clean up the flag too
          return [];
        }
      }
      
      // Check for force clear flag
      const forceClear = localStorage.getItem('force_clear_posts');
      if (forceClear) {
        localStorage.removeItem('local_forum_posts');
        localStorage.removeItem('force_clear_posts');
        localStorage.removeItem('posts_cleared_by_admin');
        return [];
      }
      
      const raw = localStorage.getItem('local_forum_posts');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      
      // Filter out demo posts and save back to localStorage
      const cleanPosts = parsed.filter(post => !post.id?.startsWith('demo-'));
      if (cleanPosts.length !== parsed.length) {
        localStorage.setItem('local_forum_posts', JSON.stringify(cleanPosts));
      }
      
      return cleanPosts;
    } catch (err) {
      console.warn('Failed to load local posts', err);
      return [];
    }
  };

  // OPTIMIZED: Single useEffect with proper cleanup
  useEffect(() => { 
    let mounted = true;
    let initPromise = null;
    
    const initializeComponent = async () => {
      // Prevent multiple initializations
      if (initPromise) return initPromise;
      
      initPromise = (async () => {
        try {
          // Cleanup check
          const forceClear = localStorage.getItem('force_clear_posts');
          const adminClearTime = localStorage.getItem('posts_cleared_by_admin');
          
          if (forceClear || (adminClearTime && Date.now() - parseInt(adminClearTime) < 24 * 60 * 60 * 1000)) {
            localStorage.removeItem('local_forum_posts');
            localStorage.removeItem('force_clear_posts');
            if (adminClearTime && Date.now() - parseInt(adminClearTime) < 24 * 60 * 60 * 1000) {
              localStorage.removeItem('posts_cleared_by_admin');
            }
          }
          
          // Load fallback categories from database if context categories are empty
          if (categories.length === 0 && !contextLoading && supabase) {
            try {
              const { data: categoriesData, error } = await supabase
                .from('forum_categories')
                .select('*')
                .order('name');
              
              if (!error && categoriesData && categoriesData.length > 0) {
                setFallbackCategories(categoriesData);
                console.log('Loaded fallback categories:', categoriesData);
              } else {
                console.warn('No categories found in database');
                setFallbackCategories([]);
              }
            } catch (err) {
              console.error('Error loading categories:', err);
              setFallbackCategories([]);
            }
          }
          
          // Single batch initialization
          if (mounted) {
            await checkAuthStatus();
          }
        } catch (error) {
          console.error('Component initialization error:', error);
        }
      })();
      
      return initPromise;
    };
    
    initializeComponent();
    
    // Listen for post highlighting from hash navigation
    const handleHighlightPost = (event) => {
      const postId = event.detail.postId;
      navigateToPost(postId);
    };
    
    window.addEventListener('highlightPost', handleHighlightPost);
    return () => {
      mounted = false;
      initPromise = null;
      window.removeEventListener('highlightPost', handleHighlightPost);
    };
  }, [categories, contextLoading]); // Depend on categories and loading state

  // Separate effect to handle auth changes
  useEffect(() => {
    checkAuthStatus();
  }, [authUser, isVerified]);



  // OPTIMIZED: Use context for engagement data
  const loadCommentsAndLikes = useCallback(async () => {
    // Engagement data now handled by context
    return;
  }, []);

  // Engagement data handled by context - no additional loading needed

  const loadUserPinnedPosts = async () => {
    if (!authUser?.email) return;
    setUserPinnedPostIds(new Set()); // Simplified - no database dependency
  };

  const handlePinPost = async (post) => {
    if (!authUser) {
      setSelectedPostId(post.id);
      setAuthAction('pin');
      setShowAuthModal(true);
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
  };

  const checkAuthStatus = async () => {
    try {
      // Reset filter to 'recent' if user logs out and was on 'my-posts'
      if (!authUser && filterType === 'my-posts') {
        setFilterType('recent');
      }
      
      if (authUser && isVerified) {
        loadUserPinnedPosts();
        loadUserLikes();
        loadCurrentUserProfile();
      } else {
        // Load local likes for non-authenticated users
        loadUserLikes();
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };



  const loadUserLikes = async () => {
    if (!authUser?.email) {
      // Load guest likes and counts from localStorage
      try {
        const guestLikes = JSON.parse(localStorage.getItem('guest_likes') || '[]');
        const guestCounts = JSON.parse(localStorage.getItem('guest_like_counts') || '{}');
        setLikedPosts(new Set(guestLikes));
        setGuestLikeCounts(guestCounts);
      } catch (error) {
        setLikedPosts(new Set());
        setGuestLikeCounts({});
      }
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_email', authUser.email);
      
      if (error) throw error;
      
      const likedPostIds = new Set((data || []).map(like => like.post_id));
      setLikedPosts(likedPostIds);
    } catch (error) {
      console.error('Error loading user likes:', error);
      setLikedPosts(new Set());
    }
  };

  const getFilteredAndSortedPosts = (postsToFilter) => {
    let filtered = [...postsToFilter];  // Create a copy to avoid mutations

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title?.toLowerCase().includes(searchLower) ||
        post.content?.toLowerCase().includes(searchLower) ||
        post.author_name?.toLowerCase().includes(searchLower) ||
        post.category_name?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply category filter
    if (selectedCategory && selectedCategory !== 'all') {
      console.log('Filtering by category:', selectedCategory);
      console.log('Available posts:', filtered.map(p => ({ id: p.id, category_id: p.category_id, category_name: p.category_name })));
      filtered = filtered.filter(post => {
        const matches = post.category_id === selectedCategory;
        if (!matches) {
          console.log(`Post ${post.id} category ${post.category_id} does not match filter ${selectedCategory}`);
        }
        return matches;
      });
      console.log('Filtered posts count:', filtered.length);
    }
    
    // Apply sorting based on filter type
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    switch (filterType) {
      case 'recent':
        filtered = filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      
      case 'trending':
        // Posts from last 7 days sorted by engagement (likes + comments), then by recency
        const recentPosts = filtered.filter(post => new Date(post.created_at) >= sevenDaysAgo);
        const olderPosts = filtered.filter(post => new Date(post.created_at) < sevenDaysAgo)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        recentPosts.sort((a, b) => {
          const aEngagement = (a.likes_count || 0) + (a.replies_count || 0);
          const bEngagement = (b.likes_count || 0) + (b.replies_count || 0);
          return bEngagement - aEngagement;
        });
        
        filtered = [...recentPosts, ...olderPosts];
        break;
      
      case 'hot':
        // Posts from last 24 hours sorted by engagement
        filtered = filtered.filter(post => new Date(post.created_at) >= oneDayAgo)
          .sort((a, b) => {
            const aEngagement = (a.likes_count || 0) + (a.replies_count || 0);
            const bEngagement = (b.likes_count || 0) + (b.replies_count || 0);
            return bEngagement - aEngagement;
          });
        break;
      
      case 'my-posts':
        // Filter posts by current user and sort by recency
        if (!authUser) {
          filtered = [];
        } else {
          filtered = filtered.filter(post => isPostOwner(post))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        break;
      
      default:
        filtered = filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }
    
    return filtered;
  };

  // Legacy like handler - now handled by RealtimeLikeButton
  const handleLike = async (postId) => {
    // This function is now deprecated - likes are handled by RealtimeLikeButton
    console.warn('Legacy handleLike called - should use RealtimeLikeButton instead');
  };



  const handleCommentClick = (postId) => {
    if (!authUser) {
      setSelectedPostId(postId);
      setAuthAction('comment');
      setShowAuthModal(true);
      return;
    }
    
    setShowCommentBox(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentSubmit = async (postId) => {
    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (!authUser) {
      setSelectedPostId(postId);
      setAuthAction('comment');
      setShowAuthModal(true);
      return;
    }

    try {
      setDisplayedPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, replies_count: (post.replies_count || 0) + 1 }
          : post
      ));
      
      setCommentText('');
      setShowCommentBox(prev => ({ ...prev, [postId]: false }));
      // Track comment event
      try {
        trackUserEvent.community.comment(postId);
      } catch (error) {
        console.warn('Analytics tracking failed:', error);
      }
      toast.success('Comment added!');
    } catch (error) {
      console.error('Comment error:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    checkAuthStatus();
    
    if (authAction === 'comment' && selectedPostId) {
      setShowCommentBox(prev => ({
        ...prev,
        [selectedPostId]: true
      }));
    } else if (authAction === 'save' && selectedPostId) {
      setTimeout(() => {
        setShowSaveModal(selectedPostId);
      }, 500);
    } else if (authAction === 'create') {
      setTimeout(() => {
        setShowCreatePost(true);
      }, 500);
    }
    
    toast.success('Successfully verified! You can now participate in discussions.');
  };

  const isPostOwner = (post) => {
    if (!authUser) return false;
    // Check by user_id first (most reliable)
    if (post.user_id === authUser.id) return true;
    // Check by email if user_profiles exists
    if (post.user_profiles?.email === authUser.email) return true;
    // Check by author_name if it matches user's email prefix
    if (post.author_name === authUser.email?.split('@')[0]) return true;
    // For local posts, check if the post was created by current user
    if (post.id?.startsWith('local-') && post.user_profiles?.email === authUser.email) return true;
    // Additional check for posts created without authentication (local posts)
    if (post.id?.startsWith('local-') && !post.user_profiles?.email && authUser.email) return true;
    return false;
  };

  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  const loadCurrentUserProfile = async () => {
    if (!authUser?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', authUser.id)
        .single();
      
      if (error) {
        console.warn('user_profiles table not found, using email-based admin check');
        return;
      }
      setCurrentUserProfile(data);
    } catch (error) {
      console.warn('Error loading user profile, using fallback admin check:', error);
    }
  };

  const isAdmin = (userEmail) => {
    // Fallback admin emails if database check fails
    const adminEmails = ['admin@testingvala.com', 'owner@testingvala.com'];
    return adminEmails.includes(userEmail);
  };

  const isCurrentUserAdmin = () => {
    return currentUserProfile?.is_admin || isAdmin(authUser?.email);
  };

  const canDeletePost = (post) => {
    if (!authUser) return false;
    return isPostOwner(post) || isCurrentUserAdmin();
  };

  const canEditPost = (post) => {
    if (!authUser) return false;
    return isPostOwner(post) || isCurrentUserAdmin();
  };

  const handleEditPost = (post) => {
    setEditingPost(post.id);
    setEditFormData({
      title: post.title || '',
      content: post.content || '',
      category_id: post.category_id || '',
      experience_years: post.experience_years || '',
      author_name: post.author_name || ''
    });
    setShowDropdown({});
  };

  const handleSaveEdit = async (postId) => {
    if (!editFormData.title.trim() || !editFormData.content.trim()) {
      toast.error('Title and content cannot be empty');
      return;
    }

    try {
      const updateData = {
        title: editFormData.title.trim(),
        content: editFormData.content.trim(),
        category_id: editFormData.category_id,
        experience_years: editFormData.experience_years || null,
        author_name: editFormData.author_name.trim(),
        updated_at: new Date().toISOString()
      };

      // Update in database if available
      if (supabase) {
        const { error } = await supabase
          .from('forum_posts')
          .update(updateData)
          .eq('id', postId);
        
        if (error) throw error;
      }
      
      // Update local posts if it's a local post
      if (postId.startsWith('local-')) {
        const localPosts = JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
        const updatedPosts = localPosts.map(post => 
          post.id === postId ? { ...post, ...updateData } : post
        );
        localStorage.setItem('local_forum_posts', JSON.stringify(updatedPosts));
      }
      
      setDisplayedPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, ...updateData } : post
      ));
      
      setEditingPost(null);
      setEditFormData({ title: '', content: '', category_id: '', experience_years: '', author_name: '' });
      toast.success('Post updated successfully!');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  };

  const handleDeletePost = async (postId) => {
    const post = displayedPosts.find(p => p.id === postId);
    setShowDeleteModal(post);
  };

  const confirmDeletePost = async (postId) => {
    try {
      // For local posts, use context removePost
      if (postId.startsWith('local-')) {
        const success = removePost(postId);
        if (success) {
          toast.success('Post deleted successfully!');
        } else {
          toast.error('Failed to delete post');
        }
      } else if (supabase) {
        // For database posts, try to delete from Supabase
        const { error } = await supabase
          .from('forum_posts')
          .delete()
          .eq('id', postId);
        
        if (error) {
          console.error('Database delete error:', error);
          toast.error('Failed to delete post from database');
        } else {
          toast.success('Post deleted successfully!');
        }
      }
      
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
      setShowDeleteModal(null);
    }
  };

  const handleViewComments = (postId) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      // Create new comment object
      const newComment = {
        id: `comment-${Date.now()}`,
        content: commentText.trim(),
        author_name: authUser.email.split('@')[0],
        user_email: authUser.email,
        created_at: new Date().toISOString(),
        replies: []
      };

      // If Supabase is available, try to save to database
      if (supabase) {
        try {
          const savedComment = await addPostComment(postId, commentText.trim(), authUser.email);
          if (savedComment) {
            newComment.id = savedComment.id;
            newComment.author_name = savedComment.author_name;
          }
        } catch (dbError) {
          console.warn('Failed to save comment to database, using local comment:', dbError);
        }
      }
      
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }));
      
      setDisplayedPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, replies_count: (post.replies_count || 0) + 1 }
          : post
      ));
      
      setCommentText('');
      // Track comment event
      try {
        trackUserEvent.community.comment(postId);
      } catch (error) {
        console.warn('Analytics tracking failed:', error);
      }
      toast.success('Comment added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleReplyToComment = async (postId, commentId) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    const newReply = {
      id: `reply-${commentId}-${Date.now()}`,
      text: replyText.trim(),
      author: authUser.email,
      authorName: authUser.email.split('@')[0],
      createdAt: new Date().toISOString()
    };

    setComments(prev => ({
      ...prev,
      [postId]: prev[postId].map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: [...comment.replies, newReply] }
          : comment
      )
    }));
    
    setReplyText('');
    setReplyingTo(null);
    toast.success('Reply added!');
  };

  const isCommentOwner = (comment) => {
    return authUser && (comment.user_email === authUser.email || comment.author === authUser.email);
  };

  const handleDeleteComment = (postId, commentId) => {
    const comment = comments[postId]?.find(c => c.id === commentId);
    if (!comment) return;
    
    setShowDeleteCommentModal({ postId, commentId, comment });
  };

  const confirmDeleteComment = () => {
    if (!showDeleteCommentModal) return;
    
    const { postId, commentId } = showDeleteCommentModal;
    
    setComments(prev => ({
      ...prev,
      [postId]: prev[postId].filter(comment => comment.id !== commentId)
    }));
    
    setDisplayedPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, replies_count: Math.max(0, (post.replies_count || 0) - 1) }
        : post
    ));
    
    setShowDeleteCommentModal(null);
    toast.success('Comment deleted!');
  };

  const handleDeleteReply = (postId, commentId, replyId) => {
    const comment = comments[postId]?.find(c => c.id === commentId);
    const reply = comment?.replies?.find(r => r.id === replyId);
    if (!reply) return;
    
    setShowDeleteReplyModal({ postId, commentId, replyId, reply });
  };

  const confirmDeleteReply = () => {
    if (!showDeleteReplyModal) return;
    
    const { postId, commentId, replyId } = showDeleteReplyModal;
    
    setComments(prev => ({
      ...prev,
      [postId]: prev[postId].map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: comment.replies.filter(reply => reply.id !== replyId) }
          : comment
      )
    }));
    
    setShowDeleteReplyModal(null);
    toast.success('Reply deleted!');
  };



  // Ensure categories are available for filtering
  const availableCategories = useMemo(() => {
    const hardcodedCategories = [
      { id: 'general-discussion', name: 'General Discussion' },
      { id: 'manual-testing', name: 'Manual Testing' },
      { id: 'automation-testing', name: 'Automation Testing' },
      { id: 'api-testing', name: 'API Testing' },
      { id: 'performance-load-testing', name: 'Performance & Load Testing' },
      { id: 'security-testing', name: 'Security Testing' },
      { id: 'mobile-testing', name: 'Mobile Testing' },
      { id: 'interview-preparation', name: 'Interview Preparation' },
      { id: 'certifications-courses', name: 'Certifications & Courses' },
      { id: 'career-guidance', name: 'Career Guidance' },
      { id: 'freshers-beginners', name: 'Freshers & Beginners' },
      { id: 'test-management-tools', name: 'Test Management Tools' },
      { id: 'cicd-devops', name: 'CI/CD & DevOps' },
      { id: 'bug-tracking', name: 'Bug Tracking' },
      { id: 'ai-in-testing', name: 'AI in Testing' },
      { id: 'job-openings-referrals', name: 'Job Openings & Referrals' },
      { id: 'testing-contests-challenges', name: 'Testing Contests & Challenges' },
      { id: 'best-practices-processes', name: 'Best Practices & Processes' },
      { id: 'community-helpdesk', name: 'Community Helpdesk' },
      { id: 'events-meetups', name: 'Events & Meetups' }
    ];
    
    const contextCategories = categories || [];
    const combined = contextCategories.length > 0 ? contextCategories : hardcodedCategories;
    
    console.log('Available categories for filtering:', combined.length, combined.map(c => ({ id: c.id, name: c.name })));
    return combined;
  }, [categories]);

  // Posts now loaded via useCommunityData hook
  
  const mergedPosts = useMemo(() => {
    return bulletproofPostStore.getMergedPosts(posts);
  }, [posts]);

  // Separate effect for filtering when posts or filters change
  // Create post index map for O(1) lookup
  const filteredPosts = useMemo(() => {
    if (!mergedPosts || mergedPosts.length === 0) return [];
    return getFilteredAndSortedPosts(mergedPosts);
  }, [mergedPosts, selectedCategory, filterType, searchQuery, authUser]);

  // Update post index map when filtered posts change
  useEffect(() => {
    const indexMap = new Map();
    filteredPosts.forEach((post, index) => {
      indexMap.set(post.id, index);
    });
    setPostIndexMap(indexMap);
  }, [filteredPosts]);

  // Advanced navigation with instant lookup
  const navigateToPost = useCallback((postId) => {
    const targetIndex = postIndexMap.get(postId);
    if (targetIndex === undefined) return false;
    
    setIsNavigating(true);
    
    // Calculate optimal window (20 posts max)
    const windowSize = 20;
    const startIndex = Math.max(0, targetIndex - 5);
    const endIndex = Math.min(filteredPosts.length, startIndex + windowSize);
    
    // Instant update with requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
      setDisplayedPosts(filteredPosts.slice(startIndex, endIndex));
      setHasMore(endIndex < filteredPosts.length);
      
      // Immediate highlight and scroll
      requestAnimationFrame(() => {
        setHighlightedPostId(postId);
        const postElement = document.getElementById(`post-${postId}`);
        if (postElement) {
          postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            setHighlightedPostId(null);
            setIsNavigating(false);
          }, 2000);
        } else {
          setIsNavigating(false);
        }
      });
    });
    
    return true;
  }, [postIndexMap, filteredPosts]);

  // Handle initial load and hash navigation
  useEffect(() => {
    if (filteredPosts.length === 0) {
      setDisplayedPosts([]);
      setHasMore(false);
      return;
    }
    
    const hash = window.location.hash;
    if (hash.startsWith('#community-post-')) {
      const postId = hash.replace('#community-post-', '');
      if (!navigateToPost(postId)) {
        // Fallback to normal loading if post not found
        setDisplayedPosts(filteredPosts.slice(0, 5));
        setHasMore(filteredPosts.length > 5);
      }
    } else {
      // Normal pagination loading
      setDisplayedPosts(filteredPosts.slice(0, 5));
      setHasMore(filteredPosts.length > 5);
    }
  }, [filteredPosts, navigateToPost]);

  // Auto-rotate events carousel
  useEffect(() => {
    if (!eventsData || eventsData.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentEventIndex(prev => (prev + 1) % eventsData.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [eventsData]);

  // Scroll detection for sticky action bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Find which post is currently in view
      displayedPosts.forEach(post => {
        const postElement = document.getElementById(`post-${post.id}`);
        if (postElement) {
          const rect = postElement.getBoundingClientRect();
          const isInView = rect.top < windowHeight * 0.3 && rect.bottom > windowHeight * 0.7;
          
          if (isInView && rect.bottom < 100) {
            setStickyPost(post.id);
          } else if (rect.top > windowHeight * 0.3) {
            setStickyPost(null);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [displayedPosts]);

  // Listen for localStorage changes (admin deletions)
  useEffect(() => {
    const handlePostsUpdated = (event) => {
      console.log('Posts updated by admin:', event.detail);
      if (event.detail?.action === 'clearAll' || event.detail?.action === 'forceReset') {
        // Force clear localStorage
        localStorage.removeItem('local_forum_posts');
        localStorage.removeItem('posts_cleared_by_admin');
        setDisplayedPosts([]);
        setHasMore(false);
      } else if (event.detail?.deletedPostId) {
        const deletedId = event.detail.deletedPostId;
        setDisplayedPosts(prev => prev.filter(p => p.id !== deletedId));
      }
    };
    
    const handleStorageChange = (event) => {
      console.log('localStorage changed, refreshing local posts...', event);
      
      // Check for force clear flag
      const forceClear = localStorage.getItem('force_clear_posts');
      if (forceClear) {
        localStorage.removeItem('force_clear_posts');
        localStorage.removeItem('local_forum_posts');
        setDisplayedPosts([]);
        setHasMore(false);
        return;
      }
      
      const currentLocal = JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
      const currentLocalIds = new Set(currentLocal.map(p => p.id));
      
      setDisplayedPosts(prev => prev.filter(p => 
        !p.id?.startsWith('local-') || currentLocalIds.has(p.id)
      ));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('postsUpdated', handlePostsUpdated);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('postsUpdated', handlePostsUpdated);
    };
  }, []);

  // Get refresh function from context
  const { refreshData } = useGlobalData();
  
  // Force refresh posts
  const refreshPosts = useCallback(async () => {
    try {
      console.log('🔄 Refreshing posts...');
      
      // Clear all caches
      if (window.dataService) {
        window.dataService.clearCache();
      }
      
      // Force context refresh
      if (refreshData) {
        await refreshData();
      }
      
      console.log('✅ Posts refreshed');
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    }
  }, [refreshData]);



  const loadMorePosts = useCallback(() => {
    if (loadingMore || !hasMore || isNavigating) return;
    
    setLoadingMore(true);
    requestAnimationFrame(() => {
      const currentLength = displayedPosts.length;
      const nextPosts = filteredPosts.slice(currentLength, currentLength + 5);
      setDisplayedPosts(prev => [...prev, ...nextPosts]);
      setHasMore(currentLength + 5 < filteredPosts.length);
      setLoadingMore(false);
    });
  }, [loadingMore, hasMore, displayedPosts.length, filteredPosts, isNavigating]);

  return (
    <section id="community" className="bg-gradient-to-br from-gray-50 via-white to-orange-50 pt-2 pb-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Responsive Header */}
        <div className="text-center mb-3 sm:mb-4">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-primary text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-2 sm:mb-3 shadow-lg">
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
            Community Hub
          </div>
          {authUser && isCurrentUserAdmin() && (
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-red-100 text-red-800 px-2 sm:px-3 py-1 rounded-full text-xs font-medium mb-2">
              🛡️ Admin Mode Active
            </div>
          )}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1.5 sm:mb-2 bg-gradient-to-r from-gray-900 via-[#0057B7] to-[#FF6600] bg-clip-text text-transparent px-2">
            QA Professional Network
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto px-4">
            Connect. Share. Grow.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 sm:p-6 mb-6">
          {/* Mobile Layout */}
          <div className="md:hidden space-y-3">
            {/* Search Bar - Full Width */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search posts and discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
              />
            </div>
            
            {/* Mobile Controls Row */}
            <div className="flex items-center gap-2">
              {/* Filters Button */}
              {activeTab === 'feed' && (
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="flex items-center gap-2 px-3 py-2.5 text-gray-600 hover:text-[#FF6600] hover:bg-orange-50 border border-gray-300 rounded-lg font-medium transition-all duration-200 min-h-[44px] flex-1"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              )}
              
              {/* Pinned Button */}
              <button
                onClick={() => {
                  if (!authUser) {
                    setAuthAction('pin');
                    setShowAuthModal(true);
                    return;
                  }
                  setActiveTab(activeTab === 'pinned' ? 'feed' : 'pinned');
                }}
                className={`px-3 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 min-h-[44px] flex-1 ${
                  activeTab === 'pinned'
                    ? 'bg-[#FF6600] text-white shadow-md'
                    : 'text-gray-600 hover:text-[#FF6600] hover:bg-orange-50 border border-gray-300'
                }`}
              >
                {activeTab === 'pinned' ? <MessageSquare className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                <span className="text-sm">{activeTab === 'pinned' ? 'All Posts' : `Pinned (${userPinnedPostIds.size})`}</span>
              </button>
              
              {/* Create Post Button - Mobile */}
              <button
                onClick={() => {
                  console.log('Create Post clicked - Mobile', { authUser, isVerified });
                  if (!authUser || !isVerified) {
                    console.log('Opening auth modal');
                    setAuthAction('create');
                    setShowAuthModal(true);
                    return;
                  }
                  console.log('Opening create post modal');
                  setShowCreatePost(true);
                }}
                className="bg-[#FF6600] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#E55A00] transition-all duration-200 flex items-center gap-2 min-h-[44px] shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Create</span>
              </button>
            </div>
            
            {/* Mobile Filters Dropdown */}
            {showMobileFilters && activeTab === 'feed' && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-3 border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <FilterDropdown
                    filterType={filterType}
                    onFilterChange={setFilterType}
                    authUser={authUser}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <CategoryDropdown
                    categories={availableCategories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={(categoryId) => {
                      console.log('Mobile category filter changed to:', categoryId);
                      setSelectedCategory(categoryId);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Desktop Layout - Preserve Exact Original */}
          <div className="hidden md:flex md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search posts and discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                />
              </div>
            </div>

            {/* Filter Dropdown - Only show for Feed tab */}
            {activeTab === 'feed' && (
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <FilterDropdown
                  filterType={filterType}
                  onFilterChange={setFilterType}
                  authUser={authUser}
                />
              </div>
            )}

            {/* Category Filter - Only show for Feed tab */}
            {activeTab === 'feed' && (
              <CategoryDropdown
                categories={availableCategories}
                selectedCategory={selectedCategory}
                onCategoryChange={(categoryId) => {
                  console.log('Category filter changed to:', categoryId);
                  setSelectedCategory(categoryId);
                }}
              />
            )}

            {/* Pinned Tab Button */}
            <button
              onClick={() => {
                if (!authUser) {
                  setAuthAction('pin');
                  setShowAuthModal(true);
                  return;
                }
                setActiveTab(activeTab === 'pinned' ? 'feed' : 'pinned');
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'pinned'
                  ? 'bg-[#FF6600] text-white shadow-md'
                  : 'text-gray-600 hover:text-[#FF6600] hover:bg-orange-50 border border-gray-300'
              }`}
            >
              {activeTab === 'pinned' ? <MessageSquare className="w-5 h-5" /> : <Pin className="w-5 h-5" />}
              {activeTab === 'pinned' ? 'All Posts' : `Pinned (${userPinnedPostIds.size})`}
            </button>

            {/* Create Post Button */}
            <button
              onClick={() => {
                console.log('Create Post clicked - Desktop', { authUser, isVerified });
                if (!authUser || !isVerified) {
                  console.log('Opening auth modal');
                  setAuthAction('create');
                  setShowAuthModal(true);
                  return;
                }
                console.log('Opening create post modal');
                setShowCreatePost(true);
              }}
              className="bg-[#FF6600] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E55A00] transition-colors duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Create Post
            </button>
          </div>
        </div>
        


        {/* Main Content Area with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Posts List - Main Content */}
          <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {activeTab === 'pinned' ? (
            // Pinned Posts Tab
            <div>
              {userPinnedPostIds.size === 0 ? (
                <div className="text-center py-8 sm:py-12 px-4">
                  <Pin className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Pinned Posts</h3>
                  <p className="text-sm sm:text-base text-gray-600">Pin posts from the feed to save them here for quick access!</p>
                  <div className="mt-4 sm:mt-6">
                    <p className="text-xs sm:text-sm text-gray-500">No posts pinned yet</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {displayedPosts.filter(post => userPinnedPostIds.has(post.id)).map((post) => (
                    <div 
                      key={post.id} 
                      className="p-3 sm:p-6 transition-all duration-500 hover:bg-gray-50 bg-amber-50/30 border-l-4 border-amber-400"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
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
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-start gap-3">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                  <Pin className="w-4 h-4 text-amber-600 fill-amber-500" />
                                  <span className="text-sm font-semibold text-gray-900">
                                    {post.author_name || post.user_profiles?.full_name || post.user_profiles?.username || 'Anonymous'}
                                  </span>
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-md font-medium">
                                    Pinned
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>{getTimeAgo(post.created_at)}</span>
                                  <span>•</span>
                                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                                    {post.category_name}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <h3 className="text-base sm:text-lg font-semibold mb-3 mt-2 text-gray-900">
                            {post.title}
                          </h3>
                          
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
                          
                          <PostContent 
                            content={post.content} 
                            postId={post.id}
                            expandedPosts={expandedPosts}
                            setExpandedPosts={setExpandedPosts}
                          />

                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <RealtimeLikeButton postId={post.id} initialDbCount={post.likes_count} />
                                <span className="text-sm text-gray-500">
                                  {(comments[post.id] || []).length} comments
                                </span>
                              </div>
                              <button
                                onClick={() => handlePinPost(post)}
                                className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1"
                              >
                                <Pin className="w-4 h-4 fill-amber-500" />
                                Unpin
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Feed Tab
            <div>
              {contextLoading ? (
                <LoadingSkeleton count={5} />
              ) : displayedPosts.length === 0 ? (
                <div className="text-center py-8 sm:py-12 px-4">
                  <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    {filterType === 'my-posts' && (!authUser || !isVerified) 
                      ? 'Sign in and verify to view your posts' 
                      : filterType === 'my-posts' 
                      ? 'No posts found' 
                      : contextLoading
                      ? 'Loading posts...'
                      : 'Setup Required'
                    }
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">
                    {filterType === 'my-posts' && (!authUser || !isVerified) 
                      ? 'Please sign in and verify your email to see posts you\'ve created.' 
                      : filterType === 'my-posts' 
                      ? 'You haven\'t created any posts yet. Create your first post!' 
                      : contextLoading
                      ? 'Please wait while we load the community posts...'
                      : 'Failed to load boards: Connection issues detected'
                    }
                  </p>
                  {filterType === 'my-posts' && (!authUser || !isVerified) && (
                    <button
                      onClick={() => {
                        setAuthAction('create');
                        setShowAuthModal(true);
                      }}
                      className="mt-4 bg-[#FF6600] text-white px-4 sm:px-6 py-2.5 sm:py-2 rounded-lg font-semibold hover:bg-[#E55A00] transition-colors text-sm sm:text-base min-h-[44px] sm:min-h-auto flex items-center justify-center"
                    >
                      Sign In
                    </button>
                  )}
                  {!contextLoading && displayedPosts.length === 0 && filterType !== 'my-posts' && (
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowDiagnostics(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Run Diagnostics
                      </button>
                      <button
                        onClick={() => {
                          refreshPosts();
                          setTimeout(() => window.location.reload(), 1000);
                        }}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Retry Connection
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {displayedPosts.map((post) => (
                    <div 
                      key={post.id} 
                      id={`post-${post.id}`}
                      className={`p-3 sm:p-6 transition-all duration-500 ${
                        highlightedPostId === post.id 
                          ? 'bg-gradient-to-r from-blue-50 to-orange-50 border-2 border-blue-300 rounded-lg shadow-lg transform scale-[1.02]' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
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
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-start gap-3">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {post.author_name || post.user_profiles?.full_name || post.user_profiles?.username || 'Anonymous'}
                                  </span>
                                  {post.experience_years && (
                                    <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full font-medium border border-green-200">
                                      {post.experience_years} • QA
                                    </span>
                                  )}
                                  {isAdmin(post.user_profiles?.email) && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-md font-medium">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>{getTimeAgo(post.created_at)}</span>
                                  <span>•</span>
                                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                                    {post.category_name}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {(canEditPost(post) || canDeletePost(post)) && (
                              <div className="relative">
                                <button
                                  onClick={() => setShowDropdown(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                                
                                {showDropdown[post.id] && (
                                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                                    {canEditPost(post) && (
                                      <button
                                        onClick={() => handleEditPost(post)}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                        Edit
                                      </button>
                                    )}
                                    {canDeletePost(post) && (
                                      <button
                                        onClick={() => handleDeletePost(post.id)}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                        {isCurrentUserAdmin() ? 'Admin Delete' : 'Delete'}
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <h3 className={`text-lg sm:text-xl font-bold mb-3 mt-2 hover:text-[#FF6600] transition-colors cursor-pointer ${
                            highlightedPostId === post.id ? 'text-blue-700' : 'text-gray-900'
                          }`}>
                            {post.title}
                          </h3>
                          
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
                          
                          {editingPost === post.id ? (
                            <div className="mb-3 space-y-4 p-4 bg-gray-50 rounded-lg">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                  type="text"
                                  value={editFormData.title}
                                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                  value={editFormData.category_id}
                                  onChange={(e) => setEditFormData(prev => ({ ...prev, category_id: e.target.value }))}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                >
                                  {(categories.length > 0 ? categories : fallbackCategories).map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                  ))}
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                                <input
                                  type="text"
                                  value={editFormData.author_name}
                                  onChange={(e) => setEditFormData(prev => ({ ...prev, author_name: e.target.value }))}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                                <select
                                  value={editFormData.experience_years}
                                  onChange={(e) => setEditFormData(prev => ({ ...prev, experience_years: e.target.value }))}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                >
                                  <option value="">Select experience</option>
                                  <option value="1 year">1 year</option>
                                  <option value="2 years">2 years</option>
                                  <option value="3 years">3 years</option>
                                  <option value="4 years">4 years</option>
                                  <option value="5 years">5 years</option>
                                  <option value="6 years">6 years</option>
                                  <option value="7 years">7 years</option>
                                  <option value="8 years">8 years</option>
                                  <option value="9 years">9 years</option>
                                  <option value="10+ years">10+ years</option>
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                <textarea
                                  value={editFormData.content}
                                  onChange={(e) => setEditFormData(prev => ({ ...prev, content: e.target.value }))}
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 bg-white"
                                  rows={4}
                                />
                              </div>
                              
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveEdit(post.id)}
                                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Save Changes
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

                          {/* Enhanced Post Actions */}
                          <div className="mt-4 sm:mt-6 pt-3 sm:pt-5 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1 overflow-x-auto pb-2 sm:pb-0">
                                {/* Like Action - Real-time */}
                                <div className="flex-shrink-0">
                                  <RealtimeLikeButton 
                                    postId={post.id} 
                                    initialDbCount={post.likes_count || 0}
                                  />
                                </div>

                                {/* Comment Action */}
                                <button
                                  onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                                  className="group flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-2.5 rounded-xl font-medium text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 border border-transparent hover:border-blue-200 transition-all duration-200 flex-shrink-0 min-h-[44px] sm:min-h-auto"
                                >
                                  <MessageSquare className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
                                  <span className="font-semibold tabular-nums">{(comments[post.id] || []).length}</span>
                                  <span className="hidden sm:inline">Comment{(comments[post.id] || []).length !== 1 ? 's' : ''}</span>
                                </button>

                                {/* Share Action */}
                                <button
                                  onClick={() => setShowShareModal(post.id)}
                                  className="group flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-2.5 rounded-xl font-medium text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent hover:border-emerald-200 transition-all duration-200 flex-shrink-0 min-h-[44px] sm:min-h-auto"
                                >
                                  <Share2 className="w-4 h-4 group-hover:text-emerald-600 transition-colors" />
                                  <span className="hidden sm:inline">Share</span>
                                </button>

                                {/* Pin Action */}
                                <button
                                  onClick={() => handlePinPost(post)}
                                  className={`group relative flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex-shrink-0 min-h-[44px] sm:min-h-auto ${
                                    userPinnedPostIds.has(post.id)
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm'
                                      : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600 border border-transparent hover:border-amber-200'
                                  }`}
                                  title={userPinnedPostIds.has(post.id) ? 'Unpin from collection' : 'Pin to collection'}
                                >
                                  <Pin className={`w-4 h-4 transition-all duration-200 ${
                                    userPinnedPostIds.has(post.id) ? 'fill-amber-500 text-amber-500 rotate-12' : 'group-hover:rotate-12'
                                  }`} />
                                  <span className="hidden sm:inline">{userPinnedPostIds.has(post.id) ? 'Pinned' : 'Pin'}</span>
                                  {userPinnedPostIds.has(post.id) && (
                                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></div>
                                  )}
                                </button>

                                {/* Save Action */}
                                <button
                                  onClick={() => {
                                    if (!authUser || !isVerified) {
                                      setSelectedPostId(post.id);
                                      setAuthAction('save');
                                      setShowAuthModal(true);
                                    } else {
                                      setShowSaveModal(post.id);
                                    }
                                  }}
                                  className="group flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-2.5 rounded-xl font-medium text-sm text-gray-600 hover:bg-violet-50 hover:text-violet-600 border border-transparent hover:border-violet-200 transition-all duration-200 flex-shrink-0 min-h-[44px] sm:min-h-auto"
                                  title="Save post"
                                >
                                  <Bookmark className="w-4 h-4 group-hover:-rotate-6 transition-all duration-200" />
                                  <span className="hidden sm:inline">Save</span>
                                </button>
                              </div>
                              

                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Comments Section */}
                      {showComments[post.id] && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          {/* Comment Input */}
                          {authUser && isVerified ? (
                            <div className="mb-4">
                              <div className="flex gap-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                                  <span className="text-gray-600 font-medium text-xs">
                                    {authUser.email.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <MentionInput
                                    value={commentText}
                                    onChange={setCommentText}
                                    placeholder="Write a comment... Use @username to mention someone"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent resize-none text-sm text-gray-900 placeholder-gray-500 bg-white"
                                    onSubmit={() => handleAddComment(post.id)}
                                  />
                                  <div className="flex justify-end gap-2 mt-2">
                                    <button
                                      onClick={() => setShowComments(prev => ({ ...prev, [post.id]: false }))}
                                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleAddComment(post.id)}
                                      disabled={!commentText.trim()}
                                      className="px-4 py-1.5 bg-[#FF6600] text-white text-sm rounded-lg hover:bg-[#E55A00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      Comment
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center gap-3">
                                <MessageSquare className="w-5 h-5 text-blue-600" />
                                <div className="flex-1">
                                  <p className="text-sm text-blue-800 font-medium">Join the conversation!</p>
                                  <p className="text-xs text-blue-600 mt-1">Sign in to add your comment and engage with the community.</p>
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedPostId(post.id);
                                    setAuthAction('comment');
                                    setShowAuthModal(true);
                                  }}
                                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                  Sign In
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Threaded Comments */}
                          <ThreadedComments
                            comments={comments[post.id] || []}
                            onAddComment={(content) => handleAddComment(post.id, content)}
                            onDeleteComment={(commentId) => handleDeleteComment(post.id, commentId)}
                            onReplyToComment={(commentId, replyText) => handleReplyToComment(post.id, commentId, replyText)}
                            authUser={authUser}
                            isCommentOwner={isCommentOwner}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {hasMore && displayedPosts.length > 0 && (
                <div className="text-center py-6 border-t border-gray-100">
                  <button
                    onClick={loadMorePosts}
                    disabled={loadingMore}
                    className="bg-[#FF6600] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#E55A00] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {loadingMore ? (
                      <LoadingSkeleton count={1} />
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5" />
                        Load More Posts
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {/* Sticky Action Bar */}
              {displayedPosts.map(post => (
                <StickyActionBar
                  key={`sticky-${post.id}`}
                  post={post}
                  isVisible={stickyPost === post.id}
                  onLike={() => {}}
                  onComment={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                  onShare={() => setShowShareModal(post.id)}
                  onPin={() => handlePinPost(post)}
                  onSave={() => setShowSaveModal(post.id)}
                  likeCount={post.likes_count || 0}
                  commentCount={(comments[post.id] || []).length}
                  isLiked={likedPosts.has(post.id)}
                  isPinned={userPinnedPostIds.has(post.id)}
                />
              ))}
            </div>
          )}
          </div>

          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block lg:w-80 space-y-6">
            {/* Hot Today */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 px-4 py-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-white" />
                  <h3 className="text-sm font-bold text-white">Hot Today</h3>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {filteredPosts.filter(post => {
                  const today = new Date();
                  const postDate = new Date(post.created_at);
                  return today.toDateString() === postDate.toDateString();
                }).sort((a, b) => (b.likes_count || 0) + (b.replies_count || 0) - (a.likes_count || 0) - (a.replies_count || 0)).slice(0, 5).map((post, index) => (
                  <div key={post.id} className="group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => navigateToPost(post.id)}>
                    <div className="flex items-start gap-3 p-3">
                      <div className="flex-shrink-0 w-6 text-center">
                        <span className="text-xs font-bold text-orange-500">#{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-orange-600 line-clamp-2 mb-1">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-400" />
                            {post.likes_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-blue-400" />
                            {post.replies_count || 0}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">{post.category_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredPosts.filter(post => {
                  const today = new Date();
                  const postDate = new Date(post.created_at);
                  return today.toDateString() === postDate.toDateString();
                }).length === 0 && (
                  <div className="text-center py-6 text-gray-500 text-sm">
                    No hot posts today
                  </div>
                )}
              </div>
            </div>

            {/* Trending Posts */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-white" />
                  <h3 className="text-sm font-bold text-white">Trending This Week</h3>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {filteredPosts.filter(post => {
                  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return new Date(post.created_at) >= sevenDaysAgo;
                }).sort((a, b) => (b.likes_count || 0) + (b.replies_count || 0) - (a.likes_count || 0) - (a.replies_count || 0)).slice(0, 5).map((post, index) => (
                  <div key={post.id} className="group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => navigateToPost(post.id)}>
                    <div className="flex items-start gap-3 p-3">
                      <div className="flex-shrink-0 w-6 text-center">
                        <span className="text-xs font-bold text-blue-500">#{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 mb-1">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-400" />
                            {post.likes_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-blue-400" />
                            {post.replies_count || 0}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">{getTimeAgo(post.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl shadow-xl border-2 border-blue-200 p-6 relative overflow-hidden">
              {/* Premium Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-6 right-6 w-20 h-20 bg-blue-400 rounded-full blur-2xl"></div>
                <div className="absolute bottom-6 left-6 w-16 h-16 bg-purple-400 rounded-full blur-xl"></div>
                <div className="absolute top-1/2 left-1/2 w-12 h-12 bg-indigo-400 rounded-full blur-lg transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent">Upcoming Events</h3>
                      <p className="text-xs text-gray-600 font-medium">🚀 Professional Development</p>
                    </div>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-blue-300 shadow-sm">
                    <span className="text-xs font-bold text-blue-800">📅 LIVE SOON</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                {eventsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                    <p className="text-xs text-gray-600">Loading events...</p>
                  </div>
                ) : eventsData && eventsData.length > 0 ? (
                  <div className="relative overflow-hidden">
                    <div 
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentEventIndex * 100}%)` }}
                    >
                      {eventsData.map((event, index) => {
                    const eventDate = new Date(event.event_date);
                    const now = new Date();
                    const daysUntil = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
                    const isToday = daysUntil === 0;
                    const isPast = daysUntil < 0;
                    const formatTime = (timeString) => {
                      try {
                        if (!timeString) return 'Time TBD';
                        const [hours, minutes] = timeString.split(':');
                        const hour = parseInt(hours);
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        const displayHour = hour % 12 || 12;
                        return `${displayHour}:${minutes} ${ampm}`;
                      } catch {
                        return 'Time TBD';
                      }
                    };
                    const getEventTypeIcon = (type) => {
                      const icons = {
                        'workshop': '🔧',
                        'masterclass': '🎓',
                        'seminar': '📚',
                        'conference': '🎤',
                        'webinar': '💻'
                      };
                      return icons[type?.toLowerCase()] || '📅';
                    };
                    const getEventTypeColor = (type) => {
                      const colors = {
                        'workshop': 'bg-purple-100 text-purple-800 border-purple-200',
                        'masterclass': 'bg-blue-100 text-blue-800 border-blue-200',
                        'seminar': 'bg-green-100 text-green-800 border-green-200',
                        'conference': 'bg-orange-100 text-orange-800 border-orange-200',
                        'webinar': 'bg-indigo-100 text-indigo-800 border-indigo-200',
                        'default': 'bg-gray-100 text-gray-800 border-gray-200'
                      };
                      return colors[type?.toLowerCase()] || colors.default;
                    };
                    const registrationPercentage = event.capacity ? Math.round((event.registered_count || 0) / event.capacity * 100) : 0;
                    
                    return (
                      <div key={event.id} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-blue-100 overflow-hidden hover:shadow-3xl hover:border-blue-300 transition-all duration-500 group flex-shrink-0 w-full transform hover:-translate-y-2 hover:rotate-1">
                        {/* Event Image */}
                        <div className="relative h-36 bg-gradient-to-br from-[#0057B7] via-[#0066CC] to-[#004494] overflow-hidden">
                          {/* Premium Overlay Pattern */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                          {event.image_url ? (
                            <img 
                              src={event.image_url} 
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-4xl">{getEventTypeIcon(event.event_type)}</div>
                            </div>
                          )}
                          
                          {/* Featured Badge */}
                          {event.featured && (
                            <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse">
                              <Star className="w-3 h-3 fill-white" />
                              🎆 FEATURED
                            </div>
                          )}
                          
                          {/* Event Type Badge */}
                          <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getEventTypeColor(event.event_type)}`}>
                              {(event.event_type || 'event').toUpperCase()}
                            </span>
                          </div>
                          
                          {/* Price Badge */}
                          <div className="absolute bottom-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full shadow-lg">
                            <div className="text-sm font-bold flex items-center gap-1">
                              {event.price ? (
                                <>
                                  <DollarSign className="w-3 h-3" />
                                  {event.price}
                                </>
                              ) : (
                                <>
                                  🎁 FREE
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Event Content */}
                        <div className="p-4">
                          {/* Event Title */}
                          <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {event.title}
                          </h3>
                          
                          {/* Event Description */}
                          <p className="text-gray-600 mb-3 line-clamp-2 text-sm">
                            {event.short_description || event.description}
                          </p>

                          {/* Speaker Info */}
                          {event.speaker && (
                            <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">
                                {event.speaker.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900 text-xs">{event.speaker}</div>
                                <div className="text-gray-600 text-xs">{event.speaker_title}</div>
                              </div>
                            </div>
                          )}

                          {/* Event Details */}
                          <div className="space-y-1 mb-3">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Calendar className="w-3 h-3 text-primary" />
                              <span>{eventDate.toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Clock className="w-3 h-3 text-primary" />
                              <span>{formatTime(event.event_time)} • {event.duration_minutes || 120} min</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <MapPin className="w-3 h-3 text-primary" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            {event.capacity && (
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Users className="w-3 h-3 text-primary" />
                                <span>{event.registered_count || 0}/{event.capacity} ({registrationPercentage}% Full)</span>
                              </div>
                            )}
                          </div>

                          {/* Registration Button */}
                          <a
                            href={event.registration_link || event.event_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm"
                          >
                            🎯 Register Now
                            {event.price && (
                              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                                {event.price}
                              </span>
                            )}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                        );
                      })}
                    </div>
                    
                    {/* Carousel Indicators */}
                    {eventsData.length > 1 && (
                      <div className="flex justify-center gap-1.5 mt-3">
                        {eventsData.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentEventIndex(index)}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 hover:scale-125 ${
                              index === currentEventIndex
                                ? 'bg-green-500 w-4'
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">No upcoming events</p>
                  </div>
                )}
                
                {eventsData && eventsData.length > 3 && (
                  <div className="text-center py-4 border-t border-blue-200/50 mt-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-2xl">📅</span>
                        <span className="text-sm font-bold text-gray-800">More Events</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">Workshops • Masterclasses • Seminars</p>
                      <button className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                        🚀 View All Events
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Business CTA */}
                <div className="text-center py-4 border-t border-blue-200/50 mt-4">
                  <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-4 border-2 border-orange-200">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-2xl">🎯</span>
                      <span className="text-sm font-bold text-orange-800">Host Your Event</span>
                    </div>
                    <p className="text-xs text-gray-700 mb-3">Reach 10,000+ QA Professionals</p>
                    <button 
                      onClick={() => setShowPartnershipModal(true)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      💼 Partner With Us
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Contest Winners */}
            <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-xl shadow-xl border-2 border-yellow-200 p-6 relative overflow-hidden" data-section="winners-spotlight">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-16 h-16 bg-yellow-400 rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-orange-400 rounded-full blur-lg"></div>
              </div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-700 via-orange-700 to-red-700 bg-clip-text text-transparent">Contest Winners</h3>
                      <p className="text-xs text-gray-600 font-medium">{(() => {
                        const now = new Date();
                        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                        return lastMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) + ' Champions';
                      })()}</p>
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-yellow-300 shadow-sm">
                    <span className="text-xs font-bold text-yellow-800">🏆 HALL OF FAME</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {(winnersData && winnersData.length > 0 ? 
                  winnersData.filter(w => w.winner_rank >= 1 && w.winner_rank <= 3)
                    .sort((a, b) => a.winner_rank - b.winner_rank)
                    .map(w => ({
                      name: w.name || 'Anonymous Winner',
                      title: w.role || w.company || 'QA Professional',
                      trick: w.technique_description || w.technique_title || 'Innovative QA technique',
                      avatar: w.winner_rank === 1 ? '👑' : w.winner_rank === 2 ? '🥈' : '🥉',
                      place: w.winner_rank,
                      email: w.email
                    })) : 
                  []
                ).map((winner, index) => {
                  const getPlaceStyles = (place) => {
                    switch(place) {
                      case 1: return {
                        gradient: 'from-[#FFD700] via-[#FFA500] to-[#FF6600]',
                        badge: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-900 border-yellow-400',
                        cardBg: 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50',
                        border: 'border-yellow-200',
                        medal: '🥇',
                        title: 'CHAMPION'
                      };
                      case 2: return {
                        gradient: 'from-[#C0C0C0] via-[#A9A9A9] to-[#808080]',
                        badge: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-900 border-gray-400',
                        cardBg: 'bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50',
                        border: 'border-gray-200',
                        medal: '🥈',
                        title: 'EXCELLENCE'
                      };
                      case 3: return {
                        gradient: 'from-[#CD7F32] via-[#D2691E] to-[#A0522D]',
                        badge: 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-900 border-orange-400',
                        cardBg: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50',
                        border: 'border-orange-200',
                        medal: '🥉',
                        title: 'ACHIEVER'
                      };
                    }
                  };
                  const placeStyles = getPlaceStyles(winner.place);
                  
                  // Show loading state if winners are being fetched
                  if (!winnersData && index === 0) {
                    return (
                      <div key="loading" className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6600] mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Loading winners...</p>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={index} className={`group relative ${placeStyles.cardBg} rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:rotate-1 overflow-hidden border-2 ${placeStyles.border} backdrop-blur-sm`}>
                      {/* Premium Badge */}
                      <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold border-2 ${placeStyles.badge} flex items-center gap-1 shadow-lg z-10`}>
                        <Trophy className="w-3 h-3" />
                        {placeStyles.title}
                      </div>
                      
                      {/* Medal Overlay */}
                      <div className="absolute top-3 left-3 text-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                        {placeStyles.medal}
                      </div>
                      
                      <div className="relative p-4">
                        {/* Professional Avatar */}
                        <div className="relative w-16 h-16 mx-auto mb-4">
                          <div className={`absolute inset-0 bg-gradient-to-br ${placeStyles.gradient} rounded-full animate-pulse group-hover:animate-none transition-all duration-500`}></div>
                          <div className="relative w-14 h-14 mx-auto mt-1 rounded-full bg-white flex items-center justify-center text-2xl shadow-xl border-4 border-white">
                            {winner.avatar}
                          </div>
                          
                          {/* Verified Professional Badge */}
                          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-lg">
                            <div className="bg-green-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Winner Professional Info */}
                        <div className="text-center mb-4">
                          <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-[#FF6600] transition-colors duration-300">
                            {winner.name}
                          </h3>
                          <div className="inline-flex items-center gap-1 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-gray-800 shadow-sm mb-1">
                            <Zap className="w-3 h-3 text-[#FF6600]" />
                            QA {placeStyles.title}
                          </div>
                          <p className="text-xs text-gray-600 font-medium">{winner.title}</p>
                        </div>
                        
                        {/* Achievement Highlight */}
                        <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl text-left mb-4 border border-white/60 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-1 text-xs">
                            <Trophy className="w-3 h-3 text-[#FF6600]" />
                            Winning Innovation
                          </h4>
                          <p className="text-xs leading-relaxed text-gray-700 line-clamp-3">
                            {winner.trick}
                          </p>
                        </div>
                        
                        {/* Achievement Stats */}
                        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl mb-4 border border-white/60 shadow-sm">
                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div>
                              <div className="text-lg font-bold text-yellow-600">🏆</div>
                              <div className="text-xs text-gray-600 font-medium">Winner</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-green-600">✓</div>
                              <div className="text-xs text-gray-600 font-medium">Verified</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Social Share Actions */}
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              const badgeLabel = `${winner.place === 1 ? '1st' : winner.place === 2 ? '2nd' : '3rd'} Place`;
                              const achievements = {
                                '1st Place': { emoji: '🥇', title: 'CHAMPION' },
                                '2nd Place': { emoji: '🥈', title: 'EXCELLENCE' },
                                '3rd Place': { emoji: '🥉', title: 'ACHIEVER' }
                              };
                              const achievement = achievements[badgeLabel];
                              const shareText = `${achievement.emoji} QA ${achievement.title} CERTIFIED ${achievement.emoji}\n\n🏅 ${winner.name} - ${badgeLabel} Winner\n🏢 ${winner.title}\n🏆 TestingVala Contest Winner\n\n🌟 ACHIEVEMENT HIGHLIGHTS:\n✅ TOP 1% QA Professional Recognition\n✅ Industry-Validated Expertise\n✅ Elite QA Community Member\n\n🚀 Join the QA Elite: www.testingvala.com\n📧 info@testingvala.com\n\n#QAChampion #TestingVala #QualityAssurance`;
                              const shareUrl = `https://testingvala.com/?utm_source=linkedin&utm_medium=social&utm_campaign=qa_winner&winner=${encodeURIComponent(winner.name)}#winners`;
                              const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(`${achievement.emoji} QA ${achievement.title} - ${winner.name}`)}&summary=${encodeURIComponent(shareText)}`;
                              window.open(url, '_blank');
                            }}
                            className="flex items-center gap-1 px-2 py-1.5 bg-[#0A66C2] text-white rounded-lg shadow-sm hover:shadow-md hover:bg-[#004182] transition-all duration-200 text-xs font-medium"
                          >
                            <Linkedin className="w-3 h-3" />
                          </button>
                          
                          <button
                            onClick={() => {
                              const badgeLabel = `${winner.place === 1 ? '1st' : winner.place === 2 ? '2nd' : '3rd'} Place`;
                              const achievements = {
                                '1st Place': { emoji: '🥇', title: 'CHAMPION' },
                                '2nd Place': { emoji: '🥈', title: 'EXCELLENCE' },
                                '3rd Place': { emoji: '🥉', title: 'ACHIEVER' }
                              };
                              const achievement = achievements[badgeLabel];
                              const whatsappText = `${achievement.emoji} QA ${achievement.title} CERTIFIED ${achievement.emoji}\n\n🏅 ${winner.name} - ${badgeLabel} Winner\n🏢 ${winner.title}\n🏆 TestingVala Contest Winner\n\n🌟 Recognized for outstanding QA excellence!\n\n🚀 Join the QA Elite Community:\n💰 Monthly contests with cash prizes\n🤝 Network with 10,000+ QA professionals\n📈 Accelerate your QA career\n\n🔗 www.testingvala.com\n📧 info@testingvala.com\n\n#QAChampion #TestingVala #QualityAssurance`;
                              const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
                              window.open(whatsappUrl, '_blank');
                            }}
                            className="flex items-center gap-1 px-2 py-1.5 bg-[#25D366] text-white rounded-lg shadow-sm hover:shadow-md hover:bg-[#1DA851] transition-all duration-200 text-xs font-medium"
                          >
                            <MessageCircle className="w-3 h-3" />
                          </button>
                          
                          <button
                            onClick={async () => {
                              const badgeLabel = `${winner.place === 1 ? '1st' : winner.place === 2 ? '2nd' : '3rd'} Place`;
                              try {
                                const canvas = document.createElement('canvas');
                                canvas.width = 1200;
                                canvas.height = 900;
                                const ctx = canvas.getContext('2d');
                                
                                ctx.fillStyle = '#ffffff';
                                ctx.fillRect(0, 0, 1200, 900);
                                
                                ctx.strokeStyle = '#e2e8f0';
                                ctx.lineWidth = 4;
                                ctx.strokeRect(30, 30, 1140, 840);
                                
                                ctx.strokeStyle = '#FF6600';
                                ctx.lineWidth = 3;
                                ctx.strokeRect(40, 40, 1120, 820);
                                
                                ctx.fillStyle = '#FF6600';
                                ctx.fillRect(60, 60, 1080, 120);
                                
                                ctx.fillStyle = '#ffffff';
                                ctx.font = 'bold 40px sans-serif';
                                ctx.textAlign = 'center';
                                ctx.fillText('CERTIFICATE OF EXCELLENCE', 600, 130);
                                
                                ctx.font = 'bold 22px sans-serif';
                                ctx.fillText('Quality Assurance Professional Recognition', 600, 165);
                                
                                ctx.fillStyle = '#1e293b';
                                ctx.font = 'normal 24px serif';
                                ctx.fillText('This is to certify that', 600, 240);
                                
                                ctx.fillStyle = '#0f172a';
                                ctx.font = 'bold 48px serif';
                                ctx.fillText(winner.name.toUpperCase(), 600, 300);
                                
                                ctx.fillStyle = '#475569';
                                ctx.font = 'italic 20px serif';
                                ctx.fillText(winner.title, 600, 335);
                                
                                const achievements = {
                                  '1st Place': { title: '1ST PLACE WINNER', emoji: '🥇' },
                                  '2nd Place': { title: '2ND PLACE WINNER', emoji: '🥈' },
                                  '3rd Place': { title: '3RD PLACE WINNER', emoji: '🥉' }
                                };
                                const achievement = achievements[badgeLabel];
                                
                                ctx.font = '60px sans-serif';
                                ctx.fillText(achievement.emoji, 600, 450);
                                
                                ctx.fillStyle = '#FFD700';
                                ctx.font = 'bold 36px sans-serif';
                                ctx.fillText(achievement.title, 600, 500);
                                
                                ctx.fillStyle = '#1e293b';
                                ctx.font = 'normal 18px serif';
                                ctx.fillText('in the TestingVala QA Professional Contest', 600, 540);
                                ctx.fillText('for exceptional expertise in Quality Assurance', 600, 565);
                                
                                const currentDate = new Date().toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                });
                                
                                ctx.fillStyle = '#64748b';
                                ctx.font = 'normal 16px sans-serif';
                                ctx.fillText(`Awarded on ${currentDate}`, 600, 620);
                                
                                ctx.fillStyle = '#FF6600';
                                ctx.fillRect(60, 800, 1080, 60);
                                
                                ctx.fillStyle = '#ffffff';
                                ctx.font = 'bold 18px sans-serif';
                                ctx.fillText('www.testingvala.com | info@testingvala.com', 600, 835);
                                
                                const dataUrl = canvas.toDataURL('image/png');
                                const link = document.createElement('a');
                                link.href = dataUrl;
                                link.download = `TestingVala_Certificate_${winner.name.replace(/\s+/g, '_')}_${badgeLabel.replace(/\s+/g, '')}.png`;
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                                toast.success('🏆 Professional certificate downloaded!');
                              } catch (err) {
                                toast.error('Failed to generate certificate');
                              }
                            }}
                            className="flex items-center gap-1 px-2 py-1.5 bg-gray-800 text-white rounded-lg shadow-sm hover:shadow-md hover:bg-gray-900 transition-all duration-200 text-xs font-medium"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                <div className="text-center py-4 border-t border-yellow-200/50 mt-6">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-2xl">🎯</span>
                      <span className="text-sm font-bold text-gray-800">Next Contest</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">January 2025 • Advanced Testing Methodologies</p>
                    <button 
                      onClick={() => setShowContestForm(true)}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      🏆 Join Contest
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Previous Winners - Mobile Only */}
        <div className="mt-8 lg:hidden">
          <Winners data={ { winners: (siteData?.winners || []), stats: (siteData?.hero?.stats || {}) } } />
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <ErrorBoundary>
            <CreatePostModal
              isOpen={showCreatePost}
              onClose={() => setShowCreatePost(false)}
              onPostCreated={() => {
                console.log('Post created, refreshing board...');
                refreshPosts();
                // Force immediate refresh of displayed posts
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              }}
            />
          </ErrorBoundary>
        )}

        {/* Auth Modal */}
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onSuccess={handleAuthSuccess}
            action={authAction}
          />
        )}

        {/* Save Post Modal */}
        {showSaveModal && (
          <SavePostModal
            isOpen={!!showSaveModal}
            onClose={() => setShowSaveModal(null)}
            post={displayedPosts.find(p => p.id === showSaveModal)}
            user={authUser}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Post</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">{showDeleteModal.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{showDeleteModal.content}</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDeletePost(showDeleteModal.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete Post
                </button>
              </div>
            </div>
          </div>
        )}

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

              <div className="space-y-3">
                <button
                  onClick={() => {
                    const post = displayedPosts.find(p => p.id === showShareModal);
                    const shareUrl = `${window.location.origin}/community/post/${post.id}`;
                    const shareText = `${post.title} - Join the discussion on TestingVala`;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
                  }}
                  className="w-full flex items-center gap-3 p-4 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a91da] transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <TwitterIcon className="w-5 h-5" />
                  <span className="font-medium">Share on Twitter</span>
                </button>

                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/community/post/${showShareModal}`;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
                  }}
                  className="w-full flex items-center gap-3 p-4 bg-[#1877F2] text-white rounded-lg hover:bg-[#166fe5] transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <FacebookIcon className="w-5 h-5" />
                  <span className="font-medium">Share on Facebook</span>
                </button>

                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/community/post/${showShareModal}`;
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
                  }}
                  className="w-full flex items-center gap-3 p-4 bg-[#0A66C2] text-white rounded-lg hover:bg-[#095bb5] transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <LinkedInIcon className="w-5 h-5" />
                  <span className="font-medium">Share on LinkedIn</span>
                </button>

                <button
                  onClick={() => {
                    const post = displayedPosts.find(p => p.id === showShareModal);
                    const shareUrl = `${window.location.origin}/community/post/${post.id}`;
                    const shareText = `${post.title} - Join the discussion on TestingVala`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank');
                  }}
                  className="w-full flex items-center gap-3 p-4 bg-[#25D366] text-white rounded-lg hover:bg-[#22c55e] transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  <span className="font-medium">Share on WhatsApp</span>
                </button>

                <div className="border-t border-gray-200 my-4"></div>
                
                <button
                  onClick={async () => {
                    try {
                      const shareUrl = `${window.location.origin}/community/post/${showShareModal}`;
                      await navigator.clipboard.writeText(shareUrl);
                      toast.success('Link copied to clipboard!');
                      setShowShareModal(null);
                    } catch (err) {
                      toast.error('Failed to copy link');
                    }
                  }}
                  className="w-full flex items-center gap-3 p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <CopyIcon className="w-5 h-5" />
                  <span className="font-medium">Copy Link</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Comment Confirmation Modal */}
        <ConfirmationModal
          isOpen={!!showDeleteCommentModal}
          onClose={() => setShowDeleteCommentModal(null)}
          onConfirm={confirmDeleteComment}
          title="Delete Comment"
          message="Are you sure you want to delete this comment?"
          confirmText="Delete Comment"
          cancelText="Cancel"
          type="danger"
          itemName={showDeleteCommentModal?.comment?.content?.substring(0, 50) + (showDeleteCommentModal?.comment?.content?.length > 50 ? '...' : '')}
          itemDescription={`By ${showDeleteCommentModal?.comment?.author_name || 'Anonymous'}`}
        />

        {/* Delete Reply Confirmation Modal */}
        <ConfirmationModal
          isOpen={!!showDeleteReplyModal}
          onClose={() => setShowDeleteReplyModal(null)}
          onConfirm={confirmDeleteReply}
          title="Delete Reply"
          message="Are you sure you want to delete this reply?"
          confirmText="Delete Reply"
          cancelText="Cancel"
          type="danger"
          itemName={showDeleteReplyModal?.reply?.text?.substring(0, 50) + (showDeleteReplyModal?.reply?.text?.length > 50 ? '...' : '')}
          itemDescription={`By ${showDeleteReplyModal?.reply?.authorName || 'Anonymous'}`}
        />

        {/* Partnership Modal */}
        <PartnershipModal
          isOpen={showPartnershipModal}
          onClose={() => setShowPartnershipModal(false)}
        />

        {/* Contest Submission Form */}
        <ContestSubmissionForm 
          isOpen={showContestForm}
          onClose={() => setShowContestForm(false)}
          contestData={{
            theme: 'Advanced Testing Methodologies',
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }}
        />

        {/* Connection Diagnostics Modal */}
        {showDiagnostics && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">System Diagnostics</h2>
                <button
                  onClick={() => setShowDiagnostics(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <ConnectionDiagnostics 
                  onRetry={() => {
                    setShowDiagnostics(false);
                    refreshPosts();
                    setTimeout(() => window.location.reload(), 1000);
                  }}
                />
              </div>
            </div>
          </div>
        )}

      </div>
      

    </section>
  );
};

export default CommunityHub;