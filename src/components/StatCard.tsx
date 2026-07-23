import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  detail: string
  color: 'indigo' | 'cyan' | 'violet'
}

export default function StatCard({ icon: Icon, label, value, detail, color }: StatCardProps) {
  const isPositive =
    detail.toLowerCase().includes('up') ||
    detail.toLowerCase().includes('live') ||
    detail.toLowerCase().includes('instant') ||
    detail.toLowerCase().includes('streak')

  return (
    <article className="stat-card glass-card">
      <div className={`stat-icon ${color}`}>
        <Icon size={19} strokeWidth={2.2} />
      </div>
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small className={isPositive ? 'positive' : ''}>{detail}</small>
      </div>
    </article>
  )
}
