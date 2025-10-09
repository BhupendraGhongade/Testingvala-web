/**
 * MAGIC LINK TOKEN VERIFICATION API
 * Verifies tokens and creates authenticated sessions with roles
 */

import { createClient } from '@supabase/supabase-js';

// Environment configuration
const config = {
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  supabaseKey: process.env.VITE_SUPABASE_ANON_KEY,
  isDevelopment: process.env.NODE_ENV !== 'production' && process.env.VERCEL_ENV !== 'production'
};

// Initialize Supabase
const supabase = config.supabaseUrl && config.supabaseKey 
  ? createClient(config.supabaseUrl, config.supabaseKey)
  : null;

// Verify token from storage
const verifyToken = async (token, email) => {
  if (!supabase) {
    // Development fallback
    const tokens = global.magicTokens || new Map();
    const tokenData = tokens.get(token);
    
    if (!tokenData) {
      return { valid: false, error: 'Token not found' };
    }
    
    if (tokenData.used) {
      return { valid: false, error: 'Token already used' };
    }
    
    if (Date.now() > tokenData.expires) {
      tokens.delete(token);
      return { valid: false, error: 'Token expired' };
    }
    
    if (tokenData.email !== email.toLowerCase().trim()) {
      return { valid: false, error: 'Token email mismatch' };
    }
    
    // Mark as used
    tokenData.used = true;
    tokens.set(token, tokenData);
    
    return { 
      valid: true, 
      email: tokenData.email, 
      role: tokenData.role 
    };
  }
  
  try {
    // Get token from database
    const { data: tokenData, error } = await supabase
      .from('magic_tokens')
      .select('*')
      .eq('token', token)
      .eq('email', email.toLowerCase().trim())
      .eq('used', false)
      .single();
    
    if (error || !tokenData) {
      return { valid: false, error: 'Invalid or expired token' };
    }
    
    // Check expiration
    if (new Date() > new Date(tokenData.expires_at)) {
      // Clean up expired token
      await supabase
        .from('magic_tokens')
        .delete()
        .eq('id', tokenData.id);
      
      return { valid: false, error: 'Token expired' };
    }
    
    // Mark token as used
    await supabase
      .from('magic_tokens')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('id', tokenData.id);
    
    return { 
      valid: true, 
      email: tokenData.email, 
      role: tokenData.role 
    };
    
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false, error: 'Verification failed' };
  }
};

// Create user profile in database
const createUserProfile = async (email, role) => {
  if (!supabase) return true;
  
  try {
    const { error } = await supabase
      .from('users')
      .upsert({
        email: email,
        name: email.split('@')[0],
        role: role,
        is_verified: true,
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      });
    
    if (error) {
      console.warn('User profile creation error:', error);
    } else {
      console.log(`✅ User profile created/updated: ${email} (${role})`);
    }
    
    return true;
  } catch (error) {
    console.error('User profile error:', error);
    return false;
  }
};

export default async function handler(req, res) {
  const requestId = Math.random().toString(36).substring(2, 15);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', requestId });
  }
  
  console.log(`[verify-token] [${requestId}] Verification request started`);
  
  try {
    // Get token and email from query params or body
    const { token, email } = req.method === 'GET' ? req.query : req.body;
    
    if (!token || !email) {
      return res.status(400).json({ 
        error: 'Token and email are required', 
        requestId 
      });
    }
    
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format', 
        requestId 
      });
    }
    
    console.log(`[verify-token] [${requestId}] Verifying token for: ${email}`);
    
    // Verify the token
    const verification = await verifyToken(token, email);
    
    if (!verification.valid) {
      console.log(`[verify-token] [${requestId}] ❌ Verification failed: ${verification.error}`);
      return res.status(400).json({ 
        error: verification.error, 
        requestId 
      });
    }
    
    // Create/update user profile
    await createUserProfile(verification.email, verification.role);
    
    // Generate session data
    const sessionData = {
      email: verification.email,
      role: verification.role,
      verified: true,
      loginTime: Date.now(),
      expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
      deviceId: req.body?.deviceId || req.query?.deviceId || 'web'
    };
    
    console.log(`[verify-token] [${requestId}] ✅ Token verified successfully: ${verification.email} (${verification.role})`);
    
    // Return success with session data
    return res.status(200).json({
      success: true,
      user: {
        id: `auth_${Date.now()}`,
        email: verification.email,
        role: verification.role,
        email_confirmed_at: new Date().toISOString(),
        user_metadata: {
          name: verification.email.split('@')[0],
          role: verification.role
        }
      },
      session: sessionData,
      message: 'Authentication successful',
      requestId
    });
    
  } catch (error) {
    console.error(`[verify-token] [${requestId}] Error:`, error);
    
    return res.status(500).json({
      error: 'Verification failed',
      message: 'Unable to verify token. Please try again.',
      requestId
    });
  }
}