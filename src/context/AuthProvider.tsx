import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../supabaseClient'

type Profile = {
  id: string
  name: string | null
  device_preference: 'iOS' | 'Android' | 'Desktop' | null
  language_preference: 'Hindi' | 'English' | null
}

type Ctx = {
  session: Session | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const Ctx = createContext<Ctx>({
  session: null, profile: null, loading: true, refreshProfile: async () => {}, signOut: async () => {}
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
    if (!session?.user?.id) { setProfile(null); return }
    const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
    if (!error) setProfile(data as Profile)
  }

  useEffect(() => {
    const init = async () => {
      if (session?.user?.id) await fetchProfile()
      setLoading(false)
    }
    init()
  }, [session?.user?.id])

  const value = useMemo(() => ({
    session, profile, loading,
    refreshProfile: fetchProfile,
    signOut: async () => { await supabase.auth.signOut() }
  }), [session, profile, loading])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
