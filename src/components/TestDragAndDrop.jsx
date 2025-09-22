/**
 * Quick test to verify the drag-and-drop hook works without errors
 * This is a minimal test to ensure the hook initializes properly
 */

import React from 'react';
import { useAdvancedDragAndDrop } from '../src/hooks/useAdvancedDragAndDrop';

const TestDragAndDrop = () => {
  const mockItems = [
    { id: '1', name: 'Test Board 1' },
    { id: '2', name: 'Test Board 2' }
  ];

  const mockOnReorder = (fromIndex, toIndex) => {
    console.log('Reorder:', fromIndex, 'to', toIndex);
  };

  try {
    const {
      dragState,
      getDragProps,
      getItemClasses,
      getDropZoneProps,
      isDragging
    } = useAdvancedDragAndDrop({
      items: mockItems,
      onReorder: mockOnReorder,
      disabled: false,
      enableTouch: true,
      enableKeyboard: true
    });

    // Test that getDragProps works without errors
    const dragProps = getDragProps(0);
    const itemClasses = getItemClasses(0);
    const dropZoneProps = getDropZoneProps(0);

    console.log('✅ Hook initialized successfully');
    console.log('✅ getDragProps works:', !!dragProps);
    console.log('✅ getItemClasses works:', !!itemClasses);
    console.log('✅ dropZoneProps works:', dropZoneProps);

    return (
      <div>
        <h2>Drag and Drop Test</h2>
        <p>Status: ✅ Working</p>
        <div>
          {mockItems.map((item, index) => (
            <div
              key={item.id}
              {...dragProps}
              className={itemClasses}
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ Hook failed to initialize:', error);
    return (
      <div>
        <h2>Drag and Drop Test</h2>
        <p>Status: ❌ Error</p>
        <p>Error: {error.message}</p>
      </div>
    );
  }
};

export default TestDragAndDrop;

