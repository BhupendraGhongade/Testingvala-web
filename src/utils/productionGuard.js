/**
 * Production Environment Guard
 * Prevents local/test data from appearing in production
 */

import { ENV } from '../lib/supabase.js'

// Check if we're in production
export const isProduction = () => {
  return ENV.isProduction || 
         window.location.hostname === 'testingvala.com' ||
         window.location.hostname.includes('vercel.app')
}

// Clear all local data in production
export const clearLocalDataInProduction = () => {
  if (!isProduction()) return false
  
  console.log('🚨 Production environment detected - clearing local data')
  
  // Clear all localStorage items that might contain local data
  const localStorageKeys = [
    'local_forum_posts',
    'contest_submissions', 
    'guest_likes',
    'guest_like_counts',
    'posts_cleared_by_admin',
    'force_clear_posts',
    'testingvala_session'
  ]
  
  localStorageKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key)
      console.log(`🧹 Cleared localStorage: ${key}`)
    }
  })
  
  // Clear any resume drafts
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('resume_draft_') || 
        key.startsWith('local_') || 
        key.startsWith('dev_') ||
        key.startsWith('test_')) {
      localStorage.removeItem(key)
      console.log(`🧹 Cleared localStorage: ${key}`)
    }
  })
  
  return true
}

// Filter out local/test data from arrays
export const filterProductionData = (data) => {
  if (!isProduction() || !Array.isArray(data)) return data
  
  return data.filter(item => {
    // Remove items with local/test identifiers
    if (item.id && (
      item.id.startsWith('local-') ||
      item.id.startsWith('demo-') ||
      item.id.startsWith('test-') ||
      item.id.startsWith('dev-')
    )) {
      console.log(`🚫 Filtered out local data: ${item.id}`)
      return false
    }
    
    // Remove items marked as test data
    if (item.is_test_data === true) {
      console.log(`🚫 Filtered out test data: ${item.id || 'unknown'}`)
      return false
    }
    
    // Remove items from non-production environments
    if (item.environment && item.environment !== 'production') {
      console.log(`🚫 Filtered out ${item.environment} data: ${item.id || 'unknown'}`)
      return false
    }
    
    return true
  })
}

// Prevent local data creation in production
export const preventLocalDataCreation = (operation, data) => {
  if (!isProduction()) return true
  
  // Block creation of local/test data
  if (data && (
    data.id?.startsWith('local-') ||
    data.id?.startsWith('demo-') ||
    data.id?.startsWith('test-') ||
    data.is_test_data === true
  )) {
    console.warn(`🚫 Blocked ${operation} of local data in production:`, data.id)
    return false
  }
  
  return true
}

// Initialize production guard
export const initProductionGuard = () => {
  if (isProduction()) {
    console.log('🛡️ Production Guard Active')
    clearLocalDataInProduction()
    
    // Set up periodic cleanup
    setInterval(() => {
      clearLocalDataInProduction()
    }, 5 * 60 * 1000) // Every 5 minutes
    
    return true
  }
  
  console.log('🔧 Development Mode - Local data allowed')
  return false
}

// Export environment check
export { isProduction as default }