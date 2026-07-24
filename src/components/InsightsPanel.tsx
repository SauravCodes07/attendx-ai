import React from 'react'
import { LineChart, Lock } from 'lucide-react'
import EmptyState from './EmptyState'

interface InsightsPanelProps {
  hasData: boolean
  attendedCount: number
  totalCount: number
  attendancePercentage: string
  streak: number
  unreadCount: number
  timetableLength: number
  profileLocked?: boolean
  onCompleteProfile?: () => void
}

export default function InsightsPanel({
  hasData,
  attendedCount,
  totalCount,
  attendancePercentage,
  streak,
  unreadCount,
  timetableLength,
  profileLocked = false,
  onCompleteProfile,
}: InsightsPanelProps) {
  if (!hasData) {
    return (
      <EmptyState
        icon={LineChart}
        title="No attendance data yet"
        description="Add some attendance records to view detailed analytics and performance charts."
      />
    )
  }

  const absentCount = Math.max(0, totalCount - attendedCount)
  const presentPercent = totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0
  const absentPercent = totalCount > 0 ? Math.round((absentCount / totalCount) * 100) : 0

  const categories = [
    { label: 'Present', value: attendedCount, percent: presentPercent },
    { label: 'Absent', value: absentCount, percent: absentPercent },
    { label: 'Leave', value: 0, percent: 0 },
  ]

  return (
    <>
      {profileLocked && (
        <div className="insights-limited-banner">
          <p>
            <Lock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
            Analytics are in limited mode. Complete your profile to unlock full insights and trend breakdowns.
          </p>
          <button className="primary-button" type="button" onClick={onCompleteProfile} style={{ padding: '8px 14px', fontSize: '12px' }}>
            Complete Profile
          </button>
        </div>
      )}

      <section className={`insights-grid ${profileLocked ? 'limited' : ''}`}>
        <article className="panel-card glass-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">INSIGHTS</span>
              <h2>Attendance overview</h2>
            </div>
          </div>
          <div className="bar-list">
            {categories.map((item) => (
              <div className="bar-item" key={item.label}>
                <span style={{ fontWeight: 500 }}>{item.label}</span>
                <div className="bar-track">
                  <i style={{ width: `${Math.max(4, item.percent)}%` }} />
                </div>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card glass-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">LIVE</span>
              <h2>Snapshot</h2>
            </div>
          </div>
          <ul className="summary-list">
            <li>
              <span>Attendance rate</span>
              <strong style={{ color: 'var(--ink)' }}>{attendancePercentage}</strong>
            </li>
            <li>
              <span>Current streak</span>
              <strong style={{ color: 'var(--ink)' }}>{streak} days</strong>
            </li>
            {!profileLocked && (
              <>
                <li>
                  <span>Pending reminders</span>
                  <strong style={{ color: 'var(--ink)' }}>{unreadCount}</strong>
                </li>
                <li>
                  <span>Schedule items</span>
                  <strong style={{ color: 'var(--ink)' }}>{timetableLength}</strong>
                </li>
              </>
            )}
          </ul>
        </article>
      </section>
    </>
  )
}
