import React from 'react';
import { Bug, TestTube } from 'lucide-react';

const Logo = ({ size = 'default', className = '' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg`}>
        <div className="relative">
          <TestTube className="w-5 h-5" />
          <Bug className="w-2 h-2 absolute -top-1 -right-1 text-yellow-300" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-lg leading-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          TestingVala
        </span>
        <span className="text-xs text-gray-500 leading-tight">QA Excellence</span>
      </div>
    </div>
  );
};

export default Logo;
