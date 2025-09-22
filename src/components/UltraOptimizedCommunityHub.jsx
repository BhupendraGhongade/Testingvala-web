import React, { useState, useEffect } from 'react';
import { MessageSquare, TrendingUp, Plus, Search, Filter, Heart, Share2, Pin, Bookmark } from 'lucide-react';
import { useBatchData } from '../hooks/useBatchData';
import { getTimeAgo } from '../utils/timeUtils';
import toast from 'react-hot-toast';

const UltraOptimizedCommunityHub = () => {
  const { data, loading, error, toggleLike, addComment } = useBatchData();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('recent');
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [expandedPosts, setExpandedPosts] = useState(new Set());

  // Extract data from single batch load
  const posts = data?.posts || [];
  const categories = data?.categories || [];

  // Filter posts in memory (no API calls)
  const filteredPosts = React.useMemo(() => {
    let filtered = [...posts];

    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title?.toLowerCase().includes(searchLower) ||
        post.content?.toLowerCase().includes(searchLower)
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category_id === selectedCategory);
    }
    
    // Sort by filter type
    switch (filterType) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'trending':
        filtered.sort((a, b) => {
          const aScore = (a.likes_count || 0) + (a.replies_count || 0);
          const bScore = (b.likes_count || 0) + (b.replies_count || 0);
          return bScore - aScore;
        });
        break;
    }
    
    return filtered;
  }, [posts, selectedCategory, filterType, searchQuery]);

  // Update displayed posts
  useEffect(() => {
    setDisplayedPosts(filteredPosts.slice(0, 20));
  }, [filteredPosts]);

  // Optimized like button with no API calls per post
  const OptimizedLikeButton = ({ post }) => {
    const [isLiked, setIsLiked] = useState(post.user_liked);
    const [count, setCount] = useState(post.likes_count || 0);

    const handleClick = async () => {
      const newState = !isLiked;
      setIsLiked(newState);
      setCount(prev => newState ? prev + 1 : prev - 1);
      
      try {
        await toggleLike(post.id);
        toast.success(newState ? 'Liked!' : 'Unliked!', { duration: 1000 });
      } catch (error) {
        setIsLiked(!newState);
        setCount(prev => newState ? prev - 1 : prev + 1);
        toast.error('Failed to update like');
      }
    };

    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          isLiked ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
        <span>{count}</span>
      </button>
    );
  };

  if (loading) {
    return (
      <section className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading community...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="community" className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <MessageSquare className="w-4 h-4" />
            Community Discussions
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Community Discussions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join the conversation with QA professionals worldwide.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="recent">Recent</option>
              <option value="trending">Trending</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <button className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Post
            </button>
          </div>
        </div>

        {/* Posts */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {displayedPosts.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Posts Found</h3>
              <p className="text-gray-600">Be the first to start a discussion!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {displayedPosts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 font-medium text-sm">
                        {(post.author_name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {post.author_name || 'Anonymous'}
                        </span>
                        <span className="text-gray-500 text-sm">•</span>
                        <span className="text-gray-500 text-sm">
                          {getTimeAgo(post.created_at)}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {post.category_name || 'General'}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {post.title}
                      </h3>

                      <div className="text-gray-700 mb-4">
                        {post.content && post.content.length > 200 ? (
                          <>
                            {expandedPosts.has(post.id) ? post.content : `${post.content.slice(0, 200)}...`}
                            <button
                              onClick={() => {
                                const newExpanded = new Set(expandedPosts);
                                if (expandedPosts.has(post.id)) {
                                  newExpanded.delete(post.id);
                                } else {
                                  newExpanded.add(post.id);
                                }
                                setExpandedPosts(newExpanded);
                              }}
                              className="text-orange-500 hover:text-orange-600 ml-2 font-medium"
                            >
                              {expandedPosts.has(post.id) ? 'Show less' : 'Read more'}
                            </button>
                          </>
                        ) : (
                          post.content
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <OptimizedLikeButton post={post} />
                        
                        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.replies_count || 0}</span>
                        </button>

                        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
                        </button>

                        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                          <Pin className="w-4 h-4" />
                          <span>Pin</span>
                        </button>

                        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                          <Bookmark className="w-4 h-4" />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default UltraOptimizedCommunityHub;