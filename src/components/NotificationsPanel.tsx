import React from 'react'
import { Bell, Inbox } from 'lucide-react'
import type { NotificationItem } from '../types'
import EmptyState from './EmptyState'

interface NotificationsPanelProps {
  notifications: NotificationItem[]
  onMarkRead: (id: string) => void
}

export default function NotificationsPanel({ notifications, onMarkRead }: NotificationsPanelProps) {
  return (
    <section className="panel-card glass-card">
      <div className="section-heading">
        <div>
          <span className="section-kicker">NOTIFICATIONS</span>
          <h2>Inbox</h2>
        </div>
      </div>
      <div className="notification-list">
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <div className={`notification-item ${item.unread ? 'unread' : ''}`} key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <p>{item.message}</p>
              </div>
              <button className="subtle-button" onClick={() => onMarkRead(item.id)}>
                {item.unread ? 'Mark read' : 'Read'}
              </button>
            </div>
          ))
        ) : (
          <EmptyState
            icon={Inbox}
            title="You're all caught up"
            description="There are no active notifications or announcements in your inbox right now."
          />
        )}
      </div>
    </section>
  )
}
