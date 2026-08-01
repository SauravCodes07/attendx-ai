import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, ensureProfile, isProfileComplete } from './supabase'
import { removeAvatar, uploadAvatar, type AvatarUploadProgress } from './avatar'
import { useTheme } from './hooks/useTheme'
import AppShellSkeleton from './components/AppShellSkeleton'
import Toast from './components/Toast'
import type { Profile } from './types'
import type { OnboardingProfileForm } from './pages/ProfileSetupPage'

const AuthPage = lazy(() => import('./pages/AuthPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const LandingPage = lazy(() => import('./pages/LandingPage'))
const ProfileSetupPage = lazy(() => import('./pages/ProfileSetupPage'))

type ViewMode = 'landing' | 'auth' | 'dashboard' | 'profile-setup'

const getProfileCacheKey = (userId: string) => `attendx:profile:${userId}`

const readProfileCache = (userId: string): Profile | null => {
  try {
    const cached = window.sessionStorage.getItem(getProfileCacheKey(userId))
    return cached ? JSON.parse(cached) as Profile : null
  } catch {
    return null
  }
}

const writeProfileCache = (profile: Profile) => {
  try {
    window.sessionStorage.setItem(getProfileCacheKey(profile.id), JSON.stringify(profile))
  } catch {}
}

function App() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [view, setView] = useState<ViewMode>('landing')
  const { isDark, syncWithProfile } = useTheme(profile?.id)
  const [profileForm, setProfileForm] = useState<OnboardingProfileForm>({ full_name: '', branch: '', year: '1', semester: '1', avatar_url: '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarProgress, setAvatarProgress] = useState<AvatarUploadProgress | null>(null)
  const [avatarError, setAvatarError] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const applyProfile = useCallback((nextProfile: Profile) => {
    writeProfileCache(nextProfile)
    setProfile(nextProfile)
    setProfileForm({
      full_name: nextProfile.full_name || '',
      branch: nextProfile.branch || '',
      year: nextProfile.year || '1',
      semester: nextProfile.semester || '1',
      avatar_url: nextProfile.avatar_url || '',
    })
    if (nextProfile.theme_preference) syncWithProfile(nextProfile.theme_preference)
    setView(isProfileComplete(nextProfile) ? 'dashboard' : 'profile-setup')
    setProfileLoading(false)
  }, [syncWithProfile])

  const refreshProfile = useCallback(async (user: User) => {
    try {
      const freshProfile = await ensureProfile(user.id, user.email, user.user_metadata?.full_name)
      if (freshProfile) applyProfile(freshProfile)
      else setProfileLoading(false)
    } catch {
      setProfileLoading(false)
      setToast({ message: 'Unable to refresh your profile. Showing the latest available workspace.', type: 'error' })
    }
  }, [applyProfile])

  const hydrateUser = useCallback((user: User) => {
    const cachedProfile = readProfileCache(user.id)
    if (cachedProfile) applyProfile(cachedProfile)
    else setProfileLoading(true)
    void refreshProfile(user)
  }, [applyProfile, refreshProfile])

  useEffect(() => {
    let active = true

    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!active) return
      setAuthLoading(false)
      if (session?.user) hydrateUser(session.user)
      else {
        setProfile(null)
        setProfileLoading(false)
        setView('landing')
      }
    }

    void loadSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setAuthLoading(false)
      if (session?.user) hydrateUser(session.user)
      else {
        setProfile(null)
        setProfileLoading(false)
        setView('landing')
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [hydrateUser])

  const handleProfileChange = useCallback((updatedProfile: Profile) => applyProfile(updatedProfile), [applyProfile])

  const handleLogout = async () => {
    const profileId = profile?.id
    await supabase.auth.signOut()
    if (profileId) window.sessionStorage.removeItem(getProfileCacheKey(profileId))
    setProfile(null)
    setView('landing')
  }

  const handleAvatarUpload = async (file: File) => {
    if (!profile?.id) return
    setAvatarUploading(true)
    setAvatarError('')
    setAvatarProgress({ stage: 'validating', percentage: 0 })
    try {
      const result = await uploadAvatar(profile.id, profile.avatar_url, file, setAvatarProgress)
      handleProfileChange(result.profile)
      setToast({ message: 'Profile photo uploaded successfully.', type: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to upload your profile photo.'
      setAvatarError(message)
      setToast({ message, type: 'error' })
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleAvatarRemove = async () => {
    if (!profile?.id || !profile.avatar_url) return
    setAvatarUploading(true)
    setAvatarError('')
    try {
      handleProfileChange(await removeAvatar(profile.id, profile.avatar_url))
      setToast({ message: 'Profile photo removed.', type: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to remove your profile photo.'
      setAvatarError(message)
      setToast({ message, type: 'error' })
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleProfileSave = async () => {
    if (!profile?.id) return
    if (!profileForm.full_name.trim() || !profileForm.branch.trim() || !profileForm.year || !profileForm.semester) {
      setProfileError('Complete your name, branch, year, and semester to continue.')
      return
    }

    setProfileSaving(true)
    setProfileError('')
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name.trim(),
          branch: profileForm.branch.trim(),
          year: profileForm.year,
          semester: profileForm.semester,
          avatar_url: profileForm.avatar_url || null,
          profile_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select('*')
        .single()

      if (error || !data) throw error || new Error('Profile was not returned after saving.')
      handleProfileChange(data as Profile)
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Unable to save your profile right now.')
    } finally {
      setProfileSaving(false)
    }
  }

  let content: JSX.Element
  if (authLoading || (profileLoading && !profile)) {
    content = <AppShellSkeleton />
  } else if (view === 'dashboard' && profile) {
    content = <Suspense fallback={<AppShellSkeleton />}><DashboardPage profile={profile} onLogout={handleLogout} onProfileChange={handleProfileChange} /></Suspense>
  } else if (view === 'profile-setup' && profile) {
    content = <Suspense fallback={<AppShellSkeleton />}><ProfileSetupPage isDark={isDark} form={profileForm} profileError={profileError} profileSaving={profileSaving} avatarUploading={avatarUploading} avatarProgress={avatarProgress} avatarError={avatarError} onFormChange={setProfileForm} onAvatarUpload={handleAvatarUpload} onAvatarRemove={handleAvatarRemove} onSave={handleProfileSave} /></Suspense>
  } else if (view === 'auth') {
    content = <Suspense fallback={<AppShellSkeleton />}><AuthPage onAuth={() => setAuthLoading(true)} /></Suspense>
  } else {
    content = <Suspense fallback={<AppShellSkeleton />}><LandingPage isAuthenticated={Boolean(profile)} onGetStarted={() => setView('auth')} onLogin={() => setView('auth')} onGoToDashboard={() => setView(profile && isProfileComplete(profile) ? 'dashboard' : 'auth')} onLogout={handleLogout} /></Suspense>
  }

  return <>{content}{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}</>
}

export default App
