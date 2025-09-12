import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, Trophy, Calendar } from 'lucide-react';
import TestingValaLogo from './TestingValaLogo';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigateTo = (path = '/', sectionId = null, e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const normalizedPath = path || '/';
      const targetUrl = sectionId ? `${normalizedPath.replace(/\/$/, '')}#${sectionId}` : normalizedPath;

      // If changing path (cross-page), perform a full navigation to avoid SPA timing issues.
      const pathOnly = normalizedPath.replace(/\/$/, '') || '/';
      const currentPathOnly = window.location.pathname.replace(/\/$/, '') || '/';
      if (currentPathOnly !== pathOnly) {
        // use full navigation so browser loads the correct page
        window.location.href = targetUrl;
        return;
      }

      // Same-path navigation: update history and allow SPA to handle rendering + scroll
      const currentFull = window.location.pathname + window.location.hash;
      if (currentFull !== targetUrl) {
        window.history.pushState({}, '', targetUrl);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    } catch {
      // fallback to full navigation
      window.location.href = sectionId ? `${path}#${sectionId}` : path;
      return;
    }

    if (!sectionId) return;

    // Attempt to scroll to element, accounting for fixed header height
    const scrollToElement = (el) => {
      try {
        const headerEl = document.querySelector('header[data-debug-header]') || document.querySelector('header');
        const headerHeight = headerEl ? (headerEl.getBoundingClientRect().height || 0) : 0;
        const rect = el.getBoundingClientRect();
        const absoluteTop = window.pageYOffset + rect.top;
        const scrollTarget = Math.max(absoluteTop - headerHeight - 12, 0);
        window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      } catch {
        try { el.scrollIntoView({ behavior: 'smooth' }); } catch { /* ignore */ }
      }
    };

    let attempts = 0;
    const attemptScroll = () => {
      const el = document.getElementById(sectionId);
      if (el) {
        scrollToElement(el);
        return;
      }
      attempts += 1;
      if (attempts <= 10) {
        setTimeout(attemptScroll, 120);
      } else {
  try { window.location.hash = `#${sectionId}`; } catch { /* ignore */ }
      }
    };

    setTimeout(attemptScroll, 60);
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
            onClick={(e) => navigateTo('/', 'home', e)}
            onKeyDown={(e) => handleKeyActivate(e, () => navigateTo('/', 'home', e))}
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
              <a href="/" onClick={(e) => navigateTo('/', 'home', e)} onKeyDown={(e) => handleKeyActivate(e, () => navigateTo('/', 'home', e))} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">
                Home
              </a>
              <a href="/#contest" onClick={(e) => navigateTo('/', 'contest', e)} onKeyDown={(e) => handleKeyActivate(e, () => navigateTo('/', 'contest', e))} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">
                Contest
              </a>
              <a href="/#winners" onClick={(e) => navigateTo('/', 'winners', e)} onKeyDown={(e) => handleKeyActivate(e, () => navigateTo('/', 'winners', e))} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">
                Winners
              </a>
              <button onClick={(e) => {
                const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
                const hasEventsOnPage = typeof document !== 'undefined' && document.getElementById('events');
                let path;
                if (currentPath === '/events') path = '/events';
                else if (hasEventsOnPage) path = '/';
                else path = '/events';
                navigateTo(path, 'events', e);
              }} onKeyDown={(e) => handleKeyActivate(e, () => {
                const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
                const hasEventsOnPage = typeof document !== 'undefined' && document.getElementById('events');
                let path;
                if (currentPath === '/events') path = '/events';
                else if (hasEventsOnPage) path = '/';
                else path = '/events';
                navigateTo(path, 'events', e);
              })} className="text-gray-300 hover:text-white font-medium transition-colors duration-200 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Upcoming Events
              </button>
              <a href="/#community" onClick={(e) => navigateTo('/', 'community', e)} onKeyDown={(e) => handleKeyActivate(e, () => navigateTo('/', 'community', e))} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">
                Community
              </a>
              <a href="/#about" onClick={(e) => navigateTo('/', 'about', e)} onKeyDown={(e) => handleKeyActivate(e, () => navigateTo('/', 'about', e))} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">
                About
              </a>
              <a href="/#contact" onClick={(e) => navigateTo('/', 'contact', e)} onKeyDown={(e) => handleKeyActivate(e, () => navigateTo('/', 'contact', e))} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">
                Contact
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
            <nav className="flex flex-col space-y-4">
              <a href="/" onClick={(e) => navigateTo('/', 'home', e)} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">Home</a>
              <a href="/#contest" onClick={(e) => navigateTo('/', 'contest', e)} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">Contest</a>
              <a href="/#winners" onClick={(e) => navigateTo('/', 'winners', e)} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">Winners</a>
              <button onClick={(e) => {
                const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
                const hasEventsOnPage = typeof document !== 'undefined' && document.getElementById('events');
                let path;
                if (currentPath === '/events') path = '/events';
                else if (hasEventsOnPage) path = '/';
                else path = '/events';
                navigateTo(path, 'events', e);
              }} className="text-gray-300 hover:text-white font-medium transition-colors duration-200 flex items-center gap-2 justify-start"> <Calendar className="w-4 h-4" /> Upcoming Events</button>
              <a href="/#about" onClick={(e) => navigateTo('/', 'about', e)} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">About</a>
              <a href="/#contact" onClick={(e) => navigateTo('/', 'contact', e)} className="text-gray-300 hover:text-white font-medium transition-colors duration-200">Contact</a>
              <button onClick={openContestForm} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 border border-blue-500"><Trophy className="w-4 h-4" /> Join Contest</button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );

  // Render header into document.body to stay above other stacking contexts
  if (typeof document !== 'undefined') {
    return createPortal(headerContent, document.body);
  }

  return headerContent;
};

export default Header;
