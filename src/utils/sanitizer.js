<<<<<<< HEAD
/**
 * Input Sanitization Utilities
 * Prevents XSS and injection attacks
 */

// HTML entity encoding map
const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
};

/**
 * Sanitize HTML content to prevent XSS
 * @param {string} input - Raw HTML input
 * @returns {string} - Sanitized HTML
 */
export const sanitizeHtml = (input) => {
  if (typeof input !== 'string') return '';
  
  return input.replace(/[&<>"'/]/g, (match) => HTML_ENTITIES[match] || match);
};

/**
 * Sanitize text input for safe display
 * @param {string} input - Raw text input
 * @returns {string} - Sanitized text
 */
export const sanitizeText = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
=======
// Input sanitization utilities for production security
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
>>>>>>> origin/main
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

<<<<<<< HEAD
/**
 * Validate and sanitize email
 * @param {string} email - Email input
 * @returns {string} - Sanitized email
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  
  const sanitized = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(sanitized) ? sanitized : '';
};

/**
 * Sanitize URL to prevent XSS
 * @param {string} url - URL input
 * @returns {string} - Sanitized URL
 */
export const sanitizeUrl = (url) => {
  if (typeof url !== 'string') return '';
  
  // Remove dangerous protocols
  const sanitized = url.replace(/^(javascript|data|vbscript):/gi, '');
  
  try {
    const urlObj = new URL(sanitized);
    return ['http:', 'https:'].includes(urlObj.protocol) ? sanitized : '';
  } catch {
    return '';
  }
};

/**
 * Sanitize object properties recursively
 * @param {object} obj - Object to sanitize
 * @returns {object} - Sanitized object
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeText(item) : sanitizeObject(item)
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
=======
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._-]/g, ''); // Only allow valid email characters
};

export const sanitizeHTML = (html) => {
  if (typeof html !== 'string') return html;
  
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
>>>>>>> origin/main
};