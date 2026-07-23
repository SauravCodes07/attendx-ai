import React, { useRef, useState } from 'react'
import {
  X,
  UserCog,
  Download,
  Lock,
  Mail,
  Bell,
  Sun,
  Moon,
  Settings2,
  CalendarDays,
  UserRound,
  UploadCloud,
} from 'lucide-react'
import type { Profile } from '../types'
import { supabase } from '../supabase'

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
    gender: profile.gender || 'Other',
  })

  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')

    try {
      await onProfileUpdate(profileForm)
      setMsg('Profile updated and saved to Supabase.')
      setTimeout(() => setMsg(''), 4000)
    } catch (err: any) {
      setMsg(err.message || 'Could not save profile details.')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMsg('Uploading photo...')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}/avatar-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      await onProfileUpdate({ avatar_url: data.publicUrl })
      setMsg('Profile photo updated.')
      setTimeout(() => setMsg(''), 4000)
    } catch (err: any) {
      setMsg(err.message || 'Photo upload failed.')
    } finally {
      setUploading(false)
    }
  }

  // Handle specific SaaS report downloads requested in Profile
  const triggerSaaSDownload = (type: 'json' | 'pdf-profile' | 'pdf-semester' | 'xlsx-attendance' | 'pdf-attendance') => {
    const fileName = `attendx-${type}-${Date.now()}`

    if (type === 'json') {
      const dataStr = JSON.stringify(profile, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}.json`
      link.click()
    } else if (type === 'pdf-profile') {
      // Generate dynamically using data URIs or structural text blob to trigger browser download
      const profileText = `ATTENDX PROFILE REPORT\n\nName: ${profileForm.full_name}\nUSN/Reg: ${profileForm.usn}\nDepartment: ${profileForm.department}\nBranch: ${profileForm.branch}\nSemester: ${profileForm.semester}\nSection: ${profileForm.section}\nCollege Email: ${profileForm.college_email}\nPersonal Email: ${profileForm.personal_email}\nPhone: ${profileForm.phone}\nGender: ${profileForm.gender || 'Other'}\nDate of Birth: ${profileForm.dob}\nAddress: ${profileForm.address}\nEmergency Contact: ${profileForm.emergency_contact}\nBio: ${profileForm.bio}`
      const blob = new Blob([profileText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}.txt`
      link.click()
    } else if (type === 'pdf-semester') {
      const semesterText = `ATTENDX SEMESTER ATTENDANCE REPORT\n\nStudent: ${profileForm.full_name}\nUSN/Reg: ${profileForm.usn}\nDepartment: ${profileForm.department}\nBranch: ${profileForm.branch}\nSemester: ${profileForm.semester}\nSection: ${profileForm.section}\nOverall Attendance Rate: ${attendancePercentage}\nStreak: ${streak} days\nStatus: Synced with Supabase RLS`
      const blob = new Blob([semesterText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}.txt`
      link.click()
    } else {
      // Forward to global export handler modal
      onExportClick()
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
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'rgba(103,107,255,0.08)',
              border: '1px dashed var(--line)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div className="avatar" style={{ width: '100%', height: '100%', borderRadius: 0 }}>
                {profileForm.full_name?.slice(0, 2).toUpperCase() || 'US'}
              </div>
            )}
          </div>
          <div>
            <strong style={{ fontSize: '13px', display: 'block' }}>
              {profileForm.full_name || 'Student'}
            </strong>
            <p className="helper-text" style={{ textTransform: 'capitalize', fontSize: '11px', margin: '2px 0 0 0' }}>
              {profile.role} • {profile.account_status || 'Active'}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoUpload}
          />
        </div>

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

        {msg && <div className="auth-message success">{msg}</div>}

        <form className="profile-form-grid" onSubmit={handleSubmit}>
          <label className="control-group">
            <span>Full name</span>
            <input
              value={profileForm.full_name}
              onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
              required
            />
          </label>
          <label className="control-group">
            <span>Personal Email</span>
            <input
              type="email"
              value={profileForm.personal_email}
              onChange={(e) => setProfileForm({ ...profileForm, personal_email: e.target.value })}
              required
            />
          </label>
          <label className="control-group">
            <span>College Email</span>
            <input
              type="email"
              value={profileForm.college_email}
              onChange={(e) => setProfileForm({ ...profileForm, college_email: e.target.value })}
              required
            />
          </label>
          <label className="control-group">
            <span>Phone</span>
            <input
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              required
            />
          </label>
          <label className="control-group">
            <span>USN</span>
            <input
              value={profileForm.usn}
              onChange={(e) => setProfileForm({ ...profileForm, usn: e.target.value })}
            />
          </label>
          <label className="control-group">
            <span>Roll number</span>
            <input
              value={profileForm.roll_number}
              onChange={(e) => setProfileForm({ ...profileForm, roll_number: e.target.value })}
              required
            />
          </label>
          <label className="control-group">
            <span>Branch</span>
            <input
              value={profileForm.branch}
              onChange={(e) => setProfileForm({ ...profileForm, branch: e.target.value })}
              required
            />
          </label>
          <label className="control-group">
            <span>Department</span>
            <input
              value={profileForm.department}
              onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
              required
            />
          </label>
          <label className="control-group">
            <span>Year</span>
            <input
              value={profileForm.year}
              onChange={(e) => setProfileForm({ ...profileForm, year: e.target.value })}
              required
            />
          </label>
          <label className="control-group">
            <span>Semester</span>
            <input
              value={profileForm.semester}
              onChange={(e) => setProfileForm({ ...profileForm, semester: e.target.value })}
              required
            />
          </label>
          <label className="control-group">
            <span>Section</span>
            <input
              value={profileForm.section}
              onChange={(e) => setProfileForm({ ...profileForm, section: e.target.value })}
              required
            />
          </label>
          <label className="control-group">
            <span>Mobile</span>
            <input
              value={profileForm.mobile}
              onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
            />
          </label>
          <label className="control-group">
            <span>Date of Birth</span>
            <input
              type="date"
              value={profileForm.dob}
              onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
              required
            />
          </label>
          <label className="control-group">
            <span>Gender</span>
            <select
              value={profileForm.gender}
              onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
              style={{
                padding: '10px',
                borderRadius: '10px',
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
          <label className="control-group">
            <span>Emergency Contact</span>
            <input
              value={profileForm.emergency_contact}
              onChange={(e) => setProfileForm({ ...profileForm, emergency_contact: e.target.value })}
              required
            />
          </label>
          <label className="control-group" style={{ gridColumn: '1 / -1' }}>
            <span>Address</span>
            <input
              value={profileForm.address}
              onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              required
            />
          </label>
          <label className="control-group" style={{ gridColumn: '1 / -1' }}>
            <span>Bio</span>
            <input
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
            />
          </label>
          <button
            className="primary-button"
            type="submit"
            style={{ gridColumn: '1 / -1' }}
            disabled={saving || uploading}
          >
            {saving ? 'Saving...' : 'Save Profile Details'}
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Available Downloads
          </span>
          <button className="profile-action-button" onClick={() => triggerSaaSDownload('json')}>
            <div>
              <strong>Download My Data</strong>
              <span>Save profile schema (JSON)</span>
            </div>
            <Download size={16} />
          </button>
          <button className="profile-action-button" onClick={() => triggerSaaSDownload('pdf-profile')}>
            <div>
              <strong>Download Profile</strong>
              <span>Academic transcript layout</span>
            </div>
            <Download size={16} />
          </button>
          <button className="profile-action-button" onClick={() => triggerSaaSDownload('pdf-semester')}>
            <div>
              <strong>Download Semester Report</strong>
              <span>Overall status overview</span>
            </div>
            <Download size={16} />
          </button>
        </div>

        <div className="profile-actions" style={{ borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
          <button className="profile-action-button" onClick={onPasswordChange}>
            <div>
              <strong>Change password</strong>
              <span>Secure your account</span>
            </div>
            <Lock size={16} />
          </button>
          <button
            className="profile-action-button"
            onClick={() => {
              toggleTheme()
            }}
          >
            <div>
              <strong>Toggle dark/light mode</strong>
              <span>{isDark ? 'Switch to light' : 'Switch to dark'}</span>
            </div>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            className="profile-action-button"
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
          <button className="profile-action-button" onClick={onLogout}>
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
