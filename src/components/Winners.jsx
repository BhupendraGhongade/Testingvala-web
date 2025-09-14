import React from 'react';
import toast from 'react-hot-toast';
import { Trophy, Star, Award, Users, Clock, Linkedin, Share2, Download, Clipboard, Instagram, Check, Crown, Medal, Zap } from 'lucide-react';

const createShareCardDataUrl = async (winner, badgeLabel) => {
  const width = 1200;
  const height = 630;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Premium dark gradient background
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#0f172a');
  grad.addColorStop(0.3, '#1e293b');
  grad.addColorStop(0.7, '#334155');
  grad.addColorStop(1, '#475569');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Gold accent border for premium feel
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, width - 40, height - 40);
  
  // Inner gold border
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.strokeRect(35, 35, width - 70, height - 70);

  // Achievement badge background
  const badgeGrad = ctx.createLinearGradient(0, 50, 0, 200);
  badgeGrad.addColorStop(0, '#fbbf24');
  badgeGrad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = badgeGrad;
  ctx.fillRect(50, 50, width - 100, 150);

  // Achievement text
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 42px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏆 ACHIEVEMENT UNLOCKED 🏆', width/2, 110);
  
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(`${badgeLabel.toUpperCase()} WINNER`, width/2, 160);

  // Winner name (prominent white text)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 52px sans-serif';
  ctx.fillText(winner.name, width/2, 250);

  // Professional title with gold accent
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText(winner.title, width/2, 290);

  // Innovation highlight box
  ctx.fillStyle = 'rgba(251, 191, 36, 0.1)';
  ctx.fillRect(80, 320, width - 160, 120);
  
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.strokeRect(80, 320, width - 160, 120);

  // Innovation text
  ctx.fillStyle = '#e5e7eb';
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'left';
  
  const text = winner.trick || '';
  const maxWidth = width - 200;
  const maxLines = 3;
  let y = 350;
  const words = text.split(' ');
  let line = '';
  let lineCount = 0;
  
  for (let n = 0; n < words.length && lineCount < maxLines; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      if (lineCount === maxLines - 1) {
        ctx.fillText(line.trim() + '...', 100, y);
        break;
      }
      ctx.fillText(line, 100, y);
      line = words[n] + ' ';
      y += 28;
      lineCount++;
    } else {
      line = testLine;
    }
  }
  if (line && lineCount < maxLines) {
    ctx.fillText(line, 100, y);
  }

  // Premium footer section
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(0, height - 120, width, 120);
  
  // TestingVala branding
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TESTINGVALA', width/2, height - 80);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '18px sans-serif';
  ctx.fillText('Premier QA Community • Monthly Contests • Career Growth', width/2, height - 50);
  
  // Contact info in clickable format
  ctx.fillStyle = '#60a5fa';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('📧 info@testingvala.com  |  🌐 www.testingvala.com', width/2, height - 20);

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

const Winners = ({ data }) => {
  const defaultData = {
    winners: [
      {
        avatar: '👑',
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

  const safeData = data || defaultData;
  const winners = Array.isArray(safeData.winners) ? safeData.winners : defaultData.winners;
  const stats = safeData.stats || defaultData.stats;
  
  const safeStats = {
    participants: stats?.participants || defaultData.stats.participants,
    prizes: stats?.prizes || defaultData.stats.prizes,
    support: stats?.support || defaultData.stats.support
  };

  const shareLinkedIn = (winner, badgeLabel) => {
    const shareText = `🏆 ACHIEVEMENT UNLOCKED: ${badgeLabel.toUpperCase()} WINNER! 🏆\n\n🎯 Congratulations to ${winner.name} (${winner.title})\n\n💡 Winning Innovation:\n${winner.trick.substring(0, 180)}...\n\n🚀 Ready to showcase YOUR QA expertise?\n✅ Join 10,000+ QA professionals\n✅ Monthly contests with cash prizes\n✅ Career advancement opportunities\n✅ Industry recognition\n\n📧 Contact: info@testingvala.com\n🌐 Join now: www.testingvala.com\n\n#QATesting #TestAutomation #CareerGrowth #Achievement #TestingVala`;
    const shareUrl = `https://testingvala.com/?utm_source=linkedin&utm_medium=social&utm_campaign=winner_achievement&winner=${encodeURIComponent(winner.name)}#winners`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(`🏆 ${badgeLabel.toUpperCase()} WINNER - TestingVala Achievement`)}&summary=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const copyShareText = (winner, badgeLabel) => {
    const text = `🏆 ACHIEVEMENT UNLOCKED: ${badgeLabel.toUpperCase()} WINNER! 🏆\n\n🎯 ${winner.name} - ${winner.title}\n\n💡 Award-Winning QA Innovation:\n${winner.trick}\n\n🚀 JOIN THE ELITE QA COMMUNITY\n\n✨ What you get at TestingVala:\n✅ Monthly contests with REAL cash prizes\n✅ 10,000+ elite QA professionals\n✅ Career advancement opportunities\n✅ Industry recognition & achievements\n✅ Expert mentorship & networking\n\n📧 Apply now: info@testingvala.com\n🌐 Join today: www.testingvala.com\n\n#QATesting #TestAutomation #Achievement #CareerGrowth #TestingVala #QAExcellence`;
    navigator.clipboard?.writeText(text).then(() => {
      toast.success('🏆 Achievement share content copied!');
    }).catch((err) => {
      console.error('Failed to copy share text', err);
      toast.error('Failed to copy');
    });
  };

  return (
    <>
      <section id="winners" className="py-16 bg-gradient-to-br from-gray-50 via-white to-orange-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 bg-[#FF6600] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#0057B7] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF6600] to-[#E55A00] text-white px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-lg">
              <Trophy className="w-5 h-5" />
              Hall of Fame
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 via-[#0057B7] to-[#FF6600] bg-clip-text text-transparent">
              Previous Winners
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Meet the exceptional QA professionals who have won our monthly contests and shared their innovative testing techniques with the community.
            </p>
          </div>

          {/* Winners Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {winners.map((winner, index) => {
              const place = index + 1;
              const badgeLabel = place === 1 ? '1st Place' : place === 2 ? '2nd Place' : place === 3 ? '3rd Place' : `${place}th Place`;
              
              const getPlaceStyles = (place) => {
                switch(place) {
                  case 1: return {
                    gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
                    badge: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200',
                    icon: <Crown className="w-5 h-5" />,
                    glow: 'shadow-yellow-200'
                  };
                  case 2: return {
                    gradient: 'from-gray-300 via-gray-400 to-gray-500',
                    badge: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200',
                    icon: <Medal className="w-5 h-5" />,
                    glow: 'shadow-gray-200'
                  };
                  case 3: return {
                    gradient: 'from-orange-400 via-orange-500 to-orange-600',
                    badge: 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200',
                    icon: <Award className="w-5 h-5" />,
                    glow: 'shadow-orange-200'
                  };
                  default: return {
                    gradient: 'from-blue-400 via-blue-500 to-blue-600',
                    badge: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200',
                    icon: <Star className="w-5 h-5" />,
                    glow: 'shadow-blue-200'
                  };
                }
              };

              const placeStyles = getPlaceStyles(place);

              return (
                <div key={index} className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl ${placeStyles.glow} transition-all duration-500 transform hover:-translate-y-3 overflow-hidden border border-gray-100`}>
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-50/50 to-orange-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Place Badge */}
                  <div className={`absolute top-6 left-6 px-4 py-2 rounded-full text-sm font-bold border ${placeStyles.badge} flex items-center gap-2 shadow-sm z-10`}>
                    {placeStyles.icon}
                    {badgeLabel}
                  </div>

                  <div className="relative p-8 text-center">
                    {/* Avatar with Animated Ring */}
                    <div className="relative w-28 h-28 mx-auto mb-6">
                      <div className={`absolute inset-0 bg-gradient-to-br ${placeStyles.gradient} rounded-full animate-pulse group-hover:animate-spin transition-all duration-1000`}></div>
                      <div className="relative w-24 h-24 mx-auto mt-2 rounded-full bg-white flex items-center justify-center text-4xl shadow-lg border-4 border-white">
                        {winner.avatar || '🏆'}
                      </div>
                      
                      {/* Verified Badge */}
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-lg">
                        <div className="bg-green-500 text-white rounded-full p-1.5 w-8 h-8 flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Winner Info */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#FF6600] transition-colors duration-300">
                        {winner.name}
                      </h3>
                      <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                        <Zap className="w-4 h-4 text-[#FF6600]" />
                        {winner.title}
                      </div>
                    </div>

                    {/* Winning Trick */}
                    <div className="bg-gradient-to-br from-gray-50 to-orange-50 p-6 rounded-xl text-left mb-6 border border-gray-100 group-hover:border-orange-200 transition-colors duration-300">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-[#FF6600]" />
                        Winning QA Innovation
                      </h4>
                      <p className="text-sm leading-relaxed text-gray-700">{winner.trick}</p>
                    </div>

                    {/* Social Actions */}
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <button
                        onClick={() => shareLinkedIn(winner, badgeLabel)}
                        className="group/btn p-3 bg-[#0A66C2] text-white rounded-xl shadow-sm hover:shadow-lg hover:scale-110 transition-all duration-200"
                        title="Share on LinkedIn"
                      >
                        <Linkedin className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                      </button>

                      <button
                        onClick={() => downloadShareCard(winner, badgeLabel)}
                        className="group/btn p-3 bg-gray-900 text-white rounded-xl shadow-sm hover:shadow-lg hover:scale-110 transition-all duration-200"
                        title="Download card"
                      >
                        <Download className="w-4 h-4 group-hover/btn:translate-y-1 transition-transform" />
                      </button>

                      <button
                        onClick={() => copyShareText(winner, badgeLabel)}
                        className="group/btn p-3 bg-gray-100 text-gray-800 rounded-xl shadow-sm hover:shadow-lg hover:scale-110 transition-all duration-200"
                        title="Copy share text"
                      >
                        <Clipboard className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                      </button>
                    </div>

                    <div className="text-xs text-gray-500">
                      Proudly hosted by <span className="text-[#FF6600] font-semibold">TestingVala</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-white rounded-2xl p-8 shadow-xl max-w-2xl mx-auto border border-gray-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF6600]/5 to-[#0057B7]/5"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FF6600] to-[#E55A00] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Join the Winners Circle?</h3>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  Share your QA expertise and compete with the best testing professionals worldwide. Your innovation could be featured next!
                </p>
                <button 
                  onClick={() => { window.location.hash = 'contest'; }}
                  className="bg-gradient-to-r from-[#FF6600] to-[#E55A00] text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-3 mx-auto hover:scale-105 group"
                >
                  <Trophy className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  View Contest & Enter Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contest Statistics */}
      <section className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[#FF6600] rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#0057B7] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-orange-200 to-blue-200 bg-clip-text text-transparent">
              Contest Statistics
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Track your progress and see how you compare with other participants. Updated in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20 hover:border-[#FF6600]/50 transition-all duration-300 hover:transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FF6600] to-[#E55A00] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                {safeStats.participants}
              </div>
              <div className="text-lg font-semibold text-gray-200 mb-2">Active Participants</div>
              <p className="text-sm text-gray-400">Contestants currently competing</p>
            </div>

            <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20 hover:border-[#0057B7]/50 transition-all duration-300 hover:transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-[#0057B7] to-[#003d82] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                {safeStats.prizes}
              </div>
              <div className="text-lg font-semibold text-gray-200 mb-2">Total Prizes</div>
              <p className="text-sm text-gray-400">Awarded across all contests</p>
            </div>

            <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20 hover:border-yellow-500/50 transition-all duration-300 hover:transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                {safeStats.support}
              </div>
              <div className="text-lg font-semibold text-gray-200 mb-2">Support Available</div>
              <p className="text-sm text-gray-400">Help and contest assistance</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Winners;