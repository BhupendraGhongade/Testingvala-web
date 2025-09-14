import React, { useState } from 'react';
import { ArrowRight, Star, Users, Award, Clock, MessageSquare, FileText, Sparkles, Trophy, Zap } from 'lucide-react';
import ResumeBuilder from './ResumeBuilder';

const Hero = ({ data }) => {
  const [showResumeBuilder, setShowResumeBuilder] = useState(false);
  // Default fallback data
  const defaultData = {
    badge: '🚀 Test Your QA Skills. Win Rewards. Build Your Career',
    headline: 'TestingVala QA – Ask, Share & Learn Software Testing',
    subtitle: 'Join the premier QA community where professionals connect, share knowledge, and compete for recognition. Build your career through our monthly contests, workshops, and expert discussions.',
    stats: {
      participants: '500+',
      prizes: '$2,000+',
      support: '24/7'
    }
  };

  // Use provided data or fallback to defaults
  const safeData = data || defaultData;

  const openContestForm = () => {
    const contestUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdVsoGqy4FaSV5bHaCAQN4oCxxhG36NoiG4eGdNp8mjQMsJzw/viewform?usp=header';
    window.open(contestUrl, '_blank');
  };

  const openCommunityDiscussion = () => {
    // Scroll to community section
    const communitySection = document.getElementById('community');
    if (communitySection) {
      communitySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openResumeBuilder = () => {
    setShowResumeBuilder(true);
  };

  return (
    <section id="home" className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 min-h-[50vh] flex items-center pt-6 md:pt-10 lg:pt-12 pb-4 md:pb-6">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Headline */}
          <h1 className="font-extrabold text-gray-900 mb-4 leading-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
            {safeData.headline || 'TestingVala'}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-md sm:max-w-2xl mx-auto mb-6 leading-relaxed px-2">
            {safeData.subtitle || 'The leading enterprise platform for software testing professionals. Connect, collaborate, and advance your testing expertise through expert-led events, comprehensive training, and industry-leading tools.'}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-2 mt-8">
            {/* Primary CTA - AI Resume Builder */}
            <button
              onClick={openResumeBuilder}
              className="group relative bg-gradient-to-r from-[#0057B7] via-[#0066CC] to-[#004494] text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-blue-500/25 transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 overflow-hidden w-full sm:w-auto min-w-[220px]"
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
              className="group relative bg-gradient-to-r from-[#0057B7] to-[#004494] text-white px-7 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-blue-500/25 transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto min-w-[200px]"
            >
              <div className="flex items-center justify-center gap-3">
                <Trophy className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-bold">Join Contest</span>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
              </div>
            </button>

            {/* Tertiary CTA - Start Discussion */}
            <button
              onClick={openCommunityDiscussion}
              className="group relative bg-white border-2 border-gray-200 text-gray-800 px-7 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl hover:border-[#FF6600] transform hover:scale-105 transition-all duration-300 w-full sm:w-auto min-w-[200px]"
            >
              <div className="flex items-center justify-center gap-3">
                <MessageSquare className="w-5 h-5 group-hover:text-[#FF6600] transition-colors duration-300" />
                <span className="group-hover:text-[#FF6600] transition-colors duration-300 font-bold">Start Discussion</span>
                <Zap className="w-4 h-4 opacity-0 group-hover:opacity-100 text-[#FF6600] transition-all duration-300" />
              </div>
            </button>
          </div>



        </div>
      </div>
      
      <ResumeBuilder 
        isOpen={showResumeBuilder} 
        onClose={() => setShowResumeBuilder(false)} 
      />
    </section>
  );
};

export default Hero;
