import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Hero from './components/Hero';
import UpcomingEvents from './components/UpcomingEvents';
import ContestSection from './components/ContestSection';

import CommunityHub from './components/CommunityHub';
import AboutUs from './components/AboutUs';
import Contact from './components/Contact';
import Footer from './components/Footer';
import EventsPage from './components/EventsPage';
import BoardsPage from './components/BoardsPage';
import BoardDetailPage from './components/BoardDetailPage';
import PublicBoardsPage from './components/PublicBoardsPage';
import AuthCallback from './components/AuthCallback';
import AuthVerify from './components/AuthVerify';
import ApiCallMonitor from './components/ApiCallMonitor';
import ApiAuditDashboard from './components/ApiAuditDashboard';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GlobalDataProvider } from './contexts/GlobalDataContext';
import { useWebsiteData } from './contexts/GlobalDataContext';
import { enterpriseAnalytics, trackUserEvent } from './services/enterpriseAnalytics';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import './utils/testOptimizations';
import './utils/globalApiLogger';
import './utils/testApiOptimizations';
import './utils/apiMonitor';

const AppContent = () => {
  const [currentPath, setCurrentPath] = useState(typeof window !== 'undefined' ? window.location.pathname : '/');
  const [boardView, setBoardView] = useState({ type: 'list', boardId: null });

  const { user, isVerified } = useAuth();
  const { data, loading } = useWebsiteData();
  const error = null; // Handle errors in the context
  const isOnline = !!data;

  // Track user authentication state changes
  useEffect(() => {
    if (user && isVerified) {
      try {
        trackUserEvent.loginAttempt(user.email, true);
        trackUserEvent.emailVerified(user.email);
      } catch (error) {
        console.warn('Analytics tracking failed:', error);
      }
    }
  }, [user, isVerified]);

  React.useEffect(() => {
    const handler = () => {
      const newPath = window.location.pathname;
      setCurrentPath(newPath);
      
      // Track page views
      try {
        trackUserEvent.pageView(newPath);
      } catch (error) {
        console.warn('Analytics tracking failed:', error);
      }
      
      // Check for post hash in URL
      const hash = window.location.hash;
      if (hash.startsWith('#community-post-')) {
        // Scroll to community section and highlight post
        setTimeout(() => {
          const communitySection = document.getElementById('community');
          if (communitySection) {
            communitySection.scrollIntoView({ behavior: 'smooth' });
            // Trigger post highlighting in CommunityHub
            const postId = hash.replace('#community-post-', '');
            window.dispatchEvent(new CustomEvent('highlightPost', { detail: { postId } }));
          }
        }, 500);
      }
    };
    
    // Check initial URL
    handler();
    
    window.addEventListener('popstate', handler);
    window.addEventListener('hashchange', handler);
    return () => {
      window.removeEventListener('popstate', handler);
      window.removeEventListener('hashchange', handler);
    };
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
      status: 'Active Now',
      stats: {
        participants: '2,500+',
        countries: '45+',
        submissions: '1,200+',
        winners: '36'
      }
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

  // Use optimized data structure
  const websiteData = data || {};
  
  // Ensure all sections have the required structure
  const validatedData = {
    hero: websiteData.hero || defaultData.hero,
    contest: websiteData.contest || defaultData.contest,
    winners: Array.isArray(websiteData.winners) ? websiteData.winners : defaultData.winners,
    about: websiteData.about || defaultData.about,
    contact: websiteData.contact || defaultData.contact
  };

  return (
    <div className="min-h-screen bg-white">
      <Toaster 
        position="bottom-left"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0057B7',
            color: '#fff',
            marginBottom: '20px',
            marginLeft: '20px'
          },
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
              color: '#fff'
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10B981',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#EF4444',
              color: '#fff'
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#EF4444',
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
      
      <main style={{ paddingTop: '80px' }}>
        {currentPath === '/auth/callback' ? (
          <AuthCallback />
        ) : currentPath === '/auth/verify' ? (
          <AuthVerify />
        ) : currentPath === '/events' ? (
          <EventsPage />
        ) : currentPath === '/boards' ? (
          boardView.type === 'detail' ? (
            <BoardDetailPage
              boardId={boardView.boardId}
              user={user}
              onBack={() => setBoardView({ type: 'list', boardId: null })}
            />
          ) : boardView.type === 'public' ? (
            <PublicBoardsPage
              user={user}
              onBack={() => setBoardView({ type: 'list', boardId: null })}
              onViewBoard={(boardId) => setBoardView({ type: 'detail', boardId })}
            />
          ) : isVerified ? (
            <BoardsPage 
              user={user} 
              onBack={() => window.history.back()}
              onViewBoard={(boardId) => setBoardView({ type: 'detail', boardId })}
              onViewPublic={() => setBoardView({ type: 'public', boardId: null })}
            />
          ) : (
            <PublicBoardsPage
              user={user}
              onBack={() => window.history.back()}
              onViewBoard={(boardId) => setBoardView({ type: 'detail', boardId })}
            />
          )
        ) : (
          <>
            <Hero data={validatedData.hero} />
            <UpcomingEvents />
            <CommunityHub />
            <ContestSection contestData={validatedData.contest} />
            <AboutUs data={validatedData.about} />
            <Contact data={validatedData.contact} />
          </>
        )}
      </main>
      
      <Footer />
      <ApiCallMonitor />
      <ApiAuditDashboard />
    </div>
  );
};

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
