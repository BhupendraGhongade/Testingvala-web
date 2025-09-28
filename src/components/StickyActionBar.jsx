import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, Share2, Pin, Bookmark } from 'lucide-react';

const StickyActionBar = ({ 
  post, 
  isVisible, 
  onLike, 
  onComment, 
  onShare, 
  onPin, 
  onSave,
  likeCount,
  commentCount,
  isLiked,
  isPinned 
}) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const postElement = document.getElementById(`post-${post.id}`);
      if (postElement) {
        const rect = postElement.getBoundingClientRect();
        setIsSticky(rect.bottom < 100);
      }
    };

    if (isVisible) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isVisible, post.id]);

  if (!isVisible || !isSticky) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl px-4 py-2 flex items-center space-x-1 transition-all duration-300">
      <button
        onClick={() => onLike(post.id)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
          isLiked
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'text-gray-600 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-200'
        }`}
      >
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
        <span className="tabular-nums">{likeCount}</span>
      </button>

      <button
        onClick={() => onComment(post.id)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 border border-transparent hover:border-blue-200 transition-all duration-200"
      >
        <MessageSquare className="w-4 h-4" />
        <span className="tabular-nums">{commentCount}</span>
      </button>

      <button
        onClick={() => onShare(post.id)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent hover:border-emerald-200 transition-all duration-200"
      >
        <Share2 className="w-4 h-4" />
      </button>

      <button
        onClick={() => onPin(post)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
          isPinned
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600 border border-transparent hover:border-amber-200'
        }`}
      >
        <Pin className={`w-4 h-4 ${isPinned ? 'fill-amber-500 text-amber-500' : ''}`} />
      </button>

      <button
        onClick={() => onSave(post.id)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm text-gray-600 hover:bg-violet-50 hover:text-violet-600 border border-transparent hover:border-violet-200 transition-all duration-200"
      >
        <Bookmark className="w-4 h-4" />
      </button>
    </div>
  );
};

export default StickyActionBar;