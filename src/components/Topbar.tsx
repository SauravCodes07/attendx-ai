import React from 'react'
import { Menu, ChevronRight, Search, Bell, Sun, Moon, Download } from 'lucide-react'
import type { Profile } from '../types'

interface TopbarProps {
  active: string
  isAdmin: boolean
  unreadCount: number
  isDark: boolean
  toggleTheme: () => void
  onSearchClick: () => void
  onNotificationClick: () => void
  onExportClick: () => void
  onProfileClick: () => void
  onMenuClick: () => void
  profile: Profile
}

export default function Topbar({
  active,
  isAdmin,
  unreadCount,
  isDark,
  toggleTheme,
  onSearchClick,
  onNotificationClick,
  onExportClick,
  onProfileClick,
  onMenuClick,
  profile,
}: TopbarProps) {
  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={onMenuClick} aria-label="Open navigation">
        <Menu size={21} />
      </button>
      <div className="crumb">
        <span>{isAdmin ? 'Coordinator space' : 'Student space'}</span>
        <ChevronRight size={14} />
        <strong>{active}</strong>
      </div>
      <div className="top-actions">
        <button className="icon-button search-button" onClick={onSearchClick} aria-label="Search">
          <Search size={19} />
          <kbd>⌘ K</kbd>
        </button>
        <button
          className="icon-button notification"
          onClick={onNotificationClick}
          aria-label="Notifications"
        >
          <Bell size={19} />
          {unreadCount > 0 ? <b /> : null}
        </button>
        <button className="theme-switch" onClick={toggleTheme} aria-label="Toggle theme">
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button className="icon-button" onClick={onExportClick} aria-label="Download reports">
          <Download size={18} />
        </button>
        <button className="avatar-button" onClick={onProfileClick} aria-label="Open profile panel">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name || 'Avatar'}
              className="avatar"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="avatar">
              {profile.full_name?.slice(0, 2).toUpperCase() || 'US'}
            </div>
          )}
        </button>
      </div>
    </header>
  )
}
