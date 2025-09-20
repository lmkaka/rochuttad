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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
    })
    return () => { sub.subscription.unsubscribe() }
  }, [])

  const fetchProfile = async () => {
    if (!session?.user?.id) { 
      setProfile(null); 
      return 
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()
      
      if (!error && data) {
        setProfile(data as Profile)
      } else {
        console.error('Profile fetch error:', error)
        setProfile(null)
      }
    } catch (err) {
      console.error('Profile fetch failed:', err)
      setProfile(null)
    }
  }

  useEffect(() => {
    const init = async () => {
      if (session?.user?.id) {
        await fetchProfile()
      }
      setLoading(false)
    }
    init()
  }, [session?.user?.id])

  const value = useMemo(() => ({
    session, 
    profile, 
    loading,
    refreshProfile: fetchProfile,
    signOut: async () => { 
      try {
        await supabase.auth.signOut()
        setProfile(null)
      } catch (error) {
        console.error('Sign out error:', error)
      }
    }
  }), [session, profile, loading])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)

// 🎯 EXPORT PROFILE TYPE FOR USE IN OTHER COMPONENTS
export type { Profile }
