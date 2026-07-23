import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, BellRing, Brain, CheckCircle2, ChevronRight, Clock3, Layers3, Play, ShieldCheck, Sparkles, TrendingUp, Zap } from 'lucide-react'

type LandingPageProps = {
  onGetStarted: () => void
  onLogin: () => void
  onGoToDashboard: () => void
  isAuthenticated: boolean
}

type MagneticButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

const featureCards = [
  { icon: Brain, title: 'AI signal engine', description: 'Instant context from every class update.' },
  { icon: ShieldCheck, title: 'Protected by design', description: 'Secure sign-in with zero exposure of private data.' },
  { icon: Zap, title: 'Live workflow', description: 'Fast updates for students, staff, and coordinators.' },
]

function MagneticButton({ children, onClick, className = '' }: MagneticButtonProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const handleMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const moveX = (x - rect.width / 2) / 12
    const moveY = (y - rect.height / 2) / 12
    setOffset({ x: moveX, y: moveY })
  }

  const handleLeave = () => setOffset({ x: 0, y: 0 })

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const ripple = document.createElement('span')
    ripple.className = 'ripple'
    ripple.style.left = `${event.clientX - rect.left}px`
    ripple.style.top = `${event.clientY - rect.top}px`
    event.currentTarget.appendChild(ripple)
    setTimeout(() => ripple.remove(), 600)
    onClick?.()
  }

  return (
    <button
      type="button"
      className={`magnetic-button ${className}`.trim()}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
    >
      {children}
    </button>
  )
}

export default function LandingPage({ onGetStarted, onLogin, onGoToDashboard, isAuthenticated }: LandingPageProps) {
  const [visible, setVisible] = useState<string[]>([])
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 })

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id
          setVisible((current) => (current.includes(id) ? current : [...current, id]))
        }
      })
    }, { threshold: 0.18 })

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      setSpotlight({
        x: (event.clientX / window.innerWidth) * 100,
        y: (event.clientY / window.innerHeight) * 100,
      })
    }

    window.addEventListener('pointermove', handleMove)
    return () => window.removeEventListener('pointermove', handleMove)
  }, [])

  const spotlightStyle = useMemo(() => ({
    background: `radial-gradient(circle at ${spotlight.x}% ${spotlight.y}%, rgba(255,255,255,0.2), transparent 28%)`,
  }), [spotlight])

  return (
    <div className="landing-shell" style={spotlightStyle}>
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="grid-overlay" />

      <header className="landing-nav">
        <div className="logo" aria-label="AttendX AI">
          <div className="logo-mark"><span /><span /><span /></div>
          <span>Attend<span>X</span></span>
        </div>

        <nav className="landing-nav__links" aria-label="Primary navigation">
          <a href="#experience">Experience</a>
          <a href="#workflow">Workflow</a>
          <a href="#launch">Launch</a>
        </nav>

        <div className="landing-nav__actions">
          {isAuthenticated ? (
            <MagneticButton className="primary-button" onClick={onGoToDashboard}>Go to Dashboard</MagneticButton>
          ) : (
            <>
              <MagneticButton className="ghost-button" onClick={onLogin}>Login</MagneticButton>
              <MagneticButton className="primary-button" onClick={onGetStarted}>Get Started</MagneticButton>
            </>
          )}
        </div>
      </header>

      <main className="landing-main">
        <section id="hero" className={`landing-hero ${visible.includes('hero') ? 'is-visible' : ''}`} data-reveal>
          <div className="hero-copy">
            <div className="hero-badge"><Sparkles size={14} /> Premium AI attendance platform</div>
            <h1>Attendance that feels effortless.</h1>
            <p>Beautifully simple workflows for every class, every campus, every moment.</p>
            <div className="hero-actions">
              <MagneticButton className="primary-button" onClick={onGetStarted}>Start free <ArrowRight size={16} /></MagneticButton>
              <MagneticButton className="ghost-button" onClick={onLogin}><Play size={15} /> Watch the flow</MagneticButton>
            </div>
          </div>

          <div className="hero-stage">
            <div className="dashboard-shell">
              <div className="dashboard-shell__top">
                <div>
                  <p className="eyebrow">Live dashboard</p>
                  <h3>Today’s pulse</h3>
                </div>
                <span className="live-pill">Live</span>
              </div>

              <div className="dashboard-shell__body">
                <div className="stack-card large-card">
                  <div className="stack-card__header">
                    <div>
                      <p className="muted-label">Engagement</p>
                      <strong>Healthy rhythm</strong>
                    </div>
                    <div className="mini-chip">+12%</div>
                  </div>
                  <div className="bar-rows">
                    <div className="bar-row"><span>Math</span><div className="bar-track"><i style={{ width: '92%' }} /></div></div>
                    <div className="bar-row"><span>Physics</span><div className="bar-track"><i style={{ width: '84%' }} /></div></div>
                    <div className="bar-row"><span>Design</span><div className="bar-track"><i style={{ width: '76%' }} /></div></div>
                  </div>
                </div>

                <div className="stack-card compact-card">
                  <div className="stack-card__header">
                    <div>
                      <p className="muted-label">Next class</p>
                      <strong>AI studio</strong>
                    </div>
                    <Clock3 size={16} />
                  </div>
                  <div className="timeline-card">
                    <div className="timeline-dot" />
                    <div>
                      <strong>09:30</strong>
                      <p>Smart check-in ready</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="floating-widget widget-a">
                <BellRing size={15} />
                <span>2 new alerts</span>
              </div>
              <div className="floating-widget widget-b">
                <TrendingUp size={15} />
                <span>Momentum up</span>
              </div>
              <div className="floating-widget widget-c">
                <Layers3 size={15} />
                <span>Smart boards</span>
              </div>
            </div>
          </div>
        </section>

        <section id="experience" className={`landing-section ${visible.includes('experience') ? 'is-visible' : ''}`} data-reveal>
          <div className="section-head">
            <span className="eyebrow">Experience</span>
            <h2>Designed like the best products in the world.</h2>
          </div>

          <div className="feature-grid">
            {featureCards.map((feature) => {
              const Icon = feature.icon
              return (
                <article className="glass-card feature-card" key={feature.title}>
                  <div className="feature-icon"><Icon size={18} /></div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section id="workflow" className={`landing-section workflow-section ${visible.includes('workflow') ? 'is-visible' : ''}`} data-reveal>
          <div className="glass-card workflow-card">
            <div className="workflow-card__content">
              <span className="eyebrow">Workflow</span>
              <h2>One calm surface for every signal.</h2>
              <p>Minimal by design, powerful in motion.</p>
            </div>
            <div className="workflow-card__list">
              <div className="workflow-item"><CheckCircle2 size={16} /><span>Secure onboarding</span></div>
              <div className="workflow-item"><CheckCircle2 size={16} /><span>Live class summaries</span></div>
              <div className="workflow-item"><CheckCircle2 size={16} /><span>Smart student insights</span></div>
            </div>
          </div>
        </section>

        <section id="launch" className={`landing-section launch-section ${visible.includes('launch') ? 'is-visible' : ''}`} data-reveal>
          <div className="glass-card launch-card">
            <div>
              <span className="eyebrow">Ready</span>
              <h2>Launch your attendance OS in minutes.</h2>
            </div>
            <MagneticButton className="primary-button" onClick={onGetStarted}>Start building <ChevronRight size={16} /></MagneticButton>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="logo" aria-label="AttendX AI">
          <div className="logo-mark"><span /><span /><span /></div>
          <span>Attend<span>X</span></span>
        </div>
        <p>Designed for modern campuses — premium, calm, and secure.</p>
      </footer>
    </div>
  )
}
