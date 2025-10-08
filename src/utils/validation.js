/**
 * Frontend Input Validation & Sanitization
 * Using Zod for schema validation and DOMPurify for sanitization
 */
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Common validation schemas
export const emailSchema = z.string()
  .email('Invalid email format')
  .max(254, 'Email too long')
  .transform(email => email.toLowerCase().trim());

export const textSchema = z.string()
  .min(1, 'Required field')
  .max(1000, 'Text too long')
  .transform(text => DOMPurify.sanitize(text.trim()));

export const titleSchema = z.string()
  .min(1, 'Title is required')
  .max(200, 'Title too long')
  .transform(title => DOMPurify.sanitize(title.trim()));

export const contentSchema = z.string()
  .min(1, 'Content is required')
  .max(5000, 'Content too long')
  .transform(content => DOMPurify.sanitize(content.trim()));

export const urlSchema = z.string()
  .url('Invalid URL format')
  .max(2048, 'URL too long')
  .optional()
  .transform(url => url ? DOMPurify.sanitize(url.trim()) : undefined);

// Post creation schema
export const createPostSchema = z.object({
  title: titleSchema,
  content: contentSchema,
  category_id: z.string().min(1, 'Category is required'),
  image_url: urlSchema,
  author_name: textSchema.optional(),
  experience_years: z.string().optional(),
  is_anonymous: z.boolean().default(false),
  visibility: z.enum(['public', 'community', 'private']).default('public')
});

// Magic link schema
export const magicLinkSchema = z.object({
  email: emailSchema,
  deviceId: z.string().min(1).max(100),
  requestId: z.string().min(1).max(50),
  csrfToken: z.string().min(1).max(100)
});

// Board creation schema
export const createBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(50, 'Name too long'),
  description: z.string().max(200, 'Description too long').optional(),
  is_private: z.boolean().default(false),
  cover_image_url: urlSchema
});

/**
 * Validate and sanitize input data
 * @param {object} schema - Zod schema
 * @param {object} data - Input data
 * @returns {object} Validated and sanitized data
 */
export const validateAndSanitize = (schema, data) => {
  try {
    return {
      success: true,
      data: schema.parse(data),
      errors: null
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    };
  }
};

/**
 * Sanitize HTML content
 * @param {string} html - HTML content
 * @returns {string} Sanitized HTML
 */
export const sanitizeHtml = (html) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
};

/**
 * Sanitize plain text
 * @param {string} text - Plain text
 * @returns {string} Sanitized text
 */
export const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  return DOMPurify.sanitize(text.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};