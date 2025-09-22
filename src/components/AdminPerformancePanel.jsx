import React, { useState } from 'react';
import { Activity, Settings } from 'lucide-react';
import PerformanceMonitor from './PerformanceMonitor';

const AdminPerformancePanel = () => {
  const [showMonitor, setShowMonitor] = useState(false);

  return (
    <>
      {/* Floating Performance Button */}
      <button
        onClick={() => setShowMonitor(true)}
        className="fixed bottom-20 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-40"
        title="Performance Monitor"
      >
        <Activity className="w-5 h-5" />
      </button>

      {/* Performance Monitor Modal */}
      <PerformanceMonitor 
        isVisible={showMonitor}
        onClose={() => setShowMonitor(false)}
      />
    </>
  );
};

export default AdminPerformancePanel;