import React from 'react';
import { MessageSquare, AlertTriangle } from 'lucide-react';

const ForumModeration = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
        <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Forum Management Removed</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 justify-center">
            <AlertTriangle className="w-6 h-6 text-blue-600" />
            <p className="text-blue-800 font-medium">
              Forum management has been simplified and moved to the main website
            </p>
          </div>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          The forum functionality has been streamlined. Users can now manage their own posts directly on the main website without complex approval workflows.
        </p>
      </div>
    </div>
  );
};

export default ForumModeration;