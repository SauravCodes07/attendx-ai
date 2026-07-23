import React from 'react'
import { ArrowRight, ArrowDownToLine, GraduationCap, ChevronRight, Calendar } from 'lucide-react'
import type { AttendanceRecord } from '../types'

interface AttendanceHistoryProps {
  attendance: AttendanceRecord[]
  loading: boolean
  onViewAllClick: () => void
  onExportClick: () => void
}

export default function AttendanceHistory({
  attendance,
  loading,
  onViewAllClick,
  onExportClick,
}: AttendanceHistoryProps) {
  return (
    <article className="history-card glass-card">
      <div className="section-heading">
        <div>
          <span className="section-kicker">HISTORY</span>
          <h2>Recent attendance</h2>
        </div>
        <button className="text-button" onClick={onViewAllClick}>
          View all <ArrowRight size={15} />
        </button>
      </div>

      <div className="attendance-list">
        {loading ? (
          <div className="loading-state">Loading live attendance...</div>
        ) : attendance.length > 0 ? (
          attendance.map((item) => (
            <div className="attendance-row" key={item.id}>
              <div className="course-badge">
                <GraduationCap size={18} />
              </div>
              <div className="attendance-course">
                <strong>{item.subject_name}</strong>
                <span>{item.subject_code}</span>
              </div>
              <div className="attendance-time">
                <strong>{new Date(item.attendance_date).toLocaleDateString()}</strong>
                <span>{item.classroom_name || 'Lecture'}</span>
              </div>
              <div
                className={`status ${
                  item.status === 'present'
                    ? 'emerald'
                    : item.status === 'absent'
                    ? 'amber'
                    : 'violet'
                }`}
              >
                <i />
                <span style={{ textTransform: 'capitalize' }}>{item.status}</span>
              </div>
              <ChevronRight className="row-arrow" size={17} />
            </div>
          ))
        ) : (
          <div
            style={{
              padding: '24px 0',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Calendar size={20} style={{ color: 'var(--muted)', marginBottom: '8px' }} />
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
              No attendance data available yet.
            </span>
          </div>
        )}
      </div>

      <button className="export-button" onClick={onExportClick}>
        <ArrowDownToLine size={16} /> Export attendance
      </button>
    </article>
  )
}
