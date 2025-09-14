import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bookmark, Lock, Globe, Plus, MoreHorizontal, Trash2, Share2, Download, FileText, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const BoardDetailPage = ({ boardId, user, onBack }) => {
  const [board, setBoard] = useState(null);
  const [saves, setSaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBoardDetails();
  }, [boardId]);

  const loadBoardDetails = async () => {
    if (!supabase) {
      setError('Database not configured');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Load board info
      const { data: boardData, error: boardError } = await supabase
        .from('user_boards')
        .select('*')
        .eq('id', boardId)
        .single();

      // Load user profile separately if board exists
      let userProfile = null;
      if (boardData && !boardError) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('full_name, username, email')
          .eq('user_id', boardData.user_id)
          .single();
        userProfile = profileData;
      }

      if (boardError) {
        if (boardError.code === 'PGRST116') {
          setError('Board not found or boards feature not set up');
          return;
        }
        throw boardError;
      }

      if (!boardData) {
        setError('Board not found');
        return;
      }

      // Check if user can view this board
      if (boardData.is_private && boardData.user_id !== user?.id) {
        setError('This board is private and you do not have access');
        return;
      }

      setBoard({ ...boardData, user_profiles: userProfile });

      // Load saves with better error handling
      const { data: savesData, error: savesError } = await supabase
        .from('board_pins')
        .select('*')
        .eq('board_id', boardId)
        .order('created_at', { ascending: false });

      if (savesError) {
        console.error('Error loading saves:', savesError);
        if (savesError.code === 'PGRST116') {
          console.warn('Board saves table not found, showing empty board');
          setSaves([]);
        } else {
          // Don't fail the whole page for save loading errors
          setSaves([]);
        }
      } else {
        // Ensure saves have proper content
        const processedSaves = (savesData || []).map(save => ({
          ...save,
          post_title: save.post_title || 'Untitled Post',
          post_content: save.post_content || 'No content available',
          post_author: save.post_author || 'Anonymous',
          post_category: save.post_category || 'General',
          post_image_url: save.post_image_url || null
        }));
        
        setSaves(processedSaves);
      }
    } catch (error) {
      console.error('Error loading board:', error);
      setError(`Failed to load board: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const removeSave = async (saveId) => {
    if (!confirm('Remove this save from the board?')) return;

    try {
      const { error } = await supabase
        .from('board_pins')
        .delete()
        .eq('id', saveId);

      if (error) throw error;

      setSaves(prev => prev.filter(p => p.id !== saveId));
      toast.success('Save removed');
    } catch (error) {
      console.error('Error removing save:', error);
      toast.error('Failed to remove save');
    }
  };

  const toggleBoardVisibility = async () => {
    if (!isOwner) return;

    try {
      const newVisibility = !board.is_private;
      const { error } = await supabase
        .from('user_boards')
        .update({ is_private: newVisibility })
        .eq('id', boardId);

      if (error) throw error;

      setBoard(prev => ({ ...prev, is_private: newVisibility }));
      toast.success(newVisibility ? 'Board made private' : 'Board published publicly');
    } catch (error) {
      console.error('Error updating board visibility:', error);
      toast.error('Failed to update board visibility');
    }
  };

  const downloadPDF = () => {
    if (!board || saves.length === 0) {
      toast.error('No content to export');
      return;
    }

    const printWindow = window.open('', '_blank');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${board.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .board-thumb { width: 100px; height: 60px; object-fit: cover; border-radius: 8px; margin-bottom: 10px; }
          .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .meta { color: #666; font-size: 14px; }
          .post { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; page-break-inside: avoid; }
          .post-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .post-meta { color: #666; font-size: 12px; margin-bottom: 15px; }
          .post-content { margin-bottom: 15px; }
          .post-image { max-width: 300px; height: auto; margin: 10px 0; border: 1px solid #ddd; }
          @media print { body { margin: 20px; } .post { page-break-inside: avoid; } }
        </style>
      </head>
      <body>
        <div class="header">
          ${board.cover_image_url ? `<img src="${board.cover_image_url}" class="board-thumb" alt="Board thumbnail">` : ''}
          <div class="title">${board.name}</div>
          <div class="meta">
            ${board.description || ''}<br>
            Created: ${new Date(board.created_at).toLocaleDateString()}<br>
            By: ${board.user_profiles?.full_name || 'Anonymous'}<br>
            Total Posts: ${saves.length}
          </div>
        </div>
        ${saves.map((save, index) => `
          <div class="post">
            <div class="post-title">${index + 1}. ${save.post_title}</div>
            <div class="post-meta">
              Author: ${save.post_author} | Category: ${save.post_category} | Saved: ${new Date(save.created_at).toLocaleDateString()}
            </div>
            ${save.post_image_url ? `<img src="${save.post_image_url}" class="post-image" alt="Post image">` : ''}
            <div class="post-content">${save.post_content}</div>
          </div>
        `).join('')}
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
    toast.success('PDF download started');
  };

  const isOwner = board?.user_id === user?.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ paddingTop: '80px' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ paddingTop: '80px' }}>
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Board Not Found</h3>
          <p className="text-gray-600 mb-4">{error || 'This board does not exist'}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '80px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start gap-6 mb-8">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 mt-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          {board.cover_image_url && (
            <div className="w-32 h-20 rounded-lg overflow-hidden shadow-md flex-shrink-0">
              <img
                src={board.cover_image_url}
                alt={board.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{board.name}</h1>
              {board.is_private ? (
                <Lock className="w-6 h-6 text-gray-500" />
              ) : (
                <Globe className="w-6 h-6 text-gray-500" />
              )}
            </div>
            
            {board.description && (
              <p className="text-gray-600 mb-2">{board.description}</p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>By {board.user_profiles?.full_name || board.user_profiles?.username || board.user_profiles?.email || 'Anonymous'}</span>
              <span>•</span>
              <span>{saves.length} saves</span>
              <span>•</span>
              <span>Created {new Date(board.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={downloadPDF}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>

            {isOwner && (
              <button
                onClick={toggleBoardVisibility}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                  board.is_private 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {board.is_private ? (
                  <>
                    <Share2 className="w-4 h-4" />
                    Publish Board
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Make Private
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Saves Grid */}
        {saves.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Saves Yet</h3>
            <p className="text-gray-600">
              {isOwner ? 'Start saving posts to this board!' : 'This board is empty.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {saves.map((save, index) => (
              <div key={save.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        {index + 1}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900">
                        {save.post_title || 'Untitled Post'}
                      </h3>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => removeSave(save.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
                    <span>By <strong>{save.post_author || 'Anonymous'}</strong></span>
                    <span>•</span>
                    <span>Category: <strong>{save.post_category || 'General'}</strong></span>
                    <span>•</span>
                    <span>Saved: {new Date(save.created_at).toLocaleDateString()}</span>
                    {save.post_id && (
                      <>
                        <span>•</span>
                        <button
                          onClick={() => {
                            // Navigate to home page with post hash
                            const targetUrl = `/#community-post-${save.post_id}`;
                            if (window.location.pathname === '/') {
                              // Already on home page, just update hash and trigger highlight
                              window.location.hash = `community-post-${save.post_id}`;
                              window.dispatchEvent(new CustomEvent('highlightPost', { detail: { postId: save.post_id } }));
                            } else {
                              // Navigate to home page with hash
                              window.location.href = targetUrl;
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Source
                        </button>
                      </>
                    )}
                  </div>
                  
                  {save.post_image_url && (
                    <div className="mb-4">
                      <img
                        src={save.post_image_url}
                        alt="Post image"
                        className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                        onError={(e) => {
                          console.log('Image failed to load:', save.post_image_url);
                          e.target.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', save.post_image_url);
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="prose max-w-none">
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {save.post_content && save.post_content.trim() && save.post_content !== 'No content available' 
                        ? save.post_content
                        : 'No content available'
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardDetailPage;