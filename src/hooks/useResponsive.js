import { useState, useEffect } from 'react';

// Breakpoint definitions
const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
  '4xl': 2560
};

export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isUltrawide: false,
    is4K: false,
    orientation: 'landscape',
    pixelRatio: 1,
    touchDevice: false
  });

  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const pixelRatio = window.devicePixelRatio || 1;
      const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      setScreenSize({ width, height });

      setDeviceInfo({
        isMobile: width < breakpoints.md,
        isTablet: width >= breakpoints.md && width < breakpoints.lg,
        isDesktop: width >= breakpoints.lg && width < breakpoints['3xl'],
        isUltrawide: width >= breakpoints['3xl'] && width < breakpoints['4xl'],
        is4K: width >= breakpoints['4xl'],
        orientation: width > height ? 'landscape' : 'portrait',
        pixelRatio,
        touchDevice
      });
    };

    updateScreenInfo();
    window.addEventListener('resize', updateScreenInfo);
    window.addEventListener('orientationchange', updateScreenInfo);

    return () => {
      window.removeEventListener('resize', updateScreenInfo);
      window.removeEventListener('orientationchange', updateScreenInfo);
    };
  }, []);

  // Utility functions
  const isBreakpoint = (breakpoint) => {
    return screenSize.width >= breakpoints[breakpoint];
  };

  const isBetween = (min, max) => {
    return screenSize.width >= breakpoints[min] && screenSize.width < breakpoints[max];
  };

  const getBreakpoint = () => {
    const { width } = screenSize;
    if (width >= breakpoints['4xl']) return '4xl';
    if (width >= breakpoints['3xl']) return '3xl';
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  };

  const getColumns = (columnConfig) => {
    const currentBreakpoint = getBreakpoint();
    const breakpointOrder = ['4xl', '3xl', '2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
    
    for (const bp of breakpointOrder) {
      if (columnConfig[bp] !== undefined && isBreakpoint(bp)) {
        return columnConfig[bp];
      }
    }
    
    return columnConfig.xs || 1;
  };

  return {
    screenSize,
    deviceInfo,
    breakpoint: getBreakpoint(),
    isBreakpoint,
    isBetween,
    getColumns,
    // Convenience properties
    isMobile: deviceInfo.isMobile,
    isTablet: deviceInfo.isTablet,
    isDesktop: deviceInfo.isDesktop,
    isUltrawide: deviceInfo.isUltrawide,
    is4K: deviceInfo.is4K,
    isTouch: deviceInfo.touchDevice,
    isLandscape: deviceInfo.orientation === 'landscape',
    isPortrait: deviceInfo.orientation === 'portrait'
  };
};

// Hook for responsive values
export const useResponsiveValue = (values) => {
  const { getColumns } = useResponsive();
  return getColumns(values);
};

// Hook for media queries
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event) => setMatches(event.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

export default useResponsive;