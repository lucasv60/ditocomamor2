import React from 'react'
import { PerformanceMetrics } from './types'

// Performance monitoring utilities
class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    pageLoadTime: 0,
    apiResponseTime: 0,
    errorCount: 0,
    userInteractions: 0,
  }

  private startTimes = new Map<string, number>()

  // Track page load time
  startPageLoad(): void {
    this.startTimes.set('pageLoad', performance.now())
  }

  endPageLoad(): void {
    const startTime = this.startTimes.get('pageLoad')
    if (startTime) {
      this.metrics.pageLoadTime = performance.now() - startTime
      this.startTimes.delete('pageLoad')
    }
  }

  // Track API response time
  startApiCall(endpoint: string): void {
    this.startTimes.set(`api:${endpoint}`, performance.now())
  }

  endApiCall(endpoint: string): void {
    const startTime = this.startTimes.get(`api:${endpoint}`)
    if (startTime) {
      const responseTime = performance.now() - startTime
      // Simple moving average
      this.metrics.apiResponseTime = (this.metrics.apiResponseTime + responseTime) / 2
      this.startTimes.delete(`api:${endpoint}`)
    }
  }

  // Track errors
  recordError(): void {
    this.metrics.errorCount++
  }

  // Track user interactions
  recordInteraction(): void {
    this.metrics.userInteractions++
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  // Reset metrics
  reset(): void {
    this.metrics = {
      pageLoadTime: 0,
      apiResponseTime: 0,
      errorCount: 0,
      userInteractions: 0,
    }
    this.startTimes.clear()
  }

  // Log performance report
  logReport(): void {
    const metrics = this.getMetrics()
    console.log('Performance Report:', {
      'Page Load Time': `${metrics.pageLoadTime.toFixed(2)}ms`,
      'Avg API Response Time': `${metrics.apiResponseTime.toFixed(2)}ms`,
      'Error Count': metrics.errorCount,
      'User Interactions': metrics.userInteractions,
    })
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Performance optimization utilities
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Lazy loading helper
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFunc)
}

// Image optimization
export function getOptimizedImageUrl(
  src: string,
  width: number,
  height?: number,
  quality: number = 80
): string {
  // For Cloudinary images
  if (src.includes('cloudinary.com')) {
    const transformations = `w_${width}${height ? `,h_${height},c_fill` : ''},q_${quality},f_auto`
    return src.replace('/upload/', `/upload/${transformations}/`)
  }

  // For local images, return as-is (Next.js Image component handles optimization)
  return src
}

// Bundle size monitoring
export function logBundleSize(): void {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Log resource sizes
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

    resources.forEach(resource => {
      if (resource.name.includes('.js') && resource.transferSize) {
        console.log(`Bundle: ${resource.name.split('/').pop()} - ${resource.transferSize} bytes`)
      }
    })
  }
}

// Memory usage monitoring (client-side only)
export function logMemoryUsage(): void {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory
    console.log('Memory Usage:', {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
    })
  }
}

// React performance hooks
export function usePerformanceTracking(componentName: string) {
  React.useEffect(() => {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      console.log(`${componentName} render time: ${(endTime - startTime).toFixed(2)}ms`)
    }
  })
}

// API call optimization with caching
export function optimizedApiCall<T>(
  url: string,
  options?: RequestInit,
  cacheTime: number = 5 * 60 * 1000 // 5 minutes
): Promise<T> {
  const cacheKey = `api:${url}:${JSON.stringify(options)}`

  // Check cache first
  const cached = sessionStorage.getItem(cacheKey)
  if (cached) {
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp < cacheTime) {
      return Promise.resolve(data)
    }
  }

  return fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    })
    .then(data => {
      // Cache the result
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
      return data
    })
}

// Preload resources
export function preloadResource(href: string, as: string): void {
  if (typeof document !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = as
    link.href = href
    document.head.appendChild(link)
  }
}

// Service worker registration for caching
export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration)
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError)
        })
    })
  }
}