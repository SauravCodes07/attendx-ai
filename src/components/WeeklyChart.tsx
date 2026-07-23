import React, { useMemo } from 'react'
import { ChevronDown, AlertCircle } from 'lucide-react'

interface WeeklyTrendItem {
  day: string
  percent: number
}

interface WeeklyChartProps {
  weeklyTrend: WeeklyTrendItem[]
  hasData: boolean
}

export default function WeeklyChart({ weeklyTrend, hasData }: WeeklyChartProps) {
  const chartPath = useMemo(() => {
    if (!weeklyTrend || weeklyTrend.length === 0) return ''
    return weeklyTrend
      .map((item, index) => {
        const x = index * 100 + 10
        // Scale percent (0-100) to y-axis (170 down to 30)
        const y = 170 - item.percent * 1.4
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
  }, [weeklyTrend])

  return (
    <article className="overview-card glass-card">
      <div className="section-heading">
        <div>
          <span className="section-kicker">THIS WEEK</span>
          <h2>Your attendance rhythm</h2>
        </div>
        <button className="subtle-button">
          This week <ChevronDown size={15} />
        </button>
      </div>

      <div className="weekly-strip">
        {weeklyTrend.map((item) => (
          <div className="day-pill" key={item.day}>
            <span>{item.day}</span>
            <strong>{item.percent}%</strong>
            <i
              className={
                item.percent >= 80
                  ? 'present'
                  : item.percent > 0
                  ? 'pending'
                  : 'future'
              }
            />
          </div>
        ))}
      </div>

      <div className="chart-area" style={{ position: 'relative' }}>
        {!hasData && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(1px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              zIndex: 2,
              borderRadius: '8px',
            }}
          >
            <AlertCircle size={20} style={{ color: 'var(--muted)' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>
              No attendance data available
            </span>
          </div>
        )}

        <div className="chart-labels">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
        </div>

        <svg
          className="line-chart"
          viewBox="0 0 620 190"
          preserveAspectRatio="none"
          role="img"
          aria-label="Attendance trend"
          style={{ opacity: hasData ? 1 : 0.25 }}
        >
          <defs>
            <linearGradient id="line" x1="0" x2="1">
              <stop stopColor="#696cff" />
              <stop offset="1" stopColor="#41c9e2" />
            </linearGradient>
            <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
              <stop stopColor="#6b6fff" stopOpacity="0.24" />
              <stop offset="1" stopColor="#6b6fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path className="grid-lines" d="M0 20H620M0 70H620M0 120H620M0 170H620" />

          {hasData && chartPath && (
            <>
              <path d={`M10 170 ${chartPath} L 610 170 Z`} fill="url(#area)" />
              <path d={chartPath} fill="none" stroke="url(#line)" strokeWidth="4" strokeLinecap="round" />
              {weeklyTrend.map((item, index) => (
                <circle
                  key={item.day}
                  cx={index * 100 + 10}
                  cy={170 - item.percent * 1.4}
                  r="6"
                  fill="#fff"
                  stroke="#5d80f4"
                  strokeWidth="3"
                />
              ))}
            </>
          )}
        </svg>
        <div className="chart-days">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>
    </article>
  )
}
