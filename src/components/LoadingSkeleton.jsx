import React from 'react';

const PostSkeleton = () => (
  <div className="p-6 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="h-8 bg-gray-200 rounded-xl w-20"></div>
          <div className="h-8 bg-gray-200 rounded-xl w-24"></div>
          <div className="h-8 bg-gray-200 rounded-xl w-16"></div>
        </div>
      </div>
    </div>
  </div>
);

const LoadingSkeleton = ({ count = 3 }) => (
  <div className="divide-y divide-gray-100">
    {Array.from({ length: count }, (_, i) => (
      <PostSkeleton key={i} />
    ))}
  </div>
);

export default LoadingSkeleton;