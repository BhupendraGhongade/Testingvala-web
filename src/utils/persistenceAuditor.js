// Comprehensive persistence audit for development environment
class PersistenceAuditor {
  constructor() {
    this.logs = [];
    this.snapshots = [];
    this.startTime = performance.now();
    this.init();
  }

  log(category, message, data = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      performanceTime: performance.now() - this.startTime,
      category,
      message,
      data: JSON.parse(JSON.stringify(data))
    };
    
    this.logs.push(entry);
    console.log(`[AUDIT:${category}] ${message}`, data);
    
    // Keep only last 200 logs
    if (this.logs.length > 200) this.logs.shift();
  }

  snapshot(label) {
    const snap = {
      label,
      timestamp: new Date().toISOString(),
      performanceTime: performance.now() - this.startTime,
      localStorage: this.getLocalStorageSnapshot(),
      sessionStorage: this.getSessionStorageSnapshot(),
      environment: this.getEnvironmentSnapshot(),
      context: this.getContextSnapshot()
    };
    
    this.snapshots.push(snap);
    this.log('SNAPSHOT', `Created snapshot: ${label}`, snap);
    return snap;
  }

  getLocalStorageSnapshot() {
    try {
      const posts = localStorage.getItem('testingvala_posts');
      return {
        exists: !!posts,
        length: posts ? posts.length : 0,
        postCount: posts ? JSON.parse(posts).length : 0,
        posts: posts ? JSON.parse(posts) : [],
        rawValue: posts
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  getSessionStorageSnapshot() {
    try {
      const backup = sessionStorage.getItem('testingvala_posts_backup');
      return {
        exists: !!backup,
        length: backup ? backup.length : 0,
        postCount: backup ? JSON.parse(backup).length : 0,
        posts: backup ? JSON.parse(backup) : []
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  getEnvironmentSnapshot() {
    return {
      userAgent: navigator.userAgent,
      viteEnv: import.meta.env.VITE_APP_ENV,
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD,
      url: window.location.href,
      origin: window.location.origin,
      localStorage: typeof localStorage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined',
      serviceWorker: 'serviceWorker' in navigator,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      dockerDetected: this.detectDocker(),
      viteHMR: !!import.meta.hot
    };
  }

  getContextSnapshot() {
    try {
      // Try to access global context if available
      const contextData = window.__GLOBAL_DATA_CONTEXT__ || {};
      return {
        available: !!window.__GLOBAL_DATA_CONTEXT__,
        postsCount: contextData.posts ? contextData.posts.length : 0,
        loading: contextData.loading,
        hydrated: contextData.hydrated
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  detectDocker() {
    // Check for common Docker indicators
    const indicators = {
      hostname: window.location.hostname,
      isLocalhost: window.location.hostname === 'localhost',
      isContainer: window.location.hostname.includes('container'),
      port: window.location.port,
      userAgent: navigator.userAgent
    };
    
    return {
      ...indicators,
      likelyDocker: indicators.isLocalhost && (indicators.port === '5173' || indicators.port === '3000')
    };
  }

  auditStorageEvents() {
    this.log('STORAGE_EVENTS', 'Setting up storage event monitoring');
    
    window.addEventListener('storage', (e) => {
      this.log('STORAGE_EVENT', 'Storage event detected', {
        key: e.key,
        oldValue: e.oldValue ? e.oldValue.substring(0, 100) + '...' : null,
        newValue: e.newValue ? e.newValue.substring(0, 100) + '...' : null,
        url: e.url
      });
    });

    window.addEventListener('beforeunload', () => {
      this.log('LIFECYCLE', 'Page unloading');
      this.snapshot('before_unload');
    });

    document.addEventListener('visibilitychange', () => {
      this.log('LIFECYCLE', 'Visibility changed', {
        hidden: document.hidden,
        visibilityState: document.visibilityState
      });
    });

    window.addEventListener('focus', () => {
      this.log('LIFECYCLE', 'Window focused');
      this.snapshot('window_focus');
    });

    window.addEventListener('blur', () => {
      this.log('LIFECYCLE', 'Window blurred');
    });
  }

  auditReactContext() {
    this.log('REACT_AUDIT', 'Starting React context audit');
    
    // Monitor React DevTools if available
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      this.log('REACT_AUDIT', 'React DevTools detected');
    }

    // Check for React version
    if (window.React) {
      this.log('REACT_AUDIT', 'React version', { version: window.React.version });
    }
  }

  auditViteHMR() {
    if (import.meta.hot) {
      this.log('VITE_HMR', 'Vite HMR detected');
      
      import.meta.hot.on('vite:beforeUpdate', () => {
        this.log('VITE_HMR', 'Before HMR update');
        this.snapshot('before_hmr_update');
      });

      import.meta.hot.on('vite:afterUpdate', () => {
        this.log('VITE_HMR', 'After HMR update');
        this.snapshot('after_hmr_update');
      });
    }
  }

  startContinuousMonitoring() {
    this.log('MONITORING', 'Starting continuous monitoring');
    
    // Monitor localStorage changes every second
    let lastStorageState = this.getLocalStorageSnapshot();
    
    setInterval(() => {
      const currentState = this.getLocalStorageSnapshot();
      
      if (JSON.stringify(currentState) !== JSON.stringify(lastStorageState)) {
        this.log('STORAGE_CHANGE', 'localStorage changed', {
          before: lastStorageState,
          after: currentState
        });
        lastStorageState = currentState;
      }
    }, 1000);

    // Take periodic snapshots
    setInterval(() => {
      this.snapshot('periodic_check');
    }, 5000);
  }

  init() {
    this.log('INIT', 'Persistence auditor initialized');
    this.snapshot('initialization');
    this.auditStorageEvents();
    this.auditReactContext();
    this.auditViteHMR();
    this.startContinuousMonitoring();
  }

  generateReport() {
    const report = {
      summary: {
        totalLogs: this.logs.length,
        totalSnapshots: this.snapshots.length,
        auditDuration: performance.now() - this.startTime,
        timestamp: new Date().toISOString()
      },
      environment: this.getEnvironmentSnapshot(),
      currentStorage: {
        localStorage: this.getLocalStorageSnapshot(),
        sessionStorage: this.getSessionStorageSnapshot()
      },
      logs: this.logs,
      snapshots: this.snapshots,
      analysis: this.analyzeIssues()
    };

    console.log('=== PERSISTENCE AUDIT REPORT ===');
    console.log(JSON.stringify(report, null, 2));
    
    return report;
  }

  analyzeIssues() {
    const issues = [];
    
    // Check for localStorage availability
    const storageSnap = this.getLocalStorageSnapshot();
    if (storageSnap.error) {
      issues.push({
        type: 'STORAGE_ERROR',
        severity: 'HIGH',
        description: 'localStorage access error',
        details: storageSnap.error
      });
    }

    // Check for Docker environment
    const dockerInfo = this.detectDocker();
    if (dockerInfo.likelyDocker) {
      issues.push({
        type: 'DOCKER_ENVIRONMENT',
        severity: 'MEDIUM',
        description: 'Running in Docker environment',
        details: dockerInfo
      });
    }

    // Check for Vite HMR interference
    if (import.meta.hot) {
      issues.push({
        type: 'VITE_HMR',
        severity: 'LOW',
        description: 'Vite HMR active - may interfere with persistence',
        details: { hmrActive: true }
      });
    }

    // Analyze storage event patterns
    const storageEvents = this.logs.filter(log => log.category === 'STORAGE_EVENT');
    if (storageEvents.length === 0) {
      issues.push({
        type: 'NO_STORAGE_EVENTS',
        severity: 'MEDIUM',
        description: 'No storage events detected - multi-tab sync may not work'
      });
    }

    return issues;
  }

  // Public API for manual testing
  testPersistence() {
    this.log('TEST', 'Starting manual persistence test');
    
    const testPost = {
      id: `audit_test_${Date.now()}`,
      title: 'Audit Test Post',
      content: 'This post is created by the persistence auditor',
      created_at: new Date().toISOString(),
      isLocal: true
    };

    // Save to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('testingvala_posts') || '[]');
      existing.unshift(testPost);
      localStorage.setItem('testingvala_posts', JSON.stringify(existing));
      
      this.log('TEST', 'Test post saved to localStorage', testPost);
      this.snapshot('after_test_post_save');
      
      // Verify immediately
      setTimeout(() => {
        const verification = this.getLocalStorageSnapshot();
        const found = verification.posts.find(p => p.id === testPost.id);
        
        this.log('TEST', 'Test post verification', {
          found: !!found,
          postId: testPost.id,
          totalPosts: verification.postCount
        });
      }, 100);
      
    } catch (error) {
      this.log('TEST', 'Test post save failed', { error: error.message });
    }
  }
}

// Initialize auditor in development only
let auditor = null;

if (import.meta.env.VITE_APP_ENV === 'development') {
  auditor = new PersistenceAuditor();
  
  // Global access for debugging
  window.persistenceAuditor = auditor;
  
  // Auto-generate report on page unload
  window.addEventListener('beforeunload', () => {
    auditor.generateReport();
  });
}

export default auditor;