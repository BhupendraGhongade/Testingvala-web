import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { createPortal } from 'react-dom';
import { Menu, X, Trophy, Bookmark, FileText, FolderOpen } from 'lucide-react';
import TestingValaLogo from './TestingValaLogo';
import AuthModal from './AuthModal';
import ResumeBuilderRouter from './ResumeBuilderRouter';
import ResumeManagement from './ResumeManagement';
import ContestSubmissionForm from './ContestSubmissionForm';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showResumeBuilder, setShowResumeBuilder] = useState(false);
  const [showResumeManagement, setShowResumeManagement] = useState(false);
  const [showContestForm, setShowContestForm] = useState(false);
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



  const openContestForm = () => {
    setShowContestForm(true);
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
    <header data-debug-header="true" className="bg-black/95 backdrop-blur-sm border-b border-gray-800 fixed top-0 left-0 w-full shadow-lg pointer-events-auto" style={{ borderWidth: '1px', zIndex: 8000 }}>
      <div className="relative">
        {/* White pill logo flush to the left edge */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-50">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              flushSync(() => {
                setShowResumeBuilder(false);
                setShowResumeManagement(false);
              });
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
                flushSync(() => {
                  setShowResumeBuilder(false);
                  setShowResumeManagement(false);
                });
                window.location.href = '/';
              }} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">
                Home
              </a>
              <a href="/#contest" onClick={(e) => {
                e.preventDefault();
                flushSync(() => {
                  setShowResumeBuilder(false);
                  setShowResumeManagement(false);
                });
                window.location.href = '/#contest';
              }} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">
                Contest
              </a>
              <a href="/#community" onClick={(e) => {
                e.preventDefault();
                flushSync(() => {
                  setShowResumeBuilder(false);
                  setShowResumeManagement(false);
                });
                window.location.href = '/#community';
              }} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">
                Community
              </a>
              <a href="/#about" onClick={(e) => {
                e.preventDefault();
                flushSync(() => {
                  setShowResumeBuilder(false);
                  setShowResumeManagement(false);
                });
                window.location.href = '/#about';
              }} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">
                About
              </a>
              <a href="/#contact" onClick={(e) => {
                e.preventDefault();
                flushSync(() => {
                  setShowResumeBuilder(false);
                  setShowResumeManagement(false);
                });
                window.location.href = '/#contact';
              }} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">
                Contact
              </a>

              <a
                href="/boards"
                onClick={(e) => {
                  e.preventDefault();
                  setShowResumeBuilder(false);
                  setShowResumeManagement(false);
                  if (!isVerified) {
                    setShowAuthModal(true);
                  } else {
                    window.history.pushState({}, '', '/boards');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="text-gray-300 hover:text-white font-medium transition-all duration-200 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800"
              >
                <Bookmark className="w-4 h-4" />
                My Boards
              </a>
              <button onClick={() => {
                setShowResumeBuilder(false);
                setShowResumeManagement(false);
                openContestForm();
              }} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 hover:shadow-lg transition-all duration-200 flex items-center gap-2 border border-blue-500">
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
                flushSync(() => {
                  setShowResumeBuilder(false);
                  setShowResumeManagement(false);
                  setIsMenuOpen(false);
                });
                window.location.href = '/';
              }} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">Home</a>
              <a href="/#contest" onClick={(e) => {
                e.preventDefault();
                flushSync(() => {
                  setShowResumeBuilder(false);
                  setShowResumeManagement(false);
                  setIsMenuOpen(false);
                });
                window.location.href = '/#contest';
              }} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">Contest</a>
              <a href="/#community" onClick={(e) => {
                e.preventDefault();
                flushSync(() => {
                  setShowResumeBuilder(false);
                  setShowResumeManagement(false);
                  setIsMenuOpen(false);
                });
                window.location.href = '/#community';
              }} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">Community</a>
              <a href="/#about" onClick={(e) => {
                e.preventDefault();
                flushSync(() => {
                  setShowResumeBuilder(false);
                  setShowResumeManagement(false);
                  setIsMenuOpen(false);
                });
                window.location.href = '/#about';
              }} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">About</a>
              <a href="/#contact" onClick={(e) => {
                e.preventDefault();
                flushSync(() => {
                  setShowResumeBuilder(false);
                  setShowResumeManagement(false);
                  setIsMenuOpen(false);
                });
                window.location.href = '/#contact';
              }} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">Contact</a>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
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
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowResumeManagement(true);
                  }}
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
                  setShowResumeBuilder(false);
                  setShowResumeManagement(false);
                  setIsMenuOpen(false);
                  if (!isVerified) {
                    setShowAuthModal(true);
                  } else {
                    window.history.pushState({}, '', '/boards');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="text-gray-300 hover:text-white font-medium transition-all duration-200 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800"
              >
                <Bookmark className="w-4 h-4" />
                My Boards
              </a>
              <button onClick={() => {
                setIsMenuOpen(false);
                openContestForm();
              }} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 border border-blue-500"><Trophy className="w-4 h-4" /> Join Contest</button>
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
                  // Use pushState instead of full page reload
                  window.history.pushState({}, '', '/boards');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                } else {
                  setShowResumeBuilder(true);
                }
              }
            }}
            action={window.location.pathname === '/boards' ? 'boards' : 'resume'}
          />
        )}
        {showResumeBuilder && (
          <ResumeBuilderRouter
            isOpen={showResumeBuilder}
            onClose={() => {
              setShowResumeBuilder(false);
              setResumeToEdit(null);
            }}
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
        <ContestSubmissionForm 
          isOpen={showContestForm}
          onClose={() => setShowContestForm(false)}
          contestData={{
            theme: 'Advanced Testing Methodologies',
            deadline: new Date().toISOString().split('T')[0]
          }}
        />
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
