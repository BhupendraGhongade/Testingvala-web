import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Trophy, Star, Award, Users, Clock, Linkedin, Share2, Download, Clipboard, Instagram, Check, Crown, Medal, Zap, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const createShareCardDataUrl = async (winner, badgeLabel) => {
  const width = 1200;
  const height = 900;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Professional white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Professional border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, width - 60, height - 60);
  
  // Inner accent border
  ctx.strokeStyle = '#FF6600';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // Header section
  ctx.fillStyle = '#FF6600';
  ctx.fillRect(60, 60, width - 120, 120);
  
  // Certificate title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CERTIFICATE OF EXCELLENCE', width/2, 130);
  
  // Subtitle
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('Quality Assurance Professional Recognition', width/2, 165);

  // Main content area
  ctx.fillStyle = '#1e293b';
  ctx.font = 'normal 24px serif';
  ctx.fillText('This is to certify that', width/2, 240);

  // Winner name (prominent)
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 48px serif';
  ctx.fillText(winner.name.toUpperCase(), width/2, 300);

  // Professional title
  ctx.fillStyle = '#475569';
  ctx.font = 'italic 20px serif';
  ctx.fillText(winner.title, width/2, 335);

  // Achievement description
  ctx.fillStyle = '#1e293b';
  ctx.font = 'normal 22px serif';
  ctx.fillText('has achieved', width/2, 390);
  
  // Award level - using actual place numbers
  const achievements = {
    '1st Place': { title: '1ST PLACE WINNER', color: '#FFD700', emoji: '🥇' },
    '2nd Place': { title: '2ND PLACE WINNER', color: '#C0C0C0', emoji: '🥈' },
    '3rd Place': { title: '3RD PLACE WINNER', color: '#CD7F32', emoji: '🥉' }
  };
  const achievement = achievements[badgeLabel] || achievements['1st Place'];
  
  // Award emoji
  ctx.font = '60px sans-serif';
  ctx.fillText(achievement.emoji, width/2, 450);
  
  // Award title
  ctx.fillStyle = achievement.color;
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(achievement.title, width/2, 500);

  // Recognition text
  ctx.fillStyle = '#1e293b';
  ctx.font = 'normal 18px serif';
  ctx.fillText('in the TestingVala QA Professional Contest', width/2, 540);
  ctx.fillText('for exceptional expertise in Quality Assurance', width/2, 565);
  
  // Date and certification number
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  ctx.fillStyle = '#64748b';
  ctx.font = 'normal 16px sans-serif';
  ctx.fillText(`Awarded on ${currentDate}`, width/2, 620);
  
  const certId = `QA-${badgeLabel.replace(/\s+/g, '').toUpperCase()}-${Date.now().toString().slice(-6)}`;
  ctx.fillText(`Certificate ID: ${certId}`, width/2, 645);

  // Signature area
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('TestingVala Certification Authority', 80, 730);
  
  ctx.font = 'normal 14px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Premier QA Community & Professional Development', 80, 750);
  
  // QR Code placeholder - positioned safely within bounds
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.strokeRect(width - 140, 700, 60, 60);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Verify at', width - 110, 745);
  ctx.fillText('testingvala.com', width - 110, 755);

  // Footer branding - increased height to fit both lines
  ctx.fillStyle = '#FF6600';
  ctx.fillRect(60, height - 100, width - 120, 60);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('www.testingvala.com | info@testingvala.com', width/2, height - 70);
  
  ctx.font = '14px sans-serif';
  ctx.fillText('Empowering QA Professionals Worldwide', width/2, height - 50);

  return canvas.toDataURL('image/png');
};

const downloadShareCard = async (winner, badgeLabel) => {
  try {
    const dataUrl = await createShareCardDataUrl(winner, badgeLabel);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `TestingVala_QA_Certificate_${winner.name.replace(/\s+/g, '_')}_${badgeLabel.replace(/\s+/g, '')}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('🏆 Professional certificate downloaded successfully!');
  } catch (err) {
    console.error('Failed to generate certificate', err);
    toast.error('Failed to generate certificate');
  }
};

const Winners = ({ data }) => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultData = {
    winners: [],
    stats: {
      participants: '500+',
      prizes: '$25,000+',
      support: '24/7'
    }
  };

  useEffect(() => {
    loadWinners();
    
    // Auto-refresh every 5 seconds to catch winner updates
    const interval = setInterval(loadWinners, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Direct database verification function
  const verifyDatabase = async () => {
    if (!supabase) {
      toast.error('Supabase not configured');
      return;
    }
    
    try {
      console.log('🔍 Starting database verification...');
      
      // Check table exists and has data
      const { data: allData, error: allError } = await supabase
        .from('contest_submissions')
        .select('id, name, email, winner_rank, status')
        .limit(10);
      
      console.log('📊 Table sample:', allData, allError);
      
      // Check specific user
      const { data: userData, error: userError } = await supabase
        .from('contest_submissions')
        .select('*')
        .eq('email', 'bghongade@york.ie');
      
      console.log('👤 Bhupendra data:', userData, userError);
      
      // Check winners
      const { data: winnersData, error: winnersError } = await supabase
        .from('contest_submissions')
        .select('*')
        .in('winner_rank', [1, 2, 3]);
      
      console.log('🏆 Winners data:', winnersData, winnersError);
      
      // Check with different query
      const { data: altWinners, error: altError } = await supabase
        .from('contest_submissions')
        .select('*')
        .not('winner_rank', 'is', null);
      
      console.log('🏆 Alt winners query:', altWinners, altError);
      
      toast.success('Database verification complete - check console');
      
    } catch (error) {
      console.error('❌ Database verification failed:', error);
      toast.error('Database verification failed');
    }
  };

  const loadWinners = async () => {
    console.log('🔄 Loading winners...');
    try {
      let winnersData = [];
      
      // Always try Supabase first if available
      if (supabase) {
        console.log('📡 Trying Supabase database...');
        
        // Try multiple query approaches to ensure we get the data
        const queries = [
          // Query 1: Direct winner_rank filter
          supabase
            .from('contest_submissions')
            .select('*')
            .in('winner_rank', [1, 2, 3])
            .order('winner_rank'),
            
          // Query 2: Not null filter
          supabase
            .from('contest_submissions')
            .select('*')
            .not('winner_rank', 'is', null)
            .order('winner_rank'),
            
          // Query 3: All submissions, filter client-side
          supabase
            .from('contest_submissions')
            .select('*')
            .order('created_at', { ascending: false })
        ];
        
        for (let i = 0; i < queries.length; i++) {
          console.log(`📡 Trying query ${i + 1}...`);
          const { data: contestWinners, error } = await queries[i];
          
          console.log(`📊 Query ${i + 1} result:`, { data: contestWinners, error, count: contestWinners?.length });
          
          if (!error && contestWinners && contestWinners.length > 0) {
            // For query 3, filter client-side
            if (i === 2) {
              winnersData = contestWinners.filter(sub => sub.winner_rank && sub.winner_rank >= 1 && sub.winner_rank <= 3);
            } else {
              winnersData = contestWinners;
            }
            
            console.log('✅ Raw contest winners from database:', winnersData);
            console.log('🔍 Checking for Bhupendra:', winnersData.filter(w => w.email === 'bghongade@york.ie'));
            
            if (winnersData.length > 0) {
              break; // Found winners, stop trying other queries
            }
          } else {
            console.log(`❌ Query ${i + 1} failed or no data:`, error);
          }
        }
      }
      
      // Fallback to localStorage if no Supabase data
      if (winnersData.length === 0) {
        console.log('💾 Trying localStorage...');
        const localSubmissions = JSON.parse(localStorage.getItem('contest_submissions') || '[]');
        winnersData = localSubmissions.filter(sub => sub.winner_rank && sub.winner_rank >= 1 && sub.winner_rank <= 3);
        console.log('📦 Winners from localStorage:', winnersData);
      }
      
      // Process winners data with better validation
      console.log('🔄 Processing winners data:', winnersData);
      
      const winnersMap = new Map();
      
      winnersData.forEach(winner => {
        console.log('🔄 Processing winner:', {
          id: winner.id,
          name: winner.name,
          email: winner.email,
          winner_rank: winner.winner_rank,
          technique_title: winner.technique_title,
          status: winner.status
        });
        
        // Validate winner_rank is a valid number
        const rank = parseInt(winner.winner_rank);
        if (rank >= 1 && rank <= 3 && !isNaN(rank)) {
          const formattedWinner = {
            avatar: rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉',
            name: winner.name || 'Anonymous Winner',
            title: winner.role || winner.company || (winner.experience_years ? `${winner.experience_years} Experience` : '') || 'QA Professional',
            trick: winner.technique_description || winner.impact_benefits || (winner.submission_text ? winner.submission_text.substring(0, 200) + '...' : '') || winner.technique_title || 'Innovative QA technique',
            rank: rank,
            email: winner.email // Keep for debugging
          };
          
          console.log(`🏆 Setting ${rank} place winner:`, formattedWinner);
          winnersMap.set(rank, formattedWinner);
        } else {
          console.log('❌ Invalid winner_rank:', winner.winner_rank, 'for winner:', winner.name);
        }
      });
      
      // Convert map to sorted array
      const formattedWinners = [];
      for (let rank = 1; rank <= 3; rank++) {
        if (winnersMap.has(rank)) {
          formattedWinners.push(winnersMap.get(rank));
        }
      }
      
      console.log('🏆 Final formatted winners:', formattedWinners);
      console.log('📊 Winners count:', formattedWinners.length);
      
      // Log each winner for debugging
      formattedWinners.forEach((winner, index) => {
        console.log(`🏆 Winner ${index + 1}:`, {
          name: winner.name,
          email: winner.email,
          rank: winner.rank,
          title: winner.title
        });
      });
      
      setWinners(formattedWinners);
      
    } catch (error) {
      console.error('❌ Error loading winners:', error);
      console.error('❌ Error details:', error.message, error.stack);
      // Show empty array on error
      setWinners([]);
      toast.error('Failed to load winners: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const safeData = data || defaultData;
  const stats = safeData.stats || defaultData.stats;
  
  const safeStats = {
    participants: stats?.participants || defaultData.stats.participants,
    prizes: stats?.prizes || defaultData.stats.prizes,
    support: stats?.support || defaultData.stats.support
  };

  const shareLinkedIn = (winner, badgeLabel) => {
    const achievements = {
      '1st Place': { emoji: '🥇', title: 'CHAMPION', subtitle: 'Gold Medal Winner', color: '#FFD700' },
      '2nd Place': { emoji: '🥈', title: 'EXCELLENCE', subtitle: 'Silver Medal Winner', color: '#C0C0C0' },
      '3rd Place': { emoji: '🥉', title: 'ACHIEVER', subtitle: 'Bronze Medal Winner', color: '#CD7F32' }
    };
    
    const achievement = achievements[badgeLabel] || achievements['1st Place'];
    
    const shareText = `${achievement.emoji} QA ${achievement.title} CERTIFIED ${achievement.emoji}\n\n🏅 Proud to announce ${winner.name} as ${badgeLabel} Winner\n🏢 ${winner.title} | TestingVala Contest Winner\n\n🚀 WHAT THIS MEANS:\n✅ Recognized among TOP QA professionals globally\n✅ Validated expertise in Quality Assurance\n✅ Part of elite 1% QA community\n✅ Industry-certified innovation leader\n\n🌟 JOIN THE QA ELITE:\n🎯 Monthly skill competitions\n💰 Cash prizes & recognition\n🤝 Network with 10,000+ QA experts\n📈 Accelerate your QA career\n\n🔗 Compete & Win: www.testingvala.com\n📧 info@testingvala.com\n\n#QAChampion #TestingExcellence #QualityAssurance #TestAutomation #CareerGrowth #TestingVala #QALeadership #TechCareers`;
    
    const shareUrl = `https://testingvala.com/?utm_source=linkedin&utm_medium=social&utm_campaign=qa_winner&winner=${encodeURIComponent(winner.name)}#winners`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(`${achievement.emoji} QA ${achievement.title} - ${winner.name}`)}&summary=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const copyShareText = (winner, badgeLabel) => {
    const achievements = {
      '1st Place': { emoji: '🥇', title: 'CHAMPION', subtitle: 'Gold Medal Winner' },
      '2nd Place': { emoji: '🥈', title: 'EXCELLENCE', subtitle: 'Silver Medal Winner' },
      '3rd Place': { emoji: '🥉', title: 'ACHIEVER', subtitle: 'Bronze Medal Winner' }
    };
    
    const achievement = achievements[badgeLabel] || achievements['1st Place'];
    
    const text = `${achievement.emoji} QA ${achievement.title} CERTIFIED ${achievement.emoji}\n\n🏅 ${winner.name} - ${achievement.subtitle}\n🏢 ${winner.title}\n🏆 TestingVala Contest Winner\n\n🌟 ACHIEVEMENT HIGHLIGHTS:\n✅ TOP 1% QA Professional Recognition\n✅ Industry-Validated Expertise\n✅ Elite QA Community Member\n✅ Innovation & Excellence Award\n\n🚀 READY TO JOIN THE QA ELITE?\n\n🎯 What TestingVala Offers:\n💰 Monthly contests with real cash prizes\n🤝 Network with 10,000+ QA professionals\n📈 Career advancement opportunities\n🎓 Skill validation & industry recognition\n🌍 Global QA community access\n\n🔗 Start Your Journey: www.testingvala.com\n📧 Get Started: info@testingvala.com\n\n#QAChampion #TestingExcellence #QualityAssurance #TestAutomation #CareerSuccess #TestingVala #QALeadership #TechCareers #ProfessionalGrowth`;
    
    navigator.clipboard?.writeText(text).then(() => {
      toast.success('🏆 Professional achievement content copied!');
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
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF6600] to-[#E55A00] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg">
                <Trophy className="w-5 h-5" />
                Hall of Fame
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 via-[#0057B7] to-[#FF6600] bg-clip-text text-transparent">
              Previous Winners
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Meet the exceptional QA professionals who have won our monthly contests and shared their innovative testing techniques with the community.
            </p>
          </div>

          {/* Winners Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : winners.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100 mb-16">
              <Trophy className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Winners Yet</h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                Contest winners will be announced here once the judging is complete. Stay tuned!
              </p>
              <button 
                onClick={() => { window.location.hash = 'contest'; }}
                className="bg-gradient-to-r from-[#FF6600] to-[#E55A00] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
              >
                <Trophy className="w-5 h-5" />
                Enter Contest Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {winners.map((winner, index) => {
              const place = index + 1;
              const badgeLabel = place === 1 ? '1st Place' : place === 2 ? '2nd Place' : place === 3 ? '3rd Place' : `${place}th Place`;
              
              const getPlaceStyles = (place) => {
                switch(place) {
                  case 1: return {
                    gradient: 'from-[#FFD700] via-[#FFA500] to-[#FF6600]',
                    badge: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-900 border-yellow-400',
                    icon: <Crown className="w-4 h-4" />,
                    cardBg: 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50',
                    border: 'border-yellow-200',
                    medal: '🥇',
                    title: 'CHAMPION'
                  };
                  case 2: return {
                    gradient: 'from-[#C0C0C0] via-[#A9A9A9] to-[#808080]',
                    badge: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-900 border-gray-400',
                    icon: <Medal className="w-4 h-4" />,
                    cardBg: 'bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50',
                    border: 'border-gray-200',
                    medal: '🥈',
                    title: 'EXCELLENCE'
                  };
                  case 3: return {
                    gradient: 'from-[#CD7F32] via-[#D2691E] to-[#A0522D]',
                    badge: 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-900 border-orange-400',
                    icon: <Award className="w-4 h-4" />,
                    cardBg: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50',
                    border: 'border-orange-200',
                    medal: '🥉',
                    title: 'ACHIEVER'
                  };
                  default: return {
                    gradient: 'from-[#0057B7] to-[#FF6600]',
                    badge: 'bg-gradient-to-r from-blue-100 to-orange-100 text-blue-900 border-blue-400',
                    icon: <Star className="w-4 h-4" />,
                    cardBg: 'bg-gradient-to-br from-blue-50 to-orange-50',
                    border: 'border-blue-200',
                    medal: '🏆',
                    title: 'WINNER'
                  };
                }
              };

              const placeStyles = getPlaceStyles(place);

              return (
                <div key={index} className={`group relative ${placeStyles.cardBg} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border-2 ${placeStyles.border} backdrop-blur-sm`}>
                  {/* Premium Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold border-2 ${placeStyles.badge} flex items-center gap-1 shadow-lg z-10`}>
                    {placeStyles.icon}
                    {placeStyles.title}
                  </div>

                  {/* Medal Overlay */}
                  <div className="absolute top-4 left-4 text-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                    {placeStyles.medal}
                  </div>

                  <div className="relative p-6 text-center">
                    {/* Professional Avatar */}
                    <div className="relative w-20 h-20 mx-auto mb-5">
                      <div className={`absolute inset-0 bg-gradient-to-br ${placeStyles.gradient} rounded-full animate-pulse group-hover:animate-none transition-all duration-500`}></div>
                      <div className="relative w-18 h-18 mx-auto mt-1 rounded-full bg-white flex items-center justify-center text-3xl shadow-xl border-4 border-white">
                        {winner.avatar || placeStyles.medal}
                      </div>
                      
                      {/* Verified Professional Badge */}
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-lg">
                        <div className="bg-green-500 text-white rounded-full p-1.5 w-7 h-7 flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                    </div>

                    {/* Winner Professional Info */}
                    <div className="mb-5">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#FF6600] transition-colors duration-300">
                        {winner.name}
                      </h3>
                      <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-gray-800 shadow-sm">
                        <Zap className="w-4 h-4 text-[#FF6600]" />
                        QA {placeStyles.title}
                      </div>
                      <p className="text-xs text-gray-600 mt-2 font-medium">{winner.title}</p>
                    </div>

                    {/* Achievement Highlight */}
                    <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl text-left mb-5 border border-white/60 shadow-sm">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                        <Trophy className="w-4 h-4 text-[#FF6600]" />
                        Certified Excellence
                      </h4>
                      <p className="text-xs leading-relaxed text-gray-700">
                        Recognized for outstanding QA innovation and professional excellence in quality assurance practices.
                      </p>
                    </div>

                    {/* Social Share Actions */}
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => shareLinkedIn(winner, badgeLabel)}
                        className="flex items-center gap-1 px-3 py-2 bg-[#0A66C2] text-white rounded-lg shadow-sm hover:shadow-md hover:bg-[#004182] transition-all duration-200 text-xs font-medium"
                      >
                        <Linkedin className="w-3 h-3" />
                        LinkedIn
                      </button>

                      <button
                        onClick={() => {
                          const achievements = {
                            '1st Place': { emoji: '🥇', title: 'CHAMPION' },
                            '2nd Place': { emoji: '🥈', title: 'EXCELLENCE' },
                            '3rd Place': { emoji: '🥉', title: 'ACHIEVER' }
                          };
                          const achievement = achievements[badgeLabel] || achievements['1st Place'];
                          const whatsappText = `${achievement.emoji} QA ${achievement.title} CERTIFIED ${achievement.emoji}\n\n🏅 ${winner.name} - ${badgeLabel} Winner\n🏢 ${winner.title}\n🏆 TestingVala Contest Winner\n\n🌟 Recognized for outstanding QA excellence!\n\n🚀 Join the QA Elite Community:\n💰 Monthly contests with cash prizes\n🤝 Network with 10,000+ QA professionals\n📈 Accelerate your QA career\n\n🔗 www.testingvala.com\n📧 info@testingvala.com\n\n#QAChampion #TestingVala #QualityAssurance`;
                          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
                          window.open(whatsappUrl, '_blank');
                        }}
                        className="flex items-center gap-1 px-3 py-2 bg-[#25D366] text-white rounded-lg shadow-sm hover:shadow-md hover:bg-[#1DA851] transition-all duration-200 text-xs font-medium"
                      >
                        <MessageCircle className="w-3 h-3" />
                        WhatsApp
                      </button>

                      <button
                        onClick={() => downloadShareCard(winner, badgeLabel)}
                        className="flex items-center gap-1 px-3 py-2 bg-gray-800 text-white rounded-lg shadow-sm hover:shadow-md hover:bg-gray-900 transition-all duration-200 text-xs font-medium"
                      >
                        <Download className="w-3 h-3" />
                        Certificate
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          )}


        </div>
      </section>




    </>
  );
};

export default Winners;