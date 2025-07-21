import { NextRequest } from 'next/server'

export function getClientIP(request: NextRequest): string {
  // Try various headers in order of preference
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
  const fastlyClientIP = request.headers.get('fastly-client-ip') // Fastly
  const xClientIP = request.headers.get('x-client-ip')
  
  // x-forwarded-for can contain multiple IPs, take the first one
  if (forwardedFor) {
    const firstIP = forwardedFor.split(',')[0].trim()
    if (firstIP && isValidIP(firstIP)) {
      return firstIP
    }
  }

  // Check other headers
  if (realIP && isValidIP(realIP)) {
    return realIP
  }
  
  if (cfConnectingIP && isValidIP(cfConnectingIP)) {
    return cfConnectingIP
  }
  
  if (fastlyClientIP && isValidIP(fastlyClientIP)) {
    return fastlyClientIP
  }
  
  if (xClientIP && isValidIP(xClientIP)) {
    return xClientIP
  }

  // Fallback to request IP (might be localhost in development)
  const requestIP = request.ip
  if (requestIP && isValidIP(requestIP)) {
    return requestIP
  }

  // Last resort - use a default development IP
  return '127.0.0.1'
}

function isValidIP(ip: string): boolean {
  // Basic IP validation (IPv4 and IPv6)
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}

export function hashIP(ip: string): string {
  // Simple hash for privacy (don't store raw IPs)
  let hash = 0
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}