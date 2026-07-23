import React from 'react'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 24px',
        borderRadius: '16px',
        width: '100%',
        margin: '12px 0',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'rgba(103, 107, 255, 0.08)',
          display: 'grid',
          placeItems: 'center',
          color: '#6766f5',
          marginBottom: '16px',
        }}
      >
        <Icon size={24} />
      </div>
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 700,
          margin: '0 0 6px 0',
          letterSpacing: '-0.3px',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '12px',
          color: 'var(--muted)',
          margin: '0 0 16px 0',
          maxWidth: '320px',
          lineHeight: '1.5',
        }}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <button className="primary-button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
