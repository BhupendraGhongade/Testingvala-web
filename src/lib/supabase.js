import { createClient } from '@supabase/supabase-js'

// Environment detection
const APP_ENV = import.meta.env.VITE_APP_ENV || 'development'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Environment-aware configuration
const isLocal = APP_ENV === 'local'
const isDevelopment = APP_ENV === 'development'
const isProduction = APP_ENV === 'production'

let supabase = null
let supabaseConnectionStatus = 'unknown'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables are missing. Running in fallback/dev mode.')
  supabaseConnectionStatus = 'missing_config'
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'testingvala-web'
        }
      }
    })
    
    supabaseConnectionStatus = 'initialized'
    
    // Log environment info (only in development)
    if (!isProduction) {
      console.log(`🌍 Environment: ${APP_ENV}`);
      console.log(`🔗 Supabase URL: ${supabaseUrl}`);
      console.log(`🔑 Using ${isLocal ? 'local' : 'remote'} database`);
      console.log(`📡 Connection status: ${supabaseConnectionStatus}`);
    }
    
    // Test connection in development (non-blocking)
    if (!isProduction && supabase) {
      setTimeout(async () => {
        try {
          const { data, error } = await Promise.race([
            supabase.from('website_content').select('id').limit(1),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 3000))
          ])
          
          if (error) {
            console.warn('⚠️ Supabase connection test failed:', error.message)
            supabaseConnectionStatus = 'connection_failed'
          } else {
            console.log('✅ Supabase connection test successful')
            supabaseConnectionStatus = 'connected'
          }
        } catch (testError) {
          console.warn('⚠️ Supabase connection test error:', testError.message)
          supabaseConnectionStatus = 'connection_error'
        }
      }, 1000)
    }
  } catch (initError) {
    console.error('❌ Failed to initialize Supabase client:', initError)
    supabase = null
    supabaseConnectionStatus = 'init_failed'
  }
}

// Export connection status for debugging
export const getSupabaseStatus = () => ({
  client: !!supabase,
  status: supabaseConnectionStatus,
  url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'Not configured',
  environment: APP_ENV
})

// Environment utilities
export const ENV = {
  current: APP_ENV,
  isLocal,
  isDevelopment, 
  isProduction,
  databaseUrl: supabaseUrl
}

export { supabase, supabaseConnectionStatus }

// Database table names for easy reference
// 1. website_content - stores all website content (hero, about, contact, etc.)
// 2. users - stores user information
// 3. contest_submissions - stores contest submissions
// 4. admin_sessions - stores admin authentication sessions
// 5. upcoming_events - stores upcoming events with dates, times, and registration links
// 6. event_images - stores event image metadata and storage references
// 7. resume_templates - stores resume template definitions
// 8. user_resumes - stores user resumes with full data
// 9. resume_versions - stores version history for resumes
// 10. resume_shares - stores sharing and collaboration settings
// 11. resume_analytics - stores usage tracking and analytics
// 12. resume_comments - stores comments and feedback on resumes
// 13. resume_exports - stores export history and download tracking

export const TABLES = {
  WEBSITE_CONTENT: 'website_content',
  USERS: 'users',
  CONTEST_SUBMISSIONS: 'contest_submissions',
  ADMIN_SESSIONS: 'admin_sessions',
  UPCOMING_EVENTS: 'upcoming_events',
  EVENT_IMAGES: 'event_images',
  FORUM_POSTS: 'forum_posts',
  FORUM_COMMENTS: 'forum_comments',
  FORUM_LIKES: 'forum_likes',
  POST_COMMENTS: 'post_comments',
  POST_LIKES: 'post_likes',
  USER_BOARDS: 'user_boards',
  BOARD_PINS: 'board_pins',
  RESUME_TEMPLATES: 'resume_templates',
  USER_RESUMES: 'user_resumes',
  RESUME_VERSIONS: 'resume_versions',
  RESUME_SHARES: 'resume_shares',
  RESUME_ANALYTICS: 'resume_analytics',
  RESUME_COMMENTS: 'resume_comments',
  RESUME_EXPORTS: 'resume_exports',
  PREMIUM_SUBSCRIPTIONS: 'premium_subscriptions',
  PAYMENT_CONFIG: 'payment_config',
  AI_RESUME_GENERATIONS: 'ai_resume_generations',
  PARTNERSHIP_INQUIRIES: 'partnership_inquiries'
}

// Storage bucket names
export const STORAGE_BUCKETS = {
  EVENT_IMAGES: 'testingvala-bucket',
  PAYMENTS: 'payments'
}

// Helper functions for events
export const getUpcomingEvents = async () => {
  try {
    if (!supabase) {
      console.warn('getUpcomingEvents: Supabase not configured — returning empty list')
      return []
    }
    const { data, error } = await supabase
      .from(TABLES.UPCOMING_EVENTS)
      .select('*')
      .eq('is_active', true)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }
};

export const createEvent = async (eventData) => {
  try {
    if (!supabase) {
      const msg = 'createEvent: Supabase not configured — cannot create event'
      console.warn(msg)
      throw new Error(msg)
    }
    const { data, error } = await supabase
      .from(TABLES.UPCOMING_EVENTS)
      .insert([eventData])
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const updateEvent = async (id, eventData) => {
  try {
    if (!supabase) {
      const msg = 'updateEvent: Supabase not configured — cannot update event'
      console.warn(msg)
      throw new Error(msg)
    }
    const { data, error } = await supabase
      .from(TABLES.UPCOMING_EVENTS)
      .update(eventData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const deleteEvent = async (id) => {
  try {
    if (!supabase) {
      const msg = 'deleteEvent: Supabase not configured — cannot delete event'
      console.warn(msg)
      throw new Error(msg)
    }
    const { error } = await supabase
      .from(TABLES.UPCOMING_EVENTS)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Test function to verify Supabase connection and storage
export const testSupabaseConnection = async () => {
  try {
    console.log('🧪 Testing Supabase connection...');
    
    // Test 1: Check if Supabase client exists
    if (!supabase) {
      console.warn('Supabase client not initialized — running in fallback/dev mode')
      return { 
        success: false, 
        error: 'Supabase client not initialized',
        status: supabaseConnectionStatus,
        fallbackMode: true
      }
    }
    console.log('✅ Supabase client exists');
    
    // Test 2: Check environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    console.log('✅ Environment variables configured');
    console.log('🔗 Supabase URL:', supabaseUrl);
    console.log('🔑 Supabase Key:', supabaseKey ? 'Present' : 'Missing');
    
    // Test 3: Basic connectivity test with timeout
    console.log('📡 Testing basic connectivity...');
    try {
      const { data, error } = await Promise.race([
        supabase.from('website_content').select('id').limit(1),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout (5s)')), 5000)
        )
      ]);
      
      if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
        throw error;
      }
      console.log('✅ Basic connectivity test passed');
    } catch (connectError) {
      console.error('❌ Basic connectivity failed:', connectError.message);
      return {
        success: false,
        error: `Connection failed: ${connectError.message}`,
        status: 'connection_failed',
        suggestion: 'Check if Supabase is running locally or network connectivity'
      };
    }
    
    // Test 4: Check storage buckets (optional)
    console.log('🔍 Checking storage buckets...');
    try {
      const { data: buckets, error: bucketError } = await Promise.race([
        supabase.storage.listBuckets(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Storage timeout')), 3000)
        )
      ]);
      
      if (bucketError) {
        console.warn('⚠️ Storage bucket check failed:', bucketError.message);
      } else {
        console.log('📦 Available storage buckets:', buckets?.map(b => b.name) || []);
        
        // Check if our bucket exists
        const eventBucket = buckets?.find(b => b.name === STORAGE_BUCKETS.EVENT_IMAGES);
        if (eventBucket) {
          console.log('✅ Event images bucket found:', eventBucket.name);
        } else {
          console.warn('⚠️ Event images bucket not found, but storage is accessible');
        }
      }
    } catch (storageError) {
      console.warn('⚠️ Storage test failed:', storageError.message);
    }
    
    console.log('🎉 Supabase connection test completed successfully!');
    return { 
      success: true, 
      status: 'connected',
      environment: APP_ENV,
      url: supabaseUrl
    };
    
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    return { 
      success: false, 
      error: error.message,
      status: 'test_failed',
      suggestion: 'Check Supabase configuration and network connectivity'
    };
  }
};

// Image upload functions
export const uploadEventImage = async (file, eventId) => {
  try {
    console.log('🚀 Starting image upload process...');
    console.log('📁 File details:', {
      name: file.name,
      type: file.type,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      eventId: eventId
    });

    // Check if Supabase client is properly configured
    if (!supabase) {
      const msg = 'uploadEventImage: Supabase not configured — cannot upload image'
      console.warn(msg)
      throw new Error(msg)
    }

    // Check if storage bucket exists
    console.log('🔍 Checking storage bucket:', STORAGE_BUCKETS.EVENT_IMAGES);
    
    // Generate unique filename with timestamp and random string
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `${eventId}-${timestamp}-${randomString}.${fileExt}`;
    const filePath = `${eventId}/${fileName}`;

    console.log('📝 Generated file path:', filePath);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}. Only image files are allowed.`);
    }

    console.log('✅ File validation passed');

    // Check storage bucket access
    

    // Upload file to Supabase Storage
    console.log('📤 Uploading file to Supabase Storage...');
    
  const { data: _uploadData, error } = await supabase.storage
      .from(STORAGE_BUCKETS.EVENT_IMAGES)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('❌ Storage upload error:', error);
      
      // Provide specific error messages for common issues
      if (error.message.includes('bucket')) {
        throw new Error('Storage bucket not found or not accessible. Please check Supabase configuration.');
      } else if (error.message.includes('policy')) {
        throw new Error('Storage policy error. Please check RLS policies in Supabase.');
      } else if (error.message.includes('size')) {
        throw new Error('File too large. Please reduce file size and try again.');
      } else {
        throw new Error(`Upload failed: ${error.message}`);
      }
    }

    console.log('✅ File uploaded successfully to storage');

    // Get public URL
    console.log('🔗 Getting public URL...');
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.EVENT_IMAGES)
      .getPublicUrl(filePath);

    console.log('✅ Image upload completed successfully:', urlData.publicUrl);
    return urlData.publicUrl;
    
  } catch (error) {
    console.error('❌ Image upload failed:', error);
    
    // Log detailed error information
    if (error.message) {
      console.error('Error message:', error.message);
    }
    if (error.details) {
      console.error('Error details:', error.details);
    }
    if (error.hint) {
      console.error('Error hint:', error.hint);
    }
    
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

export const deleteEventImage = async (filePath) => {
  try {
    if (!supabase) {
      const msg = 'deleteEventImage: Supabase not configured — cannot delete image'
      console.warn(msg)
      throw new Error(msg)
    }
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.EVENT_IMAGES)
      .delete([filePath]);

    if (error) {
      console.error('Storage delete error:', error);
      throw new Error('Failed to delete image from storage');
    }

    console.log('Image deleted successfully:', filePath);
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error(`Image deletion failed: ${error.message}`);
  }
};

// Get all events for admin management
export const getAllEvents = async () => {
  try {
    if (!supabase) {
      console.warn('getAllEvents: Supabase not configured — returning empty list')
      return []
    }
    const { data, error } = await supabase
      .from(TABLES.UPCOMING_EVENTS)
      .select('*')
      .order('event_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all events:', error);
    throw error;
  }
};

// Post Comments and Likes Functions
export const getPostComments = async (postId) => {
  try {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

export const addPostComment = async (postId, content, userEmail) => {
  try {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ 
        post_id: postId, 
        content, 
        user_email: userEmail,
        author_name: userEmail.split('@')[0]
      })
      .select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const getPostLikes = async (postId) => {
  try {
    if (!supabase) return 0;
    const { count, error } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching likes:', error);
    return 0;
  }
};

export const getBulkPostData = async (postIds) => {
  try {
    if (!supabase || !postIds.length) return { comments: {}, likes: {} };
    
    const [commentsResult, likesResult] = await Promise.all([
      supabase.from('post_comments').select('*').in('post_id', postIds),
      supabase.from('post_likes').select('post_id').in('post_id', postIds)
    ]);
    
    const commentsByPost = {};
    const likesByPost = {};
    
    (commentsResult.data || []).forEach(comment => {
      if (!commentsByPost[comment.post_id]) commentsByPost[comment.post_id] = [];
      commentsByPost[comment.post_id].push(comment);
    });
    
    (likesResult.data || []).forEach(like => {
      likesByPost[like.post_id] = (likesByPost[like.post_id] || 0) + 1;
    });
    
    return { comments: commentsByPost, likes: likesByPost };
  } catch (error) {
    console.error('Error fetching bulk post data:', error);
    return { comments: {}, likes: {} };
  }
};

export const togglePostLike = async (postId, userEmail) => {
  try {
    if (!supabase) return false;
    const { data: existing, error: selectError } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_email', userEmail)
      .maybeSingle();
    
    if (selectError) throw selectError;
    
    if (existing) {
      const { error: deleteError } = await supabase
        .from('post_likes')
        .delete()
        .eq('id', existing.id);
      if (deleteError) throw deleteError;
      return false;
    } else {
      const { error: insertError } = await supabase
        .from('post_likes')
        .insert({ 
          post_id: postId, 
          user_email: userEmail
        });
      if (insertError) throw insertError;
      return true;
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

// Board Functions
export const getUserBoards = async (userId) => {
  try {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from(TABLES.USER_BOARDS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user boards:', error);
    return [];
  }
};

export const createUserBoard = async (boardData) => {
  try {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from(TABLES.USER_BOARDS)
      .insert(boardData)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating board:', error);
    throw error;
  }
};

export const updateUserBoard = async (boardId, boardData) => {
  try {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from(TABLES.USER_BOARDS)
      .update({ ...boardData, updated_at: new Date().toISOString() })
      .eq('id', boardId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating board:', error);
    throw error;
  }
};

export const deleteUserBoard = async (boardId) => {
  try {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase
      .from(TABLES.USER_BOARDS)
      .delete()
      .eq('id', boardId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting board:', error);
    throw error;
  }
};

export const savePostToBoard = async (saveData) => {
  try {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from(TABLES.BOARD_PINS)
      .insert([saveData])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving post:', error);
    throw error;
  }
};

export const getBoardSaves = async (boardId) => {
  try {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from(TABLES.BOARD_PINS)
      .select('*')
      .eq('board_id', boardId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching board saves:', error);
    return [];
  }
};

export const removeSaveFromBoard = async (saveId) => {
  try {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase
      .from(TABLES.BOARD_PINS)
      .delete()
      .eq('id', saveId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing save:', error);
    throw error;
  }
};

export const checkIfPostSaved = async (boardId, postId) => {
  try {
    if (!supabase) return false;
    const { data, error } = await supabase
      .from(TABLES.BOARD_PINS)
      .select('id')
      .eq('board_id', boardId)
      .eq('post_id', postId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking if post is saved:', error);
    return false;
  }
};

// ============================================================================
// CONTEST SUBMISSIONS FUNCTIONS
// ============================================================================

// Get all contest submissions
export const getContestSubmissions = async () => {
  try {
    if (!supabase) {
      console.warn('getContestSubmissions: Supabase not configured — returning empty list');
      return [];
    }
    const { data, error } = await supabase
      .from(TABLES.CONTEST_SUBMISSIONS)
      .select('*')
      .order('submission_date', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching contest submissions:', error);
    return [];
  }
};

// Create contest submission
export const createContestSubmission = async (submissionData) => {
  try {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from(TABLES.CONTEST_SUBMISSIONS)
      .insert([submissionData])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating contest submission:', error);
    throw error;
  }
};

// Update contest submission status
export const updateContestSubmissionStatus = async (submissionId, status) => {
  try {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from(TABLES.CONTEST_SUBMISSIONS)
      .update({ 
        status,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating contest submission:', error);
    throw error;
  }
};

// Get contest submissions by status
export const getContestSubmissionsByStatus = async (status) => {
  try {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from(TABLES.CONTEST_SUBMISSIONS)
      .select('*')
      .eq('status', status)
      .order('submission_date', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching contest submissions by status:', error);
    return [];
  }
};

// ============================================================================
// PARTNERSHIP INQUIRIES FUNCTIONS
// ============================================================================

// Get all partnership inquiries
export const getPartnershipInquiries = async () => {
  try {
    if (!supabase) {
      console.warn('getPartnershipInquiries: Supabase not configured — returning empty list');
      return [];
    }
    const { data, error } = await supabase
      .from(TABLES.PARTNERSHIP_INQUIRIES)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching partnership inquiries:', error);
    return [];
  }
};

// Update partnership inquiry status
export const updatePartnershipInquiryStatus = async (inquiryId, status, adminNotes = null, contactedBy = null) => {
  try {
    if (!supabase) throw new Error('Supabase not configured');
    
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (adminNotes) updateData.admin_notes = adminNotes;
    if (contactedBy) {
      updateData.contacted_by = contactedBy;
      updateData.contacted_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from(TABLES.PARTNERSHIP_INQUIRIES)
      .update(updateData)
      .eq('id', inquiryId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating partnership inquiry:', error);
    throw error;
  }
};

// Get partnership inquiries by status
export const getPartnershipInquiriesByStatus = async (status) => {
  try {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from(TABLES.PARTNERSHIP_INQUIRIES)
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching partnership inquiries by status:', error);
    return [];
  }
};

// Delete partnership inquiry
export const deletePartnershipInquiry = async (inquiryId) => {
  try {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase
      .from(TABLES.PARTNERSHIP_INQUIRIES)
      .delete()
      .eq('id', inquiryId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting partnership inquiry:', error);
    throw error;
  }
};

// ============================================================================
// RESUME MANAGEMENT FUNCTIONS
// ============================================================================

// Resume Templates
export const getResumeTemplates = async () => {
  try {
    if (!supabase) {
      console.warn('getResumeTemplates: Supabase not configured — returning default templates');
      return [
        { id: 'modern', name: 'Modern Professional', description: 'Enterprise-grade design', category: 'professional' },
        { id: 'executive', name: 'Executive Premium', description: 'Sophisticated serif layout', category: 'executive' },
        { id: 'ats', name: 'ATS Optimized', description: 'Clean formatting for ATS', category: 'ats-friendly' },
        { id: 'creative', name: 'Creative Tech', description: 'Modern gradient design', category: 'creative' }
      ];
    }
    const { data, error } = await supabase
      .from(TABLES.RESUME_TEMPLATES)
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching resume templates:', error);
    return [];
  }
};

// User Resumes CRUD
export const getUserResumes = async (userEmail) => {
  try {
    if (!supabase || !userEmail) return [];
    const { data, error } = await supabase
      .from(TABLES.USER_RESUMES)
      .select(`
        *,
        template:resume_templates(name, description),
        stats:resume_stats(*)
      `)
      .eq('user_email', userEmail)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user resumes:', error);
    return [];
  }
};

export const getResumeById = async (resumeId) => {
  try {
    if (!supabase || !resumeId) return null;
    const { data, error } = await supabase
      .from(TABLES.USER_RESUMES)
      .select(`
        *,
        template:resume_templates(name, description, template_data)
      `)
      .eq('id', resumeId)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching resume:', error);
    return null;
  }
};

export const createResume = async (resumeData) => {
  try {
    if (!supabase) throw new Error('Supabase not configured');
    
    // Generate public slug if making public
    if (resumeData.is_public && resumeData.user_email) {
      const { data: slugData } = await supabase
        .rpc('generate_public_slug', {
          resume_title: resumeData.title || 'My Resume',
          user_email: resumeData.user_email
        });
      if (slugData) {
        resumeData.public_slug = slugData;
      }
    }
    
    const { data, error } = await supabase
      .from(TABLES.USER_RESUMES)
      .insert([resumeData])
      .select()
      .single();
    if (error) throw error;
    
    // Track creation analytics
    await trackResumeEvent(data.id, 'create', { template_id: resumeData.template_id });
    
    return data;
  } catch (error) {
    console.error('Error creating resume:', error);
    throw error;
  }
};

export const updateResume = async (resumeId, resumeData) => {
  try {
    if (!supabase) throw new Error('Supabase not configured');
    
    const updateData = {
      ...resumeData,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from(TABLES.USER_RESUMES)
      .update(updateData)
      .eq('id', resumeId)
      .select()
      .single();
    if (error) throw error;
    
    // Track update analytics
    await trackResumeEvent(resumeId, 'update');
    
    return data;
  } catch (error) {
    console.error('Error updating resume:', error);
    throw error;
  }
};

export const deleteResume = async (resumeId) => {
  try {
    if (!supabase) throw new Error('Supabase not configured');
    
    // Track deletion before deleting
    await trackResumeEvent(resumeId, 'delete');
    
    const { error } = await supabase
      .from(TABLES.USER_RESUMES)
      .delete()
      .eq('id', resumeId);
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting resume:', error);
    throw error;
  }
};

// Resume Versions
export const getResumeVersions = async (resumeId) => {
  try {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from(TABLES.RESUME_VERSIONS)
      .select('*')
      .eq('resume_id', resumeId)
      .order('version_number', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching resume versions:', error);
    return [];
  }
};

export const restoreResumeVersion = async (resumeId, versionId) => {
  try {
    if (!supabase) throw new Error('Supabase not configured');
    
    // Get the version data
    const { data: version, error: versionError } = await supabase
      .from(TABLES.RESUME_VERSIONS)
      .select('resume_data, template_id')
      .eq('id', versionId)
      .single();
    if (versionError) throw versionError;
    
    // Update the main resume with version data
    const { data, error } = await supabase
      .from(TABLES.USER_RESUMES)
      .update({
        resume_data: version.resume_data,
        template_id: version.template_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', resumeId)
      .select()
      .single();
    if (error) throw error;
    
    // Track restoration
    await trackResumeEvent(resumeId, 'restore_version', { version_id: versionId });
    
    return data;
  } catch (error) {
    console.error('Error restoring resume version:', error);
    throw error;
  }
};

// Resume Sharing
export const shareResume = async (resumeId, shareData) => {
  try {
    if (!supabase) throw new Error('Supabase not configured');
    
    // Generate access token
    const accessToken = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
    
    const { data, error } = await supabase
      .from(TABLES.RESUME_SHARES)
      .insert([{
        ...shareData,
        resume_id: resumeId,
        access_token: accessToken
      }])
      .select()
      .single();
    if (error) throw error;
    
    // Track sharing
    await trackResumeEvent(resumeId, 'share', { share_type: shareData.share_type });
    
    return data;
  } catch (error) {
    console.error('Error sharing resume:', error);
    throw error;
  }
};

export const getResumeShares = async (resumeId) => {
  try {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from(TABLES.RESUME_SHARES)
      .select('*')
      .eq('resume_id', resumeId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching resume shares:', error);
    return [];
  }
};

export const revokeResumeShare = async (shareId) => {
  try {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase
      .from(TABLES.RESUME_SHARES)
      .update({ is_active: false })
      .eq('id', shareId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error revoking resume share:', error);
    throw error;
  }
};

// Resume Analytics
export const trackResumeEvent = async (resumeId, eventType, metadata = {}) => {
  try {
    if (!supabase || !resumeId) return;
    
    const { error } = await supabase
      .from(TABLES.RESUME_ANALYTICS)
      .insert([{
        resume_id: resumeId,
        event_type: eventType,
        user_agent: navigator?.userAgent || 'Unknown',
        metadata: metadata
      }]);
    
    if (error) {
      console.warn('Analytics tracking failed:', error);
    }
  } catch (error) {
    console.warn('Analytics tracking error:', error);
  }
};

export const getResumeAnalytics = async (resumeId, days = 30) => {
  try {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from(TABLES.RESUME_ANALYTICS)
      .select('*')
      .eq('resume_id', resumeId)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching resume analytics:', error);
    return [];
  }
};

// Resume Comments
export const addResumeComment = async (resumeId, commentData) => {
  try {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from(TABLES.RESUME_COMMENTS)
      .insert([{
        ...commentData,
        resume_id: resumeId
      }])
      .select()
      .single();
    if (error) throw error;
    
    // Track comment
    await trackResumeEvent(resumeId, 'comment');
    
    return data;
  } catch (error) {
    console.error('Error adding resume comment:', error);
    throw error;
  }
};

export const getResumeComments = async (resumeId) => {
  try {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from(TABLES.RESUME_COMMENTS)
      .select('*')
      .eq('resume_id', resumeId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching resume comments:', error);
    return [];
  }
};

// Resume Export Tracking
export const trackResumeExport = async (resumeId, exportFormat, exportSettings = {}) => {
  try {
    if (!supabase) return;
    
    const { data, error } = await supabase
      .from(TABLES.RESUME_EXPORTS)
      .insert([{
        resume_id: resumeId,
        export_format: exportFormat,
        export_settings: exportSettings
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Track download event
    await trackResumeEvent(resumeId, 'download', { format: exportFormat });
    
    return data;
  } catch (error) {
    console.error('Error tracking resume export:', error);
  }
};

// Draft Management
export const saveDraft = async (userEmail, draftData) => {
  try {
    if (!supabase) {
      // Fallback to localStorage for offline mode
      const draftKey = `resume_draft_${userEmail || 'anonymous'}`;
      localStorage.setItem(draftKey, JSON.stringify({
        ...draftData,
        timestamp: Date.now()
      }));
      return { id: 'local_draft', ...draftData };
    }
    
    // Check if draft already exists
    const { data: existing } = await supabase
      .from(TABLES.USER_RESUMES)
      .select('id')
      .eq('user_email', userEmail)
      .eq('status', 'draft')
      .eq('title', 'Auto-saved Draft')
      .single();
    
    if (existing) {
      // Update existing draft
      return await updateResume(existing.id, draftData);
    } else {
      // Create new draft
      return await createResume({
        ...draftData,
        user_email: userEmail,
        title: 'Auto-saved Draft',
        status: 'draft'
      });
    }
  } catch (error) {
    console.error('Error saving draft:', error);
    // Fallback to localStorage
    const draftKey = `resume_draft_${userEmail || 'anonymous'}`;
    localStorage.setItem(draftKey, JSON.stringify({
      ...draftData,
      timestamp: Date.now()
    }));
    return { id: 'local_draft', ...draftData };
  }
};

export const loadDraft = async (userEmail) => {
  try {
    if (!supabase) {
      // Load from localStorage
      const draftKey = `resume_draft_${userEmail || 'anonymous'}`;
      const saved = localStorage.getItem(draftKey);
      return saved ? JSON.parse(saved) : null;
    }
    
    const { data, error } = await supabase
      .from(TABLES.USER_RESUMES)
      .select('*')
      .eq('user_email', userEmail)
      .eq('status', 'draft')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
};

export const deleteDraft = async (userEmail, draftId = null) => {
  try {
    if (!supabase) {
      // Remove from localStorage
      const draftKey = `resume_draft_${userEmail || 'anonymous'}`;
      localStorage.removeItem(draftKey);
      return true;
    }
    
    if (draftId) {
      return await deleteResume(draftId);
    } else {
      // Delete all drafts for user
      const { error } = await supabase
        .from(TABLES.USER_RESUMES)
        .delete()
        .eq('user_email', userEmail)
        .eq('status', 'draft');
      if (error) throw error;
      return true;
    }
  } catch (error) {
    console.error('Error deleting draft:', error);
    return false;
  }
};

// Quick health check function
export const quickHealthCheck = async () => {
  if (!supabase) {
    return { healthy: false, reason: 'No Supabase client' };
  }
  
  try {
    const { error } = await Promise.race([
      supabase.from('website_content').select('id').limit(1),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), 2000)
      )
    ]);
    
    return { 
      healthy: true, 
      status: supabaseConnectionStatus,
      hasError: !!error,
      errorType: error?.code || null
    };
  } catch (healthError) {
    return { 
      healthy: false, 
      reason: healthError.message,
      status: 'health_check_failed'
    };
  }
};

// Make debugging tools available globally
if (typeof window !== 'undefined') {
  window.getSupabaseStatus = getSupabaseStatus;
  window.testSupabaseConnection = testSupabaseConnection;
  window.quickHealthCheck = quickHealthCheck;
}

// Public Resume Access
export const getPublicResume = async (publicSlug) => {
  try {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from(TABLES.USER_RESUMES)
      .select(`
        *,
        template:resume_templates(name, description, template_data)
      `)
      .eq('public_slug', publicSlug)
      .eq('is_public', true)
      .single();
    if (error) throw error;
    
    // Track public view
    if (data) {
      await trackResumeEvent(data.id, 'public_view');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching public resume:', error);
    return null;
  }
};

// Utility Functions
export const calculateResumeCompleteness = (resumeData) => {
  if (!resumeData || typeof resumeData !== 'object') return 0;
  
  const sections = {
    personal: resumeData.personal?.name && resumeData.personal?.email ? 20 : 0,
    summary: resumeData.summary?.trim() ? 15 : 0,
    experience: resumeData.experience?.some(exp => exp.company && exp.role) ? 25 : 0,
    skills: Object.values(resumeData.technicalSkills || {}).some(arr => arr.length > 0) ? 15 : 0,
    education: resumeData.education?.some(edu => edu.degree && edu.university) ? 10 : 0,
    projects: resumeData.projects?.some(proj => proj.title && proj.description) ? 10 : 0,
    certifications: resumeData.certifications?.some(cert => cert.name) ? 5 : 0
  };
  
  return Object.values(sections).reduce((sum, score) => sum + score, 0);
};

export const generateResumePreview = (resumeData) => {
  if (!resumeData) return '';
  
  const name = resumeData.personal?.name || 'Unnamed Resume';
  const title = resumeData.personal?.jobTitle || 'Professional';
  const completeness = calculateResumeCompleteness(resumeData);
  
  return {
    title: `${name} - ${title}`,
    completeness,
    lastModified: new Date().toISOString(),
    sections: Object.keys(resumeData).filter(key => 
      resumeData[key] && 
      (Array.isArray(resumeData[key]) ? resumeData[key].length > 0 : 
       typeof resumeData[key] === 'object' ? Object.keys(resumeData[key]).length > 0 : 
       resumeData[key].toString().trim())
    ).length
  };
};
