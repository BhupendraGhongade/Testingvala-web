import { useState, useCallback } from 'react';

export const useAdvancedDragAndDrop = ({
  items = [],
  onReorder,
  disabled = false
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = useCallback((e, index) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    
    console.log('Drag start:', index);
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  }, [disabled]);

  const handleDragEnd = useCallback(() => {
    console.log('Drag end');
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    if (disabled || draggedIndex === null || draggedIndex === index) return;
    
    setDragOverIndex(index);
  }, [disabled, draggedIndex]);

  const handleDragEnter = useCallback((e, index) => {
    e.preventDefault();
    if (disabled || draggedIndex === null || draggedIndex === index) return;
    
    setDragOverIndex(index);
  }, [disabled, draggedIndex]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    // Only clear if really leaving the element
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null);
    }
  }, []);

  const handleDrop = useCallback((e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled || draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }
    
    console.log('Drop:', draggedIndex, '->', dropIndex);
    
    if (onReorder) {
      onReorder(draggedIndex, dropIndex);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [disabled, draggedIndex, onReorder]);

  const getDragProps = useCallback((index) => ({
    draggable: !disabled,
    onDragStart: (e) => handleDragStart(e, index),
    onDragEnd: handleDragEnd,
    onDragOver: (e) => handleDragOver(e, index),
    onDragEnter: (e) => handleDragEnter(e, index),
    onDragLeave: handleDragLeave,
    onDrop: (e) => handleDrop(e, index)
  }), [handleDragStart, handleDragEnd, handleDragOver, handleDragEnter, handleDragLeave, handleDrop]);

  const getItemClasses = useCallback((index) => {
    // NO VISUAL CHANGES - keep all items visible
    return '';
  }, []);

  return {
    dragState: { 
      draggedIndex, 
      dragOverIndex, 
      isDragging: draggedIndex !== null 
    },
    getDragProps,
    getItemClasses,
    getDropZoneProps: () => ({}),
    isDragging: draggedIndex !== null,
    isTouchDragging: false,
    keyboardMode: false
  };
};