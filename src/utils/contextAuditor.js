// React Context hydration timing auditor
export class ContextAuditor {
  constructor() {
    this.hydrationLogs = [];
    this.renderLogs = [];
    this.startTime = performance.now();
  }

  logHydration(phase, data = {}) {
    const entry = {
      phase,
      timestamp: new Date().toISOString(),
      performanceTime: performance.now() - this.startTime,
      data
    };
    
    this.hydrationLogs.push(entry);
    console.log(`[HYDRATION:${phase}]`, data);
  }

  logRender(component, data = {}) {
    const entry = {
      component,
      timestamp: new Date().toISOString(),
      performanceTime: performance.now() - this.startTime,
      data
    };
    
    this.renderLogs.push(entry);
    console.log(`[RENDER:${component}]`, data);
  }

  wrapGlobalDataProvider(OriginalProvider) {
    return function AuditedGlobalDataProvider(props) {
      const auditor = window.contextAuditor;
      
      if (auditor) {
        auditor.logHydration('PROVIDER_START', {
          propsChildren: !!props.children
        });
      }

      // Monitor useState initialization
      const [data, setData] = React.useState(() => {
        if (auditor) {
          auditor.logHydration('USESTATE_INIT_START');
        }

        const stored = localStorage.getItem('testingvala_posts');
        const posts = stored ? JSON.parse(stored) : [];
        
        if (auditor) {
          auditor.logHydration('USESTATE_INIT_COMPLETE', {
            storedExists: !!stored,
            storedLength: stored ? stored.length : 0,
            postsCount: posts.length,
            posts: posts.map(p => ({ id: p.id, title: p.title }))
          });
        }

        return {
          website: null,
          posts: [...posts],
          categories: [],
          events: [],
          winners: [],
          userProfiles: [],
          loading: true,
          error: null
        };
      });

      // Monitor data changes
      React.useEffect(() => {
        if (auditor) {
          auditor.logHydration('DATA_EFFECT', {
            postsCount: data.posts.length,
            loading: data.loading,
            posts: data.posts.map(p => ({ id: p.id, title: p.title }))
          });
        }
      }, [data.posts.length]);

      if (auditor) {
        auditor.logRender('GLOBAL_DATA_PROVIDER', {
          postsCount: data.posts.length,
          loading: data.loading
        });
      }

      return React.createElement(OriginalProvider, props);
    };
  }

  generateHydrationReport() {
    return {
      hydrationSequence: this.hydrationLogs,
      renderSequence: this.renderLogs,
      timing: {
        totalDuration: performance.now() - this.startTime,
        hydrationStart: this.hydrationLogs[0]?.performanceTime || 0,
        hydrationComplete: this.hydrationLogs.find(log => log.phase === 'USESTATE_INIT_COMPLETE')?.performanceTime || 0,
        firstRender: this.renderLogs[0]?.performanceTime || 0
      },
      analysis: this.analyzeHydrationTiming()
    };
  }

  analyzeHydrationTiming() {
    const issues = [];
    
    const initStart = this.hydrationLogs.find(log => log.phase === 'USESTATE_INIT_START');
    const initComplete = this.hydrationLogs.find(log => log.phase === 'USESTATE_INIT_COMPLETE');
    
    if (!initStart || !initComplete) {
      issues.push({
        type: 'MISSING_HYDRATION_LOGS',
        severity: 'HIGH',
        description: 'Hydration sequence not properly logged'
      });
    }

    if (initComplete && initComplete.data.postsCount === 0) {
      issues.push({
        type: 'EMPTY_HYDRATION',
        severity: 'HIGH',
        description: 'Context hydrated with 0 posts',
        details: initComplete.data
      });
    }

    const hydrationDuration = initComplete && initStart ? 
      initComplete.performanceTime - initStart.performanceTime : 0;
    
    if (hydrationDuration > 100) {
      issues.push({
        type: 'SLOW_HYDRATION',
        severity: 'MEDIUM',
        description: `Hydration took ${hydrationDuration}ms`,
        details: { duration: hydrationDuration }
      });
    }

    return issues;
  }
}

// Initialize in development only
let contextAuditor = null;

if (import.meta.env.VITE_APP_ENV === 'development') {
  contextAuditor = new ContextAuditor();
  window.contextAuditor = contextAuditor;
}

export default contextAuditor;