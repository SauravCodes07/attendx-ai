import React, { useState } from 'react'
import {
  Moon,
  Sun,
  Laptop,
  Globe,
  Bell,
  Lock,
  User,
  Activity,
  Download,
  CheckCircle2,
} from 'lucide-react'
import type { Profile, ThemePreference } from '../types'
import { useTheme } from '../hooks/useTheme'
import { PremiumSelect } from './PremiumInput'

interface SettingsPanelProps {
  profile: Profile
  onProfileUpdate: (updatedFields: Partial<Profile>) => Promise<void>
  onPasswordChange: () => void
  onExportTrigger: (format: 'csv' | 'json' | 'pdf' | 'xlsx', scope: string) => void
}

export default function SettingsPanel({
  profile,
  onProfileUpdate,
  onPasswordChange,
  onExportTrigger,
}: SettingsPanelProps) {
  const { theme, setTheme } = useTheme(profile.id)
  const [language, setLanguage] = useState('en')
  const [notifPrefs, setNotifPrefs] = useState({
    email: true,
    push: true,
    digest: false,
  })
  const [privacyMode, setPrivacyMode] = useState('private')
  const [successMsg, setSuccessMsg] = useState('')

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg('Settings updated successfully!')
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  return (
    <section className="panel-card glass-card" style={{ gap: '24px' }}>
      <div className="section-heading">
        <div>
          <span className="section-kicker">SETTINGS</span>
          <h2>Preferences & Security</h2>
        </div>
      </div>

      {successMsg && (
        <div className="auth-message success" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      <form className="settings-form" onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Appearance Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Moon size={16} /> Appearance & Theme
          </h3>
          <p className="helper-text" style={{ margin: 0 }}>
            Choose how AttendX AI looks on your device. Defaults to system settings.
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            {(['light', 'dark', 'system'] as ThemePreference[]).map((mode) => (
              <button
                key={mode}
                type="button"
                className={`subtle-button ${theme === mode ? 'active' : ''}`}
                onClick={() => setTheme(mode)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: theme === mode ? '1px solid var(--purple)' : '1px solid var(--line)',
                  background: theme === mode ? 'rgba(103,107,255,0.08)' : 'transparent',
                  color: theme === mode ? 'var(--purple)' : 'inherit',
                  textTransform: 'capitalize',
                  fontWeight: 600,
                }}
              >
                {mode === 'light' && <Sun size={14} />}
                {mode === 'dark' && <Moon size={14} />}
                {mode === 'system' && <Laptop size={14} />}
                {mode}
              </button>
            ))}
          </div>
        </div>

        <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: 0 }} />

        {/* Language Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Globe size={16} /> Language & Region
          </h3>
          <PremiumSelect
            label="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English (US)</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </PremiumSelect>
        </div>

        <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: 0 }} />

        {/* Notifications Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Bell size={16} /> Notifications
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px' }}>
              <input
                type="checkbox"
                checked={notifPrefs.email}
                onChange={(e) => setNotifPrefs({ ...notifPrefs, email: e.target.checked })}
              />
              <span>Email notifications for class alerts & remarks</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px' }}>
              <input
                type="checkbox"
                checked={notifPrefs.push}
                onChange={(e) => setNotifPrefs({ ...notifPrefs, push: e.target.checked })}
              />
              <span>Desktop push reminders for check-ins</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px' }}>
              <input
                type="checkbox"
                checked={notifPrefs.digest}
                onChange={(e) => setNotifPrefs({ ...notifPrefs, digest: e.target.checked })}
              />
              <span>Weekly summary digest email</span>
            </label>
          </div>
        </div>

        <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: 0 }} />

        {/* Security Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Lock size={16} /> Security & Account Access
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '4px' }}>
            <button type="button" className="auth-secondary" onClick={onPasswordChange} style={{ flex: 1, minWidth: '150px' }}>
              Change Password
            </button>
            <button
              type="button"
              className="auth-secondary"
              onClick={() => window.open('https://accounts.google.com/', '_blank', 'noopener,noreferrer')}
              style={{ flex: 1, minWidth: '150px' }}
            >
              Google Connected Account
            </button>
          </div>
        </div>

        <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: 0 }} />

        {/* Sessions & Privacy Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Activity size={16} /> Active Sessions & Privacy
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--muted)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span>Current Session: Chrome (Windows 10)</span>
              <span style={{ color: '#39ba88', fontWeight: 600 }}>Active Now</span>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '4px' }}>
              <input
                type="radio"
                name="privacy"
                value="private"
                checked={privacyMode === 'private'}
                onChange={() => setPrivacyMode('private')}
              />
              <span>Only administrators can view full profile details</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="privacy"
                value="public"
                checked={privacyMode === 'public'}
                onChange={() => setPrivacyMode('public')}
              />
              <span>Allow other students to see attendance ranking</span>
            </label>
          </div>
        </div>

        <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: 0 }} />

        {/* Downloads Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Download size={16} /> Downloads & Exports
          </h3>
          <p className="helper-text" style={{ margin: 0 }}>
            Download a secure snapshot of your profile data or complete semester reports.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              className="subtle-button"
              onClick={() => onExportTrigger('json', 'all')}
              style={{ flex: 1, minWidth: '130px', padding: '10px' }}
            >
              Download My Data (JSON)
            </button>
            <button
              type="button"
              className="subtle-button"
              onClick={() => onExportTrigger('pdf', 'semester-report')}
              style={{ flex: 1, minWidth: '130px', padding: '10px' }}
            >
              Semester Report (PDF)
            </button>
          </div>
        </div>

        <button className="primary-button" type="submit" style={{ marginTop: '12px' }}>
          Save Preferences
        </button>
      </form>
    </section>
  )
}
