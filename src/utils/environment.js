// src/config/environment.js

/**
 * Determines the current operating environment.
 * 'production' is for the live Vercel deployment (uses Supabase).
 * 'development' is for local work (uses Docker and localStorage).
 */
export const APP_ENV = import.meta.env.VITE_APP_ENV || 'development';

export const isProduction = APP_ENV === 'production';
export const isDevelopment = APP_ENV === 'development';

console.log(`[ENV] Application is running in: ${APP_ENV.toUpperCase()}`);

// You can add other environment-specific configurations here
// For example, feature flags:
// export const FANCY_FEATURE_ENABLED = isDevelopment;