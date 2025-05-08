import { supabase } from '@/lib/supabase'
import { AUTH } from '@/config/constants'
import Cookies from 'js-cookie'

/**
 * User session interface
 */
export interface UserSession {
  id: string
  email: string
  role?: string
}

/**
 * Set user session in cookies
 */
export function setUserSession(session: UserSession): void {
  Cookies.set(AUTH.COOKIES.USER_SESSION, JSON.stringify(session), { path: '/' })
}

/**
 * Set admin session in cookies
 */
export function setAdminSession(session: UserSession): void {
  Cookies.set(AUTH.COOKIES.ADMIN_SESSION, JSON.stringify(session), { path: '/' })
}

/**
 * Get user session from cookies
 */
export function getUserSession(): UserSession | null {
  const sessionStr = Cookies.get(AUTH.COOKIES.USER_SESSION)
  return sessionStr ? JSON.parse(sessionStr) : null
}

/**
 * Get admin session from cookies
 */
export function getAdminSession(): UserSession | null {
  const sessionStr = Cookies.get(AUTH.COOKIES.ADMIN_SESSION)
  return sessionStr ? JSON.parse(sessionStr) : null
}

/**
 * Clear user session
 */
export function clearUserSession(): void {
  Cookies.remove(AUTH.COOKIES.USER_SESSION, { path: '/' })
}

/**
 * Clear admin session
 */
export function clearAdminSession(): void {
  Cookies.remove(AUTH.COOKIES.ADMIN_SESSION, { path: '/' })
}

/**
 * Sign out the current user
 */
export async function logout(): Promise<void> {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut()
    
    // Clear cookies
    clearUserSession()
    clearAdminSession()
    
    // Redirect to home page
    window.location.href = '/'
  } catch (error) {
    console.error('Logout error:', error)
    throw error
  }
}
