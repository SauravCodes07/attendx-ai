import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import { supabase } from './supabase'
import type { Profile } from './types'

type ViewMode = 'landing' | 'auth' | 'dashboard' | 'profile-setup'

function App() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('landing')
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    usn: '',
    branch: '',
    department: '',
    year: '',
    semester: '',
    section: '',
    phone: '',
    mobile: '',
    bio: '',
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        const nextProfile = data as Profile | null
        setProfile(nextProfile)
        setView(nextProfile?.usn || nextProfile?.department || nextProfile?.branch ? 'dashboard' : 'profile-setup')
      } else {
        setProfile(null)
        setView('landing')
      }
      setLoading(false)
    }

    void loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: unknown, session: { user?: { id: string } } | null) => {
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        const nextProfile = data as Profile | null
        setProfile(nextProfile)
        setView(nextProfile?.usn || nextProfile?.department || nextProfile?.branch ? 'dashboard' : 'profile-setup')
      } else {
        setProfile(null)
        setView('landing')
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setView('landing')
  }

  const handleProfileSave = async () => {
    if (!profile?.id) return
    setProfileSaving(true)
    setProfileError('')

    const { error } = await supabase.from('profiles').update({
      full_name: profileForm.full_name || profile?.full_name || null,
      usn: profileForm.usn || null,
      branch: profileForm.branch || null,
      department: profileForm.department || null,
      year: profileForm.year || null,
      semester: profileForm.semester || null,
      section: profileForm.section || null,
      phone: profileForm.phone || null,
      mobile: profileForm.mobile || null,
      bio: profileForm.bio || null,
    }).eq('id', profile.id)

    if (!error) {
      setView('dashboard')
      setProfile({ ...profile, ...profileForm, full_name: profileForm.full_name || profile?.full_name || null } as Profile)
    } else {
      setProfileError(error.message || 'Unable to save your profile right now.')
    }

    setProfileSaving(false)
  }

  const isAuthenticated = Boolean(profile)

  const mainView = useMemo(() => {
    if (loading) {
      return (
        <div className="app auth-shell">
          <div className="ambient ambient-one" /><div className="ambient ambient-two" />
          <div className="auth-card loading-card">
            <div className="loading-ring" aria-hidden="true" />
            <div className="auth-card__hero">
              <div className="logo" aria-label="AttendX AI"><div className="logo-mark"><span /><span /><span /></div><span>Attend<span>X</span></span></div>
              <h1>Loading AttendX AI</h1>
              <p>Preparing your secure workspace and live Supabase data.</p>
            </div>
          </div>
        </div>
      )
    }

    if (view === 'dashboard' && profile) {
      return <DashboardPage profile={profile} onLogout={handleLogout} />
    }

    if (view === 'profile-setup' && profile) {
      return (
        <div className="app auth-shell">
          <div className="ambient ambient-one" /><div className="ambient ambient-two" />
          <div className="auth-card">
            <div className="auth-card__hero">
              <div className="logo" aria-label="AttendX AI"><div className="logo-mark"><span /><span /><span /></div><span>Attend<span>X</span></span></div>
              <div className="auth-badge"><Sparkles size={14} /> Welcome aboard</div>
              <h1>Complete your academic profile</h1>
              <p>Before entering the dashboard, add the details that make your attendance workspace personal and accurate.</p>
            </div>
            <div className="auth-form">
              {profileError ? <div className="auth-message error">{profileError}</div> : null}
              <label className="auth-field">
                <span>Full name</span>
                <input value={profileForm.full_name} onChange={(event) => setProfileForm({ ...profileForm, full_name: event.target.value })} placeholder="Your full name" />
              </label>
              <label className="auth-field">
                <span>USN</span>
                <input value={profileForm.usn} onChange={(event) => setProfileForm({ ...profileForm, usn: event.target.value })} placeholder="1AH22CS001" />
              </label>
              <label className="auth-field">
                <span>Branch</span>
                <input value={profileForm.branch} onChange={(event) => setProfileForm({ ...profileForm, branch: event.target.value })} placeholder="Computer Science" />
              </label>
              <label className="auth-field">
                <span>Department</span>
                <input value={profileForm.department} onChange={(event) => setProfileForm({ ...profileForm, department: event.target.value })} placeholder="CSE" />
              </label>
              <div className="settings-grid">
                <label className="auth-field">
                  <span>Year</span>
                  <input value={profileForm.year} onChange={(event) => setProfileForm({ ...profileForm, year: event.target.value })} placeholder="4" />
                </label>
                <label className="auth-field">
                  <span>Semester</span>
                  <input value={profileForm.semester} onChange={(event) => setProfileForm({ ...profileForm, semester: event.target.value })} placeholder="8" />
                </label>
              </div>
              <label className="auth-field">
                <span>Section</span>
                <input value={profileForm.section} onChange={(event) => setProfileForm({ ...profileForm, section: event.target.value })} placeholder="A" />
              </label>
              <label className="auth-field">
                <span>Phone</span>
                <input value={profileForm.phone} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} placeholder="+91 98765 43210" />
              </label>
              <label className="auth-field">
                <span>Bio</span>
                <textarea value={profileForm.bio} onChange={(event) => setProfileForm({ ...profileForm, bio: event.target.value })} placeholder="A short note about your study focus." rows={3} />
              </label>
              <button className="primary-button auth-submit" disabled={profileSaving} onClick={handleProfileSave}>
                {profileSaving ? 'Saving…' : 'Continue to dashboard'} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )
    }

    if (view === 'auth') {
      return <AuthPage onAuth={() => setLoading(true)} />
    }

    return (
      <LandingPage
        isAuthenticated={isAuthenticated}
        onGetStarted={() => setView('auth')}
        onLogin={() => setView('auth')}
        onGoToDashboard={() => setView(profile ? 'dashboard' : 'auth')}
      />
    )
  }, [loading, profile, view, isAuthenticated, handleLogout])

  return mainView
}

export default App
