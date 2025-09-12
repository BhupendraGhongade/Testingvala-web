import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Hero from './components/Hero';
import UpcomingEvents from './components/UpcomingEvents';
import ContestSection from './components/ContestSection';
// Winners displayed under the forum; removed from App top-level to avoid duplication
import CategoryNavigation from './components/CategoryNavigation';
import CommunityHub from './components/CommunityHub';
import AboutUs from './components/AboutUs';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import EventsPage from './components/EventsPage';
import { useWebsiteData } from './hooks/useWebsiteData';
import { Settings, Wifi, WifiOff, AlertCircle } from 'lucide-react';

function App() {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [currentPath, setCurrentPath] = useState(typeof window !== 'undefined' ? window.location.pathname : '/');
  const { data, loading, error, isOnline } = useWebsiteData();

  React.useEffect(() => {
    const handler = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // Default fallback data to prevent crashes
  const defaultData = {
    hero: {
      headline: 'Win Big with Your Testing Expertise',
      subtitle: 'Show off your QA skills in our monthly contest! Share your best testing hacks, automation tricks, and innovative approaches.',
      badge: '🚀 Test Your QA Skills. Win Rewards. Build Your Career',
      stats: {
        participants: '500+',
        prizes: '$2,000+',
        support: '24/7'
      }
    },
    contest: {
      title: 'January 2025 QA Contest',
      theme: 'Testing Hacks & Smart Techniques',
      prizes: '1st Place: $500 | 2nd Place: $300 | 3rd Place: $200',
      submission: 'Share your QA trick with detailed explanation and impact',
      deadline: '2025-01-31',
      status: 'Active Now'
    },
    winners: [
      {
        avatar: '🏆',
        name: 'Sarah Johnson',
        title: 'QA Automation Expert',
        trick: 'Implemented a robust test automation framework that reduced testing time by 60% while maintaining 99% accuracy.'
      },
      {
        avatar: '🥈',
        name: 'Michael Chen',
        title: 'Performance Testing Specialist',
        trick: 'Developed innovative load testing strategies that identified critical bottlenecks before production deployment.'
      },
      {
        avatar: '🥉',
        name: 'Emily Rodriguez',
        title: 'Mobile Testing Guru',
        trick: 'Created comprehensive mobile testing protocols that improved app stability across all device types.'
      }
    ],
    about: {
      description: 'TestingVala.com is revolutionizing the QA industry by creating a platform where testing professionals can showcase their skills, learn from each other, and compete for recognition and rewards.',
      features: [
        'Daily QA tips and best practices',
        'Interview preparation resources',
        'Process improvement techniques',
        'Monthly QA contests with prizes'
      ],
      stats: {
        members: '10,000+',
        tips: '500+',
        contests: '12+',
        countries: '50+'
      }
    },
    contact: {
      email: 'info@testingvala.com',
      website: 'www.testingvala.com',
      location: 'Global QA Community',
      socialMedia: {
        instagram: 'https://www.instagram.com/testingvala',
        youtube: 'https://www.youtube.com/@TestingvalaOfficial',
        twitter: 'https://twitter.com/testingvala',
        linkedin: 'https://www.linkedin.com/company/testingvala'
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF6600] mx-auto mb-4"></div>
          <p className="text-gray-700">Loading TestingVala...</p>
        </div>
      </div>
    );
  }

  // Handle errors gracefully
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[#FF6600] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#E55A00] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Use data or fallback to defaults, ensuring all required properties exist
  const safeData = data || defaultData;
  
  // Ensure all sections have the required structure
  const validatedData = {
    hero: safeData.hero || defaultData.hero,
    contest: safeData.contest || defaultData.contest,
    winners: Array.isArray(safeData.winners) ? safeData.winners : defaultData.winners,
    about: safeData.about || defaultData.about,
    contact: safeData.contact || defaultData.contact
  };

  console.log('App.jsx - Data structure:', { originalData: data, validatedData, isOnline });

  return (
    <div className="min-h-screen bg-white">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0057B7',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#FF6600',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* Status Bar */}
      {!isOnline && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-orange-800 text-sm">
            <WifiOff className="w-4 h-4" />
            <span>Offline Mode - Using local data. Set up Supabase backend for full functionality.</span>
          </div>
        </div>
      )}
      
      <Header />
      
      <main>
        {currentPath === '/events' ? (
          <EventsPage />
        ) : (
          <>
            {/* 1. Hero Section - First impression and main value proposition */}
            <Hero data={validatedData.hero} />

            {/* 2. Upcoming Events - Professional development opportunities */}
            <UpcomingEvents key={`events-${Date.now()}`} />

            {/* 3. Community Hub - Forum / Interactive discussions (showing as 3rd priority) */}
            <CommunityHub />

            {/* 4. Contest Section - Most engaging, immediate action */}
            <ContestSection data={validatedData.contest} />

            {/* 5. Winners - Social proof and motivation (rendered below forum to avoid duplication) */}

            {/* 6. Category Navigation - Content discovery */}
            <CategoryNavigation />

            {/* 7. About Us - Trust building */}
            <AboutUs data={validatedData.about} />

            {/* 8. Contact - Final call to action */}
            <Contact data={validatedData.contact} />
          </>
        )}
      </main>
      
      <Footer />
      
      {/* Admin Panel Toggle Button */}
      <button
        onClick={() => setShowAdminPanel(true)}
        className="fixed bottom-6 right-6 bg-[#FF6600] text-white p-3 rounded-full shadow-lg hover:shadow-xl hover:bg-[#E55A00] transition-all duration-200 z-40"
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
