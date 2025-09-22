// Enterprise Analytics Tracker - Professional User Analytics
import { supabase } from '../lib/supabase';

class EnterpriseAnalytics {
  constructor() {
    this.batchQueue = [];
    this.batchSize = 10;
    this.flushInterval = 15000; // 15 seconds
    this.isEnabled = true;
    this.userCache = null;
    this.userCacheTime = 0;
    this.sessionId = this.generateSessionId();
    
    this.startBatchProcessor();
    this.initializeSession();
    window.addEventListener('beforeunload', () => this.flush());
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

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

  async initializeSession() {
    const user = await this.getCurrentUser();
    if (user) {
      this.trackEvent('login', 'authentication', {
        login_method: 'magic_link',
        is_new_session: true
      });
    }
  }

  // Core tracking method
  async trackEvent(eventType, category, properties = {}) {
    if (!this.isEnabled || !supabase) return;

    try {
      const user = await this.getCurrentUser();
      const event = {
        user_id: user?.id || null,
        email: user?.email || 'anonymous',
        session_id: this.sessionId,
        event_type: eventType,
        event_category: category,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          page_url: window.location.href
        },
        device_info: {
          screen_resolution: `${screen.width}x${screen.height}`,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language
        },
        ip_address: null, // Will be filled by server
        user_agent: navigator.userAgent,
        referrer: document.referrer
      };

      this.batchQueue.push(event);

      if (this.batchQueue.length >= this.batchSize) {
        await this.flush();
      }
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  // Authentication events
  async trackAuthEvent(eventType, success = true, additionalData = {}) {
    if (!supabase) return;

    try {
      const user = await this.getCurrentUser();
      const authEvent = {
        user_id: user?.id || null,
        email: user?.email || additionalData.email || 'unknown',
        event_type: eventType,
        success,
        failure_reason: additionalData.failure_reason || null,
        ip_address: null, // Server will populate
        user_agent: navigator.userAgent,
        device_fingerprint: this.generateDeviceFingerprint(),
        location_country: null, // Server will populate
        location_city: null, // Server will populate
        risk_score: this.calculateRiskScore(additionalData),
        ...additionalData
      };

      await supabase.from('auth_events').insert([authEvent]);
    } catch (error) {
      console.warn('Auth event tracking failed:', error);
    }
  }

  // Feature usage tracking
  async trackFeatureUsage(featureName, category, timeSpent = 0, completed = false) {
    if (!supabase) return;

    try {
      const user = await this.getCurrentUser();
      if (!user) return;

      const { data: existing } = await supabase
        .from('feature_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('feature_name', featureName)
        .single();

      if (existing) {
        await supabase
          .from('feature_usage')
          .update({
            usage_count: existing.usage_count + 1,
            last_used: new Date().toISOString(),
            total_time_spent: existing.total_time_spent + timeSpent,
            completion_rate: completed ? 100 : existing.completion_rate
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('feature_usage')
          .insert([{
            user_id: user.id,
            feature_name: featureName,
            feature_category: category,
            usage_count: 1,
            total_time_spent: timeSpent,
            completion_rate: completed ? 100 : 0
          }]);
      }
    } catch (error) {
      console.warn('Feature usage tracking failed:', error);
    }
  }

  generateDeviceFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    return btoa(JSON.stringify({
      canvas: canvas.toDataURL(),
      screen: `${screen.width}x${screen.height}`,
      timezone: new Date().getTimezoneOffset(),
      language: navigator.language,
      platform: navigator.platform,
      plugins: Array.from(navigator.plugins).map(p => p.name).join(',')
    })).substr(0, 50);
  }

  calculateRiskScore(data) {
    let score = 0;
    
    // Check for suspicious patterns
    if (data.multiple_attempts) score += 30;
    if (data.unusual_location) score += 25;
    if (data.new_device) score += 15;
    if (data.vpn_detected) score += 20;
    if (data.rapid_requests) score += 35;
    
    return Math.min(score, 100);
  }

  async flush() {
    if (this.batchQueue.length === 0) return;

    const batch = [...this.batchQueue];
    this.batchQueue = [];

    try {
      const { error } = await supabase
        .from('user_analytics')
        .insert(batch);

      if (error) {
        console.error('Analytics batch failed:', error);
      }
    } catch (error) {
      console.error('Analytics flush error:', error);
    }
  }

  startBatchProcessor() {
    setInterval(() => {
      if (this.batchQueue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  // Update user cohort data
  async updateUserCohort(userId, updates) {
    if (!supabase) return;

    try {
      await supabase
        .from('user_cohorts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } catch (error) {
      console.warn('Cohort update failed:', error);
    }
  }
}

// Export singleton
export const enterpriseAnalytics = new EnterpriseAnalytics();

// Convenience tracking functions
export const trackUserEvent = {
  // Authentication
  signup: (email, method = 'magic_link') => 
    enterpriseAnalytics.trackAuthEvent('signup', true, { email, method }),
  
  loginAttempt: (email, success = true, reason = null) =>
    enterpriseAnalytics.trackAuthEvent('login_success', success, { email, failure_reason: reason }),
  
  magicLinkSent: (email) =>
    enterpriseAnalytics.trackAuthEvent('magic_link_sent', true, { email }),
  
  magicLinkClicked: (email) =>
    enterpriseAnalytics.trackAuthEvent('magic_link_clicked', true, { email }),
  
  emailVerified: (email) =>
    enterpriseAnalytics.trackAuthEvent('email_verified', true, { email }),
  
  logout: () =>
    enterpriseAnalytics.trackEvent('logout', 'authentication'),

  // User Management
  profileUpdate: (changes) =>
    enterpriseAnalytics.trackEvent('profile_update', 'user_management', { changes }),
  
  subscriptionChange: (from, to) =>
    enterpriseAnalytics.trackEvent('subscription_change', 'conversion', { from, to }),

  // Feature Usage
  resumeBuilder: {
    create: (templateId) => 
      enterpriseAnalytics.trackFeatureUsage('resume_create', 'resume_builder', 0, false),
    
    edit: (section, timeSpent) =>
      enterpriseAnalytics.trackFeatureUsage('resume_edit', 'resume_builder', timeSpent, false),
    
    download: (format) => {
      enterpriseAnalytics.trackFeatureUsage('resume_download', 'resume_builder', 0, true);
      enterpriseAnalytics.trackEvent('feature_usage', 'engagement', { feature: 'resume_download', format });
    }
  },

  boards: {
    create: (boardName) =>
      enterpriseAnalytics.trackFeatureUsage('board_create', 'boards', 0, true),
    
    pin: (postId) =>
      enterpriseAnalytics.trackFeatureUsage('board_pin', 'boards', 0, true),
    
    view: (boardId, timeSpent) =>
      enterpriseAnalytics.trackFeatureUsage('board_view', 'boards', timeSpent, false)
  },

  community: {
    postCreate: (category) => {
      enterpriseAnalytics.trackFeatureUsage('community_post', 'community', 0, true);
      enterpriseAnalytics.trackEvent('feature_usage', 'engagement', { feature: 'community_post', category });
    },
    
    like: (postId) =>
      enterpriseAnalytics.trackFeatureUsage('community_like', 'community', 0, true),
    
    comment: (postId) =>
      enterpriseAnalytics.trackFeatureUsage('community_comment', 'community', 0, true)
  },

  events: {
    view: (eventId, timeSpent) =>
      enterpriseAnalytics.trackFeatureUsage('event_view', 'events', timeSpent, false),
    
    register: (eventId) => {
      enterpriseAnalytics.trackFeatureUsage('event_register', 'events', 0, true);
      enterpriseAnalytics.trackEvent('feature_usage', 'conversion', { feature: 'event_register', event_id: eventId });
    }
  },

  // Engagement
  pageView: (page, timeSpent = 0) =>
    enterpriseAnalytics.trackEvent('feature_usage', 'engagement', { page, time_spent: timeSpent }),
  
  error: (errorType, errorMessage) =>
    enterpriseAnalytics.trackEvent('error', 'engagement', { error_type: errorType, message: errorMessage })
};

// Auto-track page views
let pageStartTime = Date.now();
let currentPage = window.location.pathname;

window.addEventListener('beforeunload', () => {
  const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
  trackUserEvent.pageView(currentPage, timeSpent);
});

// Track page changes for SPAs
const originalPushState = history.pushState;
history.pushState = function(...args) {
  const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
  trackUserEvent.pageView(currentPage, timeSpent);
  
  originalPushState.apply(history, args);
  currentPage = window.location.pathname;
  pageStartTime = Date.now();
};