import { useMemo, useState } from 'react'
import {
  ArrowDownToLine,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Command,
  CreditCard,
  FileText,
  GraduationCap,
  Grid2X2,
  Heart,
  Home,
  LineChart,
  MapPin,
  Menu,
  MoreHorizontal,
  Moon,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  UserRound,
  X,
} from 'lucide-react'

type NavItem = {
  label: string
  icon: typeof Home
}

const navigation: NavItem[] = [
  { label: 'Overview', icon: Grid2X2 },
  { label: 'Attendance', icon: CalendarDays },
  { label: 'Insights', icon: LineChart },
  { label: 'Timetable', icon: Clock3 },
]

const sessions = [
  { day: 'Mon', date: '14', state: 'present' },
  { day: 'Tue', date: '15', state: 'present' },
  { day: 'Wed', date: '16', state: 'present' },
  { day: 'Thu', date: '17', state: 'pending' },
  { day: 'Fri', date: '18', state: 'future' },
  { day: 'Sat', date: '19', state: 'future' },
  { day: 'Sun', date: '20', state: 'future' },
]

const attendance = [
  { course: 'Data Structures', code: 'CS-302', date: 'Today, 09:00', status: 'Pending', dot: 'amber' },
  { course: 'Database Management', code: 'CS-304', date: 'Yesterday, 11:15', status: 'Approved', dot: 'emerald' },
  { course: 'Computer Networks', code: 'CS-306', date: 'Jul 15, 10:00', status: 'Approved', dot: 'emerald' },
  { course: 'Software Engineering', code: 'CS-308', date: 'Jul 14, 13:30', status: 'Approved', dot: 'emerald' },
]

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="logo" aria-label="AttendX AI">
      <div className="logo-mark"><span /><span /><span /></div>
      {!compact && <span>Attend<span>X</span></span>}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, detail, color }: { icon: typeof Target; label: string; value: string; detail: string; color: 'indigo' | 'cyan' | 'violet' }) {
  return (
    <article className="stat-card glass-card">
      <div className={`stat-icon ${color}`}><Icon size={19} strokeWidth={2.2} /></div>
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small className={detail.includes('up') ? 'positive' : ''}>{detail}</small>
      </div>
    </article>
  )
}

function App() {
  const [active, setActive] = useState('Overview')
  const [dark, setDark] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [marked, setMarked] = useState(false)
  const [notice, setNotice] = useState(false)

  const greeting = useMemo(() => new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false }).format(new Date()), [])
  const salutation = Number(greeting) < 12 ? 'Good morning' : Number(greeting) < 17 ? 'Good afternoon' : 'Good evening'

  const markAttendance = () => {
    setMarked(true)
    setShowModal(false)
    window.setTimeout(() => setMarked(false), 3400)
  }

  return (
    <div className={`app ${dark ? 'dark' : ''}`}>
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <aside className="sidebar">
        <div className="brand-row"><Logo /><button className="sidebar-collapse" aria-label="Collapse sidebar"><ChevronLeft size={17} /></button></div>
        <nav className="main-nav" aria-label="Primary">
          <p>WORKSPACE</p>
          {navigation.map(({ label, icon: Icon }) => (
            <button key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => setActive(label)}>
              <Icon size={19} /><span>{label}</span>{label === 'Attendance' && <em>3</em>}
            </button>
          ))}
          <p className="nav-section">PERSONAL</p>
          <button className="nav-item" onClick={() => setNotice(true)}><Bell size={19} /><span>Notifications</span><i /></button>
          <button className="nav-item" onClick={() => setActive('Settings')}><Settings2 size={19} /><span>Settings</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="support-card"><div className="support-icon"><CircleHelp size={17} /></div><div><strong>Need a hand?</strong><span>We’re here for you</span></div><ChevronRight size={16} /></div>
          <div className="student-mini"><div className="avatar avatar-mini">SR</div><div><strong>Saurav Rana</strong><span>Student</span></div><MoreHorizontal size={18} /></div>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setShowMenu(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div className="crumb"><span>Student space</span><ChevronRight size={14} /><strong>{active}</strong></div>
          <div className="top-actions">
            <button className="icon-button search-button" aria-label="Search"><Search size={19} /><kbd>⌘ K</kbd></button>
            <button className="icon-button notification" onClick={() => setNotice(!notice)} aria-label="Notifications"><Bell size={19} /><b /></button>
            <button className="theme-switch" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? <Sun size={17} /> : <Moon size={17} />}</button>
            <div className="avatar">SR</div>
          </div>
        </header>

        <section className="hero-row">
          <div><div className="eyebrow"><Sparkles size={14} /> YOUR DAY, SIMPLIFIED</div><h1>{salutation}, Saurav <span>✦</span></h1><p>Here’s a clear view of your attendance journey.</p></div>
          <button className="primary-button" onClick={() => setShowModal(true)}><Plus size={18} /> Mark attendance</button>
        </section>

        {marked && <div className="success-banner"><div><Check size={18} /></div><span><strong>Attendance submitted</strong> — Your Data Structures session is now pending review.</span><button onClick={() => setMarked(false)}><X size={17} /></button></div>}

        <section className="stats-grid">
          <StatCard icon={Target} label="Overall attendance" value="92.4%" detail="↑ 4.6% from last month" color="indigo" />
          <StatCard icon={CalendarDays} label="Classes attended" value="124 / 134" detail="10 classes this month" color="cyan" />
          <StatCard icon={TrendingUp} label="Current streak" value="18 days" detail="Your personal best!" color="violet" />
        </section>

        <section className="dashboard-grid">
          <article className="overview-card glass-card">
            <div className="section-heading"><div><span className="section-kicker">THIS WEEK</span><h2>Your attendance rhythm</h2></div><button className="subtle-button">This week <ChevronDown size={15} /></button></div>
            <div className="weekly-strip">
              {sessions.map(session => <div className="day-pill" key={session.day}><span>{session.day}</span><strong>{session.date}</strong><i className={session.state} /></div>)}
            </div>
            <div className="chart-area">
              <div className="chart-labels"><span>100%</span><span>75%</span><span>50%</span><span>25%</span></div>
              <svg className="line-chart" viewBox="0 0 620 190" preserveAspectRatio="none" role="img" aria-label="Attendance trend increasing from 74 to 92 percent">
                <defs><linearGradient id="line" x1="0" x2="1"><stop stopColor="#696cff"/><stop offset="1" stopColor="#41c9e2" /></linearGradient><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#6b6fff" stopOpacity=".24"/><stop offset="1" stopColor="#6b6fff" stopOpacity="0"/></linearGradient></defs>
                <path className="grid-lines" d="M0 20H620M0 70H620M0 120H620M0 170H620" />
                <path d="M0 166 C42 151 54 137 87 141 S130 122 155 130 S197 112 218 116 S260 100 282 103 S332 84 352 91 S400 56 426 69 S470 48 491 53 S535 25 562 39 S596 13 620 18 L620 190 L0 190Z" fill="url(#area)"/>
                <path d="M0 166 C42 151 54 137 87 141 S130 122 155 130 S197 112 218 116 S260 100 282 103 S332 84 352 91 S400 56 426 69 S470 48 491 53 S535 25 562 39 S596 13 620 18" fill="none" stroke="url(#line)" strokeWidth="4" strokeLinecap="round"/>
                <circle cx="491" cy="53" r="6" fill="#fff" stroke="#5d80f4" strokeWidth="3"/><circle cx="620" cy="18" r="6" fill="#fff" stroke="#41c9e2" strokeWidth="3"/>
              </svg>
              <div className="chart-days"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
            </div>
          </article>

          <article className="next-card glass-card">
            <div className="section-heading"><div><span className="section-kicker">UP NEXT</span><h2>Today’s class</h2></div><button className="more-button" aria-label="More options"><MoreHorizontal size={19} /></button></div>
            <div className="next-class"><div className="course-icon"><BookOpen size={22} /></div><div><span>09:00 – 10:00 AM</span><h3>Data Structures</h3><p>Prof. R. Kulkarni <b>•</b> Room 203</p></div></div>
            <div className="class-timer"><div className="timer-ring"><span>42<small>min</small></span></div><div><strong>Starts in 42 minutes</strong><span>Get ready for a great class.</span></div></div>
            <button className="wide-button" onClick={() => setShowModal(true)}>View session <ArrowRight size={17} /></button>
          </article>
        </section>

        <section className="lower-grid">
          <article className="history-card glass-card">
            <div className="section-heading"><div><span className="section-kicker">HISTORY</span><h2>Recent attendance</h2></div><button className="text-button" onClick={() => setActive('Attendance')}>View all <ArrowRight size={15} /></button></div>
            <div className="attendance-list">
              {attendance.map(item => <div className="attendance-row" key={item.course}><div className="course-badge"><GraduationCap size={18} /></div><div className="attendance-course"><strong>{item.course}</strong><span>{item.code}</span></div><div className="attendance-time"><strong>{item.date}</strong><span>Lecture</span></div><div className={`status ${item.dot}`}><i />{item.status}</div><ChevronRight className="row-arrow" size={17} /></div>)}
            </div>
            <button className="export-button"><ArrowDownToLine size={16} /> Export attendance</button>
          </article>
          <article className="moment-card">
            <div className="moment-glow" /><div className="moment-content"><div className="achievement"><Heart size={17} fill="currentColor" /> <span>YOU’RE ON FIRE</span></div><h2>Consistency looks<br />good on you.</h2><p>You’ve maintained a 92% attendance rate this semester. Keep your momentum going.</p><div className="progress-row"><div className="progress"><span /></div><b>92%</b></div></div>
          </article>
        </section>
      </main>

      <nav className="bottom-nav" aria-label="Mobile navigation">
        {navigation.map(({ label, icon: Icon }) => <button key={label} onClick={() => setActive(label)} className={active === label ? 'active' : ''}><Icon size={20} /><span>{label}</span></button>)}
      </nav>

      {showMenu && <div className="mobile-overlay"><div className="mobile-drawer"><div className="drawer-header"><Logo /><button onClick={() => setShowMenu(false)} aria-label="Close navigation"><X size={20} /></button></div>{navigation.map(({label, icon: Icon}) => <button key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => {setActive(label);setShowMenu(false)}}><Icon size={19}/><span>{label}</span></button>)}<hr/><button className="nav-item"><Settings2 size={19}/><span>Settings</span></button></div></div>}
      {notice && <div className="notice-popover"><div><strong>All caught up</strong><button onClick={() => setNotice(false)}><X size={15} /></button></div><p>There are no new notifications right now.</p></div>}
      {showModal && <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowModal(false)}><section className="attendance-modal" role="dialog" aria-modal="true" aria-labelledby="modal-heading" onMouseDown={event => event.stopPropagation()}><button className="modal-close" onClick={() => setShowModal(false)} aria-label="Close"><X size={19}/></button><div className="modal-icon"><ShieldCheck size={25}/></div><span className="section-kicker">SECURE CHECK-IN</span><h2 id="modal-heading">Ready to mark attendance?</h2><p>Your submission will be sent securely for your instructor’s review.</p><div className="session-detail"><div><BookOpen size={19}/><span><strong>Data Structures</strong><small>CS-302 • 09:00 – 10:00 AM</small></span></div><div><MapPin size={19}/><span><strong>Room 203</strong><small>Engineering Block A</small></span></div></div><button className="primary-button modal-submit" onClick={markAttendance}><Check size={18}/> Confirm attendance</button></section></div>}
    </div>
  )
}

export default App
