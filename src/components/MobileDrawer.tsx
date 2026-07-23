import React from 'react'
import { X, UserRound, Grid2X2, CalendarDays, LineChart, Clock3, Bell, Settings2 } from 'lucide-react'
import type { Profile } from '../types'

type PageKey = 'Overview' | 'Attendance' | 'Insights' | 'Timetable' | 'Notifications' | 'Settings' | 'Admin'

interface MobileDrawerProps {
  active: PageKey
  setActive: (key: PageKey) => void
  onClose: () => void
  onLogout: () => void
  isAdmin: boolean
  profile: Profile
}

export default function MobileDrawer({
  active,
  setActive,
  onClose,
  onLogout,
  isAdmin,
  profile,
}: MobileDrawerProps) {
  const navigation = [
    { label: 'Overview', icon: Grid2X2 },
    { label: 'Attendance', icon: CalendarDays },
    { label: 'Insights', icon: LineChart },
    { label: 'Timetable', icon: Clock3 },
    { label: 'Notifications', icon: Bell },
    { label: 'Settings', icon: Settings2 },
  ] as const

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

        {navigation.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className={active === label ? 'nav-item active' : 'nav-item'}
            onClick={() => {
              setActive(label)
              onClose()
            }}
          >
            <Icon size={19} />
            <span>{label}</span>
          </button>
        ))}

        {isAdmin && (
          <button
            className={active === 'Admin' ? 'nav-item active' : 'nav-item'}
            onClick={() => {
              setActive('Admin')
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
