import React, { useState } from 'react';
import { MessageSquare, MoreHorizontal, Trash2, Reply } from 'lucide-react';
import MentionInput from './MentionInput';
import { getTimeAgo } from '../utils/timeUtils';

const ThreadedComments = ({ 
  comments = [], 
  onAddComment, 
  onDeleteComment, 
  onReplyToComment,
  authUser,
  isCommentOwner 
}) => {
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState(new Set());

  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim()) return;
    
    await onReplyToComment(commentId, replyText);
    setReplyText('');
    setReplyingTo(null);
  };

  const renderComment = (comment, depth = 0) => {
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedReplies.has(comment.id);
    const maxDepth = 3; // Limit nesting depth

    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
        <div className="flex gap-3 group">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-gray-600 font-medium text-xs">
              {(comment.author_name || 'User').charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 rounded-2xl px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900 text-sm">
                  {comment.author_name || 'Anonymous'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {getTimeAgo(comment.created_at)}
                  </span>
                  {isCommentOwner(comment) && (
                    <button
                      onClick={() => onDeleteComment(comment.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="text-gray-700 text-sm leading-relaxed">
                {comment.content}
              </div>
            </div>
            
            {/* Comment Actions */}
            <div className="flex items-center gap-4 mt-2 ml-4">
              {authUser && depth < maxDepth && (
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="text-xs text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  <Reply className="w-3 h-3" />
                  Reply
                </button>
              )}
              
              {hasReplies && (
                <button
                  onClick={() => toggleReplies(comment.id)}
                  className="text-xs text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  <MessageSquare className="w-3 h-3" />
                  {isExpanded ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </button>
              )}
            </div>
            
            {/* Reply Input */}
            {replyingTo === comment.id && authUser && (
              <div className="mt-3 ml-4">
                <div className="flex gap-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium text-xs">
                      {authUser.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <MentionInput
                      value={replyText}
                      onChange={setReplyText}
                      placeholder={`Reply to ${comment.author_name}...`}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      onSubmit={() => handleReply(comment.id)}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReply(comment.id)}
                        disabled={!replyText.trim()}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Nested Replies */}
            {hasReplies && isExpanded && (
              <div className="mt-4 space-y-3">
                {comment.replies.map(reply => renderComment(reply, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <div className="text-center py-6 text-gray-500 text-sm">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        comments.map(comment => renderComment(comment))
      )}
    </div>
  );
};

export default ThreadedComments;