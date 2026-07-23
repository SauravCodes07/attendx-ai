import React from 'react'
import {
  Grid2X2,
  CalendarDays,
  LineChart,
  Clock3,
  Bell,
  Settings2,
  UserRound,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  MoreHorizontal,
  Home,
} from 'lucide-react'
import type { Profile } from '../types'

type PageKey = 'Overview' | 'Attendance' | 'Insights' | 'Timetable' | 'Notifications' | 'Settings' | 'Admin'

interface SidebarProps {
  active: PageKey
  setActive: (key: PageKey) => void
  profile: Profile
  onLogout: () => void
  attendanceCount: number
  unreadCount: number
  isAdmin: boolean
}

type NavItem = { label: PageKey; icon: any }

export default function Sidebar({
  active,
  setActive,
  profile,
  onLogout,
  attendanceCount,
  unreadCount,
  isAdmin,
}: SidebarProps) {
  const navigation: NavItem[] = [
    { label: 'Overview', icon: Grid2X2 },
    { label: 'Attendance', icon: CalendarDays },
    { label: 'Insights', icon: LineChart },
    { label: 'Timetable', icon: Clock3 },
    { label: 'Notifications', icon: Bell },
    { label: 'Settings', icon: Settings2 },
  ]

  if (isAdmin) {
    navigation.push({ label: 'Admin', icon: UserRound })
  }

  return (
    <aside className="sidebar">
      <div className="brand-row">
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
        <button className="sidebar-collapse" aria-label="Collapse sidebar">
          <ChevronLeft size={17} />
        </button>
      </div>
      <nav className="main-nav" aria-label="Primary">
        <p>WORKSPACE</p>
        {navigation.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className={active === label ? 'nav-item active' : 'nav-item'}
            onClick={() => setActive(label)}
          >
            <Icon size={19} />
            <span>{label}</span>
            {label === 'Attendance' && attendanceCount > 0 && <em>{attendanceCount}</em>}
            {label === 'Notifications' && unreadCount > 0 && (
              <em style={{ background: '#f2a853' }}>{unreadCount}</em>
            )}
          </button>
        ))}
        <p className="nav-section">PERSONAL</p>
        <button
          className={active === 'Settings' ? 'nav-item active' : 'nav-item'}
          onClick={() => setActive('Settings')}
        >
          <Settings2 size={19} />
          <span>Settings</span>
        </button>
        <button className="nav-item" onClick={onLogout}>
          <UserRound size={19} />
          <span>Logout</span>
        </button>
      </nav>
      <div className="sidebar-bottom">
        <div className="support-card" style={{ cursor: 'pointer' }}>
          <div className="support-icon">
            <CircleHelp size={17} />
          </div>
          <div>
            <strong>Need a hand?</strong>
            <span>We’re here for you</span>
          </div>
          <ChevronRight size={16} />
        </div>
        <div className="student-mini">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name || 'Student'}
              className="avatar avatar-mini"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="avatar avatar-mini">
              {profile.full_name?.slice(0, 2).toUpperCase() || 'US'}
            </div>
          )}
          <div>
            <strong>{profile.full_name || 'Student'}</strong>
            <span style={{ textTransform: 'capitalize' }}>{profile.role}</span>
          </div>
          <MoreHorizontal size={18} />
        </div>
      </div>
    </aside>
  )
}
