import { ArrowRight, Bot, CheckCircle2, ChevronRight, Play, ShieldCheck, Sparkles, Star, Zap } from 'lucide-react'

type LandingPageProps = {
  onGetStarted: () => void
  onLogin: () => void
  onGoToDashboard: () => void
  isAuthenticated: boolean
}

const featureHighlights = [
  {
    icon: Bot,
    title: 'AI attendance copilot',
    description: 'Turn everyday class check-ins into instant summaries and smart alerts.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by design',
    description: 'Your academic records stay protected with secure Supabase-backed sessions.',
  },
  {
    icon: Zap,
    title: 'Frictionless updates',
    description: 'Capture attendance, view trends, and share insights in seconds from any device.',
  },
]

const stats = [
  { value: '98.7%', label: 'accuracy in smart attendance snapshots' },
  { value: '24/7', label: 'adaptive monitoring for every class' },
  { value: '4.9/5', label: 'rated by students and educators' },
]

const testimonials = [
  {
    quote: 'AttendX AI feels like a premium command center for my semester.',
    name: 'Mina Patel',
    role: 'Computer Science Student',
  },
  {
    quote: 'The live dashboard gives my mentor a clearer picture of attendance without extra work.',
    name: 'Daniel Ortiz',
    role: 'Academic Coordinator',
  },
]

const faqs = [
  {
    question: 'Do I need to create an account before seeing the experience?',
    answer: 'No. The landing experience is public and designed to introduce AttendX AI, while protected insights remain available only after sign-in.',
  },
  {
    question: 'What happens after my first login?',
    answer: 'You will be guided through a short academic profile step before access to the full dashboard is unlocked.',
  },
  {
    question: 'Can I revisit the landing page after sign-in?',
    answer: 'Yes. Returning users can jump back to the landing page and instantly switch to the dashboard with a single click.',
  },
]

export default function LandingPage({ onGetStarted, onLogin, onGoToDashboard, isAuthenticated }: LandingPageProps) {
  return (
    <div className="landing-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="landing-nav">
        <div className="logo" aria-label="AttendX AI">
          <div className="logo-mark"><span /><span /><span /></div>
          <span>Attend<span>X</span></span>
        </div>

        <nav className="landing-nav__links" aria-label="Primary navigation">
          <a href="#features">Features</a>
          <a href="#preview">Preview</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div className="landing-nav__actions">
          {isAuthenticated ? (
            <button className="primary-button landing-action" onClick={onGoToDashboard}>
              Go to Dashboard <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button className="landing-link" onClick={onLogin}>Login</button>
              <button className="primary-button landing-action" onClick={onGetStarted}>
                Get Started <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero__copy">
            <div className="landing-badge">
              <Sparkles size={14} /> Premium attendance intelligence for modern campuses
            </div>
            <h1>Meet AttendX AI — the elegant layer between every class and every insight.</h1>
            <p>
              Discover a mobile-first experience that turns attendance into a calm, intelligent workflow with premium storytelling, live analytics, and effortless onboarding.
            </p>
            <div className="landing-hero__actions">
              <button className="primary-button" onClick={onGetStarted}>
                Get Started <ArrowRight size={16} />
              </button>
              <button className="landing-secondary" onClick={onLogin}>
                <Play size={16} /> Watch the experience
              </button>
            </div>
            <div className="landing-trust-row">
              <span><CheckCircle2 size={14} /> No protected data exposed</span>
              <span><CheckCircle2 size={14} /> Secure sign-in first</span>
              <span><CheckCircle2 size={14} /> Designed for every screen</span>
            </div>
          </div>

          <div className="landing-hero__visual">
            <div className="dashboard-preview" id="preview">
              <div className="dashboard-preview__top">
                <div>
                  <p className="eyebrow">Live dashboard preview</p>
                  <h3>Attendance pulse</h3>
                </div>
                <span className="preview-pill">Connected</span>
              </div>

              <div className="mock-chart">
                <div className="mock-bar" style={{ height: '48%' }} />
                <div className="mock-bar" style={{ height: '78%' }} />
                <div className="mock-bar" style={{ height: '62%' }} />
                <div className="mock-bar" style={{ height: '90%' }} />
                <div className="mock-bar" style={{ height: '74%' }} />
              </div>

              <div className="mock-stats">
                <div>
                  <strong>94%</strong>
                  <span>weekly attendance</span>
                </div>
                <div>
                  <strong>+12</strong>
                  <span>smart alerts</span>
                </div>
                <div>
                  <strong>3</strong>
                  <span>live topics</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section" id="features">
          <div className="section-heading centered">
            <div className="landing-badge small">Intelligent by default</div>
            <h2>Every detail feels premium, responsive, and effortless.</h2>
            <p>From onboarding to analytics, AttendX AI is carefully tuned for clarity, motion, and momentum.</p>
          </div>

          <div className="feature-grid">
            {featureHighlights.map((feature) => {
              const Icon = feature.icon
              return (
                <article className="feature-card" key={feature.title}>
                  <div className="feature-icon">
                    <Icon size={18} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="landing-section stats-section">
          <div className="stats-strip">
            {stats.map((item) => (
              <div className="stat-pill" key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-section testimonial-section">
          <div className="section-heading centered">
            <div className="landing-badge small">Loved by learners</div>
            <h2>Designed to feel polished from the first tap.</h2>
          </div>
          <div className="testimonial-grid">
            {testimonials.map((item) => (
              <article className="testimonial-card" key={item.name}>
                <div className="testimonial-stars">
                  {Array.from({ length: 5 }).map((_, index) => <Star key={index} size={14} fill="currentColor" />)}
                </div>
                <p>“{item.quote}”</p>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section faq-section" id="faq">
          <div className="section-heading centered">
            <div className="landing-badge small">FAQ</div>
            <h2>Everything you need to know before you jump in.</h2>
          </div>
          <div className="faq-list">
            {faqs.map((item) => (
              <details className="faq-item" key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div>
          <div className="logo" aria-label="AttendX AI">
            <div className="logo-mark"><span /><span /><span /></div>
            <span>Attend<span>X</span></span>
          </div>
          <p>AttendX AI blends clarity, elegance, and intelligent attendance workflows for every learner and educator.</p>
        </div>
        <div className="footer-actions">
          <button className="landing-link" onClick={onLogin}>Login</button>
          <button className="primary-button" onClick={onGetStarted}>Start your journey <ChevronRight size={16} /></button>
        </div>
      </footer>
    </div>
  )
}
