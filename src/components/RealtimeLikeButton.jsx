import React from 'react';
import { Heart } from 'lucide-react';
import { useRealtimeLikes } from '../hooks/useRealtimeLikes';
import toast from 'react-hot-toast';

const RealtimeLikeButton = ({ postId, initialDbCount = 0 }) => {
  const { totalLikes, isLiked, toggleLike, isLoading } = useRealtimeLikes(postId, initialDbCount);

  const handleLike = async () => {
    try {
      const result = await toggleLike();
      if (result) {
        toast.success('Post liked!', { duration: 1500 });
      } else {
        toast.success('Like removed', { duration: 1500 });
      }
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`group relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
        isLiked
          ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm'
          : 'text-gray-600 hover:bg-gray-50 hover:text-rose-600 border border-transparent hover:border-gray-200'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Heart 
        className={`w-4 h-4 transition-all duration-200 ${
          isLiked ? 'fill-rose-500 text-rose-500' : 'group-hover:text-rose-500'
        } ${isLoading ? 'animate-pulse' : ''}`} 
      />
      <span className="font-semibold tabular-nums">
        {totalLikes}
      </span>
      <span className="hidden sm:inline">Like{totalLikes !== 1 ? 's' : ''}</span>
      
      {/* Real-time indicator */}
      {isLiked && (
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></div>
      )}
    </button>
  );
};

export default RealtimeLikeButton;