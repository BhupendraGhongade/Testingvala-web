import React, { useState, useEffect } from 'react';
import { useWebsiteData } from '../hooks/useWebsiteData';
import { Shield, Save, LogOut, X, Settings, Trophy, Users, Info, Mail, Calendar, MessageSquare, BookOpen, Globe, Clock, FileText } from 'lucide-react';
import EventsManagement from './EventsManagement';
import ForumModeration from './ForumModeration';
import ResumeAnalytics from './ResumeAnalytics';
import toast from 'react-hot-toast';

const WebsiteAdminPanel = ({ isOpen, onClose }) => {
  const { data, saveData, saveMultipleSections, loading, refreshData } = useWebsiteData();
  const [activeTab, setActiveTab] = useState('events');
  const [localData, setLocalData] = useState(data);

  // Update local data when backend data changes
  useEffect(() => {
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

    const mergedData = { ...defaultData, ...data };
    
    if (!Array.isArray(mergedData.winners)) {
      mergedData.winners = defaultData.winners;
    }
    
    if (!mergedData.hero?.stats) {
      mergedData.hero = { ...defaultData.hero, ...mergedData.hero };
    }
    if (!mergedData.about?.stats) {
      mergedData.about = { ...defaultData.about, ...mergedData.about };
    }
    
    setLocalData(mergedData);
  }, [data]);

  const handleSave = async (section) => {
    const sectionPayload = localData[section];
    const success = await saveData(section, sectionPayload);
    if (success) {
      setLocalData((prev) => ({ ...prev, [section]: sectionPayload }));
      if (typeof refreshData === 'function') await refreshData();
      toast.success(`${section} saved`);
    }
  };

  const handleSaveMultiple = async (sectionsObj) => {
    try {
      const success = await saveMultipleSections(sectionsObj);
      if (success) {
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
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-primary via-secondary to-orange-600 text-white p-8 rounded-b-3xl shadow-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Globe className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Website Content Manager</h2>
                <p className="text-white/80 text-sm font-medium">Real-time content & configuration</p>
              </div>
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold border border-white/30">
                🎯 Live Editor
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="p-6 pb-0">
          <div className="flex gap-2 p-1 bg-white rounded-xl shadow-sm border border-slate-200 w-fit">
            {[
              { id: 'contest', label: 'Contest', icon: Trophy },
              { id: 'hero', label: 'Hero', icon: Users },
              { id: 'events', label: 'Events', icon: Calendar },
              { id: 'winners', label: 'Winners', icon: Trophy },
              { id: 'about', label: 'About', icon: Info },
              { id: 'contact', label: 'Contact', icon: Mail },
              { id: 'messages', label: 'Messages', icon: MessageSquare },
              { id: 'resumes', label: 'Resumes', icon: FileText },
              { id: 'forum', label: 'Forum', icon: MessageSquare }
            ].map(tab => (
              <button 
                key={tab.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Content */}
        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[600px]">
            {/* Contest Tab */}
            {activeTab === 'contest' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Contest Management</h3>
                  <p className="text-gray-600">Configure monthly contest settings</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                    <input
                      type="text"
                      value={localData.contest?.theme || ''}
                      onChange={(e) => setLocalData({
                        ...localData, 
                        contest: {...(localData.contest || {}), theme: e.target.value}
                      })}
                      placeholder="Testing Hacks & Smart Techniques"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={localData.contest?.status || 'Active Now'}
                      onChange={(e) => setLocalData({
                        ...localData, 
                        contest: {...(localData.contest || {}), status: e.target.value}
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
                  className="bg-[#FF6600] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E55A00] transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
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
                      value={localData.hero?.headline || ''}
                      onChange={(e) => setLocalData({
                        ...localData, 
                        hero: {...(localData.hero || {}), headline: e.target.value}
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                    <textarea
                      value={localData.hero?.subtitle || ''}
                      onChange={(e) => setLocalData({
                        ...localData, 
                        hero: {...(localData.hero || {}), subtitle: e.target.value}
                      })}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Participants Count</label>
                      <input
                        type="text"
                        value={localData.hero?.stats?.participants || ''}
                        onChange={(e) => setLocalData({
                          ...localData, 
                          hero: {
                            ...(localData.hero || {}), 
                            stats: {...(localData.hero?.stats || {}), participants: e.target.value}
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Prizes</label>
                      <input
                        type="text"
                        value={localData.hero?.stats?.prizes || ''}
                        onChange={(e) => setLocalData({
                          ...localData, 
                          hero: {
                            ...(localData.hero || {}), 
                            stats: {...(localData.hero?.stats || {}), prizes: e.target.value}
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleSave('hero')}
                  className="bg-gradient-to-r from-[#FF6600] to-[#E55A00] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-200 transition-all duration-200 flex items-center gap-2 transform hover:scale-105"
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

            {/* Forum Tab */}
            {activeTab === 'forum' && (
              <ForumModeration />
            )}

            {/* Winners Tab - Professional Design */}
            {activeTab === 'winners' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#FF6600] to-[#E55A00] rounded-lg flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      Previous Winners Management
                    </h3>
                    <p className="text-gray-600 mt-1">Manage contest winners displayed on the homepage</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-orange-50 px-4 py-2 rounded-lg border border-blue-200">
                    <span className="text-sm font-semibold text-blue-700">🏆 Hall of Fame Editor</span>
                  </div>
                </div>

                {!localData?.winners || !Array.isArray(localData.winners) ? (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-orange-50 rounded-2xl border border-gray-200">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-8 h-8 text-gray-500" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Winners Data</h4>
                    <p className="text-gray-600 mb-6">Initialize with default winners to get started</p>
                    <button 
                      onClick={() => {
                        const defaultWinners = [
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
                        ];
                        setLocalData({ ...localData, winners: defaultWinners });
                      }}
                      className="bg-gradient-to-r from-[#FF6600] to-[#E55A00] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-200 transition-all duration-200 transform hover:scale-105 flex items-center gap-2 mx-auto"
                    >
                      <Trophy className="w-5 h-5" />
                      Load Default Winners
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {localData.winners.map((winner, index) => {
                      const place = index + 1;
                      const getPlaceStyles = (place) => {
                        switch(place) {
                          case 1: return {
                            gradient: 'from-yellow-400 to-yellow-600',
                            border: 'border-yellow-200',
                            bg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
                            badge: 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          };
                          case 2: return {
                            gradient: 'from-gray-300 to-gray-500',
                            border: 'border-gray-200',
                            bg: 'bg-gradient-to-br from-gray-50 to-slate-50',
                            badge: 'bg-gray-100 text-gray-800 border-gray-200'
                          };
                          case 3: return {
                            gradient: 'from-orange-400 to-orange-600',
                            border: 'border-orange-200',
                            bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
                            badge: 'bg-orange-100 text-orange-800 border-orange-200'
                          };
                          default: return {
                            gradient: 'from-blue-400 to-blue-600',
                            border: 'border-blue-200',
                            bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
                            badge: 'bg-blue-100 text-blue-800 border-blue-200'
                          };
                        }
                      };
                      
                      const placeStyles = getPlaceStyles(place);
                      
                      return (
                        <div key={index} className={`${placeStyles.bg} ${placeStyles.border} border-2 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden`}>
                          {/* Background Pattern */}
                          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                            <div className={`w-full h-full bg-gradient-to-br ${placeStyles.gradient} rounded-full blur-2xl`}></div>
                          </div>
                          
                          <div className="relative">
                            <div className="flex justify-between items-center mb-6">
                              <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 bg-gradient-to-br ${placeStyles.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                                  <span className="text-white font-bold text-lg">{place}</span>
                                </div>
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900">
                                    {place === 1 ? '🥇 1st Place Winner' : place === 2 ? '🥈 2nd Place Winner' : place === 3 ? '🥉 3rd Place Winner' : `${place}th Place Winner`}
                                  </h4>
                                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${placeStyles.badge}`}>
                                    Hall of Fame
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={() => removeWinner(index)}
                                disabled={localData.winners.length <= 1}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                title="Remove winner"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <span className="text-lg">{winner.avatar || '🏆'}</span>
                                    Avatar Emoji
                                  </label>
                                  <input
                                    type="text"
                                    value={winner.avatar}
                                    onChange={(e) => updateWinner(index, 'avatar', e.target.value)}
                                    placeholder="🏆 👑 🥇 🎯"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6600] focus:border-transparent bg-white shadow-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">Winner Name</label>
                                  <input
                                    type="text"
                                    value={winner.name}
                                    onChange={(e) => updateWinner(index, 'name', e.target.value)}
                                    placeholder="Enter winner's full name"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6600] focus:border-transparent bg-white shadow-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">Professional Title</label>
                                  <input
                                    type="text"
                                    value={winner.title}
                                    onChange={(e) => updateWinner(index, 'title', e.target.value)}
                                    placeholder="QA Engineer, Test Automation Expert, etc."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6600] focus:border-transparent bg-white shadow-sm"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Winning QA Innovation</label>
                                <textarea
                                  value={winner.trick}
                                  onChange={(e) => updateWinner(index, 'trick', e.target.value)}
                                  placeholder="Describe the innovative QA technique or approach that won the contest..."
                                  rows={6}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6600] focus:border-transparent bg-white shadow-sm resize-none"
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                  {winner.trick?.length || 0}/500 characters
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button 
                    onClick={addWinner}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-200 transition-all duration-200 transform hover:scale-105"
                  >
                    <Trophy className="w-5 h-5" />
                    Add New Winner
                  </button>
                  <button 
                    onClick={() => handleSave('winners')}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF6600] to-[#E55A00] text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-orange-200 transition-all duration-200 transform hover:scale-105"
                  >
                    <Save className="w-5 h-5" />
                    Save All Changes
                  </button>
                </div>
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">About TestingVala Management</h3>
                  <p className="text-gray-600">Manage the About section content and company information</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={localData.about?.title || 'About TestingVala'}
                        onChange={(e) => setLocalData({ ...localData, about: { ...(localData.about || {}), title: e.target.value } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                      <input
                        type="text"
                        value={localData.about?.subtitle || 'Empowering QA Excellence Worldwide'}
                        onChange={(e) => setLocalData({ ...localData, about: { ...(localData.about || {}), subtitle: e.target.value } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={localData.about?.description || ''}
                        onChange={(e) => setLocalData({ ...localData, about: { ...(localData.about || {}), description: e.target.value } })}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mission Statement</label>
                      <textarea
                        value={localData.about?.mission || ''}
                        onChange={(e) => setLocalData({ ...localData, about: { ...(localData.about || {}), mission: e.target.value } })}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Features (one per line)</label>
                      <textarea
                        value={(localData.about?.features || []).join('\n')}
                        onChange={(e) => setLocalData({ ...localData, about: { ...(localData.about || {}), features: e.target.value.split('\n').filter(f => f.trim()) } })}
                        rows="4"
                        placeholder="Advanced Testing Methodologies\nIndustry-Leading Best Practices\nProfessional Certification Programs\nGlobal Networking Opportunities"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Achievements (one per line)</label>
                      <textarea
                        value={(localData.about?.achievements || []).join('\n')}
                        onChange={(e) => setLocalData({ ...localData, about: { ...(localData.about || {}), achievements: e.target.value.split('\n').filter(f => f.trim()) } })}
                        rows="4"
                        placeholder="Recognized as Top QA Platform 2024\nFeatured in 50+ Industry Publications\nTrusted by Fortune 500 Companies\nAward-Winning Community Platform"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Members</label>
                      <input
                        type="text"
                        value={localData.about?.stats?.members || '25,000+'}
                        onChange={(e) => setLocalData({ ...localData, about: { ...(localData.about || {}), stats: { ...(localData.about?.stats || {}), members: e.target.value } } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Countries</label>
                      <input
                        type="text"
                        value={localData.about?.stats?.countries || '85+'}
                        onChange={(e) => setLocalData({ ...localData, about: { ...(localData.about || {}), stats: { ...(localData.about?.stats || {}), countries: e.target.value } } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contests</label>
                      <input
                        type="text"
                        value={localData.about?.stats?.contests || '50+'}
                        onChange={(e) => setLocalData({ ...localData, about: { ...(localData.about || {}), stats: { ...(localData.about?.stats || {}), contests: e.target.value } } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Companies</label>
                      <input
                        type="text"
                        value={localData.about?.stats?.companies || '1,200+'}
                        onChange={(e) => setLocalData({ ...localData, about: { ...(localData.about || {}), stats: { ...(localData.about?.stats || {}), companies: e.target.value } } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleSave('about')}
                  className="bg-[#FF6600] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E55A00] transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
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
                      value={localData.contact?.email || ''}
                      onChange={(e) => setLocalData({
                        ...localData, 
                        contact: {...(localData.contact || {}), email: e.target.value}
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="text"
                      value={localData.contact?.website || ''}
                      onChange={(e) => setLocalData({
                        ...localData, 
                        contact: {...(localData.contact || {}), website: e.target.value}
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={localData.contact?.location || ''}
                      onChange={(e) => setLocalData({
                        ...localData, 
                        contact: {...(localData.contact || {}), location: e.target.value}
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => handleSave('contact')}
                  className="bg-[#FF6600] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E55A00] transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            )}

            {/* Footer Tab */}
            {activeTab === 'footer' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Footer Management</h3>
                  <p className="text-gray-600">Manage footer content, links, and contact information</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Brand Section */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900">Brand Information</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
                      <input
                        type="text"
                        value={localData.footer?.brand?.name || 'TestingVala'}
                        onChange={(e) => setLocalData({
                          ...localData,
                          footer: {
                            ...(localData.footer || {}),
                            brand: { ...(localData.footer?.brand || {}), name: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                      <input
                        type="text"
                        value={localData.footer?.brand?.tagline || 'Premier QA Excellence Platform'}
                        onChange={(e) => setLocalData({
                          ...localData,
                          footer: {
                            ...(localData.footer || {}),
                            brand: { ...(localData.footer?.brand || {}), tagline: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={localData.footer?.brand?.description || ''}
                        onChange={(e) => setLocalData({
                          ...localData,
                          footer: {
                            ...(localData.footer || {}),
                            brand: { ...(localData.footer?.brand || {}), description: e.target.value }
                          }
                        })}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Contact Section */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900">Contact Information</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={localData.footer?.contact?.email || 'info@testingvala.com'}
                        onChange={(e) => setLocalData({
                          ...localData,
                          footer: {
                            ...(localData.footer || {}),
                            contact: { ...(localData.footer?.contact || {}), email: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="text"
                        value={localData.footer?.contact?.phone || '+1 (555) 123-4567'}
                        onChange={(e) => setLocalData({
                          ...localData,
                          footer: {
                            ...(localData.footer || {}),
                            contact: { ...(localData.footer?.contact || {}), phone: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                      <input
                        type="url"
                        value={localData.footer?.contact?.website || 'https://www.testingvala.com'}
                        onChange={(e) => setLocalData({
                          ...localData,
                          footer: {
                            ...(localData.footer || {}),
                            contact: { ...(localData.footer?.contact || {}), website: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                      <input
                        type="url"
                        value={localData.footer?.socialMedia?.twitter || 'https://twitter.com/testingvala'}
                        onChange={(e) => setLocalData({
                          ...localData,
                          footer: {
                            ...(localData.footer || {}),
                            socialMedia: { ...(localData.footer?.socialMedia || {}), twitter: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                      <input
                        type="url"
                        value={localData.footer?.socialMedia?.linkedin || 'https://www.linkedin.com/company/testingvala'}
                        onChange={(e) => setLocalData({
                          ...localData,
                          footer: {
                            ...(localData.footer || {}),
                            socialMedia: { ...(localData.footer?.socialMedia || {}), linkedin: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
                      <input
                        type="url"
                        value={localData.footer?.socialMedia?.youtube || 'https://www.youtube.com/@TestingvalaOfficial'}
                        onChange={(e) => setLocalData({
                          ...localData,
                          footer: {
                            ...(localData.footer || {}),
                            socialMedia: { ...(localData.footer?.socialMedia || {}), youtube: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                      <input
                        type="url"
                        value={localData.footer?.socialMedia?.instagram || 'https://www.instagram.com/testingvala'}
                        onChange={(e) => setLocalData({
                          ...localData,
                          footer: {
                            ...(localData.footer || {}),
                            socialMedia: { ...(localData.footer?.socialMedia || {}), instagram: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleSave('footer')}
                  className="bg-[#FF6600] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E55A00] transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Footer Changes
                </button>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Contact Messages</h3>
                    <p className="text-gray-600">View and manage messages from website visitors</p>
                  </div>
                  <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                    <span className="text-sm font-semibold text-blue-700">
                      {Array.isArray(localData.messages) ? localData.messages.length : 0} Total Messages
                    </span>
                  </div>
                </div>

                {!Array.isArray(localData.messages) || localData.messages.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Messages Yet</h4>
                    <p className="text-gray-600">Messages from the contact form will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {localData.messages.map((message, index) => (
                      <div key={message.id || index} className={`bg-white rounded-xl p-6 border-2 shadow-sm hover:shadow-md transition-shadow ${
                        message.read ? 'border-gray-200' : 'border-blue-200 bg-blue-50'
                      }`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">{message.name}</h4>
                              {!message.read && (
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                                  New
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Email:</span> {message.email}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Subject:</span> {message.subject}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(message.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!message.read && (
                              <button
                                onClick={() => {
                                  const updatedMessages = [...localData.messages];
                                  updatedMessages[index] = { ...message, read: true };
                                  setLocalData({ ...localData, messages: updatedMessages });
                                  handleSave('messages');
                                }}
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                              >
                                Mark Read
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this message?')) {
                                  const updatedMessages = localData.messages.filter((_, i) => i !== index);
                                  setLocalData({ ...localData, messages: updatedMessages });
                                  handleSave('messages');
                                }
                              }}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 leading-relaxed">{message.message}</p>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <a
                            href={`mailto:${message.email}?subject=Re: ${message.subject}`}
                            className="px-4 py-2 bg-[#FF6600] text-white rounded-lg hover:bg-[#E55A00] transition-colors text-sm font-medium"
                          >
                            Reply via Email
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Resume Analytics Tab */}
            {activeTab === 'resumes' && (
              <ResumeAnalytics />
            )}
          </div>
        </div>
        
        {/* Enhanced Footer */}
        <div className="p-6">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-4">
            <div className="text-center text-sm text-slate-600">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Live sync enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-500" />
                  <span>Secure cloud storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Auto-save active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteAdminPanel;