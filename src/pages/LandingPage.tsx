import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BellRing,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Layers3,
  Play,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  HelpCircle,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'

type LandingPageProps = {
  onGetStarted: () => void
  onLogin: () => void
  onGoToDashboard: () => void
  onLogout?: () => void
  isAuthenticated: boolean
}

type MagneticButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

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

export default function LandingPage({
  onGetStarted,
  onLogin,
  onGoToDashboard,
  onLogout,
  isAuthenticated,
}: LandingPageProps) {
  const [visible, setVisible] = useState<string[]>([])
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: 'How does the smart beacon check-in work?',
      a: 'AttendX AI interfaces directly with local classroom signals. When you enter a class, the app identifies the location coordinates and lets you mark your attendance in one secure click.',
    },
    {
      q: 'Is my academic and personal data secure?',
      a: 'Absolutely. We enforce Row Level Security (RLS) policies directly on Supabase. Your attendance, contact detail registers, and documents are only accessible to you and authorized coordinators.',
    },
    {
      q: 'Can administrators edit verified attendances?',
      a: 'Yes, coordinators can edit, approve, or adjust student logs, view upload photo coordinates, and perform bulk updates when needed. Students maintain read-only access to approved registers.',
    },
    {
      q: 'How do I download reports and data sheets?',
      a: 'Navigate to your Profile or Settings. You can export complete files in CSV, JSON, PDF, and XLSX formats with one tap.',
    },
  ]

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id
            setVisible((current) => (current.includes(id) ? current : [...current, id]))
          }
        });
      },
      { threshold: 0.18 }
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      setSpotlight({
        x: (event.clientX / window.innerWidth) * 100,
        y: (event.clientY / window.innerHeight) * 100,
      })
    }

    window.addEventListener('pointermove', handleMove)
    return () => window.removeEventListener('pointermove', handleMove)
  }, [])

  const spotlightStyle = useMemo(
    () => ({
      background: `radial-gradient(circle at ${spotlight.x}% ${spotlight.y}%, rgba(103, 107, 255, 0.12), transparent 30%)`,
    }),
    [spotlight]
  )

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="landing-shell" style={spotlightStyle}>
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="grid-overlay" />

      {/* Sticky glassmorphic Navbar */}
      <header
        className="landing-nav"
        style={{
          borderBottom: '1px solid var(--line)',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '12px 24px',
        }}
      >
        <div className="logo" aria-label="AttendX AI">
          <div className="logo-mark">
            <span />
            <span />
            <span />
          </div>
          <span>
            Attend<span>X</span>
          </span>
        </div>

        <nav className="landing-nav__links" aria-label="Primary navigation">
          <a href="#hero" onClick={(e) => handleNavClick(e, 'hero')}>
            Home
          </a>
          <a href="#experience" onClick={(e) => handleNavClick(e, 'experience')}>
            Features
          </a>
          <a href="#preview" onClick={(e) => handleNavClick(e, 'preview')}>
            Preview
          </a>
          <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')}>
            FAQ
          </a>
        </nav>

        <div className="landing-nav__actions">
          {isAuthenticated ? (
            <>
              <a
                href="#dashboard"
                onClick={(e) => {
                  e.preventDefault()
                  onGoToDashboard()
                }}
                className="landing-link"
                style={{ marginRight: '16px' }}
              >
                Dashboard
              </a>
              {onLogout && (
                <MagneticButton className="ghost-button" onClick={onLogout}>
                  Logout
                </MagneticButton>
              )}
              <MagneticButton className="primary-button" onClick={onGoToDashboard}>
                Go to Dashboard
              </MagneticButton>
            </>
          ) : (
            <>
              <MagneticButton className="ghost-button" onClick={onLogin}>
                Login
              </MagneticButton>
              <MagneticButton className="primary-button" onClick={onGetStarted}>
                Get Started
              </MagneticButton>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          className="mobile-menu"
          style={{ display: 'block', border: 0, background: 'transparent' }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          className="glass-card"
          style={{
            position: 'absolute',
            top: '80px',
            left: '20px',
            right: '20px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--line)',
          }}
        >
          <a href="#hero" onClick={(e) => handleNavClick(e, 'hero')} style={{ fontSize: '16px', fontWeight: 600 }}>
            Home
          </a>
          <a href="#experience" onClick={(e) => handleNavClick(e, 'experience')} style={{ fontSize: '16px', fontWeight: 600 }}>
            Features
          </a>
          <a href="#preview" onClick={(e) => handleNavClick(e, 'preview')} style={{ fontSize: '16px', fontWeight: 600 }}>
            Preview
          </a>
          <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} style={{ fontSize: '16px', fontWeight: 600 }}>
            FAQ
          </a>
          <hr style={{ border: 0, borderTop: '1px solid var(--line)', width: '100%' }} />
          {isAuthenticated ? (
            <button className="primary-button" onClick={onGoToDashboard} style={{ width: '100%' }}>
              Go to Dashboard
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="ghost-button" onClick={onLogin} style={{ flex: 1 }}>
                Login
              </button>
              <button className="primary-button" onClick={onGetStarted} style={{ flex: 1 }}>
                Get Started
              </button>
            </div>
          )}
        </div>
      )}

      <main className="landing-main">
        {/* Hero Section */}
        <section
          id="hero"
          className={`landing-hero ${visible.includes('hero') ? 'is-visible' : ''}`}
          data-reveal
        >
          <div className="hero-copy">
            <div className="hero-badge">
              <Sparkles size={14} /> smart campus register
            </div>
            <h1>Smart attendance, beautifully simple.</h1>
            <p>One calm interface to verify class logs, schedule timetables, and download analytics.</p>
            <div className="hero-actions">
              <MagneticButton
                className="primary-button"
                onClick={isAuthenticated ? onGoToDashboard : onGetStarted}
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Start free'} <ArrowRight size={16} />
              </MagneticButton>
              <MagneticButton className="ghost-button" onClick={onLogin}>
                <Play size={15} /> Watch the flow
              </MagneticButton>
            </div>
          </div>

          <div className="hero-stage">
            <div className="dashboard-shell">
              <div className="dashboard-shell__top">
                <div>
                  <p className="eyebrow">LIVE PULSE</p>
                  <h3>Active Rhythm</h3>
                </div>
                <span className="live-pill">Live</span>
              </div>

              <div className="dashboard-shell__body">
                <div className="stack-card large-card">
                  <div className="stack-card__header">
                    <div>
                      <p className="muted-label">AVERAGE RATE</p>
                      <strong>92.8% Verified</strong>
                    </div>
                    <div className="mini-chip">+12%</div>
                  </div>
                  <div className="bar-rows">
                    <div className="bar-row">
                      <span>Math</span>
                      <div className="bar-track">
                        <i style={{ width: '92%' }} />
                      </div>
                    </div>
                    <div className="bar-row">
                      <span>Physics</span>
                      <div className="bar-track">
                        <i style={{ width: '84%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="stack-card compact-card">
                  <div className="stack-card__header">
                    <div>
                      <p className="muted-label">UPCOMING</p>
                      <strong>Smart Studio</strong>
                    </div>
                    <Clock3 size={16} />
                  </div>
                </div>
              </div>

              <div className="floating-widget widget-a">
                <BellRing size={15} />
                <span>Verified</span>
              </div>
              <div className="floating-widget widget-b">
                <TrendingUp size={15} />
                <span>Sync active</span>
              </div>
              <div className="floating-widget widget-c">
                <Layers3 size={15} />
                <span>Beacon Ready</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Experience Section */}
        <section
          id="experience"
          className={`landing-section ${visible.includes('experience') ? 'is-visible' : ''}`}
          data-reveal
        >
          <div className="section-head">
            <span className="eyebrow">Features</span>
            <h2>Designed like the best products in the world.</h2>
          </div>

          <div className="feature-grid">
            <article className="glass-card feature-card">
              <div className="feature-icon">
                <Brain size={18} />
              </div>
              <h3>Live Signal Engine</h3>
              <p>Verify check-ins instantly from coordinates inside the classroom.</p>
            </article>

            <article className="glass-card feature-card">
              <div className="feature-icon">
                <ShieldCheck size={18} />
              </div>
              <h3>Row Level Security</h3>
              <p>Protected by Supabase DB policies ensuring absolute student privacy.</p>
            </article>

            <article className="glass-card feature-card">
              <div className="feature-icon">
                <TrendingUp size={18} />
              </div>
              <h3>Instant Exports</h3>
              <p>Download academic transcripts or CSV sheets directly from the app.</p>
            </article>
          </div>
        </section>

        {/* Preview mock dashboard section */}
        <section
          id="preview"
          className={`landing-section ${visible.includes('preview') ? 'is-visible' : ''}`}
          data-reveal
        >
          <div className="section-head">
            <span className="eyebrow">Preview</span>
            <h2>One calm surface for every signal.</h2>
          </div>

          <div
            className="glass-card"
            style={{
              padding: '32px',
              borderRadius: '24px',
              border: '1px solid var(--line)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--line)',
                paddingBottom: '16px',
              }}
            >
              <div>
                <strong style={{ fontSize: '18px' }}>Weekly Rhythm Analytics</strong>
                <p className="helper-text">Visual representation of weekly check-ins</p>
              </div>
              <span className="live-pill" style={{ height: 'fit-content' }}>
                98% Present
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, idx) => (
                <div
                  key={day}
                  className="glass-card"
                  style={{
                    flex: 1,
                    minWidth: '80px',
                    padding: '16px 12px',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.03)',
                  }}
                >
                  <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>
                    {day}
                  </span>
                  <strong style={{ fontSize: '16px', display: 'block', margin: '4px 0' }}>
                    {idx === 2 ? '60%' : '100%'}
                  </strong>
                  <div
                    style={{
                      height: '4px',
                      borderRadius: '2px',
                      background: idx === 2 ? '#f2a853' : '#39ba88',
                      width: '100%',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section
          id="faq"
          className={`landing-section ${visible.includes('faq') ? 'is-visible' : ''}`}
          data-reveal
        >
          <div className="section-head">
            <span className="eyebrow">FAQ</span>
            <h2>Common Questions</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="glass-card"
                style={{
                  borderRadius: '16px',
                  border: '1px solid var(--line)',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px',
                    textAlign: 'left',
                    background: 'transparent',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <HelpCircle size={18} style={{ color: 'var(--purple)' }} />
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={16}
                    style={{
                      transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      color: 'var(--muted)',
                    }}
                  />
                </button>
                {openFaq === idx && (
                  <div
                    style={{
                      padding: '0 20px 20px 48px',
                      fontSize: '13px',
                      color: 'var(--muted)',
                      lineHeight: '1.6',
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Launch / CTA Section */}
        <section
          id="launch"
          className={`landing-section launch-section ${visible.includes('launch') ? 'is-visible' : ''}`}
          data-reveal
        >
          <div className="glass-card launch-card">
            <div>
              <span className="eyebrow">Ready</span>
              <h2>Launch your attendance OS in minutes.</h2>
            </div>
            <MagneticButton
              className="primary-button"
              onClick={isAuthenticated ? onGoToDashboard : onGetStarted}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start building'}{' '}
              <ChevronRight size={16} />
            </MagneticButton>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="logo" aria-label="AttendX AI">
          <div className="logo-mark">
            <span />
            <span />
            <span />
          </div>
          <span>
            Attend<span>X</span>
          </span>
        </div>
        <p>Designed for modern campuses — premium, calm, and secure.</p>
      </footer>
    </div>
  )
}
