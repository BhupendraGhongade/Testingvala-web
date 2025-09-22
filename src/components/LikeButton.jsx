import React from 'react';
import { Heart } from 'lucide-react';
import { useLikeSystem } from '../hooks/useLikeSystem';

const LikeButton = ({ postId, user, className = '' }) => {
  const { likeCount, isLiked, loading, toggleLike } = useLikeSystem(postId, user);

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
        isLiked 
          ? 'bg-red-50 text-red-600 hover:bg-red-100' 
          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} ${className}`}
    >
      <Heart 
        className={`w-4 h-4 transition-all duration-200 ${
          isLiked ? 'fill-current text-red-600' : ''
        }`} 
      />
      <span className="text-sm font-medium">
        {likeCount}
      </span>
    </button>
  );
};

export default LikeButton;