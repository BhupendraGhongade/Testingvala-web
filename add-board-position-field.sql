-- Add position field to user_boards table for drag-and-drop reordering
-- Run this script in your Supabase SQL editor

-- Add position column to user_boards table
ALTER TABLE user_boards ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Create index for better performance when ordering by position
CREATE INDEX IF NOT EXISTS idx_user_boards_position ON user_boards(user_id, position);

-- Update existing boards to have proper position values
-- This will assign positions based on creation order
WITH ranked_boards AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) - 1 as new_position
  FROM user_boards
  WHERE position = 0 OR position IS NULL
)
UPDATE user_boards 
SET position = ranked_boards.new_position
FROM ranked_boards
WHERE user_boards.id = ranked_boards.id;

-- Create function to reorder boards
CREATE OR REPLACE FUNCTION reorder_user_boards(
  p_user_id UUID,
  p_board_positions JSONB
) RETURNS BOOLEAN AS $$
DECLARE
  board_item JSONB;
  board_id UUID;
  new_position INTEGER;
BEGIN
  -- Validate input
  IF p_user_id IS NULL OR p_board_positions IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Update positions for each board
  FOR board_item IN SELECT * FROM jsonb_array_elements(p_board_positions)
  LOOP
    board_id := (board_item->>'id')::UUID;
    new_position := (board_item->>'position')::INTEGER;
    
    -- Only update if the board belongs to the user
    UPDATE user_boards 
    SET position = new_position, updated_at = NOW()
    WHERE id = board_id AND user_id = p_user_id;
  END LOOP;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reorder_user_boards(UUID, JSONB) TO authenticated;

-- Create function to get next position for new boards
CREATE OR REPLACE FUNCTION get_next_board_position(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  max_position INTEGER;
BEGIN
  SELECT COALESCE(MAX(position), -1) + 1
  INTO max_position
  FROM user_boards
  WHERE user_id = p_user_id;
  
  RETURN max_position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_next_board_position(UUID) TO authenticated;

-- Update the trigger to set position for new boards
CREATE OR REPLACE FUNCTION set_board_position()
RETURNS TRIGGER AS $$
BEGIN
  -- Set position for new boards
  IF NEW.position IS NULL OR NEW.position = 0 THEN
    NEW.position := get_next_board_position(NEW.user_id);
  END IF;
  
  -- Update timestamp
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for setting board position
DROP TRIGGER IF EXISTS set_board_position_trigger ON user_boards;
CREATE TRIGGER set_board_position_trigger
  BEFORE INSERT OR UPDATE ON user_boards
  FOR EACH ROW
  EXECUTE FUNCTION set_board_position();

-- Success message
SELECT 'Board position field and reordering functions added successfully!' as message;
