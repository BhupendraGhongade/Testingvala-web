import React from 'react';

export const DropIndicator = ({ position, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div 
      className={`absolute z-50 pointer-events-none transition-all duration-200 ${
        position === 'before' ? '-top-2' : '-bottom-2'
      } left-0 right-0`}
    >
      <div className="h-1 bg-green-500 rounded-full shadow-lg animate-pulse">
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full shadow-lg"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full shadow-lg"></div>
      </div>
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded font-medium">
        Drop here
      </div>
    </div>
  );
};

export default DropIndicator;