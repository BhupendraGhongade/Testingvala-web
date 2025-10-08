/**
 * Secure Magic Link API Endpoint
 * Server-side validation with Zod and DOMPurify
 */
import { validateRequest, checkRateLimit, serverMagicLinkSchema } from './utils/serverValidation.js';

export default async function handler(req, res) {
  try {
    // Validate request and sanitize input
    const validation = validateRequest(req, serverMagicLinkSchema);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input', details: validation.errors });
    }

    const { email, requestId } = validation.data;
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Check rate limiting
    const rateLimit = checkRateLimit(`${email}:${clientIP}`);
    if (!rateLimit.allowed) {
      return res.status(429).json({ 
        error: `Rate limit exceeded. Try again after ${rateLimit.resetTime.toLocaleTimeString()}` 
      });
    }
    
    // Here you would integrate with ZeptoMail using ZEPTO_API_KEY from env
    console.log(`Magic link request: ${email} from ${clientIP} (${requestId})`);
    
    return res.status(200).json({
      success: true,
      messageId: `msg_${Date.now()}`,
      remaining: rateLimit.remaining
    });
    
  } catch (error) {
    console.error('Magic link error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}