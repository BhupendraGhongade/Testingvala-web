import React, { useState, useEffect } from 'react';
import { X, Send, Image as ImageIcon, AlertCircle, User, Eye, EyeOff, Award, Briefcase, Globe, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useGlobalData } from '../contexts/GlobalDataContext';
import AuthModal from './AuthModal';
import CategoryDropdown from './CategoryDropdown';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const { user, isVerified, loading: authLoading } = useAuth();
  const { addPost } = useGlobalData();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    image_url: '',
    author_name: '',
    experience_years: '',
    is_anonymous: false,
    visibility: 'public' // public, community, private
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      // Reset form when modal opens
      setFormData({
        title: '',
        content: '',
        category_id: '',
        image_url: '',
        author_name: user?.email?.split('@')[0] || '',
        experience_years: '',
        is_anonymous: false,
        visibility: 'public'
      });
      setDragActive(false);
      setPreviewMode(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && (!user || !isVerified)) {
      setShowAuthModal(true);
    }
  }, [isOpen, user, isVerified]);



  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([
        { id: 'general-discussion', name: 'General Discussion' },
        { id: 'manual-testing', name: 'Manual Testing' },
        { id: 'automation-testing', name: 'Automation Testing' },
        { id: 'api-testing', name: 'API Testing' },
        { id: 'performance-load-testing', name: 'Performance & Load Testing' },
        { id: 'security-testing', name: 'Security Testing' },
        { id: 'mobile-testing', name: 'Mobile Testing' },
        { id: 'interview-preparation', name: 'Interview Preparation' },
        { id: 'certifications-courses', name: 'Certifications & Courses' },
        { id: 'career-guidance', name: 'Career Guidance' },
        { id: 'freshers-beginners', name: 'Freshers & Beginners' },
        { id: 'test-management-tools', name: 'Test Management Tools' },
        { id: 'cicd-devops', name: 'CI/CD & DevOps' },
        { id: 'bug-tracking', name: 'Bug Tracking' },
        { id: 'ai-in-testing', name: 'AI in Testing' },
        { id: 'job-openings-referrals', name: 'Job Openings & Referrals' },
        { id: 'testing-contests-challenges', name: 'Testing Contests & Challenges' },
        { id: 'best-practices-processes', name: 'Best Practices & Processes' },
        { id: 'community-helpdesk', name: 'Community Helpdesk' },
        { id: 'events-meetups', name: 'Events & Meetups' }
      ]);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }
    
    setImageUploading(true);
    try {
      // Create a data URL for the image (fallback approach)
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, image_url: e.target.result }));
        toast.success('Image uploaded successfully!');
        setImageUploading(false);
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
        setImageUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload image');
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Enforce authentication and verification
    if (!user || !isVerified) {
      toast.error('Please sign in and verify your email to create a post');
      setShowAuthModal(true);
      return;
    }

    if (!formData.title.trim() || !formData.content.trim() || !formData.category_id) {
      toast.error('Please fill in all required fields including category');
      return;
    }

    setLoading(true);
    try {
      const displayName = formData.is_anonymous ? 'Anonymous' : 
                         (formData.author_name.trim() || user.email?.split('@')[0] || 'Anonymous');
      
      const selectedCategory = categories.find(cat => cat.id === formData.category_id);
      
      const newPost = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category_id: formData.category_id,
        category_name: selectedCategory?.name || 'General Discussion',
        image_url: formData.image_url || null,
        user_id: user.id,
        author_name: displayName,
        experience_years: formData.experience_years || null,
        is_anonymous: formData.is_anonymous,
        visibility: formData.visibility,
        likes_count: 0,
        replies_count: 0,
        status: 'active',
        created_at: new Date().toISOString()
      };

      const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
      
      // Use existing bulletproof post store system
      const createdPost = addPost(newPost);
      
      // In production, save ONLY to Supabase (no localStorage)
      if (isProduction) {
        try {
          const { data, error } = await supabase
            .from('forum_posts')
            .insert([newPost])
            .select()
            .single();
          
          if (error) {
            throw new Error(`Supabase save failed: ${error.message}`);
          } else {
            console.log('Post saved to Supabase database only');
            // Clear localStorage in production to prevent mixing
            localStorage.removeItem('testingvala_posts');
          }
        } catch (dbError) {
          console.error('Database save failed in production:', dbError);
          throw dbError; // Fail the operation in production if DB fails
        }
      } else {
        console.log('Development mode: Post saved to localStorage only');
      }
      
      if (createdPost) {
        toast.success('✅ Post created successfully!');
        setFormData({ 
          title: '', 
          content: '', 
          category_id: '', 
          image_url: '',
          author_name: '',
          experience_years: '',
          is_anonymous: false,
          visibility: 'public'
        });
        onClose();
        
        if (onPostCreated) {
          onPostCreated();
        }
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col mx-2 sm:mx-0">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-gradient-to-r from-[#FF6600] to-[#E55A00]">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-white truncate">Create New Post</h3>
              <p className="text-orange-100 text-xs sm:text-sm hidden sm:block">Share your QA expertise with the community</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-xs sm:text-sm font-medium"
              >
                {previewMode ? <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> : <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />}
                <span className="hidden sm:inline">{previewMode ? 'Edit' : 'Preview'}</span>
              </button>
              <button onClick={onClose} className="text-white hover:text-orange-200 p-1 sm:p-2">
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {previewMode ? (
              /* Preview Mode */
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Post Preview</h4>
                  </div>
                  <p className="text-blue-700 text-sm">This is how your post will appear to the community</p>
                </div>
                
                {/* Preview Content */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#FF6600] to-[#E55A00] rounded-lg flex items-center justify-center text-white font-bold">
                      {formData.is_anonymous ? '?' : (formData.author_name || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {formData.is_anonymous ? 'Anonymous' : (formData.author_name || user?.email?.split('@')[0] || 'User')}
                        </span>
                        {formData.experience_years && (
                          <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full font-medium border border-green-200">
                            {formData.experience_years} • QA
                          </span>
                        )}
                        {formData.visibility === 'private' && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                            <Lock className="w-3 h-3 inline mr-1" />Private
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Just now</span>
                        <span>•</span>
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                          {categories.find(c => c.id === formData.category_id)?.name || 'Select Category'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                    {formData.title || 'Your post title will appear here...'}
                  </h3>
                  
                  {formData.image_url && (
                    <div className="mb-4">
                      <img src={formData.image_url} alt="Post preview" className="max-w-full h-auto rounded-lg border border-gray-200" />
                    </div>
                  )}
                  
                  <div className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {formData.content || 'Your post content will appear here...'}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="w-4 h-4 text-red-400">♥</span> 0 likes
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-4 h-4 text-blue-400">💬</span> 0 comments
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Anonymous Toggle */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <label className="font-medium text-gray-900 text-sm sm:text-base">Post Anonymously</label>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">Hide your identity from other users</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.is_anonymous}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Display Name */}
              {!formData.is_anonymous && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name (Optional)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.author_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm sm:text-base"
                      placeholder={user?.email?.split('@')[0] || 'Your display name'}
                      maxLength={50}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Leave empty to use your email username</p>
                </div>
              )}

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QA Experience (Optional)
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={formData.experience_years}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_years: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent appearance-none bg-white text-sm sm:text-base"
                  >
                    <option value="">Select experience level</option>
                    <option value="< 1 year">Less than 1 year</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5-8 years">5-8 years</option>
                    <option value="8-12 years">8-12 years</option>
                    <option value="12+ years">12+ years</option>
                    <option value="Expert">Expert (15+ years)</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">Help others understand your expertise level</p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <CategoryDropdown
                  categories={categories}
                  selectedCategory={formData.category_id}
                  onCategoryChange={(categoryId) => {
                    setFormData(prev => ({ ...prev, category_id: categoryId }));
                  }}
                  showAllOption={false}
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm sm:text-base"
                  placeholder="What's your QA insight or question?"
                  maxLength={100}
                  required
                />
                <div className="text-xs text-gray-500 mt-1">{formData.title.length}/100</div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent resize-none text-sm sm:text-base"
                  rows={5}
                  placeholder="Share your testing experience, ask questions, or discuss QA best practices..."
                  maxLength={2000}
                  required
                />
                <div className="text-xs text-gray-500 mt-1">{formData.content.length}/2000</div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Add Image (Optional)
                </label>
                
                {formData.image_url ? (
                  <div className="relative mb-4 group">
                    <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 bg-gray-50">
                      <img 
                        src={formData.image_url} 
                        alt="Preview" 
                        className="w-full h-64 object-cover transition-transform group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200"></div>
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))} 
                        className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl opacity-80 hover:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Click X to remove
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <label 
                      className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-[#FF6600] transition-all duration-200 group"
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('border-[#FF6600]', 'bg-orange-50');
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-[#FF6600]', 'bg-orange-50');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-[#FF6600]', 'bg-orange-50');
                        const file = e.dataTransfer.files?.[0];
                        if (file && file.type.startsWith('image/')) {
                          handleImageUpload(file);
                        }
                      }}
                    >
                      <div className="flex flex-col items-center justify-center pt-3 pb-4 sm:pt-5 sm:pb-6">
                        {imageUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#FF6600] mb-2"></div>
                            <p className="text-xs sm:text-sm text-gray-600 font-medium">Uploading image...</p>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#FF6600] bg-opacity-10 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-opacity-20 transition-colors">
                              <ImageIcon className="w-4 h-4 sm:w-6 sm:h-6 text-[#FF6600]" />
                            </div>
                            <p className="mb-1 text-xs sm:text-sm font-semibold text-gray-700 text-center">
                              <span className="text-[#FF6600]">Click to upload</span> <span className="hidden sm:inline">or drag and drop</span>
                            </p>
                            <p className="text-xs text-gray-500 text-center">PNG, JPG, GIF up to 10MB</p>
                          </>
                        )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => { 
                          const file = e.target.files?.[0]; 
                          if (file) handleImageUpload(file); 
                        }} 
                        className="hidden" 
                        disabled={imageUploading}
                      />
                    </label>
                  </div>
                )}
                
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Supports: JPG, PNG, GIF</span>
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <span>Max size: 10MB</span>
                </div>
              </div>



              </form>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t">
            {!previewMode && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-xs">Posts are published immediately</span>
                  </div>
                  {formData.is_anonymous && (
                    <div className="flex items-center gap-1 text-purple-600">
                      <EyeOff className="w-3 h-3" />
                      <span className="text-xs">Anonymous mode active</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {formData.title.length}/100 • {formData.content.length}/2000
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {!previewMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        title: '',
                        content: '',
                        category_id: '',
                        image_url: '',
                        author_name: '',
                        experience_years: '',
                        is_anonymous: false,
                        visibility: 'public'
                      });
                      toast.success('Form cleared');
                    }}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 text-xs sm:text-sm font-medium transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="flex-1 sm:flex-none px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                
                {previewMode ? (
                  <button
                    type="button"
                    onClick={() => setPreviewMode(false)}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <EyeOff className="w-4 h-4" />
                    <span className="hidden sm:inline">Back to Edit</span>
                    <span className="sm:hidden">Edit</span>
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    onClick={handleSubmit}
                    disabled={loading || imageUploading || !user || !isVerified || !formData.title.trim() || !formData.content.trim() || !formData.category_id} 
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-[#FF6600] text-white rounded-lg font-medium hover:bg-[#E55A00] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-lg hover:shadow-xl text-sm"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="hidden sm:inline">Creating...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline">{formData.is_anonymous ? 'Publish Anonymously' : 'Publish Post'}</span>
                        <span className="sm:hidden">Publish</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          onClose();
        }}
        onSuccess={() => {
          setShowAuthModal(false);
          // Modal will re-render with authenticated user
        }}
        action="post"
      />
    </div>
  );
};

export default CreatePostModal;