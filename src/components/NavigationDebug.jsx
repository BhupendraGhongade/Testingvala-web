import React, { useState, useEffect } from 'react';

const NavigationDebug = () => {
  const [events, setEvents] = useState([]);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleNavigation = (event) => {
      const { path, sectionId } = event.detail;
      setCurrentPath(path);
      setEvents(prev => [...prev.slice(-4), {
        type: 'navigate',
        path,
        sectionId,
        timestamp: new Date().toLocaleTimeString()
      }]);
    };

    const handlePopState = () => {
      const newPath = window.location.pathname;
      setCurrentPath(newPath);
      setEvents(prev => [...prev.slice(-4), {
        type: 'popstate',
        path: newPath,
        timestamp: new Date().toLocaleTimeString()
      }]);
    };

    window.addEventListener('navigate', handleNavigation);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('navigate', handleNavigation);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-3 shadow-lg z-[9000] max-w-xs text-xs">
      <div className="font-bold mb-2">Navigation Debug</div>
      <div className="space-y-1">
        <div><strong>Current:</strong> {currentPath}</div>
        <div><strong>URL:</strong> {window.location.pathname}</div>
        <div className="border-t pt-1 mt-1">
          <strong>Events:</strong>
          {events.map((event, index) => (
            <div key={index} className="text-xs text-gray-600">
              {event.timestamp}: {event.type} → {event.path} {event.sectionId && `#${event.sectionId}`}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavigationDebug;