import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase = null
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Running in fallback/dev mode.')
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }

// Storage bucket names
export const STORAGE_BUCKETS = {
  PAYMENTS: 'payments',
  EVENT_IMAGES: 'event-images'
}

// Table names
export const TABLES = {
  WEBSITE_CONTENT: 'website_content',
  USERS: 'users',
  EVENTS: 'events',
  FORUM_POSTS: 'forum_posts',
  FORUM_CATEGORIES: 'forum_categories',
  JOB_POSTINGS: 'job_postings',
  CANDIDATES: 'candidates',
  AUDIT_LOGS: 'audit_logs',
  USER_RESUMES: 'user_resumes',
  AI_RESUME_GENERATIONS: 'ai_resume_generations',
  RESUME_ANALYTICS: 'resume_analytics',
  RESUME_TEMPLATES: 'resume_templates',
  PAYMENT_CONFIG: 'payment_config',
  PREMIUM_SUBSCRIPTIONS: 'premium_subscriptions',
  PREMIUM_ACTIVITY_LOGS: 'premium_activity_logs'
}

// Events functions
export const getUpcomingEvents = async () => {
  try {
    if (!supabase) return []
    const { data, error } = await supabase
      .from('upcoming_events')
      .select('*')
      .order('event_date', { ascending: false })
    
    if (error) {
      console.error('Error fetching events:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export const createEvent = async (eventData) => {
  try {
    if (!supabase) throw new Error('Supabase not configured')
    
    // Ensure all required fields are present
    const completeEventData = {
      title: eventData.title,
      description: eventData.description || '',
      short_description: eventData.short_description || '',
      event_date: eventData.event_date,
      event_time: eventData.event_time,
      duration_minutes: eventData.duration_minutes || 120,
      registration_link: eventData.registration_link || '',
      image_url: eventData.image_url || null,
      event_type: eventData.event_type || 'workshop',
      difficulty_level: eventData.difficulty_level || 'beginner',
      max_participants: eventData.max_participants || null,
      is_featured: eventData.is_featured || false,
      is_active: eventData.is_active !== false,
      price: eventData.price || '$99',
      capacity: eventData.capacity || 50,
      registered_count: 0,
      speaker: eventData.speaker || 'QA Expert',
      speaker_title: eventData.speaker_title || 'Senior QA Professional',
      company: eventData.company || 'TestingVala',
      location: eventData.location || 'Online',
      featured: eventData.featured || eventData.is_featured || false
    }
    
    const { data, error } = await supabase
      .from('upcoming_events')
      .insert([completeEventData])
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    return data
  } catch (error) {
    console.error('Error creating event:', error)
    throw error
  }
}

export const updateEvent = async (id, eventData) => {
  try {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('upcoming_events')
      .update(eventData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating event:', error)
    throw error
  }
}

export const deleteEvent = async (id) => {
  try {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase
      .from('upcoming_events')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting event:', error)
    throw error
  }
}

export const uploadEventImage = async (file, eventId) => {
  try {
    if (!supabase) throw new Error('Supabase not configured')
    const fileExt = file.name.split('.').pop()
    const fileName = `event-${eventId}-${Date.now()}.${fileExt}`
    const filePath = `events/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

export const testSupabaseConnection = async () => {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' }
    }
    const { data, error } = await supabase
      .from(TABLES.WEBSITE_CONTENT)
      .select('id')
      .limit(1)
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Forum Management Functions
export const getForumPosts = async (filters = {}) => {
  try {
    if (!supabase) return []
    
    let query = supabase
      .from(TABLES.FORUM_POSTS)
      .select(`
        *,
        forum_categories(name, description),
        user_profiles(username, full_name, avatar_url)
      `)
      .order('created_at', { ascending: false })
    
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id)
    }
    
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching forum posts:', error)
    return []
  }
}

export const updatePostStatus = async (postId, status) => {
  try {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from(TABLES.FORUM_POSTS)
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating post status:', error)
    throw error
  }
}

export const deleteForumPost = async (postId) => {
  try {
    if (!supabase) throw new Error('Supabase not configured')
    
    // First delete related replies
    await supabase
      .from('forum_replies')
      .delete()
      .eq('post_id', postId)
    
    // Then delete the post
    const { error } = await supabase
      .from(TABLES.FORUM_POSTS)
      .delete()
      .eq('id', postId)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting forum post:', error)
    throw error
  }
}

export const getForumCategories = async () => {
  try {
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from(TABLES.FORUM_CATEGORIES)
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching forum categories:', error)
    return []
  }
}

export const createForumCategory = async (categoryData) => {
  try {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from(TABLES.FORUM_CATEGORIES)
      .insert([categoryData])
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating forum category:', error)
    throw error
  }
}

export const updateForumCategory = async (categoryId, categoryData) => {
  try {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from(TABLES.FORUM_CATEGORIES)
      .update(categoryData)
      .eq('id', categoryId)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating forum category:', error)
    throw error
  }
}

export const deleteForumCategory = async (categoryId) => {
  try {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase
      .from(TABLES.FORUM_CATEGORIES)
      .delete()
      .eq('id', categoryId)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting forum category:', error)
    throw error
  }
}

export const getForumUsers = async (limit = 100) => {
  try {
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching forum users:', error)
    return []
  }
}

export const getForumAnalytics = async () => {
  try {
    if (!supabase) return {}
    
    const [postsCount, usersCount, categoriesCount, pendingCount, activeCount, rejectedCount] = await Promise.all([
      supabase.from(TABLES.FORUM_POSTS).select('id', { count: 'exact' }),
      supabase.from('user_profiles').select('id', { count: 'exact' }),
      supabase.from(TABLES.FORUM_CATEGORIES).select('id', { count: 'exact' }),
      supabase.from(TABLES.FORUM_POSTS).select('id', { count: 'exact' }).eq('status', 'pending_approval'),
      supabase.from(TABLES.FORUM_POSTS).select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from(TABLES.FORUM_POSTS).select('id', { count: 'exact' }).eq('status', 'rejected')
    ])
    
    return {
      totalPosts: postsCount.count || 0,
      totalUsers: usersCount.count || 0,
      totalCategories: categoriesCount.count || 0,
      pendingPosts: pendingCount.count || 0,
      activePosts: activeCount.count || 0,
      rejectedPosts: rejectedCount.count || 0
    }
  } catch (error) {
    console.error('Error fetching forum analytics:', error)
    return {}
  }
}

// User Management Functions
export const getUserProfiles = async (filters = {}) => {
  try {
    if (!supabase) return []
    
    let query = supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    
    if (filters.search) {
      query = query.or(`username.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching user profiles:', error)
    return []
  }
}

export const updateUserProfile = async (userId, profileData) => {
  try {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

// Job Management Functions
export const getJobPostings = async (filters = {}) => {
  try {
    if (!supabase) return []
    
    let query = supabase
      .from(TABLES.JOB_POSTINGS)
      .select('*')
      .order('created_at', { ascending: false })
    
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,company.ilike.%${filters.search}%`)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching job postings:', error)
    return []
  }
}

export const createJobPosting = async (jobData) => {
  try {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from(TABLES.JOB_POSTINGS)
      .insert([jobData])
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating job posting:', error)
    throw error
  }
}

export const updateJobPosting = async (jobId, jobData) => {
  try {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from(TABLES.JOB_POSTINGS)
      .update(jobData)
      .eq('id', jobId)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating job posting:', error)
    throw error
  }
}

export const deleteJobPosting = async (jobId) => {
  try {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase
      .from(TABLES.JOB_POSTINGS)
      .delete()
      .eq('id', jobId)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting job posting:', error)
    throw error
  }
}

// Candidate Management Functions
export const getCandidates = async (filters = {}) => {
  try {
    if (!supabase) return []
    
    let query = supabase
      .from(TABLES.CANDIDATES)
      .select('*')
      .order('created_at', { ascending: false })
    
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching candidates:', error)
    return []
  }
}

export const updateCandidateStatus = async (candidateId, status) => {
  try {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from(TABLES.CANDIDATES)
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', candidateId)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating candidate status:', error)
    throw error
  }
}

// Resume Analytics Functions
export const getResumeAnalytics = async (dateRange = '30d') => {
  try {
    if (!supabase) return null
    
    // Calculate date filter based on range
    const now = new Date()
    let startDate
    switch (dateRange) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
    
    const [resumesResult, usersResult, aiGenerationsResult] = await Promise.all([
      supabase.from(TABLES.USER_RESUMES)
        .select('*')
        .gte('created_at', startDate.toISOString())
        .neq('status', 'draft'),
      supabase.from(TABLES.USERS)
        .select('*')
        .gte('created_at', startDate.toISOString()),
      supabase.from(TABLES.AI_RESUME_GENERATIONS)
        .select('*')
        .gte('created_at', startDate.toISOString())
    ])
    
    return {
      resumes: resumesResult.data || [],
      users: usersResult.data || [],
      aiGenerations: aiGenerationsResult.data || []
    }
  } catch (error) {
    console.error('Error fetching resume analytics:', error)
    return null
  }
}

export const getAllResumes = async (limit = 100) => {
  try {
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from(TABLES.USER_RESUMES)
      .select('*')
      .neq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching resumes:', error)
    return []
  }
}

export const getAllUsers = async (limit = 100) => {
  try {
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export const getAIGenerations = async (limit = 100) => {
  try {
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from(TABLES.AI_RESUME_GENERATIONS)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching AI generations:', error)
    return []
  }
}

// Premium Management Functions
export const getPremiumSubscriptions = async (filters = {}) => {
  try {
    if (!supabase) return []
    
    let query = supabase
      .from(TABLES.PREMIUM_SUBSCRIPTIONS)
      .select('*')
      .order('created_at', { ascending: false })
    
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching premium subscriptions:', error)
    return []
  }
}

export const updateSubscriptionStatus = async (subscriptionId, status, adminNotes = '') => {
  try {
    if (!supabase) throw new Error('Supabase not configured')
    
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
      notes: adminNotes
    }
    
    if (status === 'active') {
      updateData.starts_at = new Date().toISOString()
      updateData.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      updateData.approved_by = 'admin'
      updateData.approved_at = new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from(TABLES.PREMIUM_SUBSCRIPTIONS)
      .update(updateData)
      .eq('id', subscriptionId)
      .select()
      .single()
    
    if (error) throw error
    
    // Log activity
    await supabase.from(TABLES.PREMIUM_ACTIVITY_LOGS).insert({
      subscription_id: subscriptionId,
      action: `status_changed_to_${status}`,
      performed_by: 'admin',
      details: { notes: adminNotes, timestamp: new Date().toISOString() }
    })
    
    return data
  } catch (error) {
    console.error('Error updating subscription status:', error)
    throw error
  }
}

export const checkPremiumAccess = async (userEmail) => {
  try {
    if (!supabase || !userEmail) return false
    
    const { data, error } = await supabase
      .from(TABLES.PREMIUM_SUBSCRIPTIONS)
      .select('*')
      .eq('user_email', userEmail)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return !!data
  } catch (error) {
    console.error('Error checking premium access:', error)
    return false
  }
}

export const getPaymentConfig = async () => {
  try {
    if (!supabase) return null
    
    const { data, error } = await supabase
      .from(TABLES.PAYMENT_CONFIG)
      .select('*')
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching payment config:', error)
    return null
  }
}

export const updatePaymentConfig = async (config) => {
  try {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from(TABLES.PAYMENT_CONFIG)
      .update({ ...config, updated_at: new Date().toISOString() })
      .eq('id', 1)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating payment config:', error)
    throw error
  }
}