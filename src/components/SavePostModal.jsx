import React, { useState, useEffect } from 'react';
import { X, Plus, Bookmark, Image, Lock, Globe, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useModalScrollLock } from '../hooks/useModalScrollLock';
import toast from 'react-hot-toast';

// URL validation utility
const isValidImageUrl = (url) => {
  if (!url) return true; // Allow empty URLs
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

const SavePostModal = ({ isOpen, onClose, post, user }) => {
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState('');
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [newBoardPrivate, setNewBoardPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // This function makes the component auth-agnostic.
  // It returns the user's UUID if available, otherwise falls back to email.
  const getUserId = () => user?.id || user?.email;

  // Prevent background scrolling
  useModalScrollLock(isOpen);

  // Flexible auth check: works with Supabase default (user.id) and custom auth (user.email)
  const isUserAuthenticated = user && (user.id || user.email);

  if (!isUserAuthenticated || !post?.id) {
    return null;
  }

  useEffect(() => {
    if (isOpen && isUserAuthenticated && boards.length === 0) {
      loadUserBoards();
    }
  }, [isOpen, isUserAuthenticated, boards.length]);

  const loadUserBoards = async () => {
    const userId = getUserId();
    try {
      setError(null);
      // Load from localStorage as fallback
      const localBoards = JSON.parse(localStorage.getItem(`boards_${userId}`) || '[]');
      setBoards(localBoards);
    } catch (error) {
      console.error('Error loading boards:', error);
      setBoards([]);
      setError('Failed to load boards');
    }
  };

  const createBoard = async () => {
    if (!newBoardName.trim()) {
      toast.error('Board name is required');
      return;
    }

    const userId = getUserId();
    setLoading(true);
    try {
      const newBoard = {
        id: `local-${Date.now()}`,
        user_id: userId,
        name: newBoardName.trim(),
        description: newBoardDescription.trim() || null,
        is_private: newBoardPrivate,
        created_at: new Date().toISOString(),
        save_count: 0
      };

      // Save to localStorage
      const existingBoards = JSON.parse(localStorage.getItem(`boards_${userId}`) || '[]');
      const updatedBoards = [newBoard, ...existingBoards];
      localStorage.setItem(`boards_${userId}`, JSON.stringify(updatedBoards));

      setBoards(prev => [newBoard, ...prev]);
      setSelectedBoard(newBoard.id);
      setShowCreateBoard(false);
      setNewBoardName('');
      setNewBoardDescription('');
      setNewBoardPrivate(false);
      toast.success('Board created successfully!');
    } catch (error) {
      console.error('Error creating board:', error);
      toast.error('Failed to create board. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingSave = async (boardId, postId) => {
    try {
      const { data: existing, error } = await supabase
        .from('board_pins')
        .select('id')
        .eq('board_id', boardId)
        .eq('post_id', postId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return existing;
    } catch (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
  };

  const insertSave = async (boardId, postData) => {
    // Extract and validate post data with better image handling
    const title = postData.title || postData.post_title || 'Untitled Post';
    const content = postData.content || postData.post_content || postData.description || 'No content available';
    const author = postData.user_profiles?.full_name || 
                   postData.user_profiles?.username || 
                   postData.author_name ||
                   postData.author || 
                   'Anonymous';
    const category = postData.category_name || 
                     postData.forum_categories?.name || 
                     postData.category || 
                     'General';
    
    // Better image URL extraction - check multiple possible fields
    const imageUrl = postData.image_url || 
                     postData.post_image_url || 
                     postData.imageUrl || 
                     postData.image || 
                     null;

    // Prepare save data with validation
    const saveData = {
      board_id: boardId,
      post_id: String(postData.id || `post_${Date.now()}`),
      post_title: title.trim() || 'Untitled Post',
      post_content: content.trim() || 'No content available',
      post_author: author.trim() || 'Anonymous',
      post_category: category.trim() || 'General',
      post_image_url: imageUrl
    };

    console.log('Inserting save data:', saveData);

    const { error } = await supabase
      .from('board_pins')
      .insert(saveData);
      
    if (error) throw error;
  };

  const saveToBoard = async () => {
    if (!selectedBoard) {
      toast.error('Please select a board');
      return;
    }
    if (!post?.id) {
      toast.error('Invalid post data');
      return;
    }

    setLoading(true);
    try {
      const userId = getUserId();
      const saveKey = `board_saves_${selectedBoard}`;
      const existingSaves = JSON.parse(localStorage.getItem(saveKey) || '[]');
      
      // Check if already saved
      if (existingSaves.find(save => save.post_id === post.id)) {
        const boardName = boards.find(b => b.id === selectedBoard)?.name || 'this board';
        toast.error(`This content is already saved to ${boardName}`);
        setLoading(false);
        return;
      }

      // Create save data
      const saveData = {
        id: `save-${Date.now()}`,
        board_id: selectedBoard,
        post_id: post.id,
        post_title: post.title || 'Untitled Post',
        post_content: post.content || 'No content',
        post_author: post.author_name || 'Anonymous',
        post_category: post.category_name || 'General',
        post_image_url: post.image_url || null,
        created_at: new Date().toISOString()
      };

      // Save to localStorage
      const updatedSaves = [saveData, ...existingSaves];
      localStorage.setItem(saveKey, JSON.stringify(updatedSaves));

      const boardName = boards.find(b => b.id === selectedBoard)?.name || 'board';
      toast.success(`Successfully saved to ${boardName}!`);
      onClose();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100000] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col relative z-[100001]">
        <div className="flex-shrink-0 p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-blue-600" />
              Save Post
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">

          {/* Post Preview */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="font-medium text-gray-900 mb-2 text-sm leading-tight">
              <span className="block line-clamp-1" title={post?.title || 'Untitled Post'}>
                {post?.title || 'Untitled Post'}
              </span>
            </h4>
            <div className="text-xs text-gray-600 mb-2">
              <p className="line-clamp-2 leading-relaxed break-words" title={post?.content || post?.description || post?.post_content || 'No content available'}>
                {(() => {
                  const content = post?.content || post?.description || post?.post_content || 'No content available';
                  return content.length > 80 ? content.substring(0, 80) + '...' : content;
                })()}
              </p>
            </div>
            <div className="flex items-center">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full truncate max-w-[80px]" title={post?.category_name || post?.forum_categories?.name || 'General'}>
                {post?.category_name || post?.forum_categories?.name || 'General'}
              </span>
            </div>

          </div>

          {!showCreateBoard ? (
            <>
              {/* Select Board */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Choose Board
                </label>
                {boards.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No boards yet. Create your first board below!</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 -mr-2">
                    {boards.map((board) => (
                      <label key={board.id} className="flex items-start p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="board"
                          value={board.id}
                          checked={selectedBoard === board.id}
                          onChange={(e) => setSelectedBoard(e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-0.5 flex-shrink-0"
                        />
                        <div className="ml-2.5 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-medium text-gray-900 text-sm line-clamp-1" title={board.name}>{board.name}</span>
                            {board.is_private ? (
                              <Lock className="w-3 h-3 text-gray-500 flex-shrink-0" />
                            ) : (
                              <Globe className="w-3 h-3 text-gray-500 flex-shrink-0" />
                            )}
                          </div>
                          {board.description && (
                            <p className="text-xs text-gray-500 line-clamp-1 break-words" title={board.description}>
                              {board.description.length > 50 ? board.description.substring(0, 50) + '...' : board.description}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-red-600 mb-1">Error</p>
                      <p className="text-sm text-red-600 break-words">{error}</p>
                      {error.includes('not set up') && (
                        <p className="text-xs text-red-500 mt-2">Please run the database setup script first.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Create New Board Button */}
              <button
                onClick={() => setShowCreateBoard(true)}
                disabled={loading}
                className="w-full mb-4 p-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50 text-sm"
              >
                <Plus className="w-4 h-4" />
                Create New Board
              </button>
            </>
          ) : (
            <>
              {/* Create Board Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Board Name *
                  </label>
                  <input
                    type="text"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    placeholder="e.g., Testing Resources"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    maxLength={40}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newBoardDescription}
                    onChange={(e) => setNewBoardDescription(e.target.value)}
                    placeholder="Brief description..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    rows={2}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="private-board"
                      checked={newBoardPrivate}
                      onChange={(e) => setNewBoardPrivate(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                    />
                    <label htmlFor="private-board" className="text-sm text-gray-700 flex items-center gap-2">
                      {newBoardPrivate ? <Lock className="w-4 h-4 flex-shrink-0" /> : <Globe className="w-4 h-4 flex-shrink-0" />}
                      <span>Make this board private</span>
                    </label>
                  </div>
                  
                  <div className={`p-2.5 rounded-lg border ${
                    newBoardPrivate 
                      ? 'bg-orange-50 border-orange-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      {newBoardPrivate ? (
                        <Lock className="w-3.5 h-3.5 text-orange-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Globe className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="text-xs flex-1 min-w-0">
                        <p className={`font-medium mb-0.5 ${
                          newBoardPrivate ? 'text-orange-800' : 'text-blue-800'
                        }`}>
                          {newBoardPrivate ? 'Private' : 'Public'}
                        </p>
                        <p className={`leading-relaxed line-clamp-2 ${
                          newBoardPrivate ? 'text-orange-700' : 'text-blue-700'
                        }`}>
                          {newBoardPrivate 
                            ? 'Only you can see this board.' 
                            : 'All users can view this board.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Action Buttons - Fixed at bottom */}
        {!showCreateBoard && (
          <div className="flex-shrink-0 p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveToBoard}
                disabled={!selectedBoard || loading}
                className="flex-1 px-6 py-3 bg-[#0057B7] text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="truncate">Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Bookmark className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Save Post</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        )}
        
        {/* Create Board Actions - Fixed at bottom when in create mode */}
        {showCreateBoard && (
          <div className="flex-shrink-0 p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateBoard(false);
                  setNewBoardName('');
                  setNewBoardDescription('');
                  setNewBoardPrivate(false);
                }}
                disabled={loading}
                className="flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
              >
                Back
              </button>
              <button
                onClick={createBoard}
                disabled={!newBoardName.trim() || loading}
                className="flex-1 px-4 py-3 bg-[#0057B7] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="truncate">Creating...</span>
                  </>
                ) : (
                  <span className="truncate">Create Board</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavePostModal;