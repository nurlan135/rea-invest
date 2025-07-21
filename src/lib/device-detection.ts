export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  return window.innerWidth < 768 || 
         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) return false
  
  const connection = (navigator as any).connection
  return connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')
}

export function shouldUseLightMode(): boolean {
  return isMobileDevice() || isSlowConnection()
}