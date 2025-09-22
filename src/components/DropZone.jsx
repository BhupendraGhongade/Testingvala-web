import React from 'react';

/**
 * Professional drop zone component with smooth animations
 * Features: Visual feedback, accessibility, and modern design
 */
export const DropZone = ({ 
  isActive = false, 
  direction = 'down',
  className = '',
  children,
  ...props 
}) => {
  const directionClasses = {
    up: 'border-t-2 border-t-blue-500',
    down: 'border-b-2 border-b-blue-500',
    left: 'border-l-2 border-l-blue-500',
    right: 'border-r-2 border-r-blue-500'
  };

  const baseClasses = `
    relative
    transition-all duration-300 ease-out
    ${isActive ? 'bg-blue-50 scale-[1.02] shadow-lg' : ''}
    ${isActive ? directionClasses[direction] : ''}
  `;

  return (
    <div className={`${baseClasses} ${className}`} {...props}>
      {children}
      
      {/* Drop indicator */}
      {isActive && (
        <div className={`
          absolute z-10 bg-blue-500 rounded-full animate-pulse
          ${direction === 'up' ? '-top-1 left-0 right-0 h-1' : ''}
          ${direction === 'down' ? '-bottom-1 left-0 right-0 h-1' : ''}
          ${direction === 'left' ? '-left-1 top-0 bottom-0 w-1' : ''}
          ${direction === 'right' ? '-right-1 top-0 bottom-0 w-1' : ''}
        `} 
        style={{
          boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
          animationDuration: '1s'
        }} />
      )}
      
      {/* Glow effect */}
      {isActive && (
        <div className="absolute inset-0 bg-blue-500 opacity-5 rounded-lg animate-pulse" />
      )}
    </div>
  );
};

/**
 * Animated drop zone with advanced visual feedback
 */
export const AnimatedDropZone = ({ 
  isActive = false, 
  direction = 'down',
  intensity = 'medium',
  className = '',
  children,
  ...props 
}) => {
  const intensityClasses = {
    low: 'opacity-30',
    medium: 'opacity-50',
    high: 'opacity-70'
  };

  const baseClasses = `
    relative
    transition-all duration-300 ease-out
    ${isActive ? `bg-blue-50 scale-[1.02] shadow-xl ${intensityClasses[intensity]}` : ''}
  `;

  return (
    <div className={`${baseClasses} ${className}`} {...props}>
      {children}
      
      {/* Multiple drop indicators for enhanced effect */}
      {isActive && (
        <>
          <div className={`
            absolute z-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full
            ${direction === 'up' ? '-top-1 left-0 right-0 h-1' : ''}
            ${direction === 'down' ? '-bottom-1 left-0 right-0 h-1' : ''}
            ${direction === 'left' ? '-left-1 top-0 bottom-0 w-1' : ''}
            ${direction === 'right' ? '-right-1 top-0 bottom-0 w-1' : ''}
          `} 
          style={{
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.6)',
            animation: 'pulse 1s infinite'
          }} />
          
          <div className={`
            absolute z-10 bg-blue-400 rounded-full opacity-60
            ${direction === 'up' ? '-top-0.5 left-2 right-2 h-0.5' : ''}
            ${direction === 'down' ? '-bottom-0.5 left-2 right-2 h-0.5' : ''}
            ${direction === 'left' ? '-left-0.5 top-2 bottom-2 w-0.5' : ''}
            ${direction === 'right' ? '-right-0.5 top-2 bottom-2 w-0.5' : ''}
          `} 
          style={{
            animation: 'pulse 1.5s infinite'
          }} />
        </>
      )}
      
      {/* Ripple effect */}
      {isActive && (
        <div className="absolute inset-0 bg-blue-500 opacity-10 rounded-lg animate-ping" />
      )}
    </div>
  );
};

/**
 * Touch-friendly drop zone for mobile devices
 */
export const TouchDropZone = ({ 
  isActive = false, 
  className = '',
  children,
  ...props 
}) => {
  const baseClasses = `
    relative
    transition-all duration-300 ease-out
    ${isActive ? 'bg-blue-100 scale-[1.05] shadow-2xl border-2 border-blue-500' : ''}
    touch-manipulation
  `;

  return (
    <div className={`${baseClasses} ${className}`} {...props}>
      {children}
      
      {/* Mobile-optimized drop indicator */}
      {isActive && (
        <div className="absolute inset-0 border-4 border-blue-500 border-dashed rounded-lg animate-pulse opacity-60" />
      )}
    </div>
  );
};

export default DropZone;

