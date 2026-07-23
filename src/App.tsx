import { useEffect, useMemo, useState, useRef } from 'react'
import { ArrowRight, Sparkles, ChevronRight, ChevronLeft, UploadCloud, User } from 'lucide-react'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import { supabase, ensureProfile, isProfileComplete } from './supabase'
import { useTheme } from './hooks/useTheme'
import type { Profile, ThemePreference } from './types'

type ViewMode = 'landing' | 'auth' | 'dashboard' | 'profile-setup'

function App() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('landing')

  // Theme management using our hook
  const { theme, isDark, setTheme, syncWithProfile } = useTheme(profile?.id || undefined)

  // Profile setup wizard state
  const [wizardStep, setWizardStep] = useState(1)
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    usn: '',
    roll_number: '',
    branch: '',
    department: '',
    year: '',
    semester: '',
    section: '',
    phone: '',
    mobile: '',
    gender: 'Other',
    dob: '',
    address: '',
    emergency_contact: '',
    personal_email: '',
    college_email: '',
    bio: '',
    avatar_url: '',
  })

  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [uploadState, setUploadState] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
              // Prepopulate form if some data exists
              setProfileForm((prev) => ({
                ...prev,
                full_name: fetchedProfile.full_name || '',
                usn: fetchedProfile.usn || '',
                roll_number: fetchedProfile.roll_number || '',
                branch: fetchedProfile.branch || '',
                department: fetchedProfile.department || '',
                year: fetchedProfile.year || '',
                semester: fetchedProfile.semester || '',
                section: fetchedProfile.section || '',
                phone: fetchedProfile.phone || '',
                mobile: fetchedProfile.mobile || '',
                gender: fetchedProfile.gender || 'Other',
                dob: fetchedProfile.dob || '',
                address: fetchedProfile.address || '',
                emergency_contact: fetchedProfile.emergency_contact || '',
                personal_email: fetchedProfile.personal_email || fetchedProfile.email || '',
                college_email: fetchedProfile.college_email || '',
                bio: fetchedProfile.bio || '',
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
              usn: fetchedProfile.usn || prev.usn,
              roll_number: fetchedProfile.roll_number || prev.roll_number,
              branch: fetchedProfile.branch || prev.branch,
              department: fetchedProfile.department || prev.department,
              year: fetchedProfile.year || prev.year,
              semester: fetchedProfile.semester || prev.semester,
              section: fetchedProfile.section || prev.section,
              phone: fetchedProfile.phone || prev.phone,
              mobile: fetchedProfile.mobile || prev.mobile,
              gender: fetchedProfile.gender || prev.gender,
              dob: fetchedProfile.dob || prev.dob,
              address: fetchedProfile.address || prev.address,
              emergency_contact: fetchedProfile.emergency_contact || prev.emergency_contact,
              personal_email: fetchedProfile.personal_email || fetchedProfile.email || prev.personal_email,
              college_email: fetchedProfile.college_email || prev.college_email,
              bio: fetchedProfile.bio || prev.bio,
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
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile?.id) return

    setUploadState('Uploading photo...')
    try {
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

    // Final client-side verification
    if (!profileForm.full_name.trim()) {
      setProfileError('Full name is required.')
      setWizardStep(1)
      return
    }
    if (!profileForm.gender) {
      setProfileError('Gender selection is required.')
      setWizardStep(1)
      return
    }
    if (!profileForm.dob) {
      setProfileError('Date of birth is required.')
      setWizardStep(1)
      return
    }
    if (!profileForm.personal_email) {
      setProfileError('Personal email is required.')
      setWizardStep(1)
      return
    }
    if (!profileForm.phone) {
      setProfileError('Phone number is required.')
      setWizardStep(1)
      return
    }
    if (!profileForm.usn && !profileForm.roll_number) {
      setProfileError('Either USN or Roll Number is required.')
      setWizardStep(2)
      return
    }
    if (!profileForm.department || !profileForm.branch) {
      setProfileError('Academic department and branch are required.')
      setWizardStep(2)
      return
    }
    if (!profileForm.year || !profileForm.semester || !profileForm.section) {
      setProfileError('Academic year, semester, and section are required.')
      setWizardStep(2)
      return
    }
    if (!profileForm.college_email) {
      setProfileError('College email is required.')
      setWizardStep(2)
      return
    }
    if (!profileForm.address) {
      setProfileError('Address is required.')
      setWizardStep(3)
      return
    }
    if (!profileForm.emergency_contact) {
      setProfileError('Emergency contact contact is required.')
      setWizardStep(3)
      return
    }

    setProfileSaving(true)
    setProfileError('')

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          usn: profileForm.usn || null,
          roll_number: profileForm.roll_number || null,
          branch: profileForm.branch,
          department: profileForm.department,
          year: profileForm.year,
          semester: profileForm.semester,
          section: profileForm.section,
          phone: profileForm.phone,
          mobile: profileForm.mobile || profileForm.phone,
          gender: profileForm.gender,
          dob: profileForm.dob,
          address: profileForm.address,
          emergency_contact: profileForm.emergency_contact,
          personal_email: profileForm.personal_email,
          college_email: profileForm.college_email,
          bio: profileForm.bio || null,
          avatar_url: profileForm.avatar_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) throw error

      // Fetch the updated profile state
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
      return <DashboardPage profile={profile} onLogout={handleLogout} />
    }

    if (view === 'profile-setup' && profile) {
      return (
        <div className="app auth-shell">
          <div className="ambient ambient-one" />
          <div className="ambient ambient-two" />
          <div className="auth-card" style={{ maxWidth: '540px' }}>
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
                <Sparkles size={14} /> Step {wizardStep} of 3
              </div>
              <h1>Complete your academic profile</h1>
              <p>Please provide the details below. All fields are required to secure your SaaS workspace.</p>
            </div>

            {profileError ? <div className="auth-message error">{profileError}</div> : null}

            {wizardStep === 1 && (
              <div className="auth-form">
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      background: 'rgba(103,107,255,0.08)',
                      border: '1px dashed var(--line)',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: 'pointer',
                      overflow: 'hidden',
                    }}
                  >
                    {profileForm.avatar_url ? (
                      <img src={profileForm.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={24} style={{ color: 'var(--muted)' }} />
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      className="auth-secondary"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ fontSize: '11px', padding: '6px 12px' }}
                    >
                      Upload Profile Photo
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleAvatarUpload}
                    />
                    {uploadState && <p className="helper-text" style={{ fontSize: '10px', marginTop: '4px' }}>{uploadState}</p>}
                  </div>
                </div>

                <label className="auth-field">
                  <span>Full name</span>
                  <input
                    value={profileForm.full_name}
                    onChange={(event) => setProfileForm({ ...profileForm, full_name: event.target.value })}
                    placeholder=" Ava Thompson"
                    required
                  />
                </label>

                <div className="settings-grid">
                  <label className="auth-field">
                    <span>Gender</span>
                    <select
                      value={profileForm.gender}
                      onChange={(event) => setProfileForm({ ...profileForm, gender: event.target.value })}
                      style={{
                        padding: '12px 13px',
                        borderRadius: '12px',
                        background: 'rgba(247,248,252,.9)',
                        border: '1px solid var(--line)',
                        color: 'inherit',
                        outline: 'none',
                      }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                  <label className="auth-field">
                    <span>Date of Birth</span>
                    <input
                      type="date"
                      value={profileForm.dob}
                      onChange={(event) => setProfileForm({ ...profileForm, dob: event.target.value })}
                      required
                    />
                  </label>
                </div>

                <label className="auth-field">
                  <span>Personal Email</span>
                  <input
                    type="email"
                    value={profileForm.personal_email}
                    onChange={(event) => setProfileForm({ ...profileForm, personal_email: event.target.value })}
                    placeholder="you@example.com"
                    required
                  />
                </label>

                <label className="auth-field">
                  <span>Phone Number</span>
                  <input
                    value={profileForm.phone}
                    onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })}
                    placeholder="+1 555-0199"
                    required
                  />
                </label>

                <button type="button" className="primary-button auth-submit" onClick={() => setWizardStep(2)}>
                  Next Step <ChevronRight size={16} />
                </button>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="auth-form">
                <div className="settings-grid">
                  <label className="auth-field">
                    <span>USN / Register No.</span>
                    <input
                      value={profileForm.usn}
                      onChange={(event) => setProfileForm({ ...profileForm, usn: event.target.value })}
                      placeholder="1AH22CS001"
                    />
                  </label>
                  <label className="auth-field">
                    <span>Roll Number</span>
                    <input
                      value={profileForm.roll_number}
                      onChange={(event) => setProfileForm({ ...profileForm, roll_number: event.target.value })}
                      placeholder="Roll 42"
                      required
                    />
                  </label>
                </div>

                <div className="settings-grid">
                  <label className="auth-field">
                    <span>Department</span>
                    <input
                      value={profileForm.department}
                      onChange={(event) => setProfileForm({ ...profileForm, department: event.target.value })}
                      placeholder="CSE"
                      required
                    />
                  </label>
                  <label className="auth-field">
                    <span>Branch</span>
                    <input
                      value={profileForm.branch}
                      onChange={(event) => setProfileForm({ ...profileForm, branch: event.target.value })}
                      placeholder="Computer Science"
                      required
                    />
                  </label>
                </div>

                <div className="settings-grid">
                  <label className="auth-field">
                    <span>Year</span>
                    <input
                      value={profileForm.year}
                      onChange={(event) => setProfileForm({ ...profileForm, year: event.target.value })}
                      placeholder="3"
                      required
                    />
                  </label>
                  <label className="auth-field">
                    <span>Semester</span>
                    <input
                      value={profileForm.semester}
                      onChange={(event) => setProfileForm({ ...profileForm, semester: event.target.value })}
                      placeholder="6"
                      required
                    />
                  </label>
                  <label className="auth-field">
                    <span>Section</span>
                    <input
                      value={profileForm.section}
                      onChange={(event) => setProfileForm({ ...profileForm, section: event.target.value })}
                      placeholder="A"
                      required
                    />
                  </label>
                </div>

                <label className="auth-field">
                  <span>College Email</span>
                  <input
                    type="email"
                    value={profileForm.college_email}
                    onChange={(event) => setProfileForm({ ...profileForm, college_email: event.target.value })}
                    placeholder="student@college.edu"
                    required
                  />
                </label>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    className="auth-secondary"
                    style={{ flex: 1 }}
                    onClick={() => setWizardStep(1)}
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button type="button" className="primary-button" style={{ flex: 2 }} onClick={() => setWizardStep(3)}>
                    Next Step <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="auth-form">
                <label className="auth-field">
                  <span>Residential Address</span>
                  <input
                    value={profileForm.address}
                    onChange={(event) => setProfileForm({ ...profileForm, address: event.target.value })}
                    placeholder="123 Main St, Campus City"
                    required
                  />
                </label>

                <label className="auth-field">
                  <span>Emergency Contact</span>
                  <input
                    value={profileForm.emergency_contact}
                    onChange={(event) => setProfileForm({ ...profileForm, emergency_contact: event.target.value })}
                    placeholder="Name - +1 555-0100"
                    required
                  />
                </label>

                <label className="auth-field">
                  <span>Academic Bio (Optional)</span>
                  <textarea
                    value={profileForm.bio}
                    onChange={(event) => setProfileForm({ ...profileForm, bio: event.target.value })}
                    placeholder="Tell us about your learning track."
                    rows={3}
                    style={{
                      padding: '12px 13px',
                      borderRadius: '12px',
                      background: 'rgba(247,248,252,.9)',
                      border: '1px solid var(--line)',
                      color: 'inherit',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </label>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    className="auth-secondary"
                    style={{ flex: 1 }}
                    onClick={() => setWizardStep(2)}
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button
                    className="primary-button auth-submit"
                    style={{ flex: 2 }}
                    disabled={profileSaving}
                    onClick={handleProfileSave}
                  >
                    {profileSaving ? 'Saving...' : 'Finish Setup'} <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
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
  }, [loading, profile, view, isAuthenticated, wizardStep, profileForm, profileSaving, profileError, uploadState, handleLogout])

  return mainView
}

export default App
