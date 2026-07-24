import React from 'react'
import { X, UserRound, Grid2X2, CalendarDays, LineChart, Clock3, Bell, Settings2, Lock } from 'lucide-react'
import type { Profile } from '../types'

type PageKey = 'Overview' | 'Attendance' | 'Insights' | 'Timetable' | 'Notifications' | 'Settings' | 'Admin'

interface MobileDrawerProps {
  active: PageKey
  onNavigate: (key: PageKey) => void
  onClose: () => void
  onLogout: () => void
  isAdmin: boolean
  profile: Profile
  profileLocked?: boolean
}

export default function MobileDrawer({
  active,
  onNavigate,
  onClose,
  onLogout,
  isAdmin,
  profileLocked = false,
}: MobileDrawerProps) {
  const navigation = [
    { label: 'Overview' as const, icon: Grid2X2, locked: false },
    { label: 'Attendance' as const, icon: CalendarDays, locked: profileLocked },
    { label: 'Insights' as const, icon: LineChart, locked: false },
    { label: 'Timetable' as const, icon: Clock3, locked: false },
    { label: 'Notifications' as const, icon: Bell, locked: false },
    { label: 'Settings' as const, icon: Settings2, locked: false },
  ]

  return (
    <div className="mobile-overlay" onClick={onClose}>
      <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
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
          <button onClick={onClose} aria-label="Close navigation">
            <X size={20} />
          </button>
        </div>

        {navigation.map(({ label, icon: Icon, locked }) => (
          <button
            key={label}
            className={active === label ? 'nav-item active' : 'nav-item'}
            onClick={() => {
              onNavigate(label)
              onClose()
            }}
          >
            <Icon size={19} />
            <span>{label}</span>
            {locked && <Lock size={13} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
          </button>
        ))}

        {isAdmin && (
          <button
            className={active === 'Admin' ? 'nav-item active' : 'nav-item'}
            onClick={() => {
              onNavigate('Admin')
              onClose()
            }}
          >
            <UserRound size={19} />
            <span>Admin Control</span>
          </button>
        )}

        <hr />

        <button className="nav-item" onClick={onLogout}>
          <UserRound size={19} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
