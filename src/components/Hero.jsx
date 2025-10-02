import React, { useState } from 'react';
import { ArrowRight, Star, Users, Award, Clock, MessageSquare, FileText, Sparkles, Trophy, Zap, Lock, Briefcase, BookOpen } from 'lucide-react';
import ResumeBuilderRouter from './ResumeBuilderRouter';
import AuthModal from './AuthModal';
import ContestSubmissionForm from './ContestSubmissionForm';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Hero = ({ data }) => {
  const [showResumeBuilder, setShowResumeBuilder] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showContestForm, setShowContestForm] = useState(false);
  const { user, isVerified } = useAuth();
  // Default fallback data - matches admin panel defaults
  const defaultData = {
    badge: '🚀 Test Your QA Skills. Win Rewards. Build Your Career',
    headline: 'Win Big with Your Testing Expertise',
    subtitle: 'Show off your QA skills in our monthly contest! Share your best testing hacks, automation tricks, and innovative approaches.',
    stats: {
      participants: '500+',
      prizes: '$2,000+',
      support: '24/7'
    }
  };

  // Use provided data or fallback to defaults
  const safeData = data || defaultData;

  const openContestForm = () => {
    setShowContestForm(true);
  };

  const openCommunityDiscussion = () => {
    // Scroll to community section
    const communitySection = document.getElementById('community');
    if (communitySection) {
      communitySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openResumeBuilder = () => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }
    setShowResumeBuilder(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (user && isVerified) {
      setShowResumeBuilder(true);
    }
  };

  return (
    <section id="home" className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 py-8">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Headline */}
          <h1 className="font-extrabold text-gray-900 mb-4 leading-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
            {safeData.headline || 'Win Big with Your Testing Expertise'}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-md sm:max-w-2xl mx-auto mb-6 leading-relaxed px-2">
            {safeData.subtitle || 'Show off your QA skills in our monthly contest! Share your best testing hacks, automation tricks, and innovative approaches.'}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6">
            {/* Primary CTA - AI Resume Builder */}
            <button
              onClick={openResumeBuilder}
              className="group relative bg-gradient-to-r from-[#0057B7] via-[#0066CC] to-[#004494] text-white px-6 py-3 rounded-xl font-semibold text-base shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden w-full sm:w-auto min-w-[180px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-3">
                <div className="relative">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
                </div>
                <span className="font-extrabold tracking-wide">AI Resume Builder</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </button>

            {/* Secondary CTA - Join Contest */}
            <button
              onClick={openContestForm}
              className="group relative bg-gradient-to-r from-[#0066CC] to-[#004494] text-white px-5 py-3 rounded-xl font-medium text-base shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden w-full sm:w-auto min-w-[160px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-3">
                <div className="relative">
                  <Trophy className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-300 rounded-full animate-bounce"></div>
                </div>
                <span className="font-bold">Join Contest</span>
                <Zap className="w-4 h-4 opacity-0 group-hover:opacity-100 text-blue-200 transition-all duration-300" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </button>

            {/* Tertiary CTA - Find Jobs */}
            <button
              onClick={() => {
                toast('🚀 Coming Soon! Stay tuned for exciting job opportunities.', {
                  duration: 3000,
                  style: {
                    background: '#0057B7',
                    color: 'white',
                    fontWeight: '500'
                  }
                });
              }}
              className="group relative bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white px-5 py-3 rounded-xl font-medium text-base shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden w-full sm:w-auto min-w-[160px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-3">
                <div className="relative">
                  <Briefcase className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
                </div>
                <span className="font-bold">Find Jobs</span>
                <Zap className="w-4 h-4 opacity-0 group-hover:opacity-100 text-blue-200 transition-all duration-300" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </button>

            {/* Fourth CTA - Insight Library */}
            <button
              onClick={() => {
                toast('📚 Coming Soon! Access premium QA insights and resources.', {
                  duration: 3000,
                  style: {
                    background: '#0057B7',
                    color: 'white',
                    fontWeight: '500'
                  }
                });
              }}
              className="group relative bg-gradient-to-r from-[#3b82f6] to-[#1e40af] text-white px-5 py-3 rounded-xl font-medium text-base shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden w-full sm:w-auto min-w-[160px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-3">
                <div className="relative">
                  <BookOpen className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-300 rounded-full animate-bounce"></div>
                </div>
                <span className="font-bold">Insight Library</span>
                <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 text-blue-200 transition-all duration-300" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </button>
          </div>



        </div>
      </div>
      
      <ResumeBuilderRouter 
        isOpen={showResumeBuilder} 
        onClose={() => setShowResumeBuilder(false)} 
      />
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        action="resume"
      />
      
      <ContestSubmissionForm 
        isOpen={showContestForm}
        onClose={() => setShowContestForm(false)}
        contestData={{
          theme: 'Advanced Testing Methodologies',
          deadline: new Date().toISOString().split('T')[0]
        }}
      />
    </section>
  );
};

export default Hero;
