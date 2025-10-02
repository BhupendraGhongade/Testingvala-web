import React from 'react';
import { Shield, Target, Users, Globe, Trophy, CheckCircle, Award, Star, Heart, BookOpen, Rocket, Code } from 'lucide-react';
import { useWebsiteData } from '../contexts/GlobalDataContext';

const AboutUs = ({ data }) => {
  const { data: websiteData } = useWebsiteData();
  
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
    ]
  };

  // Use admin panel data first, then provided data, then defaults
  const safeData = { ...defaultData, ...websiteData?.about, ...data };
  safeData.features = Array.isArray(safeData.features) ? safeData.features : defaultData.features;
  safeData.achievements = Array.isArray(safeData.achievements) ? safeData.achievements : defaultData.achievements;

  return (
    <section id="about" className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">{safeData.title}</h2>
          <p className="text-lg text-[#FF6600] font-semibold mb-3">{safeData.subtitle}</p>
          <p className="text-gray-700 max-w-4xl mx-auto">{safeData.description}</p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white border-2 border-[#0057B7] rounded p-5">
            <div className="w-12 h-12 bg-[#0057B7] rounded flex items-center justify-center mb-3">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#0057B7] mb-2">Our Mission</h3>
            <p className="text-gray-700 text-sm">{safeData.mission}</p>
          </div>
          
          <div className="bg-white border-2 border-[#FF6600] rounded p-5">
            <div className="w-12 h-12 bg-[#FF6600] rounded flex items-center justify-center mb-3">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#FF6600] mb-2">Our Vision</h3>
            <p className="text-gray-700 text-sm">
              To become the global standard for QA excellence, where every testing professional can access world-class resources and advance their career through innovation.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Our Core Values</h3>
            <p className="text-gray-600 max-w-3xl mx-auto text-sm">
              The principles that guide our commitment to the QA community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Shield, title: 'Quality First', desc: 'Excellence in everything we deliver', color: '#0057B7' },
              { icon: Heart, title: 'Community Driven', desc: 'Built by QA professionals worldwide', color: '#FF6600' },
              { icon: Rocket, title: 'Innovation Focus', desc: 'Pioneering the future of testing', color: '#0057B7' },
              { icon: BookOpen, title: 'Continuous Learning', desc: 'Empowering growth and education', color: '#FF6600' }
            ].map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="text-center p-4 bg-white border border-gray-200 rounded">
                  <div 
                    className="w-10 h-10 rounded flex items-center justify-center mx-auto mb-2"
                    style={{ backgroundColor: value.color }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1 text-sm">{value.title}</h4>
                  <p className="text-gray-600 text-xs">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform Features */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeData.features.map((feature, index) => {
              const icons = [Target, CheckCircle, Award, Globe];
              const Icon = icons[index] || Target;
              const isBlue = index % 2 === 0;
              
              return (
                <div key={index} className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded">
                  <div 
                    className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: isBlue ? '#0057B7' : '#FF6600' }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1 text-sm">{feature}</h4>
                    <p className="text-gray-600 text-xs">Industry-leading solutions for modern QA professionals</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recognition */}
        <div className="bg-gray-50 rounded p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Industry Recognition</h3>
            <p className="text-gray-600 max-w-3xl mx-auto text-sm">
              Trusted by leading organizations worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeData.achievements.map((achievement, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-white rounded border border-gray-200">
                <div 
                  className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: index % 2 === 0 ? '#0057B7' : '#FF6600' }}
                >
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1 text-sm">{achievement}</h4>
                  <p className="text-gray-600 text-xs">Excellence in QA education and community building</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutUs;