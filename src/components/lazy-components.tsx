import { lazy, Suspense } from 'react'
import { LoadingSpinner } from './ui/loading-spinner'

// Lazy load heavy components
export const LazyStatsCards = lazy(() => 
  import('./dashboard/stats-cards').then(m => ({ default: m.StatsCards }))
)

export const LazyMonthlyChart = lazy(() => 
  import('./dashboard/monthly-chart').then(m => ({ default: m.MonthlyChart }))
)

export const LazyPropertiesTable = lazy(() => 
  import('./properties/properties-table').then(m => ({ default: m.PropertiesTable }))
)

export const LazyTransactionsTable = lazy(() => 
  import('./transactions/transactions-table').then(m => ({ default: m.TransactionsTable }))
)

// Wrapper component with loading
interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function LazyWrapper({ children, fallback }: LazyWrapperProps) {
  return (
    <Suspense fallback={fallback || <LoadingSpinner size="lg" />}>
      {children}
    </Suspense>
  )
}