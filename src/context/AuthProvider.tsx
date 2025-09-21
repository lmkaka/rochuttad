import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../supabaseClient'

// 🎯 UPDATED PROFILE INTERFACE - All possible fields
type Profile = {
  id: string
  name: string | null
  email?: string | null
  full_name?: string | null
  avatar_url?: string | null
  device_preference: 'iOS' | 'Android' | 'Desktop' | null
  language_preference: 'Hindi' | 'English' | null
  is_admin?: boolean | null        // Added for admin check
  updated_at?: string | null       // Added for timestamps
  created_at?: string | null       // Added for timestamps
  phone?: string | null           // Optional phone
  bio?: string | null             // Optional bio
  location?: string | null        // Optional location
  website?: string | null         // Optional website
  verified?: boolean | null       // Optional verification
}

type Ctx = {
  session: Session | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const Ctx = createContext<Ctx>({
  session: null, 
  profile: null, 
  loading: true, 
  refreshProfile: async () => {}, 
  signOut: async () => {}
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Enhanced session initialization
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session initialization error:', error)
        }
        
        console.log('Initial session:', !!session)
        setSession(session)
        
        // Process URL hash for OAuth callbacks
        const processUrlHash = () => {
          const hash = window.location.hash
          if (hash && hash.includes('access_token')) {
            console.log('Processing OAuth callback hash')
            // Supabase will automatically handle the hash and trigger auth state change
            // Clear the hash to clean up the URL
            setTimeout(() => {
              if (window.location.hash === hash) {
                window.location.hash = ''
              }
            }, 100)
          }
        }
        
        processUrlHash()
        
      } catch (error) {
        console.error('Auth initialization failed:', error)
      }
    }

    initializeAuth()

    // Enhanced auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, !!session)
        
        setSession(session)
        
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in:', session.user.email)
          // Small delay to ensure session is fully established
          setTimeout(() => {
            setLoading(false)
          }, 100)
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out')
          setProfile(null)
          setLoading(false)
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('Token refreshed for:', session.user.email)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Enhanced profile fetching
  const fetchProfile = async () => {
    if (!session?.user?.id) { 
      setProfile(null)
      return 
    }
    
    try {
      console.log('Fetching profile for user:', session.user.id)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()
      
      if (!error && data) {
        console.log('Profile loaded:', data.name || data.email)
        setProfile(data as Profile)
      } else if (error) {
        console.error('Profile fetch error:', error)
        setProfile(null)
      } else {
        console.log('No profile found for user')
        setProfile(null)
      }
    } catch (err) {
      console.error('Profile fetch failed:', err)
      setProfile(null)
    }
  }

  // Enhanced profile loading with better timing
  useEffect(() => {
    const loadProfile = async () => {
      if (session?.user?.id) {
        await fetchProfile()
      } else {
        setProfile(null)
      }
      
      // Only set loading to false if we have a definitive state
      if (!loading || !session) {
        setLoading(false)
      }
    }

    loadProfile()
  }, [session?.user?.id])

  // Enhanced sign out with proper cleanup
  const signOut = async () => {
    try {
      console.log('Signing out user...')
      setLoading(true)
      
      await supabase.auth.signOut()
      
      // Clear state
      setSession(null)
      setProfile(null)
      
      console.log('User signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Memoized context value with enhanced dependencies
  const value = useMemo(() => ({
    session, 
    profile, 
    loading,
    refreshProfile: fetchProfile,
    signOut
  }), [session, profile, loading])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth = () => {
  const context = useContext(Ctx)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// 🎯 EXPORT PROFILE TYPE FOR USE IN OTHER COMPONENTS
export type { Profile }
