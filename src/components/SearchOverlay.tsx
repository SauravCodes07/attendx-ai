import React, { useEffect, useRef } from 'react'
import { Search, CalendarDays, LineChart, Clock3, Bell, Settings2, Grid2X2 } from 'lucide-react'
import type { AttendanceRecord } from '../types'

interface SearchOverlayProps {
  onClose: () => void
  search: string
  setSearch: (val: string) => void
  attendance: AttendanceRecord[]
  setActiveTab: (tab: 'Overview' | 'Attendance' | 'Insights' | 'Timetable' | 'Notifications' | 'Settings') => void
}

export default function SearchOverlay({
  onClose,
  search,
  setSearch,
  attendance,
  setActiveTab,
}: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Quick navigation options
  const navOptions = [
    { label: 'Overview', icon: Grid2X2, desc: 'View today\'s pulsing attendance stats' },
    { label: 'Attendance', icon: CalendarDays, desc: 'Manage your history and add records' },
    { label: 'Insights', icon: LineChart, desc: 'Weekly rhythms and trends analysis' },
    { label: 'Timetable', icon: Clock3, desc: 'Weekly schedule and class rooms' },
    { label: 'Notifications', icon: Bell, desc: 'Announcements inbox' },
    { label: 'Settings', icon: Settings2, desc: 'Preferences and device theme settings' },
  ] as const

  const filteredNavs = navOptions.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  )

  const filteredRecords = attendance
    .filter((row) =>
      `${row.subject_name} ${row.subject_code} ${row.notes}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .slice(0, 4)

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
      style={{
        alignItems: 'flex-start',
        paddingTop: '80px',
      }}
    >
      <div
        className="glass-card"
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '100%',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
          border: '1px solid var(--line)',
        }}
      >
        {/* Input area */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <Search size={20} style={{ color: 'var(--muted)' }} />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages, attendance records, or type a command..."
            style={{
              width: '100%',
              border: 0,
              outline: 'none',
              background: 'transparent',
              fontSize: '15px',
              color: 'var(--ink)',
            }}
          />
          <kbd
            style={{
              padding: '4px 6px',
              borderRadius: '6px',
              border: '1px solid var(--line)',
              fontSize: '11px',
              background: 'rgba(255,255,255,0.08)',
              color: 'var(--muted)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results area */}
        <div style={{ padding: '8px', maxHeight: '340px', overflowY: 'auto' }}>
          {/* Navigation Links */}
          {filteredNavs.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: 'var(--muted)',
                  padding: '8px 12px',
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Go to page
              </span>
              {filteredNavs.map((opt) => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.label}
                    onClick={() => {
                      setActiveTab(opt.label)
                      onClose()
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      textAlign: 'left',
                      background: 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(103, 107, 255, 0.06)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'rgba(103, 107, 255, 0.08)',
                        display: 'grid',
                        placeItems: 'center',
                        color: 'var(--purple)',
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', display: 'block', color: 'var(--ink)' }}>
                        {opt.label}
                      </strong>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{opt.desc}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Attendance Results */}
          {filteredRecords.length > 0 && (
            <div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: 'var(--muted)',
                  padding: '8px 12px',
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Attendance Records
              </span>
              {filteredRecords.map((row) => (
                <button
                  key={row.id}
                  onClick={() => {
                    setActiveTab('Attendance')
                    onClose()
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    textAlign: 'left',
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(103, 107, 255, 0.06)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>
                      {row.subject_name}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                      {row.subject_code} • {new Date(row.attendance_date).toLocaleDateString()}
                    </span>
                  </div>
                  <span
                    className={`status ${row.status === 'present' ? 'emerald' : 'amber'}`}
                    style={{ fontSize: '11px', fontWeight: 600 }}
                  >
                    <i />
                    {row.status}
                  </span>
                </button>
              ))}
            </div>
          )}

          {filteredNavs.length === 0 && filteredRecords.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>
              <span style={{ fontSize: '13px' }}>No matches found for "{search}"</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
