import { useEffect, useRef } from 'react'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  interactionTime: number
}

export function usePerformance(componentName: string) {
  const startTime = useRef<number>(Date.now())
  const renderTime = useRef<number>(0)

  useEffect(() => {
    // Component mount time
    const mountTime = Date.now() - startTime.current
    renderTime.current = mountTime

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} mounted in ${mountTime}ms`)
    }

    // Measure time to interactive
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          console.log(`[Performance] ${entry.name}: ${entry.duration}ms`)
        }
      })
    })

    if ('PerformanceObserver' in window) {
      observer.observe({ entryTypes: ['measure', 'navigation'] })
    }

    return () => {
      if ('PerformanceObserver' in window) {
        observer.disconnect()
      }
    }
  }, [componentName])

  const measureAction = (actionName: string, action: () => void) => {
    const start = Date.now()
    action()
    const duration = Date.now() - start
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} - ${actionName}: ${duration}ms`)
    }
  }

  return { measureAction, renderTime: renderTime.current }
}