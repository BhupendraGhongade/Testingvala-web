import React, { useState } from 'react';
import { Heart, ThumbsUp, Laugh, Angry, Frown, Plus } from 'lucide-react';

const REACTION_EMOJIS = [
  { id: 'like', icon: ThumbsUp, emoji: '👍', label: 'Like' },
  { id: 'love', icon: Heart, emoji: '❤️', label: 'Love' },
  { id: 'laugh', icon: Laugh, emoji: '😂', label: 'Laugh' },
  { id: 'angry', icon: Angry, emoji: '😠', label: 'Angry' },
  { id: 'sad', icon: Frown, emoji: '😢', label: 'Sad' }
];

const QuickReactions = ({ postId, reactions = {}, onReact, compact = false }) => {
  const [showAll, setShowAll] = useState(false);
  const [isAnimating, setIsAnimating] = useState(null);

  const handleReaction = (reactionId) => {
    setIsAnimating(reactionId);
    onReact?.(postId, reactionId);
    setTimeout(() => setIsAnimating(null), 300);
  };

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
  const hasReactions = totalReactions > 0;

  if (compact && !hasReactions) return null;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Existing reactions */}
      {hasReactions && (
        <div className="flex items-center gap-1">
          {Object.entries(reactions)
            .filter(([_, count]) => count > 0)
            .slice(0, showAll ? undefined : 3)
            .map(([reactionId, count]) => {
              const reaction = REACTION_EMOJIS.find(r => r.id === reactionId);
              if (!reaction) return null;
              
              return (
                <button
                  key={reactionId}
                  onClick={() => handleReaction(reactionId)}
                  className={`
                    inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
                    bg-blue-50 text-blue-700 border border-blue-200
                    hover:bg-blue-100 transition-all duration-200
                    ${isAnimating === reactionId ? 'scale-110' : ''}
                  `}
                >
                  <span className="text-sm">{reaction.emoji}</span>
                  <span className="font-medium">{count}</span>
                </button>
              );
            })}
          
          {Object.keys(reactions).filter(k => reactions[k] > 0).length > 3 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
            >
              +{Object.keys(reactions).filter(k => reactions[k] > 0).length - 3}
            </button>
          )}
        </div>
      )}

      {/* Add reaction button */}
      {!compact && (
        <div className="relative group">
          <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
            <Plus className="w-4 h-4 text-gray-400" />
          </button>
          
          {/* Reaction picker */}
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:flex bg-white rounded-lg shadow-lg border p-2 gap-1 z-10">
            {REACTION_EMOJIS.map((reaction) => (
              <button
                key={reaction.id}
                onClick={() => handleReaction(reaction.id)}
                className="p-2 rounded hover:bg-gray-50 transition-colors"
                title={reaction.label}
              >
                <span className="text-lg">{reaction.emoji}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickReactions;