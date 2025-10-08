/**
 * Optimized Callbacks Hook
 * Prevents unnecessary re-renders by memoizing event handlers
 */
import { useCallback, useMemo } from 'react';

export const useOptimizedCallbacks = (dependencies = []) => {
  // Memoized event handlers
  const handlers = useMemo(() => ({
    // Generic click handler
    onClick: useCallback((callback) => (event) => {
      event.preventDefault();
      callback?.(event);
    }, dependencies),

    // Generic change handler
    onChange: useCallback((callback) => (event) => {
      callback?.(event.target.value, event);
    }, dependencies),

    // Generic submit handler
    onSubmit: useCallback((callback) => (event) => {
      event.preventDefault();
      callback?.(event);
    }, dependencies),

    // Generic toggle handler
    onToggle: useCallback((callback) => (value) => {
      callback?.(!value);
    }, dependencies)
  }), dependencies);

  return handlers;
};