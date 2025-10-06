import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { GlobalDataProvider } from './contexts/GlobalDataContext';
import Header from './components/Header';

function AppContent() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', paddingTop: '100px' }}>
        <h1>TestingVala - Step by Step Debug</h1>
        <p>✅ Basic React component working</p>
        <p>✅ App.jsx loading successfully</p>
        <p>✅ Contexts loading successfully</p>
        <p>✅ Header component loading successfully</p>
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
          <strong>Next:</strong> Will add main components
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <GlobalDataProvider>
        <AppContent />
      </GlobalDataProvider>
    </AuthProvider>
  );
}

export default App;