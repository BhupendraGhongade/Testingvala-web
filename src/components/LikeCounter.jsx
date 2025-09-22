import React from 'react';
import { Heart } from 'lucide-react';
import { useLikeSync } from '../hooks/useLikeSync';

const LikeCounter = ({ postId, authUser, onLike, isLiked }) => {
  const { totalLikes } = useLikeSync(postId, authUser);

  return (
    <button
      onClick={() => onLike(postId)}
      className={`group relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
        isLiked
          ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm'
          : 'text-gray-600 hover:bg-gray-50 hover:text-rose-600 border border-transparent hover:border-gray-200'
      }`}
    >
      <Heart className={`w-4 h-4 transition-all duration-200 ${
        isLiked ? 'fill-rose-500 text-rose-500' : 'group-hover:text-rose-500'
      }`} />
      <span className="font-semibold tabular-nums">
        {totalLikes}
      </span>
      <span className="hidden sm:inline">Like{totalLikes !== 1 ? 's' : ''}</span>
    </button>
  );
};

export default LikeCounter;