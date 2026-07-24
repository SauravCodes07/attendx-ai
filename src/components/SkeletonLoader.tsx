import React from 'react'

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card glass-card" style={{ opacity: 0.6 }}>
      <div className="stat-icon" style={{ background: 'rgba(103,107,255,0.08)' }}>
        <Skeleton style={{ width: 19, height: 19, borderRadius: 4 }} />
      </div>
      <div className="stat-copy">
        <Skeleton style={{ width: 80, height: 10, borderRadius: 4, marginBottom: 6 }} />
        <Skeleton style={{ width: 60, height: 24, borderRadius: 4, marginBottom: 4 }} />
        <Skeleton style={{ width: 70, height: 10, borderRadius: 4 }} />
      </div>
    </div>
  )
}

export function AttendanceRowSkeleton() {
  return (
    <div className="attendance-row" style={{ opacity: 0.5 }}>
      <Skeleton style={{ width: 33, height: 33, borderRadius: 10 }} />
      <div className="attendance-course">
        <Skeleton style={{ width: 120, height: 11, borderRadius: 4, marginBottom: 4 }} />
        <Skeleton style={{ width: 80, height: 9, borderRadius: 4 }} />
      </div>
      <div className="attendance-time">
        <Skeleton style={{ width: 90, height: 11, borderRadius: 4, marginBottom: 4 }} />
        <Skeleton style={{ width: 60, height: 9, borderRadius: 4 }} />
      </div>
      <Skeleton style={{ width: 50, height: 20, borderRadius: 10 }} />
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="glass-card overview-card" style={{ padding: 22, opacity: 0.6 }}>
      <Skeleton style={{ width: 120, height: 14, borderRadius: 4, marginBottom: 8 }} />
      <Skeleton style={{ width: 80, height: 20, borderRadius: 4, marginBottom: 20 }} />
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 170 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            style={{
              flex: 1,
              height: `${Math.random() * 60 + 40}%`,
              borderRadius: 6,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function NextClassSkeleton() {
  return (
    <div className="glass-card next-card" style={{ padding: 22, opacity: 0.6 }}>
      <Skeleton style={{ width: 100, height: 14, borderRadius: 4, marginBottom: 12 }} />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <Skeleton style={{ width: 43, height: 43, borderRadius: 12 }} />
        <div style={{ flex: 1 }}>
          <Skeleton style={{ width: 140, height: 12, borderRadius: 4, marginBottom: 4 }} />
          <Skeleton style={{ width: 100, height: 10, borderRadius: 4 }} />
        </div>
      </div>
      <Skeleton style={{ width: '100%', height: 60, borderRadius: 12 }} />
    </div>
  )
}