import React, { useState, useEffect } from 'react';
import { ArrowLeft, Globe, Bookmark, User, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

const PublicBoardsPage = ({ user, onBack, onViewBoard }) => {
  const [publicBoards, setPublicBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPublicBoards();
  }, []);

  const loadPublicBoards = async () => {
    if (!supabase) {
      setError('Database not configured');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading public boards for user:', user?.email);
      
      // Get public boards (excluding user's own boards)
      const { data: boardsData, error: boardsError } = await supabase
        .from('user_boards')
        .select('*')
        .eq('is_private', false)
        .neq('user_id', user?.id || '')
        .order('created_at', { ascending: false });
        
      console.log('Public boards query result:', { boardsData, boardsError });

      if (boardsError) {
        if (boardsError.code === 'PGRST116') {
          setError('Boards feature not set up');
          return;
        }
        throw boardsError;
      }

      // Load save counts for each board
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

      setPublicBoards(boardsWithSaves);
      console.log('Final public boards:', boardsWithSaves);
    } catch (error) {
      console.error('Error loading public boards:', error);
      setError(`Failed to load public boards: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '80px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <Globe className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Public Boards</h1>
              <p className="text-gray-600">Discover boards shared by the community</p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading public boards...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Boards</h3>
            <p className="text-gray-600 mb-4">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && publicBoards.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Public Boards Yet</h3>
            <p className="text-gray-600 mb-6">Be the first to share a public board with the community!</p>
          </div>
        )}

        {/* Public Boards Grid */}
        {!loading && !error && publicBoards.length > 0 && (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Found {publicBoards.length} public board{publicBoards.length !== 1 ? 's' : ''} shared by verified users
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {publicBoards.map((board) => (
                <div 
                  key={board.id} 
                  onClick={() => onViewBoard(board.id)}
                  className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-2 hover:scale-105 border border-gray-100"
                >
                  <div className="relative h-40 bg-gradient-to-br from-green-500 via-blue-600 to-purple-500 overflow-hidden">
                    {board.cover_image_url ? (
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
                          <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 animate-pulse"></div>
                          <Bookmark className="w-16 h-16 text-white opacity-80 relative z-10 group-hover:scale-125 transition-transform duration-300" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </>
                    )}
                    
                    {/* Public Badge */}
                    <div className="absolute top-3 left-3">
                      <div className="px-3 py-1 bg-green-500/20 text-green-100 border border-green-400/30 rounded-full text-xs font-medium backdrop-blur-sm">
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          Public
                        </div>
                      </div>
                    </div>

                    {/* Save Count Badge */}
                    <div className="absolute bottom-3 right-3">
                      <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-gray-800 shadow-lg">
                        {board.save_count || 0} saves
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-200 line-clamp-1">
                      {board.name}
                    </h3>
                    
                    {board.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {board.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-white" />
                        </div>
                        <div className="text-xs text-gray-600">
                          <div className="font-medium">
                            Creator
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(board.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="mt-3 text-center">
                      <div className="text-xs font-medium text-green-600 group-hover:text-green-700 transition-colors">
                        View Board →
                      </div>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400/0 via-blue-400/0 to-purple-400/0 group-hover:from-green-400/10 group-hover:via-blue-400/10 group-hover:to-purple-400/10 transition-all duration-500 pointer-events-none"></div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PublicBoardsPage;