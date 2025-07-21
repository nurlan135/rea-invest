'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

interface Metrics {
  loadTime: number
  renderTime: number
  cacheHits: number
  apiCalls: number
}

export function PerformanceDisplay() {
  const [metrics, setMetrics] = useState<Metrics>({
    loadTime: 0,
    renderTime: 0,
    cacheHits: 0,
    apiCalls: 0
  })

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    const updateMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      setMetrics({
        loadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
        renderTime: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
        cacheHits: 0, // Bu cache sistemindən alınacaq
        apiCalls: 0  // Bu API çağırılarından sayılacaq
      })
    }

    updateMetrics()
  }, [])

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs space-x-2 z-50">
      <Badge variant="outline">Load: {metrics.loadTime}ms</Badge>
      <Badge variant="outline">Render: {metrics.renderTime}ms</Badge>
    </div>
  )
}