import React, { useState, useEffect } from 'react';
import { MessageSquare, TrendingUp, Plus, Search, Filter, AlertCircle, Zap, Clipboard, Briefcase, BookOpen, Code, Layers } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CreatePostModal from './CreatePostModal';
import Winners from './Winners';
import { useWebsiteData } from '../hooks/useWebsiteData';

const CommunityHub = () => {
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
  // authUser state removed — authentication is handled inside CreatePostModal now.

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

  // Authentication is intentionally delegated to CreatePostModal which shows
  // sign-in and verification prompts when needed.

  // Demo posts (used only when Supabase is not available)


  const loadLocalPosts = () => {
    try {
      const raw = localStorage.getItem('local_forum_posts');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (err) {
      console.warn('Failed to load local posts', err);
      return [];
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
  setCategoriesLoading(true);
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*');

      if (error) {
        console.error('❌ Error fetching categories:', error);
        throw error;
      }

      // If no categories are returned and Supabase is available, show an error
      if (!data || data.length === 0) {
        if (supabase) {
          console.error('No categories found in database. Please run the forum setup script.');
          setCategories([]);
        } else {
          // Only use fallback categories when Supabase is not available (local dev)
          setCategories([
            { id: 'local-general', name: 'General QA Discussion', description: 'General discussions about QA practices', slug: 'general-qa' },
            { id: 'local-automation', name: 'Test Automation', description: 'Automation frameworks and tools', slug: 'test-automation' },
            { id: 'local-manual', name: 'Manual Testing', description: 'Manual testing techniques', slug: 'manual-testing' },
            { id: 'local-career', name: 'Career & Interview', description: 'Career advice and interviews', slug: 'career-interview' }
          ]);
        }
      } else {
        setCategories(data);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      if (supabase) {
        // If Supabase is available but there's an error, don't set fallback categories
        setCategories([]);
      } else {
        // Only use fallback categories when Supabase is not available (local dev)
        setCategories([
          { id: 'local-general', name: 'General QA Discussion', description: 'General discussions about QA practices', slug: 'general-qa' },
          { id: 'local-automation', name: 'Test Automation', description: 'Automation frameworks and tools', slug: 'test-automation' },
          { id: 'local-manual', name: 'Manual Testing', description: 'Manual testing techniques', slug: 'manual-testing' },
          { id: 'local-career', name: 'Career & Interview', description: 'Career advice and interviews', slug: 'career-interview' }
        ]);
      }
    }
    finally {
      setCategoriesLoading(false);
    }
  };

  const fetchPosts = React.useCallback(async () => {
    const DEMO_POSTS = [
      {
        id: 'demo-post-1',
        title: 'Welcome to TestingVala — Start a QA Discussion',
        content: 'Share your testing tips, ask questions, and connect with QA professionals. This is a demo post to showcase the community features.',
        category_id: 'local-general',
        category_name: 'General QA Discussion',
        created_at: new Date().toISOString(),
        user_profiles: { username: 'demo-user', full_name: 'Demo User', avatar_url: null },
        replies_count: 2,
        likes_count: 5
      },
      {
        id: 'demo-post-2',
        title: 'Automating flaky tests — best practices',
        content: 'How do you approach flaky tests in your CI? Share tools and strategies.',
        category_id: 'local-automation',
        category_name: 'Test Automation',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        user_profiles: { username: 'automation_guru', full_name: 'Automation Guru', avatar_url: null },
        replies_count: 1,
        likes_count: 3
      }
    ];
    try {
  setLoading(true);
      // If Supabase not configured, fallback to demo + local posts
      if (!supabase) {
  const local = loadLocalPosts();
  const allPosts = [...local, ...DEMO_POSTS];
  setPosts(allPosts);
  setDisplayedPosts(allPosts.slice(0, 5));
  setHasMore(allPosts.length > 5);
        return;
      }

      let query = supabase
        .from('forum_posts')
        .select(`
          *,
          forum_categories!foru_posts_category_id_fkey(name,description)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

  if (searchQuery) query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
  if (selectedCategory !== 'all') query = query.eq('category_id', selectedCategory);

      const { data, error } = await query;

  if (error) throw error;
  setPosts(data || []);
  setDisplayedPosts((data || []).slice(0, 5));
  setHasMore((data || []).length > 5);
    } catch (error) {
  console.error('Error fetching posts:', error);
  const local = loadLocalPosts();
  const allPosts = [...local, ...DEMO_POSTS];
  setPosts(allPosts);
  setDisplayedPosts(allPosts.slice(0, 5));
  setHasMore(allPosts.length > 5);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const loadMorePosts = () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    setTimeout(() => {
      const currentLength = displayedPosts.length;
      const filteredPosts = selectedCategory === 'all' 
        ? posts 
        : posts.filter(p => p.category_id === selectedCategory);
      
      const nextPosts = filteredPosts.slice(currentLength, currentLength + 5);
      setDisplayedPosts(prev => [...prev, ...nextPosts]);
      setHasMore(currentLength + 5 < filteredPosts.length);
      setLoadingMore(false);
    }, 500);
  };

  useEffect(() => {
    const filteredPosts = selectedCategory === 'all' 
      ? posts 
      : posts.filter(p => p.category_id === selectedCategory);
    
    setDisplayedPosts(filteredPosts.slice(0, 5));
    setHasMore(filteredPosts.length > 5);
  }, [posts, selectedCategory]);

  // no category stats helper needed when categories overview is removed

  return (
    <section id="community" className="site-section bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
            <MessageSquare className="w-4 h-4" />
            Community Discussions
          </div>
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

            {/* category filter removed (explore by category) */}
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
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

            {/* Create Post Button */}
            <button
              onClick={() => {
                // Always open the CreatePost modal; the modal itself will prompt for sign-in
                // or show the appropriate message when the user is unauthenticated or unverified.
                setShowCreatePost(true);
              }}
              className="bg-[#FF6600] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E55A00] transition-colors duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Post
            </button>
          </div>
        </div>

  {/* categories overview removed per request */}
        {/* Categories Overview */}
  {/* categories banner removed - silently fall back to default categories when needed */}
       

  {/* Posts List (errors are handled silently; demo/local posts shown when fetch fails) */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6600] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading community posts...</p>
            </div>
          ) : displayedPosts.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Posts Found</h3>
              <p className="text-gray-600">Be the first to start a discussion in this category!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {displayedPosts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start gap-4">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#FF6600] to-[#E55A00] rounded-full flex items-center justify-center">
                        {post.user_profiles?.avatar_url ? (
                          <img
                            src={post.user_profiles.avatar_url}
                            alt={post.user_profiles.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {post.user_profiles?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {post.user_profiles?.full_name || post.user_profiles?.username || 'Anonymous'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {post.category_name}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-[#FF6600] transition-colors cursor-pointer">
                        {post.title}
                      </h3>
                      
                      {post.image_url && (
                        <div className="mb-3">
                          <img
                            src={post.image_url}
                            alt="Post image"
                            className="w-full max-h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
                          />
                        </div>
                      )}
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {post.content}
                      </p>

                      {/* Post Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {post.replies_count || 0} replies
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {post.likes_count || 0} likes
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

        {/* Previous Winners (show below forum posts) */}
        <div className="mt-8">
          <Winners data={ { winners: (siteData?.winners || []), stats: (siteData?.hero?.stats || {}) } } />
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <CreatePostModal
            isOpen={showCreatePost}
            onClose={() => setShowCreatePost(false)}
            categories={categories}
            onPostCreated={fetchPosts}
          />
        )}
      </div>
    </section>
  );
};

export default CommunityHub;
