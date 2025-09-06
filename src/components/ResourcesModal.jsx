import React from 'react';

const ResourcesModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Explore Resources</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>

        <p className="text-sm text-gray-600 mb-4">Choose a curated starting point:</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a href="/resources/beginner" className="p-4 border rounded-lg hover:shadow-md">Beginner Track<br /><span className="text-xs text-gray-500">Start here if you're new</span></a>
          <a href="/resources/automation" className="p-4 border rounded-lg hover:shadow-md">Automation Track<br /><span className="text-xs text-gray-500">Tools & frameworks</span></a>
          <a href="/resources/performance" className="p-4 border rounded-lg hover:shadow-md">Performance Track<br /><span className="text-xs text-gray-500">Load & scale tests</span></a>
        </div>

        <div className="mt-6 text-right">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ResourcesModal;
