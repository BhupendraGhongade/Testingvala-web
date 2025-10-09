import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Bookmark, Lock, Globe, Plus, MoreHorizontal, Trash2, Share2, Download, FileText, ExternalLink, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import ConfirmationModal from './ConfirmationModal';

const BoardDetailPage = ({ boardId, user, onBack }) => {
  const [board, setBoard] = useState(null);
  const [saves, setSaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(null);
  const [dragState, setDragState] = useState({
    draggedIndex: null,
    dragOverIndex: null,
    isDragging: false,
    dragStartPos: null
  });
  const dragTimeoutRef = useRef(null);
  const dragPreviewRef = useRef(null);

  // Flexible user ID getter
  const getUserId = () => user?.id || user?.email;

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
      // Load board from localStorage
      const userId = getUserId();
      const userBoards = JSON.parse(localStorage.getItem(`boards_${userId}`) || '[]');
      const boardData = userBoards.find(b => b.id === boardId);
      
      if (!boardData) {
        setError('Board not found');
        return;
      }

      // Check if user can view this board
      if (boardData.is_private && boardData.user_id !== userId) {
        setError('This board is private and you do not have access');
        return;
      }

      setBoard(boardData);

      // Load saves from localStorage
      const saveKey = `board_saves_${boardId}`;
      const savesData = JSON.parse(localStorage.getItem(saveKey) || '[]');
      
      const processedSaves = savesData.map(save => ({
        ...save,
        post_title: save.post_title || 'Untitled Post',
        post_content: save.post_content || 'No content available',
        post_author: save.post_author || 'Anonymous',
        post_category: save.post_category || 'General',
        post_image_url: save.post_image_url || null,
        position: save.position || 0
      }));
      
      setSaves(processedSaves);
    } catch (error) {
      console.error('Error loading board:', error);
      setError(`Failed to load board: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const removeSave = async (saveId) => {
    const save = saves.find(s => s.id === saveId);
    if (!save) return;
    
    setShowRemoveModal(save);
  };

  const confirmRemoveSave = async () => {
    if (!showRemoveModal) return;

    try {
      const { error } = await supabase
        .from('board_pins')
        .delete()
        .eq('id', showRemoveModal.id);

      if (error) throw error;

      setSaves(prev => prev.filter(p => p.id !== showRemoveModal.id));
      setShowRemoveModal(null);
      toast.success('Save removed');
    } catch (error) {
      console.error('Error removing save:', error);
      toast.error('Failed to remove save');
    }
  };

  const reorderSaves = useCallback(async (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    
    const newSaves = [...saves];
    const [movedItem] = newSaves.splice(fromIndex, 1);
    newSaves.splice(toIndex, 0, movedItem);
    
    setSaves(newSaves);
    
    try {
      const updates = newSaves.map((save, index) => 
        supabase.from('board_pins').update({ position: index }).eq('id', save.id)
      );
      await Promise.all(updates);
      toast.success('Order updated');
    } catch (error) {
      setSaves(saves);
      toast.error('Failed to update order');
    }
  }, [saves]);

  const handleDragStart = useCallback((e, index) => {
    const save = saves[index];
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ index, id: save.id }));
    
    const preview = document.createElement('div');
    preview.className = 'fixed pointer-events-none z-[9999] bg-white border-2 border-[#0057B7] rounded-lg p-3 shadow-2xl max-w-xs transform rotate-1 opacity-90';
    preview.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 bg-gradient-to-br from-[#0057B7] to-blue-600 rounded flex items-center justify-center">
          <span class="text-white text-xs font-bold">${index + 1}</span>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-gray-900 truncate text-sm">${save.post_title}</h4>
          <p class="text-xs text-blue-600 font-medium">Moving...</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(preview);
    preview.style.left = '-9999px';
    preview.style.top = '-9999px';
    
    e.dataTransfer.setDragImage(preview, 100, 30);
    dragPreviewRef.current = preview;
    
    requestAnimationFrame(() => {
      setDragState({
        draggedIndex: index,
        dragOverIndex: null,
        isDragging: true,
        dragStartPos: { x: e.clientX, y: e.clientY }
      });
    });
    
    dragTimeoutRef.current = setTimeout(() => {
      if (dragPreviewRef.current && document.body.contains(dragPreviewRef.current)) {
        document.body.removeChild(dragPreviewRef.current);
        dragPreviewRef.current = null;
      }
    }, 50);
  }, [saves]);

  const handleDragEnd = useCallback(() => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    if (dragPreviewRef.current && document.body.contains(dragPreviewRef.current)) {
      document.body.removeChild(dragPreviewRef.current);
      dragPreviewRef.current = null;
    }
    
    setDragState({
      draggedIndex: null,
      dragOverIndex: null,
      isDragging: false,
      dragStartPos: null
    });
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (dragState.draggedIndex !== null && dragState.draggedIndex !== index) {
      setDragState(prev => ({ ...prev, dragOverIndex: index }));
    }
  }, [dragState.draggedIndex]);

  const handleDragEnter = useCallback((e, index) => {
    e.preventDefault();
    if (dragState.draggedIndex !== null && dragState.draggedIndex !== index) {
      setDragState(prev => ({ ...prev, dragOverIndex: index }));
    }
  }, [dragState.draggedIndex]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX: x, clientY: y } = e;
    
    if (x < rect.left - 5 || x > rect.right + 5 || y < rect.top - 5 || y > rect.bottom + 5) {
      setDragState(prev => ({ ...prev, dragOverIndex: null }));
    }
  }, []);

  const handleDrop = useCallback((e, dropIndex) => {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const draggedIndex = data.index;
      
      if (draggedIndex !== dropIndex && draggedIndex >= 0 && dropIndex >= 0) {
        reorderSaves(draggedIndex, dropIndex);
      }
    } catch (error) {
      console.warn('Drop data parsing failed:', error);
    }
    
    setDragState(prev => ({ ...prev, dragOverIndex: null }));
  }, [reorderSaves]);

  const moveUp = (index) => {
    if (index > 0) reorderSaves(index, index - 1);
  };

  const moveDown = (index) => {
    if (index < saves.length - 1) reorderSaves(index, index + 1);
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

  const isOwner = board?.user_id === getUserId();

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
          <div className={`transition-all duration-300 ${
            dragState.isDragging ? 'space-y-1' : 'space-y-6'
          }`}>
            {saves.map((save, index) => (
              <div 
                key={save.id} 
                draggable={isOwner}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                className={`relative bg-white rounded-lg shadow-sm border transition-all duration-200 ${
                  dragState.dragOverIndex === index && dragState.draggedIndex !== index 
                    ? 'border-[#0057B7] shadow-lg bg-blue-50 transform scale-[1.01]' 
                    : 'border-gray-200'
                } ${
                  dragState.draggedIndex === index 
                    ? 'opacity-50 transform scale-95 shadow-xl border-[#0057B7] z-50' 
                    : ''
                } ${
                  isOwner ? 'hover:shadow-md hover:border-gray-300' : ''
                } ${
                  dragState.isDragging && dragState.draggedIndex !== index 
                    ? 'transform scale-98 shadow-sm' 
                    : ''
                }`}
              >
                {/* Drop Zone Indicator */}
                {dragState.dragOverIndex === index && dragState.draggedIndex !== index && (
                  <div className="absolute -top-1 left-0 right-0 h-1 bg-[#0057B7] rounded-full animate-pulse z-10" />
                )}
                
                {/* Conditional Rendering: Full View or Strip View */}
                {dragState.isDragging ? (
                  /* Vertical Strip View (During Drag) */
                  <div className="p-2 border-l-4 border-l-[#0057B7]">
                    <div className="flex items-center gap-2">
                      {isOwner && dragState.draggedIndex === index && (
                        <div className="p-1 rounded bg-[#0057B7] cursor-grabbing">
                          <GripVertical className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="w-6 h-6 bg-gradient-to-br from-[#0057B7] to-blue-600 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium truncate text-sm transition-colors ${
                          dragState.draggedIndex === index ? 'text-[#0057B7]' : 'text-gray-900'
                        }`}>
                          {save.post_title}
                        </h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs text-gray-500 truncate">
                            {save.post_category || 'General'}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 truncate">
                            {save.post_author || 'Anonymous'}
                          </span>
                        </div>
                      </div>
                      {dragState.draggedIndex === index && (
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-[#0057B7] rounded-full animate-pulse"></div>
                          <span className="text-xs text-[#0057B7] font-medium">
                            Moving
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Normal Full View */
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {isOwner && (
                          <div className="flex flex-col gap-1 group">
                            <div 
                              className="relative p-1 rounded-md bg-[#0057B7] hover:bg-blue-700 cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-110 hover:shadow-lg"
                              title="Drag to reorder posts"
                            >
                              <GripVertical className="w-4 h-4 text-white" />
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                                Drag to reorder
                              </div>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <button
                                onClick={() => moveUp(index)}
                                disabled={index === 0}
                                className="p-1 text-[#0057B7] hover:text-white hover:bg-[#0057B7] disabled:opacity-30 disabled:cursor-not-allowed rounded transition-all duration-200"
                                title="Move up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => moveDown(index)}
                                disabled={index === saves.length - 1}
                                className="p-1 text-[#0057B7] hover:text-white hover:bg-[#0057B7] disabled:opacity-30 disabled:cursor-not-allowed rounded transition-all duration-200"
                                title="Move down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
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
                              if (window.location.pathname === '/') {
                                const communitySection = document.getElementById('community');
                                if (communitySection) {
                                  communitySection.scrollIntoView({ behavior: 'smooth' });
                                  setTimeout(() => {
                                    const postElement = document.getElementById(`post-${save.post_id}`);
                                    if (postElement) {
                                      postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      postElement.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
                                      setTimeout(() => {
                                        postElement.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
                                      }, 3000);
                                    }
                                  }, 500);
                                }
                              } else {
                                window.location.href = `/#community-post-${save.post_id}`;
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
                          onError={(e) => e.target.style.display = 'none'}
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
                )}
              </div>
            ))}
          </div>
        )}

        {/* Remove Save Confirmation Modal */}
        <ConfirmationModal
          isOpen={!!showRemoveModal}
          onClose={() => setShowRemoveModal(null)}
          onConfirm={confirmRemoveSave}
          title="Remove Save"
          message="Are you sure you want to remove this save from the board?"
          confirmText="Remove Save"
          cancelText="Cancel"
          type="warning"
          itemName={showRemoveModal?.post_title}
          itemDescription={`By ${showRemoveModal?.post_author || 'Anonymous'} • ${showRemoveModal?.post_category || 'General'}`}
        />
      </div>
    </div>
  );
};

export default BoardDetailPage;