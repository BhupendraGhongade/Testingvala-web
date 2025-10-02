/**
 * Environment-Aware Data Management
 * Handles data separation between local, dev, and production
 */

import { ENV } from '../lib/supabase.js'

// Data prefixes for environment separation
const DATA_PREFIXES = {
  local: 'local_',
  development: 'dev_',
  production: ''  // Production uses clean data
}

// Get environment-specific table prefix
export const getTablePrefix = () => {
  return DATA_PREFIXES[ENV.current] || DATA_PREFIXES.development
}

// Environment-aware data operations
export const createEnvironmentData = (data, type = 'user') => {
  const prefix = getTablePrefix()
  
  // Add environment metadata
  const environmentData = {
    ...data,
    environment: ENV.current,
    created_in_env: ENV.current,
    is_test_data: !ENV.isProduction
  }
  
  // Add environment prefix to identifiers if not production
  if (!ENV.isProduction && data.email) {
    environmentData.email = `${prefix}${data.email}`
  }
  
  if (!ENV.isProduction && data.name) {
    environmentData.name = `[${ENV.current.toUpperCase()}] ${data.name}`
  }
  
  return environmentData
}

// Clean data for display (remove environment prefixes)
export const cleanDisplayData = (data) => {
  if (!data) return data
  
  const cleaned = { ...data }
  const prefix = getTablePrefix()
  
  // Remove environment prefixes for display
  if (cleaned.email && cleaned.email.startsWith(prefix)) {
    cleaned.email = cleaned.email.replace(prefix, '')
  }
  
  if (cleaned.name && cleaned.name.startsWith(`[${ENV.current.toUpperCase()}]`)) {
    cleaned.name = cleaned.name.replace(`[${ENV.current.toUpperCase()}] `, '')
  }
  
  return cleaned
}

// Environment-specific queries
export const getEnvironmentFilter = () => {
  if (ENV.isProduction) {
    // Production: only show production data
    return { environment: 'production' }
  } else {
    // Dev/Local: show data for current environment
    return { environment: ENV.current }
  }
}

// Data migration helpers
export const migrateDataBetweenEnvironments = async (fromEnv, toEnv, dataType) => {
  // This would be used for promoting dev data to production
  console.log(`Migrating ${dataType} data from ${fromEnv} to ${toEnv}`)
  // Implementation would depend on specific needs
}

// Environment status
export const getEnvironmentStatus = () => {
  return {
    environment: ENV.current,
    isLocal: ENV.isLocal,
    isDevelopment: ENV.isDevelopment,
    isProduction: ENV.isProduction,
    databaseUrl: ENV.databaseUrl,
    dataPrefix: getTablePrefix(),
    safeToTest: !ENV.isProduction
  }
}

// Development helpers
export const logEnvironmentInfo = () => {
  if (ENV.isProduction) return // Don't log in production
  
  console.group('🌍 Environment Info')
  console.log('Current Environment:', ENV.current)
  console.log('Database URL:', ENV.databaseUrl)
  console.log('Data Prefix:', getTablePrefix())
  console.log('Safe to Test:', !ENV.isProduction)
  console.groupEnd()
}

// Initialize environment logging
if (!ENV.isProduction) {
  logEnvironmentInfo()
}