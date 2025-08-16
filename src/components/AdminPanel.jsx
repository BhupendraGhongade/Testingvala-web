import React, { useState, useEffect } from 'react';
import { useWebsiteData } from '../hooks/useWebsiteData';
import { supabase, TABLES } from '../lib/supabase';
import { Shield, Save, LogOut, X, Settings, Trophy, Users, Info, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPanel = ({ isOpen, onClose }) => {
  const { data, saveData, loading } = useWebsiteData();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(true);
  const [activeTab, setActiveTab] = useState('contest');
  const [localData, setLocalData] = useState(data);

  // Owner password - you can change this to whatever you want
  const OWNER_PASSWORD = 'Golu@2205';

  // Update local data when backend data changes
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Check if user is already authenticated (session storage)
  useEffect(() => {
    const isOwner = sessionStorage.getItem('isOwner');
    if (isOwner === 'true') {
      setIsAuthenticated(true);
      setShowPasswordForm(false);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (password === OWNER_PASSWORD) {
      setIsAuthenticated(true);
      setShowPasswordForm(false);
      sessionStorage.setItem('isOwner', 'true');
      
      // Store admin session in database
      try {
        await supabase
          .from(TABLES.ADMIN_SESSIONS)
          .insert({
            session_id: sessionStorage.getItem('isOwner'),
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
          });
      } catch (error) {
        console.error('Error storing admin session:', error);
      }
      
      setPassword('');
      toast.success('Welcome back, Owner!');
    } else {
      toast.error('❌ Access Denied! Only the owner can edit contest information.');
      setPassword('');
    }
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    setShowPasswordForm(true);
    sessionStorage.removeItem('isOwner');
    
    // Remove admin session from database
    try {
      await supabase
        .from(TABLES.ADMIN_SESSIONS)
        .delete()
        .eq('session_id', 'true');
    } catch (error) {
      console.error('Error removing admin session:', error);
    }
    
    onClose();
    toast.success('Logged out successfully');
  };

  const handleSave = async (section) => {
    const success = await saveData(section, localData[section]);
    if (success) {
      // Update local data to match backend
      setLocalData(data);
    }
  };

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
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
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
                activeTab === 'contest' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-600 hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('contest')}
            >
              <Trophy className="w-4 h-4" />
              Contest
            </button>
            <button 
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'hero' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-600 hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('hero')}
            >
              <Users className="w-4 h-4" />
              Hero
            </button>
            <button 
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'winners' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-600 hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('winners')}
            >
              <Trophy className="w-4 h-4" />
              Winners
            </button>
            <button 
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'about' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-600 hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('about')}
            >
              <Info className="w-4 h-4" />
              About
            </button>
            <button 
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'contact' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-600 hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('contact')}
            >
              <Mail className="w-4 h-4" />
              Contact
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Active Now">Active Now</option>
                    <option value="Coming Soon">Coming Soon</option>
                    <option value="Ended">Ended</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={() => handleSave('contest')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Badge Text</label>
                  <input
                    type="text"
                    value={localData.hero.badge}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      hero: {...localData.hero, badge: e.target.value}
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleSave('hero')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Hero Changes
              </button>
            </div>
          )}

          {/* Winners Tab */}
          {activeTab === 'winners' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Previous Winners</h3>
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          value={winner.name}
                          onChange={(e) => updateWinner(index, 'name', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={winner.title}
                          onChange={(e) => updateWinner(index, 'title', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">QA Trick</label>
                        <input
                          type="text"
                          value={winner.trick}
                          onChange={(e) => updateWinner(index, 'trick', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={addWinner}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Add New Winner
                </button>
                <button 
                  onClick={() => handleSave('winners')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Winners Changes
                </button>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">About Section</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={localData.about.description}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      about: {...localData.about, description: e.target.value}
                    })}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Features (one per line)</label>
                  <textarea
                    value={localData.about.features.join('\n')}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      about: {
                        ...localData.about, 
                        features: e.target.value.split('\n').filter(f => f.trim())
                      }
                    })}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Members Count</label>
                  <input
                    type="text"
                    value={localData.about.stats.members}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      about: {
                        ...localData.about, 
                        stats: {...localData.about.stats, members: e.target.value}
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button 
                onClick={() => handleSave('about')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save About Changes
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
                    value={localData.contact.email}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      contact: {...localData.contact, email: e.target.value}
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button 
                onClick={() => handleSave('contact')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Contact Changes
              </button>
            </div>
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
