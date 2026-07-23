import React, { useMemo } from 'react'
import { BookOpen, MoreHorizontal, ArrowRight, Clock } from 'lucide-react'
import type { TimetableItem } from '../types'

interface NextClassCardProps {
  nextClass: TimetableItem | null
  onMarkClick: () => void
}

export default function NextClassCard({ nextClass, onMarkClick }: NextClassCardProps) {
  // Calculate remaining time dynamically
  const timeRemaining = useMemo(() => {
    if (!nextClass) return null

    try {
      const now = new Date()
      const [hoursStr, minutesStr] = nextClass.start_time.split(':')
      const targetHours = parseInt(hoursStr, 10)
      // Strip any AM/PM if present
      const targetMinutes = parseInt(minutesStr.replace(/(am|pm)/i, '').trim(), 10)

      const target = new Date()
      target.setHours(targetHours, targetMinutes, 0, 0)

      // If class start time has already passed for today, say "In progress" or "Passed"
      const diffMs = target.getTime() - now.getTime()
      if (diffMs < 0) {
        // If it was less than 1 hour ago, it might be in progress
        if (Math.abs(diffMs) < 60 * 60 * 1000) {
          return { label: 'In Progress', display: 'Live' }
        }
        return { label: 'Finished', display: '--' }
      }

      const diffMins = Math.round(diffMs / 60000)
      if (diffMins > 60) {
        const hrs = Math.floor(diffMins / 60)
        return { label: 'Starts soon', display: `${hrs}h` }
      }
      return { label: 'Starts soon', display: `${diffMins}m` }
    } catch {
      return { label: 'Starts soon', display: 'Ready' }
    }
  }, [nextClass])

  return (
    <article className="next-card glass-card">
      <div className="section-heading">
        <div>
          <span className="section-kicker">UP NEXT</span>
          <h2>Today’s class</h2>
        </div>
        <button className="more-button" aria-label="More options">
          <MoreHorizontal size={19} />
        </button>
      </div>

      {nextClass ? (
        <>
          <div className="next-class">
            <div className="course-icon">
              <BookOpen size={22} />
            </div>
            <div>
              <span>
                {nextClass.start_time} – {nextClass.end_time}
              </span>
              <h3>{nextClass.subject_name}</h3>
              <p>
                {nextClass.teacher_name || 'Schedule synced'} <b>•</b> {nextClass.room || 'TBA'}
              </p>
            </div>
          </div>
          <div className="class-timer">
            <div className="timer-ring">
              <span>
                {timeRemaining?.display || '42'}
                <small style={{ fontSize: '7px' }}>min</small>
              </span>
            </div>
            <div>
              <strong>{timeRemaining?.label || 'Starts soon'}</strong>
              <span>Your next class session is ready for smart check-in.</span>
            </div>
          </div>
          <button className="wide-button" onClick={onMarkClick}>
            View session <ArrowRight size={17} />
          </button>
        </>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 12px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(103,107,255,0.06)',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--muted)',
              marginBottom: '12px',
            }}
          >
            <Clock size={18} />
          </div>
          <strong style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>
            No classes today
          </strong>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
            Enjoy your free time or check back later.
          </span>
        </div>
      )}
    </article>
  )
}
