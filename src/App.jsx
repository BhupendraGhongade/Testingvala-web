import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Hero from './components/Hero';
import ContestSection from './components/ContestSection';
import Winners from './components/Winners';
import AboutUs from './components/AboutUs';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import { useWebsiteData } from './hooks/useWebsiteData';
import { Settings, Wifi, WifiOff } from 'lucide-react';

function App() {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { data, loading, error, isOnline } = useWebsiteData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading TestingVala...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* Status Bar */}
      {!isOnline && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-yellow-800 text-sm">
            <WifiOff className="w-4 h-4" />
            <span>Offline Mode - Using local data. Set up Supabase backend for full functionality.</span>
          </div>
        </div>
      )}
      
      <Header />
      
      <main>
        <Hero data={data.hero} />
        <ContestSection data={data.contest} />
        <Winners data={data} />
        <AboutUs data={data.about} />
        <Contact data={data.contact} />
      </main>
      
      <Footer />
      
      {/* Admin Panel Toggle Button */}
      <button
        onClick={() => setShowAdminPanel(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40"
        title="Admin Panel"
      >
        <Settings className="w-6 h-6" />
      </button>
      
      <AdminPanel 
        isOpen={showAdminPanel} 
        onClose={() => setShowAdminPanel(false)} 
      />
    </div>
  );
}

export default App;
