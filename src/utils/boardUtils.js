import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

/**
 * Utility functions for board management and reordering
 */

/**
 * Reorder boards in the database
 * @param {string} userId - The user ID
 * @param {Array} boards - Array of boards with updated positions
 * @returns {Promise<boolean>} - Success status
 */
export const reorderBoardsInDatabase = async (userId, boards) => {
  try {
    // Prepare position data for the database function
    const positionData = boards.map((board, index) => ({
      id: board.id,
      position: index
    }));

    const { data, error } = await supabase.rpc('reorder_user_boards', {
      p_user_id: userId,
      p_board_positions: positionData
    });

    if (error) {
      console.error('Error reordering boards:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to reorder boards:', error);
    throw error;
  }
};

/**
 * Get the next position for a new board
 * @param {string} userId - The user ID
 * @returns {Promise<number>} - Next position
 */
export const getNextBoardPosition = async (userId) => {
  try {
    const { data, error } = await supabase.rpc('get_next_board_position', {
      p_user_id: userId
    });

    if (error) {
      console.error('Error getting next position:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('Failed to get next position:', error);
    return 0;
  }
};

/**
 * Load boards with proper ordering (with fallback for missing position column)
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - Array of boards with save counts
 */
export const loadBoardsWithOrdering = async (userId) => {
  try {
    // First try with position column
    const { data: boardsData, error: boardsError } = await supabase
      .from('user_boards')
      .select('*')
      .eq('user_id', userId)
      .order('position', { ascending: true })
      .order('created_at', { ascending: false });

    if (boardsError) {
      // If position column doesn't exist, fall back to created_at ordering
      if (boardsError.message?.includes('position') || boardsError.code === '42703') {
        console.log('Position column not found, falling back to created_at ordering');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('user_boards')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (fallbackError) {
          if (fallbackError.code === 'PGRST116' || fallbackError.message?.includes('relation "user_boards" does not exist')) {
            throw new Error('Boards feature not set up. Please run the database setup script.');
          }
          throw fallbackError;
        }

        // Load save counts for fallback data
        const boardsWithSaves = await Promise.all(
          (fallbackData || []).map(async (board) => {
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

        return boardsWithSaves;
      }
      
      if (boardsError.code === 'PGRST116' || boardsError.message?.includes('relation "user_boards" does not exist')) {
        throw new Error('Boards feature not set up. Please run the database setup script.');
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

    return boardsWithSaves;
  } catch (error) {
    console.error('Error loading boards:', error);
    throw error;
  }
};

/**
 * Create a new board with proper positioning (with fallback for missing position column)
 * @param {string} userId - The user ID
 * @param {Object} boardData - Board data
 * @returns {Promise<Object>} - Created board
 */
export const createBoardWithPosition = async (userId, boardData) => {
  try {
    // Try to get next position first
    let position = 0;
    try {
      position = await getNextBoardPosition(userId);
    } catch (error) {
      console.log('Position function not available, using default position 0');
      position = 0;
    }

    const { data, error } = await supabase
      .from('user_boards')
      .insert({
        user_id: userId,
        name: boardData.name,
        description: boardData.description,
        is_private: boardData.is_private,
        cover_image_url: boardData.cover_image_url,
        position: position
      })
      .select()
      .single();

    if (error) throw error;

    return { ...data, save_count: 0 };
  } catch (error) {
    console.error('Error creating board:', error);
    throw error;
  }
};

/**
 * Optimistic reordering with rollback capability (with fallback for missing position column)
 * @param {Array} boards - Current boards array
 * @param {number} fromIndex - Source index
 * @param {number} toIndex - Destination index
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Updated boards array
 */
export const optimisticReorderBoards = async (boards, fromIndex, toIndex, userId) => {
  // Create optimistic update
  const newBoards = [...boards];
  const [movedItem] = newBoards.splice(fromIndex, 1);
  newBoards.splice(toIndex, 0, movedItem);

  try {
    // Try to update database with position column
    try {
      await reorderBoardsInDatabase(userId, newBoards);
    } catch (error) {
      // If position column doesn't exist, just show success message
      if (error.message?.includes('position') || error.code === '42703') {
        console.log('Position column not available, skipping database update');
        toast.success('Board order updated locally! (Run database migration for persistence)', {
          duration: 3000,
          position: 'top-right'
        });
        return newBoards;
      }
      throw error;
    }
    
    // Show success message
    toast.success('Board order updated!', {
      duration: 2000,
      position: 'top-right'
    });

    return newBoards;
  } catch (error) {
    // Rollback on error
    toast.error('Failed to update board order', {
      duration: 3000,
      position: 'top-right'
    });
    
    console.error('Reorder failed, rolling back:', error);
    throw error;
  }
};

/**
 * Validate board data before operations
 * @param {Object} boardData - Board data to validate
 * @returns {Object} - Validation result
 */
export const validateBoardData = (boardData) => {
  const errors = [];
  
  if (!boardData.name || boardData.name.trim().length === 0) {
    errors.push('Board name is required');
  }
  
  if (boardData.name && boardData.name.length > 50) {
    errors.push('Board name must be 50 characters or less');
  }
  
  if (boardData.description && boardData.description.length > 200) {
    errors.push('Description must be 200 characters or less');
  }
  
  if (boardData.cover_image_url) {
    try {
      const url = new URL(boardData.cover_image_url);
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.push('Please enter a valid image URL');
      }
    } catch {
      errors.push('Please enter a valid image URL');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize text input
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
export const sanitizeText = (text) => {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '').trim();
};
