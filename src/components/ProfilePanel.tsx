import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  X,
  UserCog,
  Download,
  Lock,
  Sun,
  Moon,
  Settings2,
  CalendarDays,
  UserRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import type { Profile } from '../types'
import {
  calculateCompletionPercentage,
  getMissingFields,
  getOptionalMissingFields,
  supabase,
} from '../supabase'
import {
  PremiumInput,
  PremiumSelect,
  PremiumTextarea,
  PremiumDatePicker,
  PremiumFileUpload,
} from './PremiumInput'

interface ProfilePanelProps {
  profile: Profile
  onClose: () => void
  onProfileUpdate: (updatedFields: Partial<Profile>) => Promise<void>
  onLogout: () => void
  onPasswordChange: () => void
  onExportClick: () => void
  onActiveTabChange: (tab: 'Overview' | 'Attendance' | 'Settings') => void
  attendancePercentage: string
  streak: number
  isDark: boolean
  toggleTheme: () => void
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export default function ProfilePanel({
  profile,
  onClose,
  onProfileUpdate,
  onLogout,
  onPasswordChange,
  onExportClick,
  onActiveTabChange,
  attendancePercentage,
  streak,
  isDark,
  toggleTheme,
}: ProfilePanelProps) {
  const [profileForm, setProfileForm] = useState({
    full_name: profile.full_name || '',
    personal_email: profile.personal_email || profile.email || '',
    college_email: profile.college_email || '',
    phone: profile.phone || '',
    bio: profile.bio || '',
    usn: profile.usn || '',
    roll_number: profile.roll_number || '',
    branch: profile.branch || '',
    department: profile.department || '',
    year: profile.year || '',
    semester: profile.semester || '',
    section: profile.section || '',
    mobile: profile.mobile || '',
    dob: profile.dob || '',
    address: profile.address || '',
    emergency_contact: profile.emergency_contact || '',
    gender: profile.gender || '',
  })

  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveError, setSaveError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)
  const lastSavedRef = useRef(JSON.stringify(profileForm))

  const mergedProfile = useMemo(
    () => ({ ...profile, ...profileForm, avatar_url: avatarUrl || profile.avatar_url }),
    [profile, profileForm, avatarUrl]
  )

  const completionPercentage = useMemo(
    () => calculateCompletionPercentage(mergedProfile),
    [mergedProfile]
  )
  const missingFields = useMemo(() => getMissingFields(mergedProfile), [mergedProfile])
  const optionalMissing = useMemo(() => getOptionalMissingFields(mergedProfile), [mergedProfile])
  const isVerified = profile.email_verified === true

  const persistProfile = useCallback(
    async (fields: Partial<Profile>) => {
      setSaveStatus('saving')
      setSaveError('')
      try {
        await onProfileUpdate({
          ...fields,
          updated_at: new Date().toISOString(),
        })
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch (err: any) {
        setSaveStatus('error')
        setSaveError(err.message || 'Could not save profile details.')
      }
    },
    [onProfileUpdate]
  )

  // Autosave on field changes (debounced)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const serialized = JSON.stringify(profileForm)
    if (serialized === lastSavedRef.current) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      lastSavedRef.current = serialized
      await persistProfile(profileForm)
    }, 800)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [profileForm, persistProfile])

  const updateField = (key: keyof typeof profileForm, value: string) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }))
  }

  const handlePhotoUpload = async (file: File) => {
    setSaveStatus('saving')
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}/avatar-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      setAvatarUrl(data.publicUrl)
      await onProfileUpdate({ avatar_url: data.publicUrl })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (err: any) {
      setSaveStatus('error')
      setSaveError(err.message || 'Photo upload failed.')
    }
  }

  const triggerSaaSDownload = (type: 'json' | 'pdf-profile' | 'pdf-semester') => {
    const fileName = `attendx-${type}-${Date.now()}`

    if (type === 'json') {
      const dataStr = JSON.stringify(mergedProfile, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}.json`
      link.click()
    } else if (type === 'pdf-profile') {
      const profileText = `ATTENDX PROFILE REPORT\n\nName: ${profileForm.full_name}\nUSN/Reg: ${profileForm.usn}\nDepartment: ${profileForm.department}\nBranch: ${profileForm.branch}\nSemester: ${profileForm.semester}\nSection: ${profileForm.section}\nCollege Email: ${profileForm.college_email}\nPersonal Email: ${profileForm.personal_email}\nPhone: ${profileForm.phone}\nGender: ${profileForm.gender || '—'}\nDate of Birth: ${profileForm.dob}\nAddress: ${profileForm.address}\nEmergency Contact: ${profileForm.emergency_contact}\nBio: ${profileForm.bio}`
      const blob = new Blob([profileText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}.txt`
      link.click()
    } else {
      const semesterText = `ATTENDX SEMESTER ATTENDANCE REPORT\n\nStudent: ${profileForm.full_name}\nUSN/Reg: ${profileForm.usn}\nDepartment: ${profileForm.department}\nBranch: ${profileForm.branch}\nSemester: ${profileForm.semester}\nSection: ${profileForm.section}\nOverall Attendance Rate: ${attendancePercentage}\nStreak: ${streak} days`
      const blob = new Blob([semesterText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}.txt`
      link.click()
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="profile-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-heading"
        onMouseDown={(event) => event.stopPropagation()}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <div className="profile-panel__hero">
          <div>
            <div className="profile-pill">
              <UserCog size={13} /> Academic Profile
            </div>
            <h3 id="profile-heading" style={{ margin: '8px 0 2px 0' }}>
              {profileForm.full_name || 'Student Profile'}
            </h3>
            <p style={{ margin: 0 }}>{profile.email || 'Supabase authenticated user'}</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close profile">
            <X size={18} />
          </button>
        </div>

        <div className="profile-completion-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Profile Completion
              </span>
              <strong style={{ display: 'block', fontSize: '20px', marginTop: '2px' }}>{completionPercentage}%</strong>
            </div>
            <span
              className={`profile-verification-badge ${isVerified ? 'verified' : 'pending'}`}
            >
              {isVerified ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
              {isVerified ? 'Verified' : 'Pending verification'}
            </span>
          </div>
          <div className="completeness-bar-container">
            <div className="completeness-bar-fill" style={{ width: `${completionPercentage}%` }} />
          </div>
          {missingFields.length > 0 && (
            <div>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Missing information
              </span>
              <ul className="summary-list" style={{ gap: '4px', marginTop: '6px' }}>
                {missingFields.map((field) => (
                  <li key={field} style={{ justifyContent: 'flex-start', gap: '8px', fontSize: '12px' }}>
                    <Lock size={11} />
                    <span>{field}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className={`autosave-indicator ${saveStatus === 'saving' ? 'saving' : saveStatus === 'saved' ? 'saved' : ''}`}>
            {saveStatus === 'saving' && <><Loader2 size={12} className="spin" /> Saving to Supabase…</>}
            {saveStatus === 'saved' && <><CheckCircle2 size={12} /> All changes saved</>}
            {saveStatus === 'error' && saveError}
            {saveStatus === 'idle' && optionalMissing.length > 0 && 'Changes autosave as you type'}
          </div>
        </div>

        <PremiumFileUpload
          previewUrl={avatarUrl || profile.avatar_url}
          initials={profileForm.full_name?.slice(0, 2).toUpperCase() || 'US'}
          onFileSelect={handlePhotoUpload}
          optional
        />

        <div className="profile-panel__stats">
          <div className="summary-card">
            <strong>{attendancePercentage}</strong>
            <span>Attendance</span>
          </div>
          <div className="summary-card">
            <strong>{streak} days</strong>
            <span>Streak</span>
          </div>
        </div>

        <div className="profile-form-grid">
          <PremiumInput
            label="Full name"
            value={profileForm.full_name}
            onChange={(e) => updateField('full_name', e.target.value)}
            placeholder="e.g. Ava Thompson"
          />
          <PremiumInput
            label="Phone number"
            value={profileForm.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="+91 98765 43210"
          />
          <PremiumInput
            label="Personal email"
            type="email"
            value={profileForm.personal_email}
            onChange={(e) => updateField('personal_email', e.target.value)}
            placeholder="you@email.com"
          />
          <PremiumInput
            label="College email"
            type="email"
            value={profileForm.college_email}
            onChange={(e) => updateField('college_email', e.target.value)}
            placeholder="you@college.edu"
          />
          <PremiumInput
            label="Roll number"
            value={profileForm.roll_number}
            onChange={(e) => updateField('roll_number', e.target.value)}
            placeholder="e.g. 2024CS001"
          />
          <PremiumInput
            label="USN"
            value={profileForm.usn}
            onChange={(e) => updateField('usn', e.target.value)}
            placeholder="University seat number"
          />
          <PremiumInput
            label="Branch"
            value={profileForm.branch}
            onChange={(e) => updateField('branch', e.target.value)}
            placeholder="e.g. Computer Science"
          />
          <PremiumInput
            label="Department"
            value={profileForm.department}
            onChange={(e) => updateField('department', e.target.value)}
            placeholder="e.g. CSE"
          />
          <PremiumSelect
            label="Year"
            value={profileForm.year}
            onChange={(e) => updateField('year', e.target.value)}
          >
            <option value="">Select year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </PremiumSelect>
          <PremiumSelect
            label="Semester"
            value={profileForm.semester}
            onChange={(e) => updateField('semester', e.target.value)}
          >
            <option value="">Select semester</option>
            {Array.from({ length: 8 }, (_, i) => (
              <option key={i + 1} value={String(i + 1)}>
                Semester {i + 1}
              </option>
            ))}
          </PremiumSelect>
          <PremiumInput
            label="Section"
            value={profileForm.section}
            onChange={(e) => updateField('section', e.target.value)}
            placeholder="e.g. A"
          />
          <PremiumInput
            label="Mobile"
            value={profileForm.mobile}
            onChange={(e) => updateField('mobile', e.target.value)}
            placeholder="Alternate number"
          />
          <PremiumDatePicker
            label="Date of birth"
            value={profileForm.dob}
            onChange={(e) => updateField('dob', e.target.value)}
          />
          <PremiumSelect
            label="Gender"
            value={profileForm.gender}
            onChange={(e) => updateField('gender', e.target.value)}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </PremiumSelect>
          <PremiumInput
            label="Emergency contact"
            value={profileForm.emergency_contact}
            onChange={(e) => updateField('emergency_contact', e.target.value)}
            placeholder="Name & phone"
          />
          <div style={{ gridColumn: '1 / -1' }}>
            <PremiumInput
              label="Address"
              value={profileForm.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Full residential address"
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <PremiumTextarea
              label="Bio"
              value={profileForm.bio}
              onChange={(e) => updateField('bio', e.target.value)}
              placeholder="A short note about you"
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Available Downloads
          </span>
          <button className="profile-action-button" type="button" onClick={() => triggerSaaSDownload('json')}>
            <div>
              <strong>Download My Data</strong>
              <span>Save profile schema (JSON)</span>
            </div>
            <Download size={16} />
          </button>
          <button className="profile-action-button" type="button" onClick={() => triggerSaaSDownload('pdf-profile')}>
            <div>
              <strong>Download Profile</strong>
              <span>Academic transcript layout</span>
            </div>
            <Download size={16} />
          </button>
          <button className="profile-action-button" type="button" onClick={() => triggerSaaSDownload('pdf-semester')}>
            <div>
              <strong>Download Semester Report</strong>
              <span>Overall status overview</span>
            </div>
            <Download size={16} />
          </button>
        </div>

        <div className="profile-actions" style={{ borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
          <button className="profile-action-button" type="button" onClick={onPasswordChange}>
            <div>
              <strong>Change password</strong>
              <span>Secure your account</span>
            </div>
            <Lock size={16} />
          </button>
          <button className="profile-action-button" type="button" onClick={toggleTheme}>
            <div>
              <strong>Toggle dark/light mode</strong>
              <span>{isDark ? 'Switch to light' : 'Switch to dark'}</span>
            </div>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            className="profile-action-button"
            type="button"
            onClick={() => {
              onActiveTabChange('Settings')
              onClose()
            }}
          >
            <div>
              <strong>Open settings</strong>
              <span>Access preferences</span>
            </div>
            <Settings2 size={16} />
          </button>
          <button
            className="profile-action-button"
            type="button"
            onClick={() => {
              onActiveTabChange('Attendance')
              onClose()
            }}
          >
            <div>
              <strong>View attendance history</strong>
              <span>Jump to records</span>
            </div>
            <CalendarDays size={16} />
          </button>
          <button className="profile-action-button" type="button" onClick={onLogout}>
            <div>
              <strong>Log out</strong>
              <span>Leave the workspace</span>
            </div>
            <UserRound size={16} />
          </button>
        </div>
      </section>
    </div>
  )
}
