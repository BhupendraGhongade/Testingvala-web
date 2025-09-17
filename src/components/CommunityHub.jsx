import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MessageSquare, TrendingUp, Plus, Search, Filter, Zap, Clipboard, Briefcase, BookOpen, Code, Layers, Heart, MoreHorizontal, Edit2, Trash2, Share2, X, Bookmark, Pin } from 'lucide-react';
import { TwitterIcon, FacebookIcon, LinkedInIcon, WhatsAppIcon, CopyIcon } from './SocialIcons';
import { supabase, togglePostLike, addPostComment } from '../lib/supabase';
import CreatePostModal from './CreatePostModal';
import AuthModal from './AuthModal';
import SavePostModal from './SavePostModal';
import Winners from './Winners';
import { useWebsiteData } from '../hooks/useWebsiteData';
import { getTimeAgo } from '../utils/timeUtils';
import toast from 'react-hot-toast';

const CommunityHub = () => {
  // Immediate cleanup on component initialization
  React.useMemo(() => {
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
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState('comment');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [showCommentBox, setShowCommentBox] = useState({});
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [editingPost, setEditingPost] = useState(null);
  const [editText, setEditText] = useState('');
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

  const [filterType, setFilterType] = useState('recent');
  const [activeTab, setActiveTab] = useState('feed');

  const [userPinnedPostIds, setUserPinnedPostIds] = useState(new Set());
  const [highlightedPostId, setHighlightedPostId] = useState(null);

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

  useEffect(() => { 
    // Immediate cleanup check
    const forceClear = localStorage.getItem('force_clear_posts');
    const adminClearTime = localStorage.getItem('posts_cleared_by_admin');
    
    if (forceClear || (adminClearTime && Date.now() - parseInt(adminClearTime) < 24 * 60 * 60 * 1000)) {
      localStorage.removeItem('local_forum_posts');
      localStorage.removeItem('force_clear_posts');
      if (adminClearTime && Date.now() - parseInt(adminClearTime) < 24 * 60 * 60 * 1000) {
        localStorage.removeItem('posts_cleared_by_admin');
      }
    }
    
    fetchCategories();
    checkAuthStatus();
    loadCommentsAndLikes();
  }, []);

  const loadUserLikes = async () => {
    if (!authUser?.email) return;
    
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

  const loadCommentsAndLikes = useCallback(async () => {
    if (displayedPosts.length === 0) return;
    
    const postIds = displayedPosts.map(p => p.id);
    const existingIds = Object.keys(comments);
    const newPostIds = postIds.filter(id => !existingIds.includes(id) && !id.startsWith('local-'));
    
    if (newPostIds.length === 0) return;
    
    try {
      const [allComments, allLikes] = await Promise.all([
        supabase?.from('post_comments').select('*').in('post_id', newPostIds) || Promise.resolve({ data: [] }),
        supabase?.from('post_likes').select('post_id').in('post_id', newPostIds) || Promise.resolve({ data: [] })
      ]);
      
      const commentsByPost = {};
      const likesByPost = {};
      
      (allComments.data || []).forEach(comment => {
        if (!commentsByPost[comment.post_id]) commentsByPost[comment.post_id] = [];
        commentsByPost[comment.post_id].push(comment);
      });
      
      (allLikes.data || []).forEach(like => {
        likesByPost[like.post_id] = (likesByPost[like.post_id] || 0) + 1;
      });
      
      setComments(prev => ({ ...prev, ...commentsByPost }));
      setDisplayedPosts(prev => prev.map(p => ({
        ...p,
        likes_count: likesByPost[p.id] || p.likes_count || 0
      })));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [displayedPosts, comments, supabase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCommentsAndLikes();
      if (authUser && displayedPosts.length > 0) {
        loadUserLikes();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [displayedPosts.length, authUser, loadCommentsAndLikes]);

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
      const { data: { user } } = await supabase.auth.getUser();
      setAuthUser(user);
      
      // Reset filter to 'recent' if user logs out and was on 'my-posts'
      if (!user && filterType === 'my-posts') {
        setFilterType('recent');
      }
      
      if (user) {
        loadUserPinnedPosts();
        loadUserLikes();
        loadCurrentUserProfile();
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };



  const getFilteredAndSortedPosts = (postsToFilter) => {
    let filtered = [...postsToFilter];  // Create a copy to avoid mutations

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title?.toLowerCase().includes(searchLower) ||
        post.content?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply category filter
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category_id === selectedCategory);
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

  const handleLike = async (postId) => {
    if (!authUser) {
      setSelectedPostId(postId);
      setAuthAction('like');
      setShowAuthModal(true);
      return;
    }

    try {
      const userEmail = authUser.email;
      const isCurrentlyLiked = likedPosts.has(postId);
      
      const result = await togglePostLike(postId, userEmail);
      
      if (result) {
        setLikedPosts(prev => new Set([...prev, postId]));
        setDisplayedPosts(prev => prev.map(post => 
          post.id === postId ? { ...post, likes_count: (post.likes_count || 0) + 1 } : post
        ));
        toast.success('Post liked!');
      } else {
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        setDisplayedPosts(prev => prev.map(post => 
          post.id === postId ? { ...post, likes_count: Math.max(0, (post.likes_count || 0) - 1) } : post
        ));
        toast.success('Like removed');
      }
    } catch (error) {
      console.error('Error handling like:', error);
      toast.error('Failed to update like');
    }
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
    setEditText(post.content);
    setShowDropdown({});
  };

  const handleSaveEdit = async (postId) => {
    if (!editText.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    try {
      // Update in database if available
      if (supabase) {
        const { error } = await supabase
          .from('forum_posts')
          .update({ content: editText.trim(), updated_at: new Date().toISOString() })
          .eq('id', postId);
        
        if (error) throw error;
      }
      
      // Update local posts if it's a local post
      if (postId.startsWith('local-')) {
        const localPosts = JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
        const updatedPosts = localPosts.map(post => 
          post.id === postId ? { ...post, content: editText.trim() } : post
        );
        localStorage.setItem('local_forum_posts', JSON.stringify(updatedPosts));
      }
      
      setDisplayedPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, content: editText.trim() } : post
      ));
      
      setEditingPost(null);
      setEditText('');
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
      // For local posts, delete from localStorage
      if (postId.startsWith('local-')) {
        const localPosts = JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
        const updatedPosts = localPosts.filter(post => post.id !== postId);
        localStorage.setItem('local_forum_posts', JSON.stringify(updatedPosts));
      } else if (supabase) {
        // For database posts, try to delete from Supabase
        const { error } = await supabase
          .from('forum_posts')
          .delete()
          .eq('id', postId);
        
        if (error) {
          console.error('Database delete error:', error);
          // Continue with local deletion even if database fails
        }
      }
      
      // Always update the UI regardless of database success/failure
      setDisplayedPosts(prev => prev.filter(post => post.id !== postId));
      setPosts(prev => prev.filter(post => post.id !== postId));
      setShowDeleteModal(null);
      toast.success('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      // Still try to remove from UI for better UX
      setDisplayedPosts(prev => prev.filter(post => post.id !== postId));
      setPosts(prev => prev.filter(post => post.id !== postId));
      setShowDeleteModal(null);
      toast.success('Post removed from view');
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
    if (!confirm('Delete this comment?')) return;
    
    setComments(prev => ({
      ...prev,
      [postId]: prev[postId].filter(comment => comment.id !== commentId)
    }));
    
    setDisplayedPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, replies_count: Math.max(0, (post.replies_count || 0) - 1) }
        : post
    ));
    
    toast.success('Comment deleted!');
  };

  const handleDeleteReply = (postId, commentId, replyId) => {
    if (!confirm('Delete this reply?')) return;
    
    setComments(prev => ({
      ...prev,
      [postId]: prev[postId].map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: comment.replies.filter(reply => reply.id !== replyId) }
          : comment
      )
    }));
    
    toast.success('Reply deleted!');
  };



  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      if (!supabase) {
        // Fallback categories for offline mode
        setCategories([
          { id: 'local-general', name: 'General QA Discussion', description: 'General discussions about QA practices', slug: 'general-qa' },
          { id: 'local-automation', name: 'Test Automation', description: 'Automation frameworks and tools', slug: 'test-automation' },
          { id: 'local-manual', name: 'Manual Testing', description: 'Manual testing techniques', slug: 'manual-testing' },
          { id: 'local-career', name: 'Career & Interview', description: 'Career advice and interviews', slug: 'career-interview' }
        ]);
        return;
      }

      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching categories:', error);
        setCategories([]);
        return;
      }

      if (!data || data.length === 0) {
        setCategories([]);
      } else {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchPosts = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Always load local posts first
      const local = loadLocalPosts();
      
      if (!supabase) {
        const allPosts = [...local];
        setPosts(allPosts);
        return;
      }

      // Simplified query - no search/category filters in the main query
      let query = supabase
        .from('forum_posts')
        .select(`
          *,
          forum_categories(name)
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw error;
      }
      
      const dbPosts = (data || []).map(post => ({
        ...post,
        category_name: post.forum_categories?.name || 'Uncategorized'
      }));
      
      // Combine local and database posts
      const allPosts = [...local, ...dbPosts];
      
      setPosts(allPosts);
      
    } catch (error) {
      console.error('Error in fetchPosts:', error);
      // Fallback to local posts only
      const local = loadLocalPosts();
      setPosts(local);
    } finally {
      setLoading(false);
    }
  }, []);  // Remove dependencies to prevent unnecessary re-fetches

  // Separate effect for initial load
  useEffect(() => {
    fetchPosts();
  }, []);  // Only run once on mount
  
  // Separate effect for filtering when posts or filters change
  useEffect(() => {
    if (posts.length > 0) {
      const filteredPosts = getFilteredAndSortedPosts(posts);
      setDisplayedPosts(filteredPosts.slice(0, 5));
      setHasMore(filteredPosts.length > 5);
    } else {
      setDisplayedPosts([]);
      setHasMore(false);
    }
  }, [posts, selectedCategory, searchQuery, filterType, authUser]);

  // Listen for localStorage changes (admin deletions)
  useEffect(() => {
    const handlePostsUpdated = (event) => {
      console.log('Posts updated by admin:', event.detail);
      if (event.detail?.action === 'clearAll' || event.detail?.action === 'forceReset') {
        // Force clear localStorage
        localStorage.removeItem('local_forum_posts');
        localStorage.removeItem('posts_cleared_by_admin');
        setPosts([]);
        setDisplayedPosts([]);
        setHasMore(false);
      } else if (event.detail?.deletedPostId) {
        const deletedId = event.detail.deletedPostId;
        setPosts(prev => prev.filter(p => p.id !== deletedId));
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
        setPosts([]);
        setDisplayedPosts([]);
        setHasMore(false);
        return;
      }
      
      const currentLocal = JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
      const currentLocalIds = new Set(currentLocal.map(p => p.id));
      
      setPosts(prev => prev.filter(p => 
        !p.id?.startsWith('local-') || currentLocalIds.has(p.id)
      ));
      
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

  // Force refresh function for external calls
  const refreshPosts = useCallback(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  const filteredPosts = useMemo(() => {
    if (posts.length === 0) return [];
    return getFilteredAndSortedPosts(posts);
  }, [posts, selectedCategory, filterType, searchQuery, authUser]);

  const loadMorePosts = useCallback(() => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    const currentLength = displayedPosts.length;
    const nextPosts = filteredPosts.slice(currentLength, currentLength + 5);
    setDisplayedPosts(prev => [...prev, ...nextPosts]);
    setHasMore(currentLength + 5 < filteredPosts.length);
    setLoadingMore(false);
  }, [loadingMore, hasMore, displayedPosts.length, filteredPosts]);

  return (
    <section id="community" className="bg-gradient-to-br from-gray-50 via-white to-orange-50 pt-2 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
            <MessageSquare className="w-4 h-4" />
            Community Discussions
          </div>
          {authUser && isCurrentUserAdmin() && (
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

            {/* Filter Dropdown - Only show for Feed tab */}
            {activeTab === 'feed' && (
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
                  {authUser && <option value="my-posts">My Posts</option>}
                </select>
              </div>
            )}

            {/* Category Filter - Only show for Feed tab */}
            {activeTab === 'feed' && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  disabled={categoriesLoading}
                >
                  <option value="all">All Categories</option>
                  {categoriesLoading ? (
                    <option disabled>Loading categories...</option>
                  ) : categories.length === 0 ? (
                    <option disabled>No categories available</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({posts.filter(p => p.category_id === category.id).length})
                      </option>
                    ))
                  )}
                </select>
              </div>
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
                setShowCreatePost(true);
              }}
              className="bg-[#FF6600] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E55A00] transition-colors duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Post
            </button>
          </div>
        </div>

        {/* Posts List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {activeTab === 'pinned' ? (
            // Pinned Posts Tab
            <div className="text-center py-12">
              <Pin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pinned Posts</h3>
              <p className="text-gray-600">Pin posts from the feed to save them here for quick access!</p>
              <div className="mt-6">
                {userPinnedPostIds.size > 0 ? (
                  <p className="text-sm text-blue-600">{userPinnedPostIds.size} posts pinned</p>
                ) : (
                  <p className="text-sm text-gray-500">No posts pinned yet</p>
                )}
              </div>
            </div>
          ) : (
            // Feed Tab
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6600] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading community posts...</p>
                </div>
              ) : displayedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {filterType === 'my-posts' && !authUser 
                      ? 'Sign in to view your posts' 
                      : filterType === 'my-posts' 
                      ? 'No posts found' 
                      : 'No Posts Found'
                    }
                  </h3>
                  <p className="text-gray-600">
                    {filterType === 'my-posts' && !authUser 
                      ? 'Please sign in to see posts you\'ve created.' 
                      : filterType === 'my-posts' 
                      ? 'You haven\'t created any posts yet. Create your first post!' 
                      : 'Be the first to start a discussion in this category!'
                    }
                  </p>
                  {filterType === 'my-posts' && !authUser && (
                    <button
                      onClick={() => {
                        setAuthAction('create');
                        setShowAuthModal(true);
                      }}
                      className="mt-4 bg-[#FF6600] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#E55A00] transition-colors"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {displayedPosts.map((post) => (
                    <div 
                      key={post.id} 
                      id={`post-${post.id}`}
                      className={`p-6 transition-all duration-500 ${
                        highlightedPostId === post.id 
                          ? 'bg-gradient-to-r from-blue-50 to-orange-50 border-2 border-blue-300 rounded-lg shadow-lg transform scale-[1.02]' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
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
                          
                          <h3 className={`text-lg font-semibold mb-3 mt-2 hover:text-[#FF6600] transition-colors cursor-pointer ${
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
                            <div className="mb-3">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={4}
                              />
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => handleSaveEdit(post.id)}
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
                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {post.content}
                            </p>
                          )}

                          {/* Enterprise-Grade Post Actions */}
                          <div className="mt-6 pt-5 border-t border-gray-200">
                            <div className="flex items-center space-x-1">
                              {/* Like Action */}
                              <button
                                onClick={() => handleLike(post.id)}
                                className={`group relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                                  likedPosts.has(post.id)
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-rose-600 border border-transparent hover:border-gray-200'
                                }`}
                              >
                                <Heart className={`w-4 h-4 transition-all duration-200 ${
                                  likedPosts.has(post.id) ? 'fill-rose-500 text-rose-500' : 'group-hover:text-rose-500'
                                }`} />
                                <span className="font-semibold tabular-nums">{post.likes_count || 0}</span>
                                <span className="hidden sm:inline">Like{(post.likes_count || 0) !== 1 ? 's' : ''}</span>
                              </button>

                              {/* Comment Action */}
                              <button
                                onClick={() => {
                                  if (!authUser) {
                                    setSelectedPostId(post.id);
                                    setAuthAction('comment');
                                    setShowAuthModal(true);
                                  } else {
                                    setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }));
                                  }
                                }}
                                className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 border border-transparent hover:border-blue-200 transition-all duration-200"
                              >
                                <MessageSquare className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
                                <span className="font-semibold tabular-nums">{(comments[post.id] || []).length}</span>
                                <span className="hidden sm:inline">Comment{(comments[post.id] || []).length !== 1 ? 's' : ''}</span>
                              </button>

                              {/* Share Action */}
                              <button
                                onClick={() => setShowShareModal(post.id)}
                                className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent hover:border-emerald-200 transition-all duration-200"
                              >
                                <Share2 className="w-4 h-4 group-hover:text-emerald-600 transition-colors" />
                                <span className="hidden sm:inline">Share</span>
                              </button>

                              {/* Pin Action */}
                              <button
                                onClick={() => handlePinPost(post)}
                                className={`group relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
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
                                  if (!authUser) {
                                    setSelectedPostId(post.id);
                                    setAuthAction('save');
                                    setShowAuthModal(true);
                                  } else {
                                    setShowSaveModal(post.id);
                                  }
                                }}
                                className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm text-gray-600 hover:bg-violet-50 hover:text-violet-600 border border-transparent hover:border-violet-200 transition-all duration-200"
                                title="Save post"
                              >
                                <Bookmark className="w-4 h-4 group-hover:-rotate-6 transition-all duration-200" />
                                <span className="hidden sm:inline">Save</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Comments Section */}
                      {showComments[post.id] && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          {/* Comment Input */}
                          {authUser && (
                            <div className="mb-4">
                              <div className="flex gap-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                                  <span className="text-gray-600 font-medium text-xs">
                                    {authUser.email.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent resize-none text-sm"
                                    rows={3}
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
                          )}

                          {/* Comments List */}
                          <div className="space-y-3">
                            {(comments[post.id] || []).length === 0 ? (
                              <div className="text-center py-4 text-gray-500 text-sm">
                                No comments yet. Be the first to comment!
                              </div>
                            ) : (
                              (comments[post.id] || []).map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                  <div className="w-8 h-8 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                                    <span className="text-gray-600 font-medium text-xs">
                                      {(comment.author_name || 'User').charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-gray-900 text-sm">
                                          {comment.author_name || 'Anonymous'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {new Date(comment.created_at).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <p className="text-gray-700 text-sm">{comment.content}</p>
                                    </div>
                                    
                                    {/* Comment Actions */}
                                    <div className="flex items-center gap-4 mt-2 ml-3">
                                      <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                                        Like
                                      </button>
                                      {authUser && (
                                        <button
                                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                          className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
                                        >
                                          Reply
                                        </button>
                                      )}
                                      {isCommentOwner(comment) && (
                                        <button
                                          onClick={() => handleDeleteComment(post.id, comment.id)}
                                          className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                                        >
                                          Delete
                                        </button>
                                      )}
                                    </div>

                                    {/* Reply Input */}
                                    {replyingTo === comment.id && authUser && (
                                      <div className="mt-2 ml-3">
                                        <div className="flex gap-2">
                                          <div className="w-6 h-6 bg-gray-200 rounded-md flex items-center justify-center">
                                            <span className="text-gray-600 font-medium text-xs">
                                              {authUser.email.charAt(0).toUpperCase()}
                                            </span>
                                          </div>
                                          <div className="flex-1">
                                            <input
                                              type="text"
                                              value={replyText}
                                              onChange={(e) => setReplyText(e.target.value)}
                                              placeholder={`Reply to ${comment.author_name}...`}
                                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] text-sm"
                                              onKeyPress={(e) => {
                                                if (e.key === 'Enter' && replyText.trim()) {
                                                  handleReplyToComment(post.id, comment.id);
                                                }
                                              }}
                                            />
                                            <div className="flex justify-end gap-2 mt-1">
                                              <button
                                                onClick={() => setReplyingTo(null)}
                                                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                                              >
                                                Cancel
                                              </button>
                                              <button
                                                onClick={() => handleReplyToComment(post.id, comment.id)}
                                                disabled={!replyText.trim()}
                                                className="px-3 py-1 bg-[#FF6600] text-white text-xs rounded hover:bg-[#E55A00] disabled:opacity-50"
                                              >
                                                Reply
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Replies */}
                                    {comment.replies && comment.replies.length > 0 && (
                                      <div className="mt-2 ml-6 space-y-2">
                                        {comment.replies.map((reply) => (
                                          <div key={reply.id} className="flex gap-2">
                                            <div className="w-6 h-6 bg-gray-200 rounded-md flex items-center justify-center">
                                              <span className="text-gray-600 font-medium text-xs">
                                                {reply.authorName.charAt(0).toUpperCase()}
                                              </span>
                                            </div>
                                            <div className="flex-1 bg-gray-50 rounded-lg p-2">
                                              <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium text-gray-900">{reply.authorName}</span>
                                                <span className="text-xs text-gray-500">
                                                  {new Date(reply.createdAt).toLocaleDateString()}
                                                </span>
                                              </div>
                                              <p className="text-xs text-gray-700">{reply.text}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
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
          )}
        </div>

        {/* Previous Winners */}
        <div className="mt-8">
          <Winners data={ { winners: (siteData?.winners || []), stats: (siteData?.hero?.stats || {}) } } />
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <CreatePostModal
            isOpen={showCreatePost}
            onClose={() => setShowCreatePost(false)}
            categories={categories}
            onPostCreated={refreshPosts}
          />
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={() => setExpandedImage(null)}>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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


      </div>
    </section>
  );
};

export default CommunityHub;