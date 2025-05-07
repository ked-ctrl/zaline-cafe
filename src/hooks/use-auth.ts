import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  getUserSession, 
  getAdminSession, 
  setUserSession, 
  setAdminSession,
  clearUserSession,
  clearAdminSession,
  UserSession
} from '@/lib/auth'
import { ROUTES } from '@/config/constants'
import { toast } from 'sonner'

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null)
  const [admin, setAdmin] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load session on mount
  useEffect(() => {
    const userSession = getUserSession()
    const adminSession = getAdminSession()
    
    setUser(userSession)
    setAdmin(adminSession)
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      if (data.user) {
        const isAdmin = email.includes('admin')
        
        const sessionData: UserSession = {
          id: data.user.id,
          email: data.user.email!,
          role: isAdmin ? 'admin' : 'user'
        }
        
        if (isAdmin) {
          setAdminSession(sessionData)
          setAdmin(sessionData)
          router.push(ROUTES.ADMIN_DASHBOARD)
        } else {
          setUserSession(sessionData)
          setUser(sessionData)
          router.push(ROUTES.CUSTOMER_MENU)
        }
        
        return true
      }
      
      return false
    } catch (error) {
      toast.error('Failed to sign in')
      console.error('Sign in error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (error) throw error
      
      if (data.user) {
        const sessionData: UserSession = {
          id: data.user.id,
          email: data.user.email!,
          role: 'user'
        }
        
        setUserSession(sessionData)
        setUser(sessionData)
        router.push(ROUTES.CUSTOMER_MENU)
        return true
      }
      
      return false
    } catch (error) {
      toast.error('Failed to sign up')
      console.error('Sign up error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      clearUserSession()
      clearAdminSession()
      setUser(null)
      setAdmin(null)
      
      router.push(ROUTES.HOME)
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Failed to sign out')
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    admin,
    loading,
    isAuthenticated: !!user || !!admin,
    isAdmin: !!admin,
    signIn,
    signUp,
    signOut
  }
}