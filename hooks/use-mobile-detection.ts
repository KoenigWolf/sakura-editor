'use client';

import { useState, useEffect, useCallback } from 'react';

interface MobileDetectionOptions {
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
  debounceMs?: number;
}

interface MobileDetectionResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  mounted: boolean;
}

const DEFAULT_MOBILE_BREAKPOINT = 480;
const DEFAULT_TABLET_BREAKPOINT = 768;
const DEFAULT_DEBOUNCE_MS = 100;

export const useMobileDetection = (options: MobileDetectionOptions = {}): MobileDetectionResult => {
  const {
    mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT,
    tabletBreakpoint = DEFAULT_TABLET_BREAKPOINT,
    debounceMs = DEFAULT_DEBOUNCE_MS,
  } = options;

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const checkDevice = useCallback(() => {
    const width = window.innerWidth;
    setIsMobile(width < mobileBreakpoint);
    setIsTablet(width >= mobileBreakpoint && width < tabletBreakpoint);
  }, [mobileBreakpoint, tabletBreakpoint]);

  useEffect(() => {
    setMounted(true);
    checkDevice();

    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkDevice, debounceMs);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [checkDevice, debounceMs]);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    mounted,
  };
};
