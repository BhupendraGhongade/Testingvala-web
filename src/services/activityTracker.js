// Lightweight Activity Tracker - Optimized for Free Tier
import { supabase } from '../lib/supabase';

class ActivityTracker {
  constructor() {
    this.batchQueue = [];
    this.batchSize = 5; // Small batches for free tier
    this.flushInterval = 10000; // 10 seconds
    this.isEnabled = true;
    this.userCache = null;
    this.userCacheTime = 0;
    
    this.startBatchProcessor();
    window.addEventListener('beforeunload', () => this.flush());
  }

  // Get current user (cached)
  async getCurrentUser() {
    if (!this.userCache || Date.now() - this.userCacheTime > 300000) { // 5 min cache
      try {
        const { data: { user } } = await supabase.auth.getUser();
        this.userCache = user;
        this.userCacheTime = Date.now();
      } catch (error) {
        this.userCache = null;
      }
    }
    return this.userCache;
  }

  // Log activity (queued for batching)
  async log(module, actionType, resourceId = null, metadata = {}) {
    if (!this.isEnabled || !supabase) return;

    try {
      const user = await this.getCurrentUser();
      const logEntry = {
        user_id: user?.id || null,
        email: user?.email || 'anonymous',
        module,
        action_type: actionType,
        resource_id: resourceId,
        metadata: Object.keys(metadata).length > 0 ? metadata : null
      };

      this.batchQueue.push(logEntry);

      if (this.batchQueue.length >= this.batchSize) {
        await this.flush();
      }
    } catch (error) {
      console.warn('Activity logging failed:', error);
    }
  }

  // Flush batch to database
  async flush() {
    if (this.batchQueue.length === 0) return;

    const batch = [...this.batchQueue];
    this.batchQueue = [];

    try {
      const { error } = await supabase
        .from('user_activity_logs')
        .insert(batch);

      if (error) {
        console.error('Batch logging failed:', error);
      }
    } catch (error) {
      console.error('Activity logging error:', error);
    }
  }

  // Start batch processor
  startBatchProcessor() {
    setInterval(() => {
      if (this.batchQueue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  // Magic Link tracking
  async logMagicLinkRequest(email, deviceId) {
    if (!supabase) return;

    try {
      await supabase.from('magic_link_tracking').insert({
        email,
        device_id: deviceId,
        user_agent: navigator.userAgent,
        status: 'sent'
      });
    } catch (error) {
      console.warn('Magic link logging failed:', error);
    }
  }

  // Update magic link status
  async updateMagicLinkStatus(email, status) {
    if (!supabase) return;

    try {
      await supabase
        .from('magic_link_tracking')
        .update({ 
          status,
          verified_at: status === 'verified' ? new Date().toISOString() : null
        })
        .eq('email', email)
        .eq('status', 'sent')
        .order('created_at', { ascending: false })
        .limit(1);
    } catch (error) {
      console.warn('Magic link status update failed:', error);
    }
  }
}

// Export singleton
export const activityTracker = new ActivityTracker();

// Convenience functions
export const trackActivity = {
  // Resume Builder
  resumeCreated: (resumeId, templateId) => 
    activityTracker.log('resume', 'create', resumeId, { template_id: templateId }),
  
  resumeEdited: (resumeId, section) => 
    activityTracker.log('resume', 'edit', resumeId, { section }),
  
  resumeDownloaded: (resumeId, format) => 
    activityTracker.log('resume', 'download', resumeId, { format }),

  // Boards
  boardCreated: (boardId, name) => 
    activityTracker.log('board', 'create', boardId, { name }),
  
  postPinned: (boardId, postId) => 
    activityTracker.log('board', 'pin', boardId, { post_id: postId }),
  
  boardViewed: (boardId) => 
    activityTracker.log('board', 'view', boardId),

  // Community
  postCreated: (postId, category) => 
    activityTracker.log('community', 'create', postId, { category }),
  
  postLiked: (postId) => 
    activityTracker.log('community', 'like', postId),
  
  commentAdded: (postId, commentId) => 
    activityTracker.log('community', 'comment', postId, { comment_id: commentId }),

  // Events
  eventClicked: (eventId, eventName) => 
    activityTracker.log('events', 'click', eventId, { name: eventName }),
  
  eventRegistered: (eventId) => 
    activityTracker.log('events', 'register', eventId),

  // Auth
  magicLinkRequested: (email, deviceId) => {
    activityTracker.logMagicLinkRequest(email, deviceId);
    activityTracker.log('auth', 'magic_link_request', null, { email });
  },
  
  userLoggedIn: (email) => 
    activityTracker.log('auth', 'login', null, { email }),
  
  userLoggedOut: () => 
    activityTracker.log('auth', 'logout')
};