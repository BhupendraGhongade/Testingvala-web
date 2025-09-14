import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Bookmark, Users, Eye, EyeOff, Trash2, Search, Filter, Calendar, TrendingUp, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const BoardsManagement = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    totalBoards: 0,
    publicBoards: 0,
    privateBoards: 0,
    totalSaves: 0,
    activeUsers: 0
  });

  useEffect(() => {
    loadBoardsData();
  }, []);

  const loadBoardsData = async () => {
    if (!supabase) {
      setError('Supabase not configured');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load boards with user profiles and save counts
      const { data: boardsData, error: boardsError } = await supabase
        .from('user_boards')
        .select(`
          *,
          user_profiles:user_id (
            full_name,
            username,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (boardsError) {
        if (boardsError.code === 'PGRST116') {
          setError('Boards feature not set up. Please run the database setup script.');
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
            console.error(`Error loading saves for board ${board.id}:`, error);
            return { ...board, save_count: 0 };
          }
        })
      );

      setBoards(boardsWithSaves);

      // Calculate stats
      const totalBoards = boardsWithSaves.length;
      const publicBoards = boardsWithSaves.filter(b => !b.is_private).length;
      const privateBoards = boardsWithSaves.filter(b => b.is_private).length;
      const totalSaves = boardsWithSaves.reduce((sum, b) => sum + b.save_count, 0);
      
      // Get unique users count
      const uniqueUsers = new Set(boardsWithSaves.map(b => b.user_id)).size;

      setStats({
        totalBoards,
        publicBoards,
        privateBoards,
        totalSaves,
        activeUsers: uniqueUsers
      });

    } catch (error) {
      console.error('Error loading boards:', error);
      setError(`Failed to load boards: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleBoardVisibility = async (boardId, currentPrivacy) => {
    try {
      const { error } = await supabase
        .from('user_boards')
        .update({ is_private: !currentPrivacy })
        .eq('id', boardId);

      if (error) throw error;

      setBoards(prev => prev.map(board => 
        board.id === boardId 
          ? { ...board, is_private: !currentPrivacy }
          : board
      ));

      toast.success(currentPrivacy ? 'Board made public' : 'Board made private');
      
      // Update stats
      setStats(prev => ({
        ...prev,
        publicBoards: currentPrivacy ? prev.publicBoards + 1 : prev.publicBoards - 1,
        privateBoards: currentPrivacy ? prev.privateBoards - 1 : prev.privateBoards + 1
      }));

    } catch (error) {
      console.error('Error updating board visibility:', error);
      toast.error('Failed to update board visibility');
    }
  };

  const deleteBoard = async (boardId, boardName) => {
    if (!confirm(`Are you sure you want to delete "${boardName}"? This will also delete all saves in this board.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_boards')
        .delete()
        .eq('id', boardId);

      if (error) throw error;

      setBoards(prev => prev.filter(board => board.id !== boardId));
      toast.success('Board deleted successfully');
      
      // Refresh stats
      loadBoardsData();

    } catch (error) {
      console.error('Error deleting board:', error);
      toast.error('Failed to delete board');
    }
  };

  const filteredBoards = boards.filter(board => {
    const matchesSearch = 
      board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      board.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      board.user_profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      board.user_profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'public' && !board.is_private) ||
      (filterStatus === 'private' && board.is_private);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6600]"></div>
        <span className="ml-3 text-gray-600">Loading boards...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h3 className="text-lg font-semibold text-red-900">Boards Management Error</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        {error.includes('not set up') && (
          <div className="bg-white border border-red-200 rounded-lg p-4 mt-4">
            <h4 className="font-semibold text-red-900 mb-2">Setup Instructions:</h4>
            <ol className="text-sm text-red-800 space-y-1 list-decimal list-inside">
              <li>Run the database setup script: <code className="bg-red-100 px-2 py-1 rounded">supabase-boards-schema.sql</code></li>
              <li>Ensure RLS policies are properly configured</li>
              <li>Verify user_profiles table exists</li>
            </ol>
          </div>
        )}
        <button
          onClick={loadBoardsData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Boards Management</h3>
        <button
          onClick={loadBoardsData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Boards</p>
              <p className="text-2xl font-bold">{stats.totalBoards}</p>
            </div>
            <Bookmark className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Public Boards</p>
              <p className="text-2xl font-bold">{stats.publicBoards}</p>
            </div>
            <Eye className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Private Boards</p>
              <p className="text-2xl font-bold">{stats.privateBoards}</p>
            </div>
            <EyeOff className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Saves</p>
              <p className="text-2xl font-bold">{stats.totalSaves}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Active Users</p>
              <p className="text-2xl font-bold">{stats.activeUsers}</p>
            </div>
            <Users className="w-8 h-8 text-indigo-200" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search boards, descriptions, or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
            >
              <option value="all">All Boards ({stats.totalBoards})</option>
              <option value="public">Public ({stats.publicBoards})</option>
              <option value="private">Private ({stats.privateBoards})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Boards List */}
      {filteredBoards.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Boards Found</h3>
          <p className="text-gray-600">
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No boards have been created yet.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Board
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saves
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visibility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBoards.map((board) => (
                  <tr key={board.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{board.name}</div>
                        {board.description && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {board.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {board.user_profiles?.full_name || board.user_profiles?.username || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {board.user_profiles?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{board.save_count}</span>
                        <span className="text-xs text-gray-500 ml-1">pins</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {board.is_private ? (
                          <>
                            <EyeOff className="w-4 h-4 text-gray-500" />
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Private
                            </span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 text-green-500" />
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Public
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(board.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleBoardVisibility(board.id, board.is_private)}
                          className={`p-2 rounded-lg transition-colors ${
                            board.is_private
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          title={board.is_private ? 'Make Public' : 'Make Private'}
                        >
                          {board.is_private ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteBoard(board.id, board.name)}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          title="Delete Board"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Board System Overview</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h5 className="font-medium mb-2">Features Available:</h5>
            <ul className="space-y-1">
              <li>• Create and manage personal boards</li>
              <li>• Save posts from community discussions</li>
              <li>• Public/private board visibility</li>
              <li>• Board discovery for public boards</li>
              <li>• Real-time pin management</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-2">Admin Capabilities:</h5>
            <ul className="space-y-1">
              <li>• View all boards and their statistics</li>
              <li>• Toggle board visibility (public/private)</li>
              <li>• Delete boards and their saves</li>
              <li>• Monitor user engagement</li>
              <li>• Track community growth</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardsManagement;