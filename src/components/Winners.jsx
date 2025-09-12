import React from 'react';
import toast from 'react-hot-toast';
import { Trophy, Star, Award, Users, Clock, Linkedin, Share2, Download, Clipboard, Instagram, Check } from 'lucide-react';

// Create a simple share card as a canvas and return dataURL
const createShareCardDataUrl = async (winner, badgeLabel) => {
  const width = 1200;
  const height = 630;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#FF6600');
  grad.addColorStop(1, '#0057B7');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // White card area
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.fillRect(80, 80, width - 160, height - 160);

  // Badge
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 48px sans-serif';
  ctx.fillText(badgeLabel, 110, 160);

  // Winner name
  ctx.font = 'bold 64px sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(winner.name, 110, 260);

  // Title
  ctx.font = '28px sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText(winner.title, 110, 310);

  // Trick (wrap text)
  ctx.font = '22px sans-serif';
  ctx.fillStyle = '#111827';
  const text = winner.trick || '';
  const maxWidth = width - 260;
  let y = 360;
  const words = text.split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, 110, y);
      line = words[n] + ' ';
      y += 34;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, 110, y);

  // Footer / site
  ctx.font = '20px sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('TestingVala — Monthly QA Contest', 110, height - 90);

  return canvas.toDataURL('image/png');
};

const downloadShareCard = async (winner, badgeLabel) => {
  try {
    const dataUrl = await createShareCardDataUrl(winner, badgeLabel);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${winner.name.replace(/\s+/g, '_')}_winner_card.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  toast.success('Download started — check your downloads');
  } catch (err) {
    console.error('Failed to generate share card', err);
  toast.error('Failed to generate share card');
  }
};

  // keep the function inline where used; avoid top-level unused binding

const downloadThenOpenInstagram = async (winner, badgeLabel) => {
  try {
    await downloadShareCard(winner, badgeLabel);
    // Can't auto-post to Instagram from web — open Instagram web upload (user must manually upload)
    window.open('https://www.instagram.com/', '_blank');
  toast.success('Downloaded card — open Instagram to upload it');
  } catch (err) {
    console.error('Instagram flow failed', err);
  toast.error('Instagram flow failed');
  }
};

const Winners = ({ data }) => {
  // Default fallback data to prevent crashes
  const defaultData = {
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
    stats: {
      participants: '500+',
      prizes: '$25,000+',
      support: '24/7'
    }
  };

  // Use provided data or fallback to defaults
  const safeData = data || defaultData;
  
  // Ensure winners is always an array
  const winners = Array.isArray(safeData.winners) ? safeData.winners : defaultData.winners;
  
  // Ensure stats exist and have required properties
  const stats = safeData.stats || defaultData.stats;
  
  // Validate stats object
  const safeStats = {
    participants: stats?.participants || defaultData.stats.participants,
    prizes: stats?.prizes || defaultData.stats.prizes,
    support: stats?.support || defaultData.stats.support
  };

  // Removed verbose logging for production UI

  return (
    <>
      <section id="winners" className="py-10 bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Previous Winners
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet the talented QA professionals who have won our monthly contests and shared their innovative testing techniques.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {winners.map((winner, index) => {
              const place = index + 1;
              const badgeLabel = place === 1 ? '1st Place' : place === 2 ? '2nd Place' : place === 3 ? '3rd Place' : `${place}th Place`;

              // shareText removed: only LinkedIn/download/Instagram actions remain


              const shareLinkedIn = () => {
                // LinkedIn primarily shares a URL. We create a short sharable page anchor for the winners section.
                const shareUrl = `https://testingvala.com/?share_winner=${encodeURIComponent(winner.name)}#winners`;
                const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
                window.open(url, '_blank');
              };

              const copyShareText = (winner, badgeLabel) => {
                const text = `${badgeLabel} — ${winner.name} (${winner.title})\n\n${winner.trick}\n\nProud to be part of TestingVala community. Learn more: https://testingvala.com/#winners`;
                navigator.clipboard?.writeText(text).then(() => {
                  toast.success('Share text copied to clipboard');
                }).catch((err) => {
                  console.error('Failed to copy share text', err);
                  toast.error('Failed to copy');
                });
              };


              return (
                <div key={index} className="relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                  {/* Ribbon / Badge */}
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold ${place === 1 ? 'bg-yellow-100 text-yellow-800' : place === 2 ? 'bg-gray-100 text-gray-800' : place === 3 ? 'bg-orange-100 text-orange-800' : 'bg-blue-50 text-blue-800'}`}>
                    {badgeLabel}
                  </div>

                  <div className="p-6 text-center">
                      <div className="relative w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FF6600] to-[#E55A00] flex items-center justify-center text-4xl shadow-lg text-white">
                      <div className="w-24 h-24 flex items-center justify-center text-4xl">
                        {winner.avatar || '🏆'}
                      </div>

                      {/* Small verified check at top-right of avatar */}
                      <div className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-sm">
                        <div className="bg-green-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 mb-2">
                      <h3 className="text-2xl font-semibold text-gray-900">{winner.name}</h3>
                      {/* Visually-hidden duplicate of verified for screen readers if needed */}
                      <span className="sr-only">Verified Winner</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">{winner.title}</div>

                    <div className="bg-gray-50 p-4 rounded-lg text-left text-gray-700 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Winning QA Trick</h4>
                      <p className="text-sm leading-relaxed">{winner.trick}</p>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={shareLinkedIn}
                        aria-label={`Share ${winner.name} on LinkedIn`}
                        title="Share on LinkedIn"
                        className="p-3 bg-[#0A66C2] text-white rounded-full shadow-sm hover:scale-105 transition-transform"
                      >
                        <Linkedin className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => downloadShareCard(winner, badgeLabel)}
                        aria-label={`Download share card for ${winner.name}`}
                        title="Download card"
                        className="p-3 bg-gray-900 text-white rounded-full shadow-sm hover:scale-105 transition-transform"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => copyShareText(winner, badgeLabel)}
                        aria-label={`Copy share text for ${winner.name}`}
                        title="Copy share text"
                        className="p-3 bg-gray-100 text-gray-800 rounded-full shadow-sm hover:scale-105 transition-transform"
                      >
                        <Clipboard className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => downloadThenOpenInstagram(winner, badgeLabel)}
                        aria-label={`Download and open Instagram to post card for ${winner.name}`}
                        title="Instagram (download then upload)"
                        className="p-3 bg-pink-600 text-white rounded-full shadow-sm hover:scale-105 transition-transform"
                      >
                        <Instagram className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">Proudly hosted by <a href="https://testingvala.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">testingvala.com</a></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-10">
            <div className="bg-white rounded-xl p-6 shadow-lg max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Join the Winners Circle?</h3>
              <p className="text-gray-600 mb-4">Share your QA expertise and compete with the best testing professionals worldwide.</p>
              <button 
                onClick={() => { window.location.hash = 'contest'; }}
                className="bg-gradient-to-r from-[#FF6600] to-[#E55A00] text-white px-8 py-3 rounded-lg font-semibold text-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto hover:scale-105"
              >
                <Trophy className="w-5 h-5" />
                View Contest & Enter
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contest Statistics Section - Polished */}
      <section aria-labelledby="contest-stats" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 id="contest-stats" className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Contest Statistics</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Track your progress and see how you compare with other participants. Updated in real-time.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <article className="bg-white rounded-2xl shadow-lg p-6 text-center transform hover:-translate-y-1 transition-all duration-200" aria-label="Active participants">
              <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style={{background: 'linear-gradient(135deg,#f97316, #ff8a3d)'}}>
                <Users className="w-10 h-10 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1" aria-live="polite">{safeStats.participants}</div>
              <div className="text-sm text-gray-600 font-semibold">Active Participants</div>
              <p className="text-xs text-gray-500 mt-2">Number of contestants currently active</p>
            </article>

            <article className="bg-white rounded-2xl shadow-lg p-6 text-center transform hover:-translate-y-1 transition-all duration-200" aria-label="Total prizes awarded">
              <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style={{background: 'linear-gradient(135deg,#0073e6, #005bb5)'}}>
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1" aria-live="polite">{safeStats.prizes}</div>
              <div className="text-sm text-gray-600 font-semibold">Total Prizes</div>
              <p className="text-xs text-gray-500 mt-2">Prizes awarded across all contests</p>
            </article>

            <article className="bg-white rounded-2xl shadow-lg p-6 text-center transform hover:-translate-y-1 transition-all duration-200" aria-label="Support availability">
              <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style={{background: 'linear-gradient(135deg,#f97316, #0073e6)'}}>
                <Clock className="w-10 h-10 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1" aria-live="polite">{safeStats.support}</div>
              <div className="text-sm text-gray-600 font-semibold">Support</div>
              <p className="text-xs text-gray-500 mt-2">Help and contest support availability</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
};

export default Winners;
