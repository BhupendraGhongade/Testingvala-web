import React from 'react';
import { GripVertical, Move } from 'lucide-react';

/**
 * Professional drag handle component inspired by modern design systems
 * Features: Hover effects, accessibility, and smooth animations
 */
export const DragHandle = ({ 
  className = '', 
  size = 'md', 
  variant = 'default',
  disabled = false,
  ...props 
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3 p-1',
    md: 'w-4 h-4 p-1.5',
    lg: 'w-5 h-5 p-2',
    xl: 'w-6 h-6 p-2.5'
  };

  const variantClasses = {
    default: 'text-gray-400 hover:text-gray-600',
    subtle: 'text-gray-300 hover:text-gray-500',
    prominent: 'text-blue-500 hover:text-blue-700',
    ghost: 'text-transparent hover:text-gray-500'
  };

  const baseClasses = `
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
    transition-all duration-200 ease-out
    rounded-md
    hover:bg-gray-100
    active:bg-gray-200
    focus:outline-none
    focus:ring-2
    focus:ring-blue-500
    focus:ring-offset-1
    group
  `;

  return (
    <div
      className={`${baseClasses} ${className}`}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Drag to reorder"
      aria-disabled={disabled}
      {...props}
    >
      <GripVertical className="w-full h-full" />
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-10 rounded-md transition-opacity duration-200" />
      
      {/* Focus ring */}
      <div className="absolute inset-0 ring-2 ring-blue-500 ring-offset-1 rounded-md opacity-0 focus-within:opacity-100 transition-opacity duration-200" />
    </div>
  );
};

/**
 * Animated drag handle with pulsing effect
 */
export const AnimatedDragHandle = ({ isActive = false, ...props }) => {
  return (
    <div className={`relative ${isActive ? 'animate-pulse' : ''}`}>
      <DragHandle {...props} />
      {isActive && (
        <div className="absolute inset-0 bg-blue-500 opacity-20 rounded-md animate-ping" />
      )}
    </div>
  );
};

/**
 * Touch-friendly drag handle for mobile devices
 */
export const TouchDragHandle = ({ ...props }) => {
  return (
    <div className="touch-manipulation">
      <DragHandle 
        size="lg" 
        variant="prominent"
        className="min-w-[44px] min-h-[44px] flex items-center justify-center"
        {...props} 
      />
    </div>
  );
};

export default DragHandle;

