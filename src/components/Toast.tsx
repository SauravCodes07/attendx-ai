import React, { useEffect } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

export interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const isError = type === 'error'

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '12px',
        background: isError ? 'rgba(255, 245, 245, 0.95)' : 'rgba(237, 255, 248, 0.95)',
        border: `1px solid ${isError ? '#c35a5a' : '#39ba88'}`,
        color: isError ? '#c35a5a' : '#318d6f',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(12px)',
        animation: 'arrive 0.25s ease-out',
        maxWidth: '360px',
      }}
    >
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          color: isError ? '#c35a5a' : '#39ba88',
        }}
      >
        {isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
      </div>
      <span style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 0,
          color: 'inherit',
          padding: '2px',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
        }}
      >
        <X size={15} />
      </button>
    </div>
  )
}
