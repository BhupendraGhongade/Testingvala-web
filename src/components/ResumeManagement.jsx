import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Search, Filter, Download, Share2, Eye, Edit3, Trash2, 
  Copy, Clock, Star, Users, BarChart3, MessageSquare, History, Settings,
  Globe, Lock, ChevronDown, ChevronRight, Calendar, User, Zap, Crown,
  ExternalLink, RefreshCw, Archive, BookOpen, Target, Award, FolderOpen, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from './ConfirmationModal';
import { 
  getUserResumes, deleteResume, getResumeVersions, shareResume, 
  getResumeShares, revokeResumeShare, getResumeAnalytics, 
  trackResumeEvent, calculateResumeCompleteness, generateResumePreview,
  loadDraft, deleteDraft
} from '../lib/supabase';

const ResumeManagement = ({ userEmail, onCreateNew, onEditResume, isOpen, onClose }) => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [selectedResume, setSelectedResume] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [hasDraft, setHasDraft] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  // Load resumes and check for drafts
  useEffect(() => {
    loadResumes();
    checkForDrafts();
  }, [userEmail]);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const data = await getUserResumes(userEmail);
      setResumes(data);
    } catch (error) {
      console.error('Error loading resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const checkForDrafts = async () => {
    try {
      const draft = await loadDraft(userEmail);
      setHasDraft(!!draft);
    } catch (error) {
      console.error('Error checking drafts:', error);
    }
  };

  const handleDeleteResume = async (resumeId, resumeTitle) => {
    const resume = resumes.find(r => r.id === resumeId);
    if (!resume) return;
    
    setShowDeleteModal(resume);
  };

  const confirmDeleteResume = async () => {
    if (!showDeleteModal) return;

    try {
      await deleteResume(showDeleteModal.id);
      setResumes(resumes.filter(r => r.id !== showDeleteModal.id));
      setShowDeleteModal(null);
      toast.success('Resume deleted successfully');
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  const handleDuplicateResume = async (resume) => {
    try {
      const duplicatedData = {
        ...resume,
        title: `${resume.title} (Copy)`,
        status: 'draft',
        is_public: false,
        public_slug: null,
        user_email: userEmail
      };
      delete duplicatedData.id;
      delete duplicatedData.created_at;
      delete duplicatedData.updated_at;

      // Create new resume with duplicated data
      onCreateNew(duplicatedData);
      toast.success('Resume duplicated successfully');
    } catch (error) {
      console.error('Error duplicating resume:', error);
      toast.error('Failed to duplicate resume');
    }
  };

  const handleShareResume = async (resumeId, shareType = 'view') => {
    try {
      const shareData = {
        shared_by: userEmail,
        share_type: shareType,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };
      
      const share = await shareResume(resumeId, shareData);
      const shareUrl = `${window.location.origin}/resume/shared/${share.access_token}`;
      
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
      setShowShareModal(false);
    } catch (error) {
      console.error('Error sharing resume:', error);
      toast.error('Failed to share resume');
    }
  };

  const handleRestoreDraft = async () => {
    try {
      const draft = await loadDraft(userEmail);
      if (draft) {
        onEditResume(draft);
        toast.success('Draft restored successfully');
      }
    } catch (error) {
      console.error('Error restoring draft:', error);
      toast.error('Failed to restore draft');
    }
  };

  const handleDeleteDraft = async () => {
    try {
      await deleteDraft(userEmail);
      setHasDraft(false);
      toast.success('Draft deleted successfully');
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast.error('Failed to delete draft');
    }
  };

  // Filter and sort resumes
  const filteredResumes = resumes
    .filter(resume => {
      const matchesSearch = resume.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resume.resume_data?.personal?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || resume.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created_at':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return new Date(b.updated_at) - new Date(a.updated_at);
      }
    });

  const toggleCardExpansion = (resumeId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(resumeId)) {
      newExpanded.delete(resumeId);
    } else {
      newExpanded.add(resumeId);
    }
    setExpandedCards(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return <Globe className="w-4 h-4" />;
      case 'draft': return <Edit3 className="w-4 h-4" />;
      case 'archived': return <Archive className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your resumes...</p>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Resume Management</h2>
                <p className="text-sm text-blue-100">Manage your professional resumes and drafts</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Modal Content */}
        <div className="flex-1 overflow-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              Resume Management
            </h1>
            <p className="text-gray-600 mt-2">Manage your professional resumes, drafts, and sharing settings</p>
          </div>
          <div className="flex gap-3">
            {hasDraft && (
              <div className="flex gap-2">
                <button
                  onClick={handleRestoreDraft}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Restore Draft
                </button>
                <button
                  onClick={handleDeleteDraft}
                  className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={() => onCreateNew()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Resume
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search resumes by title or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Drafts</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="updated_at">Last Modified</option>
              <option value="created_at">Date Created</option>
              <option value="title">Title</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resume Grid */}
      {filteredResumes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {resumes.length === 0 ? 'No resumes yet' : 'No resumes match your search'}
          </h3>
          <p className="text-gray-600 mb-6">
            {resumes.length === 0 
              ? 'Create your first professional resume to get started'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {resumes.length === 0 && (
            <button
              onClick={() => onCreateNew()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Create Your First Resume
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResumes.map((resume) => {
            const completeness = calculateResumeCompleteness(resume.resume_data);
            const isExpanded = expandedCards.has(resume.id);
            const preview = generateResumePreview(resume.resume_data);

            return (
              <div key={resume.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                {/* Card Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                        {resume.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {resume.resume_data?.personal?.name || 'Unnamed Resume'}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(resume.status)}`}>
                          {getStatusIcon(resume.status)}
                          {resume.status.charAt(0).toUpperCase() + resume.status.slice(1)}
                        </span>
                        {resume.is_public && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Globe className="w-3 h-3" />
                            Public
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleCardExpansion(resume.id)}
                      className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Completeness</span>
                      <span>{completeness}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          completeness >= 80 ? 'bg-green-500' : 
                          completeness >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${completeness}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Updated {new Date(resume.updated_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {preview.sections} sections completed
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Template:</span>
                          <p className="font-medium">{resume.template?.name || 'Custom'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <p className="font-medium">{new Date(resume.created_at).toLocaleDateString()}</p>
                        </div>
                        {resume.stats && (
                          <>
                            <div>
                              <span className="text-gray-500">Views:</span>
                              <p className="font-medium">{resume.stats.view_count || 0}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Downloads:</span>
                              <p className="font-medium">{resume.stats.download_count || 0}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="px-6 pb-6">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditResume(resume)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedResume(resume);
                        setShowShareModal(true);
                      }}
                      className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicateResume(resume)}
                      className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteResume(resume.id, resume.title)}
                      className="bg-red-100 text-red-700 py-2 px-3 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedResume && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Share Resume</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{selectedResume.title}</h4>
                  <p className="text-sm text-gray-600">Choose how you want to share this resume</p>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handleShareResume(selectedResume.id, 'view')}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium">View Only</div>
                        <div className="text-sm text-gray-600">Recipients can view but not edit</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleShareResume(selectedResume.id, 'comment')}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium">Comment Access</div>
                        <div className="text-sm text-gray-600">Recipients can view and add comments</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Summary */}
      {resumes.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Resume Portfolio</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{resumes.length}</div>
              <div className="text-sm text-gray-600">Total Resumes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {resumes.filter(r => r.status === 'published').length}
              </div>
              <div className="text-sm text-gray-600">Published</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {resumes.filter(r => r.status === 'draft').length}
              </div>
              <div className="text-sm text-gray-600">Drafts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(resumes.reduce((sum, r) => sum + calculateResumeCompleteness(r.resume_data), 0) / resumes.length) || 0}%
              </div>
              <div className="text-sm text-gray-600">Avg. Complete</div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Resume Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        onConfirm={confirmDeleteResume}
        title="Delete Resume"
        message="Are you sure you want to delete this resume? This action cannot be undone and all associated data will be permanently removed."
        confirmText="Delete Resume"
        cancelText="Cancel"
        type="danger"
        itemName={showDeleteModal?.title}
        itemDescription={`Created on ${showDeleteModal ? new Date(showDeleteModal.created_at).toLocaleDateString() : ''} • ${showDeleteModal?.status || 'Unknown status'}`}
      />
        </div>
      </div>
    </div>
  );
};

export default ResumeManagement;