import React from 'react';
import { Users, Globe, Trophy, Target, CheckCircle, Zap, Award, TrendingUp } from 'lucide-react';

const AboutUs = ({ data }) => {
  const defaultData = {
    title: 'About TestingVala',
    subtitle: 'Empowering QA Excellence Worldwide',
    description: 'TestingVala is the premier global platform for quality assurance professionals, fostering innovation, knowledge sharing, and career advancement through cutting-edge resources, competitive challenges, and a thriving community of testing experts.',
    mission: 'To revolutionize the QA industry by creating the world\'s most comprehensive platform for testing professionals to learn, compete, and excel in their careers.',
    features: [
      'Advanced Testing Methodologies',
      'Industry-Leading Best Practices', 
      'Professional Certification Programs',
      'Global Networking Opportunities'
    ],
    achievements: [
      'Recognized as Top QA Platform 2024',
      'Featured in 50+ Industry Publications',
      'Trusted by Fortune 500 Companies',
      'Award-Winning Community Platform'
    ],
    stats: {
      members: '25,000+',
      countries: '85+',
      contests: '50+',
      companies: '1,200+'
    }
  };

  const safeData = { ...defaultData, ...data };
  safeData.features = Array.isArray(safeData.features) ? safeData.features : defaultData.features;
  safeData.achievements = Array.isArray(safeData.achievements) ? safeData.achievements : defaultData.achievements;
  safeData.stats = { ...defaultData.stats, ...safeData.stats };

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{safeData.title}</h2>
          <p className="text-xl text-[#FF6600] font-semibold mb-6">{safeData.subtitle}</p>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">{safeData.description}</p>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-[#0057B7] to-[#FF6600] rounded-2xl p-8 mb-16 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
          <p className="text-lg leading-relaxed max-w-4xl mx-auto">{safeData.mission}</p>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">What Sets Us Apart</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {safeData.features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-[#FF6600] rounded-full flex items-center justify-center mx-auto mb-4">
                  {index === 0 && <Target className="w-8 h-8 text-white" />}
                  {index === 1 && <CheckCircle className="w-8 h-8 text-white" />}
                  {index === 2 && <Award className="w-8 h-8 text-white" />}
                  {index === 3 && <Globe className="w-8 h-8 text-white" />}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature}</h4>
                <p className="text-gray-600 text-sm">Industry-leading solutions designed for modern QA professionals</p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Recognition & Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {safeData.achievements.map((achievement, index) => (
              <div key={index} className="flex items-center p-6 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-12 h-12 bg-[#0057B7] rounded-full flex items-center justify-center mr-4">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{achievement}</h4>
                  <p className="text-gray-600 text-sm">Excellence in QA education and community building</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Global Impact</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF6600] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{safeData.stats.members}</div>
              <div className="text-gray-600 font-medium">Active Members</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0057B7] rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{safeData.stats.countries}</div>
              <div className="text-gray-600 font-medium">Countries</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF6600] rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{safeData.stats.contests}</div>
              <div className="text-gray-600 font-medium">Contests Held</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0057B7] rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{safeData.stats.companies}</div>
              <div className="text-gray-600 font-medium">Partner Companies</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
