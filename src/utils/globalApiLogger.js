// 🔍 Global API Logger - Comprehensive API Call Tracking System
// This utility captures EVERY API call across the entire application

class GlobalApiLogger {
  constructor() {
    this.calls = new Map(); // callId -> call details
    this.callsByEndpoint = new Map(); // endpoint -> array of calls
    this.callsByComponent = new Map(); // component -> array of calls
    this.duplicates = new Map(); // endpoint -> duplicate count
    this.callCounter = 0;
    this.startTime = Date.now();
    this.isEnabled = import.meta.env.DEV;
    
    if (this.isEnabled) {
      this.interceptSupabaseRequests();
      this.interceptFetchRequests();
      console.log('🔍 Global API Logger initialized');
    }
  }

  // Intercept Supabase requests
  interceptSupabaseRequests() {
    if (typeof window !== 'undefined' && window.supabase) {
      const originalFrom = window.supabase.from;
      window.supabase.from = (table) => {
        const query = originalFrom.call(window.supabase, table);
        
        // Intercept select operations
        const originalSelect = query.select;
        query.select = (...args) => {
          const result = originalSelect.apply(query, args);
          this.logCall(`supabase:${table}:select`, 'Supabase', 'database', {
            table,
            operation: 'select',
            args: args
          });
          return result;
        };

        // Intercept insert operations
        const originalInsert = query.insert;
        query.insert = (...args) => {
          const result = originalInsert.apply(query, args);
          this.logCall(`supabase:${table}:insert`, 'Supabase', 'database', {
            table,
            operation: 'insert',
            args: args
          });
          return result;
        };

        // Intercept update operations
        const originalUpdate = query.update;
        query.update = (...args) => {
          const result = originalUpdate.apply(query, args);
          this.logCall(`supabase:${table}:update`, 'Supabase', 'database', {
            table,
            operation: 'update',
            args: args
          });
          return result;
        };

        // Intercept delete operations
        const originalDelete = query.delete;
        query.delete = (...args) => {
          const result = originalDelete.apply(query, args);
          this.logCall(`supabase:${table}:delete`, 'Supabase', 'database', {
            table,
            operation: 'delete',
            args: args
          });
          return result;
        };

        return query;
      };
    }
  }

  // Intercept fetch requests
  interceptFetchRequests() {
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      window.fetch = (...args) => {
        const url = args[0];
        const options = args[1] || {};
        
        this.logCall(`fetch:${url}`, 'Fetch', 'http', {
          url,
          method: options.method || 'GET',
          headers: options.headers
        });
        
        return originalFetch.apply(window, args);
      };
    }
  }

  logCall(endpoint, component, type = 'api', metadata = {}) {
    if (!this.isEnabled) return;

    this.callCounter++;
    const callId = `call_${this.callCounter}`;
    const timestamp = Date.now();
    const stack = new Error().stack;
    
    const call = {
      id: callId,
      endpoint,
      component,
      type,
      timestamp,
      timeFromStart: timestamp - this.startTime,
      metadata,
      stack: stack ? stack.split('\n').slice(2, 8) : []
    };

    // Store call
    this.calls.set(callId, call);

    // Group by endpoint
    if (!this.callsByEndpoint.has(endpoint)) {
      this.callsByEndpoint.set(endpoint, []);
    }
    this.callsByEndpoint.get(endpoint).push(call);

    // Group by component
    if (!this.callsByComponent.has(component)) {
      this.callsByComponent.set(component, []);
    }
    this.callsByComponent.get(component).push(call);

    // Check for duplicates (within 5 seconds)
    const endpointCalls = this.callsByEndpoint.get(endpoint);
    const recentCalls = endpointCalls.filter(c => timestamp - c.timestamp < 5000);
    
    if (recentCalls.length > 1) {
      const duplicateCount = this.duplicates.get(endpoint) || 0;
      this.duplicates.set(endpoint, duplicateCount + 1);
      
      console.group(`⚠️ DUPLICATE API CALL #${this.callCounter}: ${endpoint}`);
      console.warn(`🔄 Duplicate detected! ${recentCalls.length} calls in 5 seconds`);
      console.log(`📍 Component: ${component}`);
      console.log(`⏰ Time: ${new Date(timestamp).toISOString()}`);
      console.log(`📊 Previous calls:`, recentCalls.slice(0, -1));
      console.groupEnd();
    } else {
      console.log(`✅ API Call #${this.callCounter}: ${endpoint} (${component})`);
    }

    return callId;
  }

  // Get comprehensive statistics
  getStats() {
    const now = Date.now();
    const totalTime = now - this.startTime;
    
    const stats = {
      summary: {
        totalCalls: this.callCounter,
        uniqueEndpoints: this.callsByEndpoint.size,
        totalDuplicates: Array.from(this.duplicates.values()).reduce((sum, count) => sum + count, 0),
        duplicatePercentage: this.callCounter > 0 ? Math.round((Array.from(this.duplicates.values()).reduce((sum, count) => sum + count, 0) / this.callCounter) * 100) : 0,
        sessionDuration: Math.round(totalTime / 1000),
        callsPerMinute: this.callCounter > 0 ? Math.round((this.callCounter / totalTime) * 60000) : 0
      },
      byEndpoint: {},
      byComponent: {},
      duplicates: Object.fromEntries(this.duplicates),
      timeline: [],
      recentCalls: []
    };

    // Endpoint statistics
    this.callsByEndpoint.forEach((calls, endpoint) => {
      stats.byEndpoint[endpoint] = {
        count: calls.length,
        duplicates: this.duplicates.get(endpoint) || 0,
        firstCall: calls[0].timestamp,
        lastCall: calls[calls.length - 1].timestamp,
        components: [...new Set(calls.map(c => c.component))]
      };
    });

    // Component statistics
    this.callsByComponent.forEach((calls, component) => {
      stats.byComponent[component] = {
        count: calls.length,
        endpoints: [...new Set(calls.map(c => c.endpoint))],
        duplicates: calls.reduce((sum, call) => {
          const endpointDuplicates = this.duplicates.get(call.endpoint) || 0;
          return sum + (endpointDuplicates > 0 ? 1 : 0);
        }, 0)
      };
    });

    // Timeline (last 50 calls)
    const allCalls = Array.from(this.calls.values()).sort((a, b) => b.timestamp - a.timestamp);
    stats.timeline = allCalls.slice(0, 50).map(call => ({
      id: call.id,
      endpoint: call.endpoint,
      component: call.component,
      timestamp: call.timestamp,
      timeFromStart: call.timeFromStart
    }));

    // Recent calls (last 10)
    stats.recentCalls = allCalls.slice(0, 10);

    return stats;
  }

  // Generate detailed report
  generateReport() {
    const stats = this.getStats();
    
    console.group('📊 COMPREHENSIVE API AUDIT REPORT');
    console.log('🕐 Generated at:', new Date().toISOString());
    console.log('⏱️ Session duration:', `${stats.summary.sessionDuration}s`);
    console.log('');
    
    console.group('📈 SUMMARY STATISTICS');
    console.log(`Total API calls: ${stats.summary.totalCalls}`);
    console.log(`Unique endpoints: ${stats.summary.uniqueEndpoints}`);
    console.log(`Duplicate calls: ${stats.summary.totalDuplicates} (${stats.summary.duplicatePercentage}%)`);
    console.log(`Calls per minute: ${stats.summary.callsPerMinute}`);
    console.groupEnd();

    if (stats.summary.totalDuplicates > 0) {
      console.group('⚠️ DUPLICATE CALLS (ISSUES FOUND)');
      Object.entries(stats.duplicates).forEach(([endpoint, count]) => {
        console.warn(`${endpoint}: ${count} duplicates`);
      });
      console.groupEnd();
    }

    console.group('📍 CALLS BY COMPONENT');
    Object.entries(stats.byComponent)
      .sort(([,a], [,b]) => b.count - a.count)
      .forEach(([component, data]) => {
        console.log(`${component}: ${data.count} calls (${data.endpoints.length} endpoints)`);
      });
    console.groupEnd();

    console.group('🎯 CALLS BY ENDPOINT');
    Object.entries(stats.byEndpoint)
      .sort(([,a], [,b]) => b.count - a.count)
      .forEach(([endpoint, data]) => {
        const status = data.duplicates > 0 ? '⚠️' : '✅';
        console.log(`${status} ${endpoint}: ${data.count} calls${data.duplicates > 0 ? ` (${data.duplicates} duplicates)` : ''}`);
      });
    console.groupEnd();

    console.group('⏰ RECENT ACTIVITY (Last 10 calls)');
    stats.recentCalls.forEach(call => {
      console.log(`${call.endpoint} (${call.component}) - ${new Date(call.timestamp).toLocaleTimeString()}`);
    });
    console.groupEnd();

    console.groupEnd();

    return stats;
  }

  // Clear all logs
  clear() {
    this.calls.clear();
    this.callsByEndpoint.clear();
    this.callsByComponent.clear();
    this.duplicates.clear();
    this.callCounter = 0;
    this.startTime = Date.now();
    console.log('🧹 API logs cleared');
  }

  // Export data for analysis
  exportData() {
    return {
      calls: Object.fromEntries(this.calls),
      stats: this.getStats(),
      timestamp: Date.now()
    };
  }
}

// Create global instance
const globalApiLogger = new GlobalApiLogger();

// Export functions
export const logApiCall = (endpoint, component, type, metadata) => {
  return globalApiLogger.logCall(endpoint, component, type, metadata);
};

export const getApiStats = () => {
  return globalApiLogger.getStats();
};

export const generateApiReport = () => {
  return globalApiLogger.generateReport();
};

export const clearApiLogs = () => {
  globalApiLogger.clear();
};

export const exportApiData = () => {
  return globalApiLogger.exportData();
};

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.apiLogger = globalApiLogger;
  window.generateApiReport = generateApiReport;
  window.getApiStats = getApiStats;
}

export default globalApiLogger;