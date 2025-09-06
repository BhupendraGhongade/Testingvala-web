import React from 'react';
import { ArrowRight, Star, Users, Award, Clock, MessageSquare } from 'lucide-react';

const Hero = ({ data }) => {
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

  return (
    <section id="home" className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 min-h-[55vh] flex items-center pt-6 md:pt-10 lg:pt-12 pb-3 md:pb-5 lg:pb-6">
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
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-4 px-2">
            <button
              onClick={openCommunityDiscussion}
              className="btn-secondary text-white w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg border border-secondary"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Start Discussion</span>
              <ArrowRight className="w-5 h-5 transition-transform" />
            </button>

            <button
              onClick={openContestForm}
              className="bg-transparent border-2 border-gray-300 text-gray-900 w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 hover:text-black hover:shadow-md hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <Award className="w-5 h-5" />
              <span>Join Contest</span>
              <ArrowRight className="w-5 h-5 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
