'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

export function NavigationDebug() {
  const [screenWidth, setScreenWidth] = useState<number | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateScreenWidth = () => setScreenWidth(window.innerWidth)
      updateScreenWidth()
      window.addEventListener('resize', updateScreenWidth)
      return () => window.removeEventListener('resize', updateScreenWidth)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setShowDebug(!showDebug)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showDebug])

  if (!showDebug || process.env.NODE_ENV !== 'development') return null

  const breakpoints = {
    sm: 640,
    md: 768, 
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  }

  const currentBreakpoint = screenWidth 
    ? Object.entries(breakpoints)
        .reverse()
        .find(([_, width]) => screenWidth >= width)?.[0] || 'xs'
    : 'unknown'

  return (
    <div className="fixed top-0 right-0 z-50 bg-black text-white p-2 text-xs font-mono max-w-xs">
      <div className="space-y-1">
        <div>Screen: {screenWidth}px ({currentBreakpoint})</div>
        <div>Path: {pathname}</div>
        <div>Sidebar: {screenWidth && screenWidth >= 768 ? 'Visible' : 'Hidden'}</div>
        <div>Mobile Nav: {screenWidth && screenWidth < 768 ? 'Active' : 'Inactive'}</div>
        <div className="border-t border-gray-600 pt-1 mt-1">
          <div>Session: {status}</div>
          <div>User: {session?.user?.name || 'None'}</div>
          <div>Role: {session?.user?.role || 'None'}</div>
          <div>Email: {session?.user?.email || 'None'}</div>
        </div>
        <div className="text-gray-400">Ctrl+Shift+D: Toggle</div>
      </div>
    </div>
  )
}