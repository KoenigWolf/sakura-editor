'use client';

import { useEffect } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

type WebVitalsCallback = (metric: Metric) => void;

const defaultCallback: WebVitalsCallback = (metric) => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }

  // In production, you could send to analytics
  // Example: sendToAnalytics(metric)
};

export const useWebVitals = (callback: WebVitalsCallback = defaultCallback): void => {
  useEffect(() => {
    onCLS(callback);
    onINP(callback);
    onFCP(callback);
    onLCP(callback);
    onTTFB(callback);
  }, [callback]);
};
