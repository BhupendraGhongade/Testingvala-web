/**
 * CSRF Protection Utilities
 */

/**
 * Generate CSRF token
 * @returns {string} CSRF token
 */
export const generateCSRFToken = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Get CSRF token from session storage
 * @returns {string|null} CSRF token
 */
export const getCSRFToken = () => {
  try {
    return sessionStorage.getItem('csrf_token');
  } catch {
    return null;
  }
};

/**
 * Set CSRF token in session storage
 * @param {string} token - CSRF token
 */
export const setCSRFToken = (token) => {
  try {
    sessionStorage.setItem('csrf_token', token);
  } catch (error) {
    console.warn('Failed to set CSRF token:', error);
  }
};

/**
 * Add CSRF headers to fetch request
 * @param {object} headers - Existing headers
 * @returns {object} Headers with CSRF token
 */
export const addCSRFHeaders = (headers = {}) => {
  const token = getCSRFToken();
  
  if (token) {
    return {
      ...headers,
      'X-CSRF-Token': token,
      'X-Requested-With': 'XMLHttpRequest'
    };
  }
  
  return headers;
};

/**
 * Create secure fetch wrapper with CSRF protection
 * @param {string} url - Request URL
 * @param {object} options - Fetch options
 * @returns {Promise} Fetch promise
 */
export const secureFetch = async (url, options = {}) => {
  const token = getCSRFToken() || generateCSRFToken();
  setCSRFToken(token);
  
  const secureOptions = {
    ...options,
    headers: addCSRFHeaders(options.headers),
    credentials: 'same-origin'
  };
  
  return fetch(url, secureOptions);
};