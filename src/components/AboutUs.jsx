import React, { useState } from 'react';
import { Star, CheckCircle, Zap, Users, Award, Clock } from 'lucide-react';
import ResourcesModal from './ResourcesModal';

const AboutUs = ({ data }) => {
  const defaultData = {
    title: 'About TestingVala',
    tagline: 'Practical learning, real-world challenges, and a global QA community.',
    description:
      'TestingVala helps quality engineers and testers sharpen skills, exchange knowledge, and demonstrate expertise through hands‑on content and industry‑focused challenges. We prioritize practical guidance you can apply immediately on the job.',
    features: [
      'Actionable tutorials and lab exercises',
      'Problem‑based challenges and competitions',
      'Career resources and interview prep',
      'Community‑verified best practices'
    ],
    stats: {
      members: '10,000+',
      tips: '500+',
      contests: '12+',
      countries: '50+'
    },
    cta: {
      primary: { label: 'Join the Community', href: '/community' },
      secondary: { label: 'Explore Resources', href: '#about' }
    }
  };

  const safe = { ...defaultData, ...(data || {}) };
  safe.features = Array.isArray(safe.features) && safe.features.length ? safe.features : defaultData.features;
  safe.stats = { ...defaultData.stats, ...(safe.stats || {}) };
  const [openModal, setOpenModal] = useState(false);

  const featureIcon = (i) => {
    const icons = [CheckCircle, Zap, Star];
    const Icon = icons[i % icons.length];
    return <Icon className="w-6 h-6 text-white" />;
  };

  return (
    <section id="about" className="site-section bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8 text-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">{safe.title}</h2>
            <p className="text-lg text-gray-600 mb-4">{safe.tagline}</p>

            <p className="text-gray-700 mb-6 max-w-3xl mx-auto leading-relaxed">{safe.description}</p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => { window.location.href = safe.cta?.primary?.href || '/community'; }}
                className="inline-flex items-center justify-center rounded-md btn-primary px-6 py-3 text-white font-semibold shadow-sm hover:opacity-95"
                aria-label={safe.cta?.primary?.label || 'Primary action'}
              >
                {safe.cta?.primary?.label || 'Join'}
              </button>

              <button
                onClick={() => setOpenModal(true)}
                className="inline-flex items-center justify-center rounded-md border border-gray-200 px-5 py-3 text-gray-700 bg-white hover:bg-gray-50"
                aria-label={safe.cta?.secondary?.label || 'Secondary action'}
              >
                {safe.cta?.secondary?.label || 'Explore'}
              </button>
            </div>
          </div>
        </div>

        <ResourcesModal open={openModal} onClose={() => setOpenModal(false)} />

        {/* Features */}
        <div className="mt-10">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">What We Offer — Practical, Job‑Ready Resources</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {safe.features.map((feature, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-start gap-3 hover:shadow-md transition min-h-[160px]">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-white">{featureIcon(i)}</div>
                <h4 className="text-lg font-semibold text-gray-900">{feature}</h4>
                <p className="text-sm text-gray-600 mt-2">Expert‑authored, hands‑on content and templates you can apply immediately in your work.</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why choose us (high contrast) */}
        <div className="mt-12 bg-gradient-to-br from-[#003e8a] to-[#c64a00] rounded-2xl p-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="drop-shadow-sm">
              <h4 className="text-xl font-bold mb-2 text-white">Expert-Led Content</h4>
              <p className="text-sm text-white/90">Curated lessons and real-world examples from experienced QA practitioners.</p>
            </div>
            <div className="drop-shadow-sm">
              <h4 className="text-xl font-bold mb-2 text-white">Quality First</h4>
              <p className="text-sm text-white/90">All resources are reviewed and validated by our community experts.</p>
            </div>
            <div className="drop-shadow-sm">
              <h4 className="text-xl font-bold mb-2 text-white">Community Driven</h4>
              <p className="text-sm text-white/90">Collaborate, share, and grow with peers across the globe.</p>
            </div>
          </div>
        </div>

        {/* Bottom metric cards */}
        <div className="mt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{safe.stats.members}</div>
              <p className="text-gray-600">Active Members</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center">
              <Award className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{safe.stats.prizes || '$2,000+'}</div>
              <p className="text-gray-600">Total Prizes</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{safe.stats.support || '24/7'}</div>
              <p className="text-gray-600">Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
