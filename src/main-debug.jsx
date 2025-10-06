import React from 'react'
import { createRoot } from 'react-dom/client'

// Minimal test without CSS
function TestApp() {
  return React.createElement('div', {
    style: { 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }
  }, [
    React.createElement('h1', { key: 'title' }, 'TestingVala Debug'),
    React.createElement('p', { key: 'status' }, '✅ React is working!'),
    React.createElement('div', { 
      key: 'info',
      style: { 
        marginTop: '20px', 
        padding: '10px', 
        backgroundColor: 'white', 
        borderRadius: '5px' 
      }
    }, 'If you see this, the basic React setup is functional.')
  ]);
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(React.createElement(TestApp));
} else {
  console.error('Root element not found!');
}