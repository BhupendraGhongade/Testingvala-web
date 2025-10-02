// API Call Logger for debugging duplicate requests
const apiCallLog = new Map();
let callCounter = 0;

export const logApiCall = (endpoint, component, action = 'fetch') => {
  if (!import.meta.env.DEV) return; // Only log in development
  
  callCounter++;
  const timestamp = new Date().toISOString();
  const key = `${endpoint}_${component}`;
  
  if (!apiCallLog.has(key)) {
    apiCallLog.set(key, []);
  }
  
  const call = {
    id: callCounter,
    timestamp,
    endpoint,
    component,
    action,
    stack: new Error().stack.split('\n').slice(2, 5).join('\n')
  };
  
  apiCallLog.get(key).push(call);
  
  console.group(`🔍 API Call #${callCounter}: ${endpoint}`);
  console.log(`📍 Component: ${component}`);
  console.log(`⚡ Action: ${action}`);
  console.log(`⏰ Time: ${timestamp}`);
  
  // Check for duplicates
  const calls = apiCallLog.get(key);
  if (calls.length > 1) {
    const recent = calls.slice(-2);
    const timeDiff = new Date(recent[1].timestamp) - new Date(recent[0].timestamp);
    if (timeDiff < 1000) {
      console.warn(`⚠️ DUPLICATE CALL detected! Time diff: ${timeDiff}ms`);
      console.log('Previous call:', recent[0]);
    }
  }
  
  console.groupEnd();
  
  return call.id;
};

export const getApiCallStats = () => {
  const stats = {
    totalCalls: callCounter,
    uniqueEndpoints: apiCallLog.size,
    duplicates: 0,
    byComponent: {},
    byEndpoint: {}
  };
  
  apiCallLog.forEach((calls, key) => {
    const [endpoint, component] = key.split('_');
    
    if (!stats.byComponent[component]) stats.byComponent[component] = 0;
    if (!stats.byEndpoint[endpoint]) stats.byEndpoint[endpoint] = 0;
    
    stats.byComponent[component] += calls.length;
    stats.byEndpoint[endpoint] += calls.length;
    
    if (calls.length > 1) {
      stats.duplicates += calls.length - 1;
    }
  });
  
  return stats;
};

export const clearApiCallLog = () => {
  apiCallLog.clear();
  callCounter = 0;
};