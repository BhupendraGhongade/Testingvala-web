import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// Table names
export const TABLES = {
  WEBSITE_CONTENT: 'website_content',
  USERS: 'users',
  EVENTS: 'events',
  FORUM_POSTS: 'forum_posts',
  FORUM_CATEGORIES: 'forum_categories',
  JOB_POSTINGS: 'job_postings',
  CANDIDATES: 'candidates',
  AUDIT_LOGS: 'audit_logs'
}

// Events functions
export const getUpcomingEvents = async () => {
  try {
    if (!supabase) return []
    const { data, error } = await supabase
      .from(TABLES.EVENTS)
      .select('*')
      .eq('is_active', true)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export const createEvent = async (eventData) => {
  try {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from(TABLES.EVENTS)
      .insert([eventData])
      .select()
      .single()
    
    if (error) throw error
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
      .from(TABLES.EVENTS)
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
      .from(TABLES.EVENTS)
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