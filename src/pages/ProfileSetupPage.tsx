import { ArrowRight, Sparkles } from 'lucide-react'
import { PremiumFileUpload, PremiumInput, PremiumSelect } from '../components/PremiumInput'
import type { AvatarUploadProgress } from '../avatar'

export interface OnboardingProfileForm {
  full_name: string
  branch: string
  year: string
  semester: string
  avatar_url: string
}

interface ProfileSetupPageProps {
  isDark: boolean
  form: OnboardingProfileForm
  profileError: string
  profileSaving: boolean
  avatarUploading: boolean
  avatarProgress: AvatarUploadProgress | null
  avatarError: string
  onFormChange: (form: OnboardingProfileForm) => void
  onAvatarUpload: (file: File) => void
  onAvatarRemove: () => void
  onSave: () => void
}

export default function ProfileSetupPage({
  isDark,
  form,
  profileError,
  profileSaving,
  avatarUploading,
  avatarProgress,
  avatarError,
  onFormChange,
  onAvatarUpload,
  onAvatarRemove,
  onSave,
}: ProfileSetupPageProps) {
  const uploadStage = avatarProgress?.stage === 'saving'
    ? 'Saving photo'
    : avatarProgress?.stage === 'compressing'
      ? 'Optimizing photo'
      : avatarProgress?.stage === 'uploading'
        ? 'Uploading photo'
        : undefined

  return (
    <div className={`app auth-shell ${isDark ? 'dark' : ''}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="auth-card onboarding-card" style={{ maxWidth: '480px' }}>
        <div className="auth-card__hero">
          <div className="logo" aria-label="AttendX AI"><div className="logo-mark"><span /><span /><span /></div><span>Attend<span>X</span></span></div>
          <div className="auth-badge"><Sparkles size={14} /> Quick setup</div>
          <h1 style={{ fontSize: '24px', letterSpacing: '-0.8px', margin: '12px 0 6px 0' }}>Welcome — just the basics</h1>
          <p>Takes under 30 seconds. Everything else can wait until you&apos;re in the dashboard.</p>
        </div>

        {profileError ? <div className="auth-message error">{profileError}</div> : null}

        <div className="auth-form onboarding-form">
          <PremiumFileUpload
            previewUrl={form.avatar_url || null}
            initials={form.full_name.slice(0, 2).toUpperCase() || 'U'}
            onFileSelect={onAvatarUpload}
            hint="Skip if you prefer — add later from profile"
            optional
            isUploading={avatarUploading}
            uploadProgress={avatarProgress?.percentage}
            uploadStage={uploadStage}
            error={avatarError}
            onRemove={onAvatarRemove}
          />
          <PremiumInput label="Full name" value={form.full_name} onChange={(event) => onFormChange({ ...form, full_name: event.target.value })} placeholder="e.g. Ava Thompson" required autoFocus />
          <PremiumInput label="Branch" value={form.branch} onChange={(event) => onFormChange({ ...form, branch: event.target.value })} placeholder="e.g. Computer Science" required />
          <div className="settings-grid onboarding-grid">
            <PremiumSelect label="Year" value={form.year} onChange={(event) => onFormChange({ ...form, year: event.target.value })}>
              <option value="1">1st Year</option><option value="2">2nd Year</option><option value="3">3rd Year</option><option value="4">4th Year</option>
            </PremiumSelect>
            <PremiumSelect label="Semester" value={form.semester} onChange={(event) => onFormChange({ ...form, semester: event.target.value })}>
              {Array.from({ length: 8 }, (_, index) => <option key={index + 1} value={String(index + 1)}>Semester {index + 1}</option>)}
            </PremiumSelect>
          </div>
          <button className="primary-button auth-submit" disabled={profileSaving || avatarUploading} onClick={onSave} type="button">
            {profileSaving ? 'Saving...' : 'Go to Dashboard'} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
