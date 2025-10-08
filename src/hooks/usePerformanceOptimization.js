/**
 * React Performance Optimization Hooks
 * Prevents unnecessary re-renders and optimizes component performance
 */
import { useCallback, useMemo, memo } from 'react';

/**
 * Memoized event handlers to prevent re-renders
 */
export const useStableHandlers = (handlers, deps = []) => {
  return useMemo(() => {
    const stableHandlers = {};
    
    Object.entries(handlers).forEach(([key, handler]) => {
      stableHandlers[key] = useCallback(handler, deps);
    });
    
    return stableHandlers;
  }, deps);
};

/**
 * Optimized click handler
 */
export const useOptimizedClick = (callback, deps = []) => {
  return useCallback((event) => {
    event.preventDefault();
    callback?.(event);
  }, deps);
};

/**
 * Optimized form handlers
 */
export const useFormHandlers = (formData, setFormData, deps = []) => {
  const handleChange = useCallback((field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [setFormData, ...deps]);

  const handleSubmit = useCallback((onSubmit) => (event) => {
    event.preventDefault();
    onSubmit?.(formData);
  }, [formData, ...deps]);

  return { handleChange, handleSubmit };
};

/**
 * Higher-order component for memoization
 */
export const withMemo = (Component, areEqual) => {
  return memo(Component, areEqual);
};