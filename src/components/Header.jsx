import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, Trophy, Bookmark, FileText, FolderOpen } from 'lucide-react';
import TestingValaLogo from './TestingValaLogo';
import AuthModal from './AuthModal';
import ResumeBuilder from './ResumeBuilder';
import ResumeManagement from './ResumeManagement';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showResumeBuilder, setShowResumeBuilder] = useState(false);
  const [showResumeManagement, setShowResumeManagement] = useState(false);
  const [resumeToEdit, setResumeToEdit] = useState(null);
  const { user, isVerified } = useAuth();

  const handleCreateNewResume = (initialData = null) => {
    setResumeToEdit(initialData);
    setShowResumeManagement(false);
    setShowResumeBuilder(true);
  };

  const handleEditResume = (resume) => {
    setResumeToEdit(resume);
    setShowResumeManagement(false);
    setShowResumeBuilder(true);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigateTo = (path = '/', sectionId = null, e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    const normalizedPath = path || '/';
    const currentPath = window.location.pathname;
    
    // If navigating to different page, use full navigation
    if (currentPath !== normalizedPath) {
      const targetUrl = sectionId ? `${normalizedPath}#${sectionId}` : normalizedPath;
      window.location.href = targetUrl;
      return;
    }
    
    // Same page navigation - handle section scrolling
    if (sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerHeight = 80; // Fixed header height
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Update URL hash
        window.history.pushState({}, '', `${normalizedPath}#${sectionId}`);
      }
    }
  };

  const openContestForm = () => {
    const contestUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdVsoGqy4FaSV5bHaCAQN4oCxxhG36NoiG4eGdNp8mjQMsJzw/viewform?usp=header';
    window.open(contestUrl, '_blank');
  };

  // navigation will be handled by the navigateTo helper

  const handleKeyActivate = (e, fn) => {
    if (!fn) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn(e);
    }
  };

  const headerContent = (
    <header data-debug-header="true" className="bg-black/95 backdrop-blur-sm border-b border-gray-800 fixed top-0 left-0 w-full z-[99999] shadow-lg pointer-events-auto" style={{ borderWidth: '1px' }}>
      <div className="relative">
        {/* White pill logo flush to the left edge */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-50">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/';
            }}
            aria-label="Go to homepage"
            className="flex items-center bg-white px-3 py-1 rounded-md shadow-md ml-3"
          >
            <TestingValaLogo iconSize={36} textSize={16} />
          </a>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pl-36">
          <div className="flex justify-end items-center h-16">
            {/* Navigation (always visible) */}
            <nav className="flex items-center space-x-8">
              <a href="/" onClick={(e) => {
                e.preventDefault();
                window.location.href = '/';
              }} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">
                Home
              </a>
              <a href="/#contest" onClick={(e) => navigateTo('/', 'contest', e)} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">
                Contest
              </a>
              <a href="/#winners" onClick={(e) => navigateTo('/', 'winners', e)} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">
                Winners
              </a>
              <a href="/#community" onClick={(e) => navigateTo('/', 'community', e)} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">
                Community
              </a>
              <a href="/#about" onClick={(e) => navigateTo('/', 'about', e)} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">
                About
              </a>
              <a href="/#contact" onClick={(e) => navigateTo('/', 'contact', e)} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">
                Contact
              </a>

              <a
                href="/boards"
                onClick={(e) => {
                  e.preventDefault();
                  if (!isVerified) {
                    setShowAuthModal(true);
                  } else {
                    window.location.href = '/boards';
                  }
                }}
                className="text-gray-300 hover:text-white font-medium transition-all duration-200 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800"
                title={isVerified ? "Manage your boards" : "Sign in to access boards"}
              >
                <Bookmark className="w-4 h-4" />
                My Boards
              </a>
              <button onClick={openContestForm} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 hover:shadow-lg transition-all duration-200 flex items-center gap-2 border border-blue-500">
                <Trophy className="w-4 h-4" />
                Join Contest
              </button>
            </nav>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200" onClick={toggleMenu}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation (stacked below header area) */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4 mt-16">
            <nav className="flex flex-col space-y-4 px-4">
              <a href="/" onClick={(e) => {
                e.preventDefault();
                window.location.href = '/';
              }} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">Home</a>
              <a href="/#contest" onClick={(e) => navigateTo('/', 'contest', e)} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">Contest</a>
              <a href="/#winners" onClick={(e) => navigateTo('/', 'winners', e)} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">Winners</a>
              <a href="/#community" onClick={(e) => navigateTo('/', 'community', e)} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">Community</a>
              <a href="/#about" onClick={(e) => navigateTo('/', 'about', e)} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">About</a>
              <a href="/#contact" onClick={(e) => navigateTo('/', 'contact', e)} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">Contact</a>
              <button
                onClick={() => {
                  if (!user || !isVerified) {
                    setShowAuthModal(true);
                  } else {
                    setShowResumeBuilder(true);
                  }
                }}
                className="text-gray-300 hover:text-white font-medium transition-all duration-200 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 w-full text-left"
              >
                <FileText className="w-4 h-4" />
                AI Resume Builder
              </button>
              {isVerified && (
                <button
                  onClick={() => setShowResumeManagement(true)}
                  className="text-gray-300 hover:text-white font-medium transition-all duration-200 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 w-full text-left"
                >
                  <FolderOpen className="w-4 h-4" />
                  Manage Resumes
                </button>
              )}
              <a
                href="/boards"
                onClick={(e) => {
                  e.preventDefault();
                  if (!isVerified) {
                    setShowAuthModal(true);
                  } else {
                    window.location.href = '/boards';
                  }
                }}
                className="text-gray-300 hover:text-white font-medium transition-all duration-200 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800"
              >
                <Bookmark className="w-4 h-4" />
                My Boards
              </a>
              <button onClick={openContestForm} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 border border-blue-500"><Trophy className="w-4 h-4" /> Join Contest</button>
            </nav>
          </div>
        )}
      </div>
      
    </header>
  );

  // Render header into document.body to stay above other stacking contexts
  if (typeof document !== 'undefined') {
    return (
      <>
        {createPortal(headerContent, document.body)}
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onSuccess={() => {
              setShowAuthModal(false);
              if (user && isVerified) {
                // Check if this was triggered from resume builder or boards
                const currentPath = window.location.pathname;
                if (currentPath === '/boards' || window.location.hash.includes('boards')) {
                  window.location.href = '/boards';
                } else {
                  setShowResumeBuilder(true);
                }
              }
            }}
            action={window.location.pathname === '/boards' ? 'boards' : 'resume'}
          />
        )}
        {showResumeBuilder && (
          <ResumeBuilder
            isOpen={showResumeBuilder}
            onClose={() => {
              setShowResumeBuilder(false);
              setResumeToEdit(null);
            }}
            initialData={resumeToEdit}
          />
        )}
        {showResumeManagement && isVerified && (
          <ResumeManagement
            userEmail={user?.email}
            onCreateNew={handleCreateNewResume}
            onEditResume={handleEditResume}
            isOpen={showResumeManagement}
            onClose={() => setShowResumeManagement(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      {headerContent}

    </>
  );
};

export default Header;
