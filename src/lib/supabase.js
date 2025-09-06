import { createClient } from '@supabase/supabase-js'

// Use environment variables for flexibility
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase = null
if (!supabaseUrl || !supabaseAnonKey) {
  // Do not throw here — allow the app to run in local/dev mode without Supabase configured.
  // Components/hooks already check import.meta.env before using the backend, but some
  // helper functions live in this file. We guard them below.
  console.warn('Supabase environment variables are missing. Running in fallback/dev mode.')
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }

// Database table names for easy reference
// 1. website_content - stores all website content (hero, about, contact, etc.)
// 2. users - stores user information
// 3. contest_submissions - stores contest submissions
// 4. admin_sessions - stores admin authentication sessions
// 5. upcoming_events - stores upcoming events with dates, times, and registration links
// 6. event_images - stores event image metadata and storage references

export const TABLES = {
  WEBSITE_CONTENT: 'website_content',
  USERS: 'users',
  CONTEST_SUBMISSIONS: 'contest_submissions',
  ADMIN_SESSIONS: 'admin_sessions',
  UPCOMING_EVENTS: 'upcoming_events',
  EVENT_IMAGES: 'event_images'
}

// Storage bucket names
export const STORAGE_BUCKETS = {
  EVENT_IMAGES: 'testingvala-bucket'
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
      return { success: false, error: 'Supabase client not initialized' }
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
    
    // Debug: Log the configuration safely
    console.log('🔧 Supabase Configuration:', {
      url: supabaseUrl,
      key: supabaseKey ? 'Present' : 'Missing',
      bucket: STORAGE_BUCKETS.EVENT_IMAGES
    });
    
    // Test 3: Check storage buckets
    console.log('🔍 Checking storage buckets...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      throw new Error(`Storage bucket error: ${bucketError.message}`);
    }
    
    console.log('📦 Available storage buckets:', buckets.map(b => b.name));
    console.log('🔍 Looking for bucket named:', STORAGE_BUCKETS.EVENT_IMAGES);
    console.log('🔍 Available bucket names:', buckets.map(b => `"${b.name}"`));
    
    // Test 4: Check if our bucket exists
    const eventBucket = buckets.find(b => b.name === STORAGE_BUCKETS.EVENT_IMAGES);
    if (!eventBucket) {
      console.log('❌ Bucket not found. Checking for similar names...');
      const similarBuckets = buckets.filter(b => 
        b.name.toLowerCase().includes('event') || 
        b.name.toLowerCase().includes('image') ||
        b.name.toLowerCase().includes('storage')
      );
      if (similarBuckets.length > 0) {
        console.log('🔍 Similar buckets found:', similarBuckets.map(b => b.name));
      }
      throw new Error(`Storage bucket '${STORAGE_BUCKETS.EVENT_IMAGES}' not found`);
    }
    
    console.log('✅ Event images bucket found:', eventBucket.name);
    console.log('📊 Bucket details:', {
      id: eventBucket.id,
      name: eventBucket.name,
      public: eventBucket.public,
      created_at: eventBucket.created_at
    });
    
    // Test 5: Check bucket policies
    console.log('🔒 Checking bucket policies...');
  try {
  const { data: _policies, error: policyError } = await supabase.storage
        .from(STORAGE_BUCKETS.EVENT_IMAGES)
        .list('', { limit: 1 });
      
      if (policyError) {
        console.warn('⚠️ Policy check warning:', policyError.message);
      } else {
        console.log('✅ Bucket access test passed');
      }
    } catch (policyTestError) {
      console.warn('⚠️ Policy test warning:', policyTestError.message);
    }
    
    console.log('🎉 All Supabase tests passed!');
    return { success: true, buckets: buckets };
    
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    return { success: false, error: error.message };
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
