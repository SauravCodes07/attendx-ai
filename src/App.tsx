import { useEffect, useState } from 'react'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import { supabase } from './supabase'
import type { Profile } from './types'

function App() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        setProfile(data as Profile | null)
      } else {
        setProfile(null)
      }
      setLoading(false)
    }

    void loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: unknown, session: { user?: { id: string } } | null) => {
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        setProfile(data as Profile | null)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  if (loading) {
    return (
      <div className="app auth-shell">
        <div className="ambient ambient-one" /><div className="ambient ambient-two" />
        <div className="auth-card">
          <div className="auth-card__hero">
            <div className="logo" aria-label="AttendX AI"><div className="logo-mark"><span /><span /><span /></div><span>Attend<span>X</span></span></div>
            <h1>Loading AttendX AI</h1>
            <p>Preparing your secure workspace and live Supabase data.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return <AuthPage onAuth={() => setLoading(true)} />
  }

  return <DashboardPage profile={profile} onLogout={handleLogout} />
}

export default App
