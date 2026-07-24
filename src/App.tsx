import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import { supabase, ensureProfile, isProfileComplete, ensureAvatarBucket } from './supabase'
import { useTheme } from './hooks/useTheme'
import { PremiumInput, PremiumSelect, PremiumFileUpload } from './components/PremiumInput'
import type { Profile } from './types'

type ViewMode = 'landing' | 'auth' | 'dashboard' | 'profile-setup'

function App() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('landing')

  // Theme management using our hook
  const { theme, isDark, setTheme, syncWithProfile } = useTheme(profile?.id || undefined)

  // Profile setup wizard state (reduced for onboarding under 30s)
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    branch: '',
    year: '1',
    semester: '1',
    avatar_url: '',
  })

  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [uploadState, setUploadState] = useState('')

  // Load session with a timeout safety to prevent infinite loading screen
  useEffect(() => {
    let active = true
    const timeoutId = setTimeout(() => {
      if (active && loading) {
        console.warn('Authentication initialization timed out. Proceeding to fallback state.')
        setLoading(false)
      }
    }, 2500) // Max 2.5 seconds loading time as required

    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const fetchedProfile = await ensureProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata?.full_name
          )
          if (active) {
            setProfile(fetchedProfile)
            if (fetchedProfile) {
              setProfileForm((prev) => ({
                ...prev,
                full_name: fetchedProfile.full_name || '',
                branch: fetchedProfile.branch || '',
                year: fetchedProfile.year || '1',
                semester: fetchedProfile.semester || '1',
                avatar_url: fetchedProfile.avatar_url || '',
              }))

              if (fetchedProfile.theme_preference) {
                syncWithProfile(fetchedProfile.theme_preference)
              }
            }

            setView(isProfileComplete(fetchedProfile) ? 'dashboard' : 'profile-setup')
          }
        } else {
          if (active) {
            setProfile(null)
            setView('landing')
          }
        }
      } catch (err) {
        console.error('Error fetching session:', err)
        if (active) {
          setView('landing')
        }
      } finally {
        if (active) {
          setLoading(false)
          clearTimeout(timeoutId)
        }
      }
    }

    void loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: any, session: any) => {
        if (session?.user) {
          setLoading(true)
          const fetchedProfile = await ensureProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata?.full_name
          )
          setProfile(fetchedProfile)
          if (fetchedProfile) {
            setProfileForm((prev) => ({
              ...prev,
              full_name: fetchedProfile.full_name || prev.full_name,
              branch: fetchedProfile.branch || prev.branch,
              year: fetchedProfile.year || prev.year,
              semester: fetchedProfile.semester || prev.semester,
              avatar_url: fetchedProfile.avatar_url || prev.avatar_url,
            }))

            if (fetchedProfile.theme_preference) {
              syncWithProfile(fetchedProfile.theme_preference)
            }
          }
          setView(isProfileComplete(fetchedProfile) ? 'dashboard' : 'profile-setup')
          setLoading(false)
        } else {
          setProfile(null)
          setView('landing')
          setLoading(false)
        }
      }
    )

    return () => {
      active = false
      subscription.unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setView('landing')
  }

  // Handle uploading custom profile photo during signup wizard
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement> | File) => {
    const file = e instanceof File ? e : e.target.files?.[0]
    if (!file || !profile?.id) return

    setUploadState('Uploading photo...')
    try {
      const { ready } = await ensureAvatarBucket()
      if (!ready) {
        setUploadState('Storage is not ready. Please try again later.')
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}/avatar-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      setProfileForm((prev) => ({ ...prev, avatar_url: data.publicUrl }))
      setUploadState('Photo uploaded successfully!')
    } catch (err: any) {
      console.error(err)
      setUploadState(`Upload failed: ${err.message}`)
    }
  }

  const handleProfileSave = async () => {
    if (!profile?.id) return

    if (!profileForm.full_name.trim()) {
      setProfileError('Full name is required.')
      return
    }
    if (!profileForm.branch.trim()) {
      setProfileError('Branch is required.')
      return
    }
    if (!profileForm.year) {
      setProfileError('Year is required.')
      return
    }
    if (!profileForm.semester) {
      setProfileError('Semester is required.')
      return
    }

    setProfileSaving(true)
    setProfileError('')

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          branch: profileForm.branch,
          year: profileForm.year,
          semester: profileForm.semester,
          avatar_url: profileForm.avatar_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) throw error

      const { data: updatedProfile, error: refetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.id)
        .single()

      if (refetchError) throw refetchError

      setProfile(updatedProfile as Profile)
      setView('dashboard')
    } catch (err: any) {
      setProfileError(err.message || 'Unable to save your profile right now.')
    } finally {
      setProfileSaving(false)
    }
  }

  const isAuthenticated = Boolean(profile)

  const mainView = useMemo(() => {
    if (loading) {
      return (
        <div className="app auth-shell">
          <div className="ambient ambient-one" />
          <div className="ambient ambient-two" />
          <div className="auth-card loading-card">
            <div className="loading-ring" aria-hidden="true" />
            <div className="auth-card__hero">
              <div className="logo" aria-label="AttendX AI">
                <div className="logo-mark">
                  <span />
                  <span />
                  <span />
                </div>
                <span>
                  Attend<span>X</span>
                </span>
              </div>
              <h1>Loading AttendX AI</h1>
              <p>Preparing your secure workspace and live Supabase data.</p>
            </div>
          </div>
        </div>
      )
    }

    if (view === 'dashboard' && profile) {
      return (
        <DashboardPage
          profile={profile}
          onLogout={handleLogout}
          onProfileChange={setProfile}
        />
      )
    }

    if (view === 'profile-setup' && profile) {
      return (
        <div className={`app auth-shell ${isDark ? 'dark' : ''}`}>
          <div className="ambient ambient-one" />
          <div className="ambient ambient-two" />
          <div className="auth-card onboarding-card" style={{ maxWidth: '480px' }}>
            <div className="auth-card__hero">
              <div className="logo" aria-label="AttendX AI">
                <div className="logo-mark">
                  <span />
                  <span />
                  <span />
                </div>
                <span>
                  Attend<span>X</span>
                </span>
              </div>
              <div className="auth-badge">
                <Sparkles size={14} /> Quick setup
              </div>
              <h1 style={{ fontSize: '24px', letterSpacing: '-0.8px', margin: '12px 0 6px 0' }}>
                Welcome — just the basics
              </h1>
              <p>Takes under 30 seconds. Everything else can wait until you&apos;re in the dashboard.</p>
            </div>

            {profileError ? <div className="auth-message error">{profileError}</div> : null}

            <div className="auth-form onboarding-form">
              <PremiumFileUpload
                previewUrl={profileForm.avatar_url || null}
                initials={profileForm.full_name?.slice(0, 2).toUpperCase() || 'U'}
                onFileSelect={(file) => void handleAvatarUpload(file)}
                hint="Skip if you prefer — add later from profile"
                optional
              />
              {uploadState && <p className="helper-text onboarding-upload-status">{uploadState}</p>}

              <PremiumInput
                label="Full name"
                value={profileForm.full_name}
                onChange={(event) => setProfileForm({ ...profileForm, full_name: event.target.value })}
                placeholder="e.g. Ava Thompson"
                required
                autoFocus
              />

              <PremiumInput
                label="Branch"
                value={profileForm.branch}
                onChange={(event) => setProfileForm({ ...profileForm, branch: event.target.value })}
                placeholder="e.g. Computer Science"
                required
              />

              <div className="settings-grid onboarding-grid">
                <PremiumSelect
                  label="Year"
                  value={profileForm.year}
                  onChange={(event) => setProfileForm({ ...profileForm, year: event.target.value })}
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </PremiumSelect>

                <PremiumSelect
                  label="Semester"
                  value={profileForm.semester}
                  onChange={(event) => setProfileForm({ ...profileForm, semester: event.target.value })}
                >
                  {Array.from({ length: 8 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      Semester {i + 1}
                    </option>
                  ))}
                </PremiumSelect>
              </div>

              <button
                className="primary-button auth-submit"
                disabled={profileSaving}
                onClick={handleProfileSave}
                type="button"
              >
                {profileSaving ? 'Saving...' : 'Go to Dashboard'} <ArrowRight size={16} />
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
        onGoToDashboard={() => setView(profile ? (isProfileComplete(profile) ? 'dashboard' : 'profile-setup') : 'auth')}
        onLogout={handleLogout}
      />
    )
  }, [loading, profile, view, isAuthenticated, profileForm, profileSaving, profileError, uploadState, handleLogout, isDark])

  return mainView
}

export default App
