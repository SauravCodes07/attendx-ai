import React from 'react'
import { Calendar, Clock } from 'lucide-react'
import type { TimetableItem } from '../types'
import EmptyState from './EmptyState'

interface TimetablePanelProps {
  timetable: TimetableItem[]
}

export default function TimetablePanel({ timetable }: TimetablePanelProps) {
  return (
    <section className="panel-card glass-card">
      <div className="section-heading">
        <div>
          <span className="section-kicker">TIMETABLE</span>
          <h2>Weekly schedule</h2>
        </div>
      </div>
      <div className="timetable-list">
        {timetable.length > 0 ? (
          timetable.map((item) => (
            <div className="timetable-row" key={item.id}>
              <div>
                <strong>{item.subject_name}</strong>
                <span>
                  {item.day_of_week} • {item.start_time} – {item.end_time}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong>{item.room || 'TBA'}</strong>
                <span>{item.teacher_name || 'Instructor'}</span>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={Clock}
            title="No timetable assigned"
            description="You don't have any classes scheduled in your timetable yet. Check with your coordinator."
          />
        )}
      </div>
    </section>
  )
}
