import React, { useState, useEffect } from 'react';
import { Heart, Users, Award, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

const LikeAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalLikes: 0,
    verifiedLikes: 0,
    nonVerifiedLikes: 0,
    topPosts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // Get total likes breakdown
        const { data: likesData, error: likesError } = await supabase
          .from('post_likes')
          .select('is_verified');

        if (likesError) throw likesError;

        const totalLikes = likesData.length;
        const verifiedLikes = likesData.filter(like => like.is_verified).length;
        const nonVerifiedLikes = totalLikes - verifiedLikes;

        // Get top liked posts
        const { data: topPostsData, error: topPostsError } = await supabase
          .from('forum_posts')
          .select(`
            id,
            title,
            content,
            created_at,
            post_likes(count)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (topPostsError) throw topPostsError;

        const topPosts = topPostsData
          .map(post => ({
            ...post,
            likeCount: post.post_likes?.length || 0
          }))
          .sort((a, b) => b.likeCount - a.likeCount);

        setAnalytics({
          totalLikes,
          verifiedLikes,
          nonVerifiedLikes,
          topPosts
        });
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Likes</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalLikes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Verified Users</p>
              <p className="text-2xl font-bold text-blue-600">{analytics.verifiedLikes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Guest Users</p>
              <p className="text-2xl font-bold text-orange-600">{analytics.nonVerifiedLikes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Posts */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Top Liked Posts</h3>
          </div>
        </div>
        <div className="divide-y">
          {analytics.topPosts.map((post, index) => (
            <div key={post.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 line-clamp-1">
                    {post.title || 'Untitled Post'}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {post.content?.substring(0, 100)}...
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {post.likeCount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LikeAnalytics;