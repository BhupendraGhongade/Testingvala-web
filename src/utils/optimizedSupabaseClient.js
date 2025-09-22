// Optimized Supabase Client with Request Deduplication
import { createClient } from '@supabase/supabase-js';
import { logApiCall } from './globalApiLogger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Request deduplication cache
const requestCache = new Map();
const CACHE_TTL = 30000; // 30 seconds

class OptimizedSupabaseClient {
  constructor() {
    this.client = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
    this.pendingRequests = new Map();
  }

  // Deduplicated query method
  async query(table, operation, params = {}, cacheKey = null) {
    if (!this.client) return { data: null, error: new Error('Supabase not configured') };

    const key = cacheKey || `${table}:${operation}:${JSON.stringify(params)}`;
    
    // Log the API call
    logApiCall(`supabase:${table}:${operation}`, 'OptimizedSupabase', 'database', params);

    // Check cache first
    const cached = requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      logApiCall(`supabase:${table}:${operation}`, 'OptimizedSupabase', 'cache', { hit: true });
      return cached.result;
    }

    // Check for pending request
    if (this.pendingRequests.has(key)) {
      logApiCall(`supabase:${table}:${operation}`, 'OptimizedSupabase', 'dedupe', { pending: true });
      return await this.pendingRequests.get(key);
    }

    // Execute request
    const requestPromise = this.executeQuery(table, operation, params);
    this.pendingRequests.set(key, requestPromise);

    try {
      const result = await requestPromise;
      
      // Cache successful results
      if (!result.error) {
        requestCache.set(key, { result, timestamp: Date.now() });
      }
      
      return result;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  async executeQuery(table, operation, params) {
    let query = this.client.from(table);

    switch (operation) {
      case 'select':
        query = query.select(params.select || '*');
        if (params.eq) Object.entries(params.eq).forEach(([col, val]) => query = query.eq(col, val));
        if (params.in) Object.entries(params.in).forEach(([col, vals]) => query = query.in(col, vals));
        if (params.order) query = query.order(params.order.column, { ascending: params.order.ascending });
        if (params.limit) query = query.limit(params.limit);
        break;
      
      case 'insert':
        query = query.insert(params.data);
        break;
      
      case 'update':
        query = query.update(params.data);
        if (params.eq) Object.entries(params.eq).forEach(([col, val]) => query = query.eq(col, val));
        break;
      
      case 'delete':
        if (params.eq) Object.entries(params.eq).forEach(([col, val]) => query = query.eq(col, val));
        query = query.delete();
        break;
    }

    return await query;
  }

  // Clear cache
  clearCache(pattern = null) {
    if (pattern) {
      for (const key of requestCache.keys()) {
        if (key.includes(pattern)) {
          requestCache.delete(key);
        }
      }
    } else {
      requestCache.clear();
    }
  }
}

export const optimizedSupabase = new OptimizedSupabaseClient();
export default optimizedSupabase;