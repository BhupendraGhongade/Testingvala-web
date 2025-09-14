import React, { useState, useEffect } from 'react';
import { useWebsiteData } from '../hooks/useWebsiteData';
import { Shield, Save, LogOut, X, Settings, Trophy, Users, Info, Mail, Calendar, MessageSquare, BookOpen, Bookmark, Crown } from 'lucide-react';
import EventsManagement from './EventsManagement';
import BoardsManagement from './BoardsManagement';
import PremiumManagement from './PremiumManagement';
import toast from 'react-hot-toast';

const AdminPanel = ({ isOpen, onClose }) => {
  const { data, saveData, saveMultipleSections, loading, refreshData } = useWebsiteData();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  // removed unused showPasswordForm state
  const [activeTab, setActiveTab] = useState('events');
  const [localData, setLocalData] = useState(data);

  // Owner password - you can change this to whatever you want
  const OWNER_PASSWORD = 'Golu@2205';

  // Update local data when backend data changes
  useEffect(() => {
    // Ensure we have default data structure if backend data is missing
    const defaultData = {
      hero: {
        badge: '🚀 Test Your QA Skills. Win Rewards. Build Your Career',
        headline: 'Win Big with Your Testing Expertise',
        subtitle: 'Show off your QA skills in our monthly contest! Share your best testing hacks, automation tricks, and innovative approaches.',
        stats: {
          participants: '500+',
          prizes: '$2,000+',
          support: '24/7'
        }
      },
      contest: {
        title: 'January 2025 QA Contest',
        theme: 'Testing Hacks & Smart Techniques',
        prizes: '1st Place: $500 | 2nd Place: $300 | 3rd Place: $200',
        submission: 'Share your QA trick with detailed explanation and impact',
        deadline: '2025-01-31',
        status: 'Active Now'
      },
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
      about: {
        description: 'TestingVala.com is revolutionizing the QA industry by creating a platform where testing professionals can showcase their skills, learn from each other, and compete for recognition and rewards.',
        features: [
          'Daily QA tips and best practices',
          'Interview preparation resources',
          'Process improvement techniques',
          'Monthly QA contests with prizes'
        ],
        stats: {
          members: '10,000+',
          tips: '500+',
          contests: '12+',
          countries: '50+'
        }
      },
      contact: {
        email: 'info@testingvala.com',
        website: 'www.testingvala.com',
        location: 'Global QA Community'
      }
    };

    // Merge backend data with defaults, ensuring all required sections exist
    const mergedData = { ...defaultData, ...data };
    
    // Ensure winners is always an array
    if (!Array.isArray(mergedData.winners)) {
      mergedData.winners = defaultData.winners;
    }
    
    // Ensure all nested objects exist
    if (!mergedData.hero?.stats) {
      mergedData.hero = { ...defaultData.hero, ...mergedData.hero };
    }
    if (!mergedData.about?.stats) {
      mergedData.about = { ...defaultData.about, ...mergedData.about };
    }
    
    setLocalData(mergedData);
  }, [data]);

  // Check if user is already authenticated (session storage)
  useEffect(() => {
    const isOwner = sessionStorage.getItem('isOwner');
    if (isOwner === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (password === OWNER_PASSWORD) {
  setIsAuthenticated(true);
      sessionStorage.setItem('isOwner', 'true');
      setPassword('');
      toast.success('Welcome back, Owner!');
    } else {
      toast.error('❌ Access Denied! Only the owner can edit contest information.');
      setPassword('');
    }
  };

  const handleLogout = async () => {
  setIsAuthenticated(false);
    sessionStorage.removeItem('isOwner');
    onClose();
    toast.success('Logged out successfully');
  };

  const handleSave = async (section) => {
    const sectionPayload = localData[section];
    const success = await saveData(section, sectionPayload);
    if (success) {
      // Update local data immediately so UI reflects the change
      setLocalData((prev) => ({ ...prev, [section]: sectionPayload }));
      // Refresh backend-synced data to ensure canonical state
      if (typeof refreshData === 'function') await refreshData();
      toast.success(`${section} saved`);
    }
  };

  const handleSaveMultiple = async (sectionsObj) => {
    try {
      const success = await saveMultipleSections(sectionsObj);
      if (success) {
        // merge updated sections locally
        setLocalData(prev => ({ ...prev, ...sectionsObj }));
        if (typeof refreshData === 'function') await refreshData();
        toast.success('Saved changes');
      }
    } catch (err) {
      console.error('Error saving multiple sections', err);
      toast.error('Failed to save');
    }
  }

  const updateWinner = (index, field, value) => {
    const newWinners = [...localData.winners];
    newWinners[index][field] = value;
    setLocalData({ ...localData, winners: newWinners });
  };

  const addWinner = () => {
    setLocalData({
      ...localData,
      winners: [...localData.winners, {
        name: 'New Winner',
        title: 'New Month Winner',
        trick: 'New QA Trick',
        avatar: '🏆'
      }]
    });
  };

  const removeWinner = (index) => {
    if (localData.winners.length > 1) {
      const newWinners = localData.winners.filter((_, i) => i !== index);
      setLocalData({ ...localData, winners: newWinners });
    }
  };

  if (!isOpen) return null;

  // Show password form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FF6600] to-[#E55A00] rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Owner Access Required</h2>
            <p className="text-gray-600 mt-2">Only the website owner can edit contest information</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter owner password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-[#FF6600] text-white py-3 rounded-lg font-medium hover:bg-[#E55A00] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Access Admin Panel
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-4">💡 Contact the owner if you need access</p>
            <button 
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6600] mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF6600] to-[#E55A00] text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6" />
              <h2 className="text-xl font-bold">Owner Admin Panel - TestingVala</h2>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                👑 Owner Access
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
              <button 
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto">
            <button 
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'contest' ? 'text-[#FF6600] border-b-2 border-[#FF6600] bg-white' : 'text-gray-600 hover:text-[#FF6600]'
              }`}
              onClick={() => setActiveTab('contest')}
            >
              <Trophy className="w-4 h-4" />
              Contest
            </button>
            <button 
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'hero' ? 'text-[#FF6600] border-b-2 border-[#FF6600] bg-white' : 'text-gray-600 hover:text-[#FF6600]'
              }`}
              onClick={() => setActiveTab('hero')}
            >
              <Users className="w-4 h-4" />
              Hero
            </button>
            <button 
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'events' ? 'text-[#FF6600] border-b-2 border-[#FF6600] bg-white' : 'text-gray-600 hover:text-[#FF6600]'
              }`}
              onClick={() => setActiveTab('events')}
            >
              <Calendar className="w-4 h-4" />
              Events
            </button>
            <button 
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'winners' ? 'text-[#FF6600] border-b-2 border-[#FF6600] bg-white' : 'text-gray-600 hover:text-[#FF6600]'
              }`}
              onClick={() => setActiveTab('winners')}
            >
              <Trophy className="w-4 h-4" />
              Winners
            </button>
            <button 
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'about' ? 'text-[#FF6600] border-b-2 border-[#FF6600] bg-white' : 'text-gray-600 hover:text-[#FF6600]'
              }`}
              onClick={() => setActiveTab('about')}
            >
              <Info className="w-4 h-4" />
              About
            </button>
            <button 
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'contact' ? 'text-[#FF6600] border-b-2 border-[#FF6600] bg-white' : 'text-gray-600 hover:text-[#FF6600]'
              }`}
              onClick={() => setActiveTab('contact')}
            >
              <Mail className="w-4 h-4" />
              Contact
            </button>

            <button 
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'categories' ? 'text-[#FF6600] border-b-2 border-[#FF6600] bg-white' : 'text-gray-600 hover:text-[#FF6600]'
              }`}
              onClick={() => setActiveTab('categories')}
            >
              <BookOpen className="w-4 h-4" />
              Categories
            </button>
            <button 
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'messages' ? 'text-[#FF6600] border-b-2 border-[#FF66000] bg-white' : 'text-gray-600 hover:text-[#FF6600]'
              }`}
              onClick={() => setActiveTab('messages')}
            >
              <Mail className="w-4 h-4" />
              Messages
            </button>
            <button 
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'boards' ? 'text-[#FF6600] border-b-2 border-[#FF6600] bg-white' : 'text-gray-600 hover:text-[#FF6600]'
              }`}
              onClick={() => setActiveTab('boards')}
            >
              <Bookmark className="w-4 h-4" />
              Boards
            </button>
            <button 
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'footer' ? 'text-[#FF6600] border-b-2 border-[#FF6600] bg-white' : 'text-gray-600 hover:text-[#FF6600]'
              }`}
              onClick={() => setActiveTab('footer')}
            >
              <Info className="w-4 h-4" />
              Footer
            </button>
            <button 
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'premium' ? 'text-[#FF6600] border-b-2 border-[#FF6600] bg-white' : 'text-gray-600 hover:text-[#FF6600]'
              }`}
              onClick={() => setActiveTab('premium')}
            >
              <Crown className="w-4 h-4" />
              Premium
            </button>
          </div>
        </div>

        {/* Content */}
  <div className="p-6 overflow-y-auto max-h-[70vh] sm:max-h-[80vh]">
          {/* Contest Tab */}
          {activeTab === 'contest' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Contest Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contest Title</label>
                  <input
                    type="text"
                    value={localData.contest.title}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      contest: {...localData.contest, title: e.target.value}
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <input
                    type="text"
                    value={localData.contest.theme}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      contest: {...localData.contest, theme: e.target.value}
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prizes</label>
                  <textarea
                    value={localData.contest.prizes}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      contest: {...localData.contest, prizes: e.target.value}
                    })}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prize Breakdown (one per line)</label>
                  <textarea
                    value={(localData.contest.prize_breakdown || []).join('\n')}
                    onChange={(e) => setLocalData({
                      ...localData,
                      contest: { ...localData.contest, prize_breakdown: e.target.value.split('\n').filter(Boolean) }
                    })}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={localData.contest.description}
                    onChange={(e) => setLocalData({ ...localData, contest: { ...localData.contest, description: e.target.value } })}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Submission Format</label>
                  <input
                    type="text"
                    value={localData.contest.submission_format || ''}
                    onChange={(e) => setLocalData({ ...localData, contest: { ...localData.contest, submission_format: e.target.value } })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Judging Criteria</label>
                  <input
                    type="text"
                    value={localData.contest.judging_criteria || ''}
                    onChange={(e) => setLocalData({ ...localData, contest: { ...localData.contest, judging_criteria: e.target.value } })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rules (one per line)</label>
                  <textarea
                    value={(localData.contest.rules || []).join('\n')}
                    onChange={(e) => setLocalData({ ...localData, contest: { ...localData.contest, rules: e.target.value.split('\n').filter(Boolean) } })}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Judges (JSON array of objects with name and title)</label>
                  <textarea
                    value={JSON.stringify(localData.contest.judges || [], null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setLocalData({ ...localData, contest: { ...localData.contest, judges: parsed } });
                      } catch {
                        // ignore parsing errors while typing
                        setLocalData({ ...localData, contest: { ...localData.contest, judges: localData.contest.judges || [] } });
                      }
                    }}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    value={localData.contest.image_url || ''}
                    onChange={(e) => setLocalData({ ...localData, contest: { ...localData.contest, image_url: e.target.value } })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={!!localData.contest.visible} onChange={(e) => setLocalData({ ...localData, contest: { ...localData.contest, visible: e.target.checked } })} />
                    <span className="text-sm">Visible on site</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Submission Guidelines</label>
                  <textarea
                    value={localData.contest.submission}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      contest: {...localData.contest, submission: e.target.value}
                    })}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">External Submission / Form Link (optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={localData.contest.form_link || ''}
                      onChange={(e) => setLocalData({
                        ...localData,
                        contest: { ...localData.contest, form_link: e.target.value }
                      })}
                      placeholder="https://docs.google.com/forms/..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setLocalData({ ...localData, contest: { ...localData.contest, form_link: '' } })}
                      className="px-4 py-3 bg-red-50 text-red-700 border border-red-100 rounded-lg hover:bg-red-100"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">If provided, the public contest CTA will open this link instead of the default Google Form.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                  <input
                    type="date"
                    value={localData.contest.deadline}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      contest: {...localData.contest, deadline: e.target.value}
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={localData.contest.status}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      contest: {...localData.contest, status: e.target.value}
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  >
                    <option value="Active Now">Active Now</option>
                    <option value="Coming Soon">Coming Soon</option>
                    <option value="Ended">Ended</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={() => handleSave('contest')}
                className="bg-[#FF6600] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#E55A00] transition-all duration-200 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Contest Changes
              </button>
            </div>
          )}

          {/* Hero Tab */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Hero Section</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Main Headline</label>
                  <input
                    type="text"
                    value={localData.hero.headline}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      hero: {...localData.hero, headline: e.target.value}
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                  <textarea
                    value={localData.hero.subtitle}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      hero: {...localData.hero, subtitle: e.target.value}
                    })}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  />
                </div>
                {/* Badge text removed by request */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Participants Count</label>
                    <input
                      type="text"
                      value={localData.hero.stats.participants}
                      onChange={(e) => setLocalData({
                        ...localData, 
                        hero: {
                          ...localData.hero, 
                          stats: {...localData.hero.stats, participants: e.target.value}
                        }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Prizes</label>
                    <input
                      type="text"
                      value={localData.hero.stats.prizes}
                      onChange={(e) => setLocalData({
                        ...localData, 
                        hero: {
                          ...localData.hero, 
                          stats: {...localData.hero.stats, prizes: e.target.value}
                        }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleSave('hero')}
                className="bg-[#FF6600] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#E55A00] transition-all duration-200 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Hero Changes
              </button>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <EventsManagement />
          )}



          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Category Management</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">Current Categories</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <h5 className="font-medium text-gray-900 mb-2">Manual Testing</h5>
                    <p className="text-sm text-gray-600">Learn manual testing techniques, test case design, and exploratory testing strategies.</p>
                    <div className="mt-2 text-xs text-blue-600">2.5k+ posts</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <h5 className="font-medium text-gray-900 mb-2">Automation</h5>
                    <p className="text-sm text-gray-600">Master test automation frameworks, tools, and best practices for efficient testing.</p>
                    <div className="mt-2 text-xs text-blue-600">3.2k+ posts</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <h5 className="font-medium text-gray-900 mb-2">Tools & Technologies</h5>
                    <p className="text-sm text-gray-600">Explore testing tools, CI/CD integration, and technology stack discussions.</p>
                    <div className="mt-2 text-xs text-blue-600">1.8k+ posts</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <h5 className="font-medium text-gray-900 mb-2">Career & Growth</h5>
                    <p className="text-sm text-gray-600">Career advice, interview preparation, and professional development for QA engineers.</p>
                    <div className="mt-2 text-xs text-blue-600">1.2k+ posts</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <h5 className="font-medium text-gray-900 mb-2">Best Practices</h5>
                    <p className="text-sm text-gray-600">Industry best practices, methodologies, and quality assurance standards.</p>
                    <div className="mt-2 text-xs text-blue-600">2.1k+ posts</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Category Features</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Interactive category cards with icons and stats</li>
                  <li>• Popular topics for each category</li>
                  <li>• Community overview statistics</li>
                  <li>• Easy navigation for new users</li>
                  <li>• Professional color-coded design</li>
                </ul>
              </div>
            </div>
          )}

          {/* Winners Tab */}
          {activeTab === 'winners' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Previous Winners</h3>
              {!localData?.winners || !Array.isArray(localData.winners) ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">No winners data available</div>
                  <button 
                    onClick={() => {
                      const defaultWinners = [
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
                      ];
                      setLocalData({ ...localData, winners: defaultWinners });
                    }}
                    className="bg-[#FF6600] text-white px-4 py-2 rounded-lg hover:bg-[#E55A00] transition-colors"
                  >
                    Load Default Winners
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {localData.winners.map((winner, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-900">Winner {index + 1}</h4>
                      <button 
                        onClick={() => removeWinner(index)}
                        disabled={localData.winners.length <= 1}
                        className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                        <input
                          type="text"
                          value={winner.avatar}
                          onChange={(e) => updateWinner(index, 'avatar', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          value={winner.name}
                          onChange={(e) => updateWinner(index, 'name', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={winner.title}
                          onChange={(e) => updateWinner(index, 'title', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">QA Trick</label>
                        <input
                          type="text"
                          value={winner.trick}
                          onChange={(e) => updateWinner(index, 'trick', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              )}
              <div className="flex gap-4">
                <button 
                  onClick={addWinner}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Add New Winner
                </button>
                <button 
                  onClick={() => handleSave('winners')}
                  className="bg-[#FF6600] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#E55A00] transition-all duration-200 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Winners Changes
                </button>
              </div>
            </div>
          )}

          {/* sponsors removed from admin */}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">About Section</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={localData.about.title || ''}
                      onChange={(e) => setLocalData({ ...localData, about: { ...localData.about, title: e.target.value } })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                    <input
                      type="text"
                      value={localData.about.tagline || ''}
                      onChange={(e) => setLocalData({ ...localData, about: { ...localData.about, tagline: e.target.value } })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={localData.about.description || ''}
                      onChange={(e) => setLocalData({ ...localData, about: { ...localData.about, description: e.target.value } })}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Features (one per line)</label>
                    <textarea
                      value={(localData.about.features || []).join('\n')}
                      onChange={(e) => setLocalData({ ...localData, about: { ...localData.about, features: e.target.value.split('\n').filter(f => f.trim()) } })}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Members</label>
                      <input
                        type="text"
                        value={(localData.about.stats && localData.about.stats.members) || ''}
                        onChange={(e) => setLocalData({ ...localData, about: { ...localData.about, stats: { ...localData.about.stats, members: e.target.value } } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tips</label>
                      <input
                        type="text"
                        value={(localData.about.stats && localData.about.stats.tips) || ''}
                        onChange={(e) => setLocalData({ ...localData, about: { ...localData.about, stats: { ...localData.about.stats, tips: e.target.value } } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contests</label>
                      <input
                        type="text"
                        value={(localData.about.stats && localData.about.stats.contests) || ''}
                        onChange={(e) => setLocalData({ ...localData, about: { ...localData.about, stats: { ...localData.about.stats, contests: e.target.value } } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Countries</label>
                      <input
                        type="text"
                        value={(localData.about.stats && localData.about.stats.countries) || ''}
                        onChange={(e) => setLocalData({ ...localData, about: { ...localData.about, stats: { ...localData.about.stats, countries: e.target.value } } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary CTA Label</label>
                      <input
                        type="text"
                        value={(localData.about.cta && localData.about.cta.primary && localData.about.cta.primary.label) || ''}
                        onChange={(e) => setLocalData({ ...localData, about: { ...localData.about, cta: { ...(localData.about.cta || {}), primary: { ...(localData.about.cta?.primary || {}), label: e.target.value } } } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary CTA URL</label>
                      <input
                        type="text"
                        value={(localData.about.cta && localData.about.cta.primary && localData.about.cta.primary.href) || ''}
                        onChange={(e) => setLocalData({ ...localData, about: { ...localData.about, cta: { ...(localData.about.cta || {}), primary: { ...(localData.about.cta?.primary || {}), href: e.target.value } } } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Secondary CTA Label</label>
                      <input
                        type="text"
                        value={(localData.about.cta && localData.about.cta.secondary && localData.about.cta.secondary.label) || ''}
                        onChange={(e) => setLocalData({ ...localData, about: { ...localData.about, cta: { ...(localData.about.cta || {}), secondary: { ...(localData.about.cta?.secondary || {}), label: e.target.value } } } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Secondary CTA URL</label>
                      <input
                        type="text"
                        value={(localData.about.cta && localData.about.cta.secondary && localData.about.cta.secondary.href) || ''}
                        onChange={(e) => setLocalData({ ...localData, about: { ...localData.about, cta: { ...(localData.about.cta || {}), secondary: { ...(localData.about.cta?.secondary || {}), href: e.target.value } } } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleSave('about')}
                      className="bg-[#FF6600] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#E55A00] transition-all duration-200 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save About Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Reset to default about section from backend by refreshing
                        if (typeof refreshData === 'function') refreshData();
                        toast.success('Reloaded content from backend');
                      }}
                      className="px-6 py-3 rounded-lg border border-gray-200"
                    >
                      Reset from server
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="lg:col-span-1 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <h4 className="text-lg font-bold text-gray-900">Preview</h4>
                  <div className="mt-3">
                    <div className="text-xl font-extrabold text-gray-900">{localData.about.title || 'About TestingVala'}</div>
                    <div className="text-sm text-gray-600 mt-1">{localData.about.tagline}</div>
                    <p className="text-sm text-gray-700 mt-3">{localData.about.description}</p>
                    <ul className="mt-3 space-y-1 text-sm text-gray-600">
                      {(localData.about.features || []).slice(0,5).map((f, i) => (
                        <li key={i}>• {f}</li>
                      ))}
                    </ul>
                    <div className="mt-4 text-sm text-gray-500">
                      <div><strong>Members:</strong> {localData.about.stats?.members}</div>
                      <div><strong>Tips:</strong> {localData.about.stats?.tips}</div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {localData.about.cta?.primary?.label && (
                        <a href={localData.about.cta.primary.href || '#'} className="px-3 py-2 bg-[#FF6600] text-white rounded-md text-sm">{localData.about.cta.primary.label}</a>
                      )}
                      {localData.about.cta?.secondary?.label && (
                        <a href={localData.about.cta.secondary.href || '#'} className="px-3 py-2 border rounded-md text-sm">{localData.about.cta.secondary.label}</a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={localData.contact.email}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      contact: {...localData.contact, email: e.target.value}
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="text"
                    value={localData.contact.website}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      contact: {...localData.contact, website: e.target.value}
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={localData.contact.location}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      contact: {...localData.contact, location: e.target.value}
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
                  <input
                    type="url"
                    value={localData.contact.socialMedia.instagram}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      contact: {
                        ...localData.contact, 
                        socialMedia: {...localData.contact.socialMedia, instagram: e.target.value}
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
                  <input
                    type="url"
                    value={localData.contact.socialMedia.youtube}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      contact: {
                        ...localData.contact, 
                        socialMedia: {...localData.contact.socialMedia, youtube: e.target.value}
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twitter URL</label>
                  <input
                    type="url"
                    value={localData.contact.socialMedia.twitter}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      contact: {
                        ...localData.contact, 
                        socialMedia: {...localData.contact.socialMedia, twitter: e.target.value}
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                  <input
                    type="url"
                    value={localData.contact.socialMedia.linkedin}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      contact: {
                        ...localData.contact, 
                        socialMedia: {...localData.contact.socialMedia, linkedin: e.target.value}
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  />
                </div>
              </div>
              <button 
                onClick={() => handleSave('contact')}
                className="bg-[#FF6600] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#E55A00] transition-all duration-200 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Contact Changes
              </button>
            </div>
          )}

          {/* Footer Tab */}
          {activeTab === 'footer' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Footer</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
                    <input
                      type="text"
                      value={localData.footer?.brand?.name || ''}
                      onChange={(e) => setLocalData({ ...localData, footer: { ...localData.footer, brand: { ...localData.footer?.brand, name: e.target.value } } })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                    <input
                      type="text"
                      value={localData.footer?.brand?.tagline || ''}
                      onChange={(e) => setLocalData({ ...localData, footer: { ...localData.footer, brand: { ...localData.footer?.brand, tagline: e.target.value } } })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={localData.footer?.description || ''}
                      onChange={(e) => setLocalData({ ...localData, footer: { ...localData.footer, description: e.target.value } })}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                      <input
                        type="email"
                        value={localData.footer?.contact?.email || ''}
                        onChange={(e) => setLocalData({ ...localData, footer: { ...localData.footer, contact: { ...localData.footer?.contact, email: e.target.value } } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                      <input
                        type="text"
                        value={localData.footer?.contact?.phone || ''}
                        onChange={(e) => setLocalData({ ...localData, footer: { ...localData.footer, contact: { ...localData.footer?.contact, phone: e.target.value } } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quick Links</label>
                    <div className="space-y-3">
                      {(localData.footer?.quickLinks || []).map((l, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Label"
                            value={l.label}
                            onChange={(e) => {
                              const updated = (localData.footer?.quickLinks || []).map((it, i) => i === idx ? { ...it, label: e.target.value } : it)
                              setLocalData({ ...localData, footer: { ...localData.footer, quickLinks: updated } })
                            }}
                            className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="/path or https://..."
                            value={l.href}
                            onChange={(e) => {
                              const updated = (localData.footer?.quickLinks || []).map((it, i) => i === idx ? { ...it, href: e.target.value } : it)
                              setLocalData({ ...localData, footer: { ...localData.footer, quickLinks: updated } })
                            }}
                            className="col-span-6 px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (localData.footer?.quickLinks || []).filter((_, i) => i !== idx)
                              setLocalData({ ...localData, footer: { ...localData.footer, quickLinks: updated } })
                            }}
                            className="col-span-1 px-2 py-1 text-sm bg-red-50 text-red-700 rounded-md"
                          >Remove</button>
                        </div>
                      ))}
                      <div>
                        <button
                          type="button"
                          onClick={() => setLocalData({ ...localData, footer: { ...localData.footer, quickLinks: [ ...(localData.footer?.quickLinks || []), { label: 'New Link', href: '#' } ] } })}
                          className="px-3 py-2 bg-green-50 text-green-700 rounded-md text-sm"
                        >+ Add Link</button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resources</label>
                    <div className="space-y-3">
                      {(localData.footer?.resources || []).map((r, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Label"
                            value={r.label}
                            onChange={(e) => {
                              const updated = (localData.footer?.resources || []).map((it, i) => i === idx ? { ...it, label: e.target.value } : it)
                              setLocalData({ ...localData, footer: { ...localData.footer, resources: updated } })
                            }}
                            className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="/path or https://..."
                            value={r.href}
                            onChange={(e) => {
                              const updated = (localData.footer?.resources || []).map((it, i) => i === idx ? { ...it, href: e.target.value } : it)
                              setLocalData({ ...localData, footer: { ...localData.footer, resources: updated } })
                            }}
                            className="col-span-6 px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (localData.footer?.resources || []).filter((_, i) => i !== idx)
                              setLocalData({ ...localData, footer: { ...localData.footer, resources: updated } })
                            }}
                            className="col-span-1 px-2 py-1 text-sm bg-red-50 text-red-700 rounded-md"
                          >Remove</button>
                        </div>
                      ))}
                      <div>
                        <button
                          type="button"
                          onClick={() => setLocalData({ ...localData, footer: { ...localData.footer, resources: [ ...(localData.footer?.resources || []), { label: 'New Resource', href: '#' } ] } })}
                          className="px-3 py-2 bg-green-50 text-green-700 rounded-md text-sm"
                        >+ Add Resource</button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Twitter URL</label>
                      <input
                        type="url"
                        value={localData.footer?.socialMedia?.twitter || ''}
                        onChange={(e) => setLocalData({ ...localData, footer: { ...localData.footer, socialMedia: { ...localData.footer?.socialMedia, twitter: e.target.value } } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                      <input
                        type="url"
                        value={localData.footer?.socialMedia?.linkedin || ''}
                        onChange={(e) => setLocalData({ ...localData, footer: { ...localData.footer, socialMedia: { ...localData.footer?.socialMedia, linkedin: e.target.value } } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
                      <input
                        type="url"
                        value={localData.footer?.socialMedia?.youtube || ''}
                        onChange={(e) => setLocalData({ ...localData, footer: { ...localData.footer, socialMedia: { ...localData.footer?.socialMedia, youtube: e.target.value } } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
                      <input
                        type="url"
                        value={localData.footer?.socialMedia?.instagram || ''}
                        onChange={(e) => setLocalData({ ...localData, footer: { ...localData.footer, socialMedia: { ...localData.footer?.socialMedia, instagram: e.target.value } } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Copyright Text</label>
                    <input
                      type="text"
                      value={localData.footer?.copyright || ''}
                      onChange={(e) => setLocalData({ ...localData, footer: { ...localData.footer, copyright: e.target.value } })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleSaveMultiple({ footer: localData.footer, contact: localData.contact })}
                      className="bg-[#FF6600] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#E55A00] transition-all duration-200 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Footer & Contact
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof refreshData === 'function') refreshData();
                        toast.success('Reloaded content from backend');
                      }}
                      className="px-6 py-3 rounded-lg border border-gray-200"
                    >
                      Reset from server
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-1 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <h4 className="text-lg font-bold text-gray-900">Preview</h4>
                  <div className="mt-3 text-sm text-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-[#E55A00] rounded-md flex items-center justify-center text-white font-bold">{localData.footer?.brand?.logoLetter || 'T'}</div>
                      <div>
                        <div className="font-semibold text-gray-900">{localData.footer?.brand?.name}</div>
                        <div className="text-xs text-gray-500">{localData.footer?.brand?.tagline}</div>
                      </div>
                    </div>
                      <p className="mt-3 text-gray-600">{localData.footer?.description}</p>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-500">
                        <div>
                          <div className="font-medium text-gray-700">Contact</div>
                          <div>{localData.footer?.contact?.email}</div>
                          <div>{localData.footer?.contact?.phone}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">Quick Links</div>
                          <ul className="mt-1 space-y-1">
                            {(localData.footer?.quickLinks || []).slice(0,5).map((q, i) => (
                              <li key={i} className="text-gray-600">• {q.label}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        {(localData.footer?.socialMedia?.twitter) && <a href={localData.footer.socialMedia.twitter} className="text-sm text-gray-500">Twitter</a>}
                        {(localData.footer?.socialMedia?.linkedin) && <a href={localData.footer.socialMedia.linkedin} className="text-sm text-gray-500">LinkedIn</a>}
                        {(localData.footer?.socialMedia?.youtube) && <a href={localData.footer.socialMedia.youtube} className="text-sm text-gray-500">YouTube</a>}
                      </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Boards Tab */}
          {activeTab === 'boards' && (
            <BoardsManagement />
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Contact Messages</h3>
              {!localData?.messages || localData.messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No messages yet</div>
              ) : (
                <div className="space-y-4">
                  {localData.messages.map((msg, idx) => (
                    <div key={msg.id || idx} className={`p-4 rounded-lg border ${msg.read ? 'bg-white border-gray-200' : 'bg-yellow-50 border-yellow-200'}`}>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="font-semibold text-gray-900">{msg.name || 'Anonymous'}</div>
                            <div className="text-sm text-gray-500">• {new Date(msg.created_at).toLocaleString()}</div>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{msg.email}</div>
                          <div className="mt-3 font-medium">{msg.subject}</div>
                          <div className="mt-2 text-gray-700 whitespace-pre-wrap">{msg.message}</div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={async () => {
                              const updated = localData.messages.map(m => m.id === msg.id ? { ...m, read: !m.read } : m)
                              setLocalData({ ...localData, messages: updated })
                              try {
                                await saveData('messages', updated)
                                toast.success(msg.read ? 'Marked unread' : 'Marked read')
                              } catch (e) {
                                console.error('Error saving read state', e)
                                toast.error('Failed to update')
                              }
                            }}
                            className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm"
                          >
                            {msg.read ? 'Mark Unread' : 'Mark Read'}
                          </button>
                          <button
                            onClick={async () => {
                              const updated = localData.messages.filter(m => m.id !== msg.id)
                              setLocalData({ ...localData, messages: updated })
                              try {
                                await saveData('messages', updated)
                                toast.success('Message deleted')
                              } catch (e) {
                                console.error('Error deleting message', e)
                                toast.error('Failed to delete')
                              }
                            }}
                            className="px-3 py-1 rounded-lg bg-red-50 text-red-700 text-sm"
                          >
                            Hard Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-4">
                    <button
                      onClick={() => saveData('messages', localData.messages)}
                      className="bg-[#FF6600] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#E55A00] transition-all duration-200 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Messages
                    </button>

                    <button
                      onClick={() => {
                        const updated = (localData.messages || []).map(m => ({ ...m, read: true }))
                        setLocalData({ ...localData, messages: updated })
                      }}
                      className="px-6 py-3 rounded-lg border border-gray-200"
                    >
                      Mark all read
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Premium Tab */}
          {activeTab === 'premium' && (
            <PremiumManagement />
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <div className="text-center text-sm text-gray-600">
            <p>👑 Owner Access: All changes are saved to secure cloud database</p>
            <p>🔐 Session expires when you close the browser or logout</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
