/**
 * Server-Side Input Validation & Sanitization
 * Never trust client input - validate and sanitize everything
 */
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Server-side schemas (stricter than client)
export const serverEmailSchema = z.string()
  .email('Invalid email format')
  .max(254, 'Email too long')
  .refine(email => !email.includes('+'), 'Plus addressing not allowed')
  .transform(email => email.toLowerCase().trim());

export const serverCreatePostSchema = z.object({
  title: z.string()
    .min(1, 'Title required')
    .max(200, 'Title too long')
    .refine(title => !/<script|javascript:|data:/i.test(title), 'Dangerous content in title')
    .transform(title => DOMPurify.sanitize(title.trim())),
  
  content: z.string()
    .min(1, 'Content required')
    .max(5000, 'Content too long')
    .refine(content => !/<script|javascript:|data:|vbscript:/i.test(content), 'Dangerous content detected')
    .transform(content => DOMPurify.sanitize(content.trim()))
});

export const serverMagicLinkSchema = z.object({
  email: serverEmailSchema,
  deviceId: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/, 'Invalid device ID'),
  requestId: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/, 'Invalid request ID'),
  csrfToken: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/, 'Invalid CSRF token')
});

/**
 * Validate request with security checks
 */
export const validateRequest = (req, schema) => {
  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const csrfToken = req.headers['x-csrf-token'];
    const bodyToken = req.body?.csrfToken;
    
    if (!csrfToken || !bodyToken || csrfToken !== bodyToken) {
      throw new Error('Invalid CSRF token');
    }

    const validated = schema.parse(req.body);
    
    return { success: true, data: validated, errors: null };
  } catch (error) {
    return { success: false, data: null, errors: error.errors || [{ message: error.message }] };
  }
};

const rateLimitStore = new Map();

export const checkRateLimit = (key, maxRequests = 5, windowMs = 60 * 60 * 1000) => {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };
  
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: new Date(record.resetTime) };
  }
  
  record.count++;
  rateLimitStore.set(key, record);
  
  return { allowed: true, remaining: maxRequests - record.count, resetTime: new Date(record.resetTime) };
};