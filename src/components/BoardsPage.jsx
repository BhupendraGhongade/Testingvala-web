import React, { useState, useEffect } from 'react';
import { Bookmark, Plus, Edit2, Trash2, Lock, Globe, X, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const isValidImageUrl = (url) => {
  if (!url) return true;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

const sanitizeText = (text) => {
  return text.replace(/<[^>]*>/g, '').trim();
};

const BoardsPage = ({ user, onBack, onViewBoard, onViewPublic }) => {
  const [boards, setBoards] = useState([]);
  const [saves, setSaves] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [newBoard, setNewBoard] = useState({
    name: '',
    description: '',
    is_private: false,
    cover_image_url: ''
  });
  const [showDropdown, setShowDropdown] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    if (!supabase) {
      setError('Database not configured');
      setLoading(false);
      return;
    }

    if (!user?.id) {
      setBoards([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data: boardsData, error: boardsError } = await supabase
        .from('user_boards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (boardsError) {
        if (boardsError.code === 'PGRST116' || boardsError.message?.includes('relation "user_boards" does not exist')) {
          setError('Boards feature not set up. Please run the database setup script.');
          return;
        }
        throw boardsError;
      }

      // Load boards with save counts
      const boardsWithSaves = await Promise.all(
        (boardsData || []).map(async (board) => {
          try {
            const { count } = await supabase
              .from('board_pins')
              .select('*', { count: 'exact', head: true })
              .eq('board_id', board.id);
            
            return { ...board, save_count: count || 0 };
          } catch (error) {
            console.warn(`Could not load save count for board ${board.id}:`, error);
            return { ...board, save_count: 0 };
          }
        })
      );

      setBoards(boardsWithSaves);

      // Update saves state for backward compatibility
      const savesCount = {};
      boardsWithSaves.forEach(board => {
        savesCount[board.id] = board.save_count;
      });
      setSaves(savesCount);

    } catch (error) {
      console.error('Error loading boards:', error);
      setError(`Failed to load boards: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async () => {
    const sanitizedName = sanitizeText(newBoard.name);
    if (!sanitizedName) {
      toast.error('Board name is required');
      return;
    }
    
    const imageUrl = newBoard.cover_image_url.trim();
    if (imageUrl && !isValidImageUrl(imageUrl)) {
      toast.error('Please enter a valid image URL');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_boards')
        .insert({
          user_id: user.id,
          name: sanitizedName,
          description: sanitizeText(newBoard.description) || null,
          is_private: newBoard.is_private,
          cover_image_url: imageUrl || null
        })
        .select()
        .single();

      if (error) throw error;

      setBoards(prev => [data, ...prev]);
      setSaves(prev => ({ ...prev, [data.id]: 0 }));
      resetForm();
      toast.success('Board created successfully!');
    } catch (error) {
      console.error('Error creating board:', error);
      toast.error('Failed to create board');
    } finally {
      setLoading(false);
    }
  };

  const deleteBoard = async (boardId) => {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    if (!confirm(`Delete "${board.name}"? All saves will be removed.`)) return;

    try {
      const { error } = await supabase
        .from('user_boards')
        .delete()
        .eq('id', boardId);

      if (error) throw error;

      setBoards(prev => prev.filter(b => b.id !== boardId));
      setSaves(prev => {
        const newSaves = { ...prev };
        delete newSaves[boardId];
        return newSaves;
      });
      setShowDropdown({});
      toast.success('Board deleted!');
    } catch (error) {
      console.error('Error deleting board:', error);
      toast.error('Failed to delete board');
    }
  };

  const resetForm = () => {
    setEditingBoard(null);
    setShowCreateBoard(false);
    setNewBoard({ name: '', description: '', is_private: false, cover_image_url: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Bookmark className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Boards</h1>
                <p className="text-gray-600">Organize and manage your saved posts</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onViewPublic}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Globe className="w-5 h-5" />
              Public Boards
            </button>
            <button
              onClick={() => setShowCreateBoard(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Board
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Setup Required</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            {error.includes('not set up') && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left max-w-md mx-auto">
                <p className="text-sm text-yellow-800">Run the SQL setup in your Supabase dashboard</p>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your boards...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && boards.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bookmark className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Boards Yet</h3>
            <p className="text-gray-600 mb-6">Create your first board to start organizing posts!</p>
            <button
              onClick={() => setShowCreateBoard(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Create Your First Board
            </button>
          </div>
        )}

        {/* Boards Grid */}
        {!loading && !error && boards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {boards.map((board) => (
              <div 
                key={board.id} 
                onClick={() => onViewBoard(board.id)}
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-2 hover:scale-105 border border-gray-100"
              >
                <div className="relative h-40 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 overflow-hidden">
                  {board.cover_image_url && isValidImageUrl(board.cover_image_url) ? (
                    <>
                      <img
                        src={board.cover_image_url}
                        alt={board.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    </>
                  ) : (
                    <>
                      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 animate-pulse"></div>
                        <Bookmark className="w-16 h-16 text-white opacity-80 relative z-10 group-hover:scale-125 transition-transform duration-300" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </>
                  )}
                  
                  {/* Floating Action Button */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDropdown(prev => ({ ...prev, [board.id]: !prev[board.id] }));
                      }}
                      className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    
                    {showDropdown[board.id] && (
                      <div className="absolute right-0 top-12 bg-white border rounded-xl shadow-2xl z-20 min-w-[140px] overflow-hidden">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBoard(board.id);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Board
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Privacy Badge */}
                  <div className="absolute top-3 left-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                      board.is_private 
                        ? 'bg-red-500/20 text-red-100 border border-red-400/30' 
                        : 'bg-green-500/20 text-green-100 border border-green-400/30'
                    }`}>
                      {board.is_private ? (
                        <div className="flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Private
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          Public
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Save Count Badge */}
                  <div className="absolute bottom-3 right-3">
                    <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-gray-800 shadow-lg">
                      {board.save_count || saves[board.id] || 0} saves
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
                    {board.name}
                  </h3>
                  {board.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {board.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      Created {new Date(board.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
                      View Board →
                    </div>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400/0 via-purple-400/0 to-pink-400/0 group-hover:from-blue-400/10 group-hover:via-purple-400/10 group-hover:to-pink-400/10 transition-all duration-500 pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}

        {/* Create Board Form */}
        {showCreateBoard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100000] p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create New Board</h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Board Name *</label>
                  <input
                    type="text"
                    value={newBoard.name}
                    onChange={(e) => setNewBoard(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Testing Resources"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newBoard.description}
                    onChange={(e) => setNewBoard(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What's this board about?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    maxLength={200}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="private-board"
                      checked={newBoard.is_private}
                      onChange={(e) => setNewBoard(prev => ({ ...prev, is_private: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="private-board" className="text-sm text-gray-700 flex items-center gap-2">
                      {newBoard.is_private ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                      Make this board private
                    </label>
                  </div>
                  
                  <div className={`p-3 rounded-lg border ${
                    newBoard.is_private 
                      ? 'bg-orange-50 border-orange-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      {newBoard.is_private ? (
                        <Lock className="w-4 h-4 text-orange-600 mt-0.5" />
                      ) : (
                        <Globe className="w-4 h-4 text-blue-600 mt-0.5" />
                      )}
                      <div className="text-xs">
                        <p className={`font-medium mb-1 ${
                          newBoard.is_private ? 'text-orange-800' : 'text-blue-800'
                        }`}>
                          {newBoard.is_private ? 'Private Board' : 'Public Board'}
                        </p>
                        <p className={newBoard.is_private ? 'text-orange-700' : 'text-blue-700'}>
                          {newBoard.is_private 
                            ? 'Only you can see this board and its saves.' 
                            : 'All verified users can discover and view this board and its saves.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createBoard}
                  disabled={!newBoard.name.trim() || loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Board'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardsPage;