import { Skeleton } from './SkeletonLoader'

export default function AppShellSkeleton() {
  return (
    <div className="app app-shell-skeleton" aria-busy="true" aria-live="polite">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <aside className="app-shell-skeleton__sidebar">
        <div className="app-shell-skeleton__brand"><Skeleton style={{ width: 124, height: 22, borderRadius: 7 }} /></div>
        <div className="app-shell-skeleton__nav">
          {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} style={{ height: 44, borderRadius: 11 }} />)}
        </div>
      </aside>
      <main className="app-shell-skeleton__content">
        <header className="app-shell-skeleton__topbar">
          <Skeleton style={{ width: 176, height: 18, borderRadius: 6 }} />
          <Skeleton style={{ width: 148, height: 34, borderRadius: 10 }} />
        </header>
        <section className="stats-grid app-shell-skeleton__stats">
          {Array.from({ length: 3 }, (_, index) => <Skeleton key={index} style={{ height: 118, borderRadius: 16 }} />)}
        </section>
        <section className="dashboard-grid">
          <Skeleton style={{ minHeight: 290, borderRadius: 16 }} />
          <Skeleton style={{ minHeight: 290, borderRadius: 16 }} />
        </section>
      </main>
      <span className="sr-only">Loading your workspace</span>
    </div>
  )
}
