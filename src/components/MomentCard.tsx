import React from 'react'
import { Heart } from 'lucide-react'

interface MomentCardProps {
  attendancePercentage: string
  streak: number
}

export default function MomentCard({ attendancePercentage, streak }: MomentCardProps) {
  return (
    <article className="moment-card">
      <div className="moment-glow" />
      <div className="moment-content">
        <div className="achievement">
          <Heart size={17} fill="currentColor" /> <span>YOU’RE ON FIRE</span>
        </div>
        <h2>
          Consistency looks
          <br />
          good on you.
        </h2>
        <p>
          You’ve maintained a live attendance rate from your latest Supabase records. Keep your
          momentum going.
        </p>
        <div className="progress-row">
          <div className="progress">
            <span style={{ width: attendancePercentage }} />
          </div>
          <b>{attendancePercentage}</b>
        </div>
      </div>
    </article>
  )
}
