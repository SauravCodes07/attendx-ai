import React from 'react'
import { LineChart, BarChart2 } from 'lucide-react'
import EmptyState from './EmptyState'

interface InsightsPanelProps {
  hasData: boolean
  attendedCount: number
  totalCount: number
  attendancePercentage: string
  streak: number
  unreadCount: number
  timetableLength: number
}

export default function InsightsPanel({
  hasData,
  attendedCount,
  totalCount,
  attendancePercentage,
  streak,
  unreadCount,
  timetableLength,
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

  // Calculate percentages safely
  const presentPercent = totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0
  const absentPercent = totalCount > 0 ? Math.round((absentCount / totalCount) * 100) : 0
  const leavePercent = totalCount > 0 ? Math.round((1 / totalCount) * 100) : 0 // Leave is represented, let's say 1 or actual leave count if tracked

  const categories = [
    { label: 'Present', value: attendedCount, percent: presentPercent },
    { label: 'Absent', value: absentCount, percent: absentPercent },
    { label: 'Leave', value: totalCount > 0 ? 0 : 0, percent: 0 }, // We'll update dynamically when data points are loaded
  ]

  // If there are leave records, count them
  const leaveCount = totalCount - attendedCount - absentCount

  return (
    <section className="insights-grid">
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
          <li>
            <span>Pending reminders</span>
            <strong style={{ color: 'var(--ink)' }}>{unreadCount}</strong>
          </li>
          <li>
            <span>Schedule items</span>
            <strong style={{ color: 'var(--ink)' }}>{timetableLength}</strong>
          </li>
        </ul>
      </article>
    </section>
  )
}
