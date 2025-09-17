import { supabase } from '../lib/supabase';

// Resume Service for Enhanced QA Resume Builder
export class ResumeService {
  
  // Save resume data
  static async saveResume(resumeData, sectionsEnabled, userEmail, title = 'My QA Resume') {
    try {
      const { data, error } = await supabase
        .from('user_resumes')
        .insert({
          user_email: userEmail,
          title: title,
          resume_data: resumeData,
          sections_enabled: sectionsEnabled,
          status: 'draft',
          metadata: {
            completion_percentage: this.calculateCompletion(resumeData, sectionsEnabled),
            last_modified: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error saving resume:', error);
      return { success: false, error: error.message };
    }
  }

  // Update existing resume
  static async updateResume(resumeId, resumeData, sectionsEnabled, title) {
    try {
      const { data, error } = await supabase
        .from('user_resumes')
        .update({
          title: title,
          resume_data: resumeData,
          sections_enabled: sectionsEnabled,
          updated_at: new Date().toISOString(),
          metadata: {
            completion_percentage: this.calculateCompletion(resumeData, sectionsEnabled),
            last_modified: new Date().toISOString()
          }
        })
        .eq('id', resumeId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating resume:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's resumes
  static async getUserResumes(userEmail) {
    try {
      const { data, error } = await supabase
        .from('user_resumes')
        .select('*')
        .eq('user_email', userEmail)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching resumes:', error);
      return { success: false, error: error.message };
    }
  }

  // Get single resume
  static async getResume(resumeId) {
    try {
      const { data, error } = await supabase
        .from('user_resumes')
        .select('*')
        .eq('id', resumeId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching resume:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete resume
  static async deleteResume(resumeId) {
    try {
      const { error } = await supabase
        .from('user_resumes')
        .delete()
        .eq('id', resumeId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting resume:', error);
      return { success: false, error: error.message };
    }
  }

  // Get resume templates
  static async getTemplates() {
    try {
      const { data, error } = await supabase
        .from('resume_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching templates:', error);
      return { success: false, error: error.message };
    }
  }

  // Track resume analytics
  static async trackEvent(resumeId, eventType, metadata = {}) {
    try {
      const { error } = await supabase
        .from('resume_analytics')
        .insert({
          resume_id: resumeId,
          event_type: eventType,
          metadata: metadata,
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error tracking event:', error);
      return { success: false, error: error.message };
    }
  }

  // Calculate completion percentage
  static calculateCompletion(resumeData, sectionsEnabled) {
    let totalSections = 5; // Core sections: personal, summary, skills, experience, education
    let completedSections = 0;

    // Check core sections
    if (resumeData.personal?.name && resumeData.personal?.email) {
      completedSections++;
    }
    if (resumeData.summary && resumeData.summary.trim().length > 0) {
      completedSections++;
    }
    if (resumeData.technicalSkills && Object.values(resumeData.technicalSkills).some(skills => skills.length > 0)) {
      completedSections++;
    }
    if (resumeData.experience && resumeData.experience.length > 0 && resumeData.experience[0].company) {
      completedSections++;
    }
    if (resumeData.education && resumeData.education.length > 0 && resumeData.education[0].degree) {
      completedSections++;
    }

    // Check optional sections
    const optionalSections = ['publications', 'openSource', 'memberships', 'portfolio', 'patents', 'achievements', 'languages', 'volunteer'];
    
    optionalSections.forEach(section => {
      if (sectionsEnabled[section]) {
        totalSections++;
        if (resumeData[section] && resumeData[section].length > 0) {
          // Check if the first item has meaningful content
          const firstItem = resumeData[section][0];
          if (firstItem && Object.values(firstItem).some(value => value && value.toString().trim().length > 0)) {
            completedSections++;
          }
        }
      }
    });

    return Math.round((completedSections / totalSections) * 100);
  }

  // Export resume data for download
  static async exportResume(resumeId, format = 'json') {
    try {
      const { data, error } = await supabase
        .from('user_resumes')
        .select('*')
        .eq('id', resumeId)
        .single();

      if (error) throw error;

      // Track export event
      await this.trackEvent(resumeId, 'export', { format });

      // Record export in history
      await supabase
        .from('resume_exports')
        .insert({
          resume_id: resumeId,
          export_format: format,
          export_settings: {},
          created_at: new Date().toISOString()
        });

      return { success: true, data };
    } catch (error) {
      console.error('Error exporting resume:', error);
      return { success: false, error: error.message };
    }
  }

  // Share resume
  static async shareResume(resumeId, shareType = 'view', expiresIn = 30) {
    try {
      const accessToken = this.generateAccessToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresIn);

      const { data, error } = await supabase
        .from('resume_shares')
        .insert({
          resume_id: resumeId,
          shared_by: 'current_user', // This should be the actual user email
          share_type: shareType,
          access_token: accessToken,
          expires_at: expiresAt.toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data, shareUrl: `${window.location.origin}/resume/shared/${accessToken}` };
    } catch (error) {
      console.error('Error sharing resume:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate random access token
  static generateAccessToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Get shared resume
  static async getSharedResume(accessToken) {
    try {
      const { data: shareData, error: shareError } = await supabase
        .from('resume_shares')
        .select(`
          *,
          user_resumes (*)
        `)
        .eq('access_token', accessToken)
        .eq('is_active', true)
        .single();

      if (shareError) throw shareError;

      // Check if share has expired
      if (new Date(shareData.expires_at) < new Date()) {
        throw new Error('Share link has expired');
      }

      return { success: true, data: shareData };
    } catch (error) {
      console.error('Error fetching shared resume:', error);
      return { success: false, error: error.message };
    }
  }

  // Get resume statistics
  static async getResumeStats(resumeId) {
    try {
      const { data, error } = await supabase
        .from('resume_stats')
        .select('*')
        .eq('id', resumeId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching resume stats:', error);
      return { success: false, error: error.message };
    }
  }
}

export default ResumeService;