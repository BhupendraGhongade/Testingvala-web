// Context Interceptor - Minimal implementation
export const contextInterceptor = {
  intercept: () => console.log('[ContextInterceptor] Intercepting'),
  init: () => console.log('[ContextInterceptor] Initialized')
};

export default contextInterceptor;