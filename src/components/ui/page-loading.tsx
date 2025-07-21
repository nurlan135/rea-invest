import { LoadingSpinner } from './loading-spinner'

export function PageLoading() {
  return (
    <div className="min-h-96 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-500">Yüklənir...</p>
      </div>
    </div>
  )
}