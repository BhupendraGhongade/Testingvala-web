import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Advanced drag-and-drop hook for reordering items
 * Provides smooth animations, visual feedback, and robust error handling
 */
export const useDragAndDrop = ({
  items = [],
  onReorder,
  onReorderStart,
  onReorderEnd,
  disabled = false,
  dragHandleSelector = null,
  dropZoneClass = 'drop-zone',
  dragPreviewClass = 'drag-preview',
  animationDuration = 200
}) => {
  const [dragState, setDragState] = useState({
    draggedIndex: null,
    dragOverIndex: null,
    isDragging: false,
    dragStartPos: null,
    dragOffset: { x: 0, y: 0 },
    isAnimating: false
  });

  const dragTimeoutRef = useRef(null);
  const dragPreviewRef = useRef(null);
  const animationTimeoutRef = useRef(null);
  const dragElementRef = useRef(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    if (dragPreviewRef.current && document.body.contains(dragPreviewRef.current)) {
      document.body.removeChild(dragPreviewRef.current);
      dragPreviewRef.current = null;
    }
  }, []);

  // Create drag preview element
  const createDragPreview = useCallback((item, index, event) => {
    const preview = document.createElement('div');
    preview.className = `fixed pointer-events-none z-[9999] ${dragPreviewClass}`;
    preview.style.cssText = `
      background: white;
      border: 2px solid #0057B7;
      border-radius: 12px;
      padding: 12px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      max-width: 300px;
      transform: rotate(2deg);
      opacity: 0.95;
      transition: all 0.2s ease;
    `;
    
    const container = document.createElement('div');
    container.style.cssText = 'display: flex; align-items: center; gap: 8px;';
    
    const badge = document.createElement('div');
    badge.style.cssText = 'width: 24px; height: 24px; background: linear-gradient(135deg, #0057B7, #0066CC); border-radius: 6px; display: flex; align-items: center; justify-content: center;';
    const badgeText = document.createElement('span');
    badgeText.style.cssText = 'color: white; font-size: 12px; font-weight: bold;';
    badgeText.textContent = String(index + 1);
    badge.appendChild(badgeText);
    
    const content = document.createElement('div');
    content.style.cssText = 'flex: 1; min-width: 0;';
    const title = document.createElement('h4');
    title.style.cssText = 'font-weight: 600; color: #111827; margin: 0; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
    title.textContent = item.name || item.title || 'Item';
    const status = document.createElement('p');
    status.style.cssText = 'color: #0057B7; font-size: 12px; font-weight: 500; margin: 0;';
    status.textContent = 'Moving...';
    
    content.appendChild(title);
    content.appendChild(status);
    container.appendChild(badge);
    container.appendChild(content);
    preview.appendChild(container);
    
    document.body.appendChild(preview);
    preview.style.left = '-9999px';
    preview.style.top = '-9999px';
    
    return preview;
  }, [dragPreviewClass]);

  // Handle drag start
  const handleDragStart = useCallback((event, index) => {
    if (disabled) {
      event.preventDefault();
      return;
    }

    const item = items[index];
    if (!item) return;

    // Check if drag handle is specified and event target matches
    if (dragHandleSelector && !event.target.closest(dragHandleSelector)) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', JSON.stringify({ 
      index, 
      id: item.id,
      type: 'reorder'
    }));

    // Create custom drag preview
    const preview = createDragPreview(item, index, event);
    event.dataTransfer.setDragImage(preview, 100, 30);
    dragPreviewRef.current = preview;

    // Set drag state
    const rect = event.currentTarget.getBoundingClientRect();
    setDragState({
      draggedIndex: index,
      dragOverIndex: null,
      isDragging: true,
      dragStartPos: { x: event.clientX, y: event.clientY },
      dragOffset: { 
        x: event.clientX - rect.left, 
        y: event.clientY - rect.top 
      },
      isAnimating: false
    });

    // Store reference to dragged element
    dragElementRef.current = event.currentTarget;

    // Call onReorderStart callback
    if (onReorderStart) {
      onReorderStart(index, item);
    }

    // Cleanup preview after a short delay
    dragTimeoutRef.current = setTimeout(() => {
      if (dragPreviewRef.current && document.body.contains(dragPreviewRef.current)) {
        document.body.removeChild(dragPreviewRef.current);
        dragPreviewRef.current = null;
      }
    }, 50);

  }, [disabled, items, dragHandleSelector, createDragPreview, onReorderStart]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    cleanup();
    
    setDragState(prev => ({
      ...prev,
      draggedIndex: null,
      dragOverIndex: null,
      isDragging: false,
      dragStartPos: null,
      dragOffset: { x: 0, y: 0 },
      isAnimating: true
    }));

    // Call onReorderEnd callback
    if (onReorderEnd) {
      onReorderEnd();
    }

    // Reset animation state after animation duration
    animationTimeoutRef.current = setTimeout(() => {
      setDragState(prev => ({ ...prev, isAnimating: false }));
    }, animationDuration);

  }, [cleanup, onReorderEnd, animationDuration]);

  // Handle drag over
  const handleDragOver = useCallback((event, index) => {
    if (disabled) return;
    
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    if (dragState.draggedIndex !== null && dragState.draggedIndex !== index) {
      setDragState(prev => ({ ...prev, dragOverIndex: index }));
    }
  }, [disabled, dragState.draggedIndex]);

  // Handle drag enter
  const handleDragEnter = useCallback((event, index) => {
    if (disabled) return;
    
    event.preventDefault();
    if (dragState.draggedIndex !== null && dragState.draggedIndex !== index) {
      setDragState(prev => ({ ...prev, dragOverIndex: index }));
    }
  }, [disabled, dragState.draggedIndex]);

  // Handle drag leave
  const handleDragLeave = useCallback((event) => {
    if (disabled) return;
    
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const { clientX: x, clientY: y } = event;
    
    // Only clear dragOverIndex if mouse is truly outside the element
    if (x < rect.left - 10 || x > rect.right + 10 || y < rect.top - 10 || y > rect.bottom + 10) {
      setDragState(prev => ({ ...prev, dragOverIndex: null }));
    }
  }, [disabled]);

  // Handle drop
  const handleDrop = useCallback((event, dropIndex) => {
    if (disabled) return;
    
    event.preventDefault();
    
    try {
      const rawData = event.dataTransfer.getData('text/plain');
      if (!rawData || typeof rawData !== 'string') {
        console.warn('Invalid drop data');
        return;
      }
      
      const data = JSON.parse(rawData);
      
      if (!data || typeof data !== 'object' || data.type !== 'reorder') {
        console.warn('Invalid drop data type');
        return;
      }

      const draggedIndex = parseInt(data.index, 10);
      if (isNaN(draggedIndex)) {
        console.warn('Invalid drag index');
        return;
      }
      
      if (draggedIndex !== dropIndex && 
          draggedIndex >= 0 && 
          dropIndex >= 0 && 
          draggedIndex < items.length && 
          dropIndex < items.length) {
        
        // Call onReorder callback
        if (onReorder) {
          onReorder(draggedIndex, dropIndex);
        }
      }
    } catch (error) {
      console.warn('Drop data parsing failed:', error);
    }
    
    setDragState(prev => ({ ...prev, dragOverIndex: null }));
  }, [disabled, items.length, onReorder]);

  // Get drag props for an item
  const getDragProps = useCallback((index) => ({
    draggable: !disabled,
    onDragStart: (e) => handleDragStart(e, index),
    onDragEnd: handleDragEnd,
    onDragOver: (e) => handleDragOver(e, index),
    onDragEnter: (e) => handleDragEnter(e, index),
    onDragLeave: handleDragLeave,
    onDrop: (e) => handleDrop(e, index)
  }), [disabled, handleDragStart, handleDragEnd, handleDragOver, handleDragEnter, handleDragLeave, handleDrop]);

  // Get item classes for styling
  const getItemClasses = useCallback((index) => {
    const baseClasses = 'transition-all duration-200';
    const dragClasses = [];
    
    if (dragState.isDragging) {
      if (dragState.draggedIndex === index) {
        dragClasses.push('opacity-50 transform scale-95 shadow-xl border-[#0057B7] z-50');
      } else if (dragState.dragOverIndex === index) {
        dragClasses.push('border-[#0057B7] shadow-lg bg-blue-50 transform scale-[1.02]');
      } else {
        dragClasses.push('transform scale-98 shadow-sm');
      }
    }
    
    return `${baseClasses} ${dragClasses.join(' ')}`;
  }, [dragState]);

  // Get drop zone indicator props
  const getDropZoneProps = useCallback((index) => {
    if (dragState.dragOverIndex === index && dragState.draggedIndex !== index) {
      return {
        className: `absolute -top-1 left-0 right-0 h-1 bg-[#0057B7] rounded-full animate-pulse z-10`,
        style: { animationDuration: '1s' }
      };
    }
    return null;
  }, [dragState]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    dragState,
    getDragProps,
    getItemClasses,
    getDropZoneProps,
    isDragging: dragState.isDragging,
    draggedIndex: dragState.draggedIndex,
    dragOverIndex: dragState.dragOverIndex
  };
};
