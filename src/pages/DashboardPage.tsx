import { useEffect, useMemo, useState } from 'react'
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
  Grid2X2,
  GraduationCap,
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
import { supabase } from '../supabase'
import type { AttendanceRecord, NotificationItem, Profile, Subject, TimetableItem } from '../types'

type PageKey = 'Overview' | 'Attendance' | 'Insights' | 'Timetable' | 'Notifications' | 'Settings'

type NavItem = { label: PageKey; icon: typeof Home }

const navigation: NavItem[] = [
  { label: 'Overview', icon: Grid2X2 },
  { label: 'Attendance', icon: CalendarDays },
  { label: 'Insights', icon: LineChart },
  { label: 'Timetable', icon: Clock3 },
  { label: 'Notifications', icon: Bell },
  { label: 'Settings', icon: Settings2 },
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

export default function DashboardPage({ profile, onLogout }: { profile: Profile; onLogout: () => void }) {
  const [active, setActive] = useState<PageKey>('Overview')
  const [dark, setDark] = useState(profile.dark_mode)
  const [showMenu, setShowMenu] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [marked, setMarked] = useState(false)
  const [notice, setNotice] = useState(false)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [timetable, setTimetable] = useState<TimetableItem[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [settingsForm, setSettingsForm] = useState({ fullName: profile.full_name || '', email: profile.email || '', phone: profile.phone || '', bio: profile.bio || '' })
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsMessage, setSettingsMessage] = useState('')
  const [uploadMessage, setUploadMessage] = useState('')
  const [formState, setFormState] = useState({ subjectId: '', status: 'present' as 'present' | 'absent' | 'leave', date: new Date().toISOString().slice(0, 10), notes: '' })

  useEffect(() => {
    void loadData()
    const channel = supabase.channel('realtime-attendance')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timetable' }, () => loadData())
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    void supabase.from('profiles').update({ dark_mode: dark }).eq('id', profile.id).then()
  }, [dark, profile.id])

  async function loadData() {
    setLoading(true)
    const [attendanceRes, subjectsRes, timetableRes, notificationsRes] = await Promise.all([
      supabase.from('attendance').select('*').eq('profile_id', profile.id).order('attendance_date', { ascending: false }).limit(8),
      supabase.from('subjects').select('*').eq('profile_id', profile.id).order('name'),
      supabase.from('timetable').select('*').eq('profile_id', profile.id).order('day_of_week', { ascending: true }).order('start_time', { ascending: true }),
      supabase.from('notifications').select('*').eq('profile_id', profile.id).order('created_at', { ascending: false }).limit(8),
    ])

    if (attendanceRes.data) setAttendance(attendanceRes.data as AttendanceRecord[])
    if (subjectsRes.data) setSubjects(subjectsRes.data as Subject[])
    if (timetableRes.data) setTimetable(timetableRes.data as TimetableItem[])
    if (notificationsRes.data) setNotifications(notificationsRes.data as NotificationItem[])
    setLoading(false)
  }

  const greeting = useMemo(() => new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false }).format(new Date()), [])
  const salutation = Number(greeting) < 12 ? 'Good morning' : Number(greeting) < 17 ? 'Good afternoon' : 'Good evening'

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' })
  const todayClasses = timetable.filter((item) => item.day_of_week.toLowerCase() === today.toLowerCase())
  const nextClass = todayClasses[0] || timetable[0]
  const attendancePercentage = useMemo(() => {
    if (!attendance.length) return '0%'
    const present = attendance.filter((item) => item.status === 'present').length
    const total = attendance.length
    return `${Math.round((present / total) * 100)}%`
  }, [attendance])

  const attendedCount = attendance.filter((item) => item.status === 'present').length
  const totalCount = attendance.length
  const streak = useMemo(() => {
    if (!attendance.length) return 0
    let streakCount = 0
    const sorted = [...attendance].sort((a, b) => new Date(a.attendance_date).getTime() - new Date(b.attendance_date).getTime())
    for (const row of sorted.reverse()) {
      if (row.status === 'present') streakCount += 1
      else break
    }
    return streakCount
  }, [attendance])

  async function markAttendance() {
    if (!nextClass) return
    const recorded = {
      profile_id: profile.id,
      subject_name: nextClass.subject_name,
      subject_code: nextClass.title,
      classroom_name: nextClass.room,
      attendance_date: new Date().toISOString(),
      status: 'present' as const,
      notes: 'Marked from dashboard',
    }
    const { error } = await supabase.from('attendance').insert([recorded])
    if (!error) {
      setMarked(true)
      setShowModal(false)
      window.setTimeout(() => setMarked(false), 3400)
    }
  }

  const unreadCount = notifications.filter((item) => item.unread).length
  const filteredAttendance = useMemo(() => attendance.filter((row) => {
    const searchText = `${row.subject_name} ${row.subject_code}`.toLowerCase()
    const matchesSearch = searchText.includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || row.status === statusFilter
    return matchesSearch && matchesStatus
  }), [attendance, search, statusFilter])

  const weeklyTrend = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map((day) => {
      const records = attendance.filter((row) => new Date(row.attendance_date).toLocaleDateString('en-US', { weekday: 'short' }) === day)
      const present = records.filter((row) => row.status === 'present').length
      const percent = records.length ? Math.round((present / records.length) * 100) : 0
      return { day, percent }
    })
  }, [attendance])

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    const subject = subjects.find((item) => item.id === formState.subjectId) || subjects[0]
    if (!subject) return

    const payload = {
      profile_id: profile.id,
      subject_name: subject.name,
      subject_code: subject.code,
      classroom_name: nextClass?.room || 'Main Hall',
      attendance_date: `${formState.date}T12:00:00.000Z`,
      status: formState.status,
      notes: formState.notes || null,
    }

    if (editingId) {
      await supabase.from('attendance').update(payload).eq('id', editingId)
    } else {
      await supabase.from('attendance').insert([payload])
    }

    setEditingId(null)
    setFormState({ subjectId: subjects[0]?.id || '', status: 'present', date: new Date().toISOString().slice(0, 10), notes: '' })
    setShowModal(false)
    void loadData()
  }

  const handleEdit = (row: AttendanceRecord) => {
    setEditingId(row.id)
    const subject = subjects.find((item) => item.name === row.subject_name)
    setFormState({
      subjectId: subject?.id || subjects[0]?.id || '',
      status: row.status,
      date: row.attendance_date.slice(0, 10),
      notes: row.notes || '',
    })
    setActive('Attendance')
  }

  const handleDelete = async (rowId: string) => {
    await supabase.from('attendance').delete().eq('id', rowId)
    void loadData()
  }

  const handleExport = () => {
    const rows = filteredAttendance.length ? filteredAttendance : attendance
    const csv = ['subject,code,date,status,notes', ...rows.map((row) => `${row.subject_name},${row.subject_code},${row.attendance_date},${row.status},${row.notes || ''}`)]
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'attendance.csv'
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const handleBulkAttendance = async () => {
    if (!subjects.length) return
    const rows = subjects.map((subject) => ({
      profile_id: profile.id,
      subject_name: subject.name,
      subject_code: subject.code,
      classroom_name: nextClass?.room || 'Main Hall',
      attendance_date: new Date().toISOString(),
      status: 'present' as const,
      notes: 'Bulk marked',
    }))
    await supabase.from('attendance').insert(rows)
    void loadData()
  }

  const handleMarkAttendance = async () => {
    if (!nextClass) return
    const payload = {
      profile_id: profile.id,
      subject_name: nextClass.subject_name,
      subject_code: nextClass.title,
      classroom_name: nextClass.room,
      attendance_date: new Date().toISOString(),
      status: 'present' as const,
      notes: 'Marked from dashboard',
    }
    const { error } = await supabase.from('attendance').insert([payload])
    if (!error) {
      setMarked(true)
      setShowModal(false)
      window.setTimeout(() => setMarked(false), 3400)
      void loadData()
    }
  }

  const markNotificationRead = async (id: string) => {
    await supabase.from('notifications').update({ unread: false }).eq('id', id)
    void loadData()
  }

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSettings(true)
    setSettingsMessage('')
    try {
      await supabase.from('profiles').update({ full_name: settingsForm.fullName, phone: settingsForm.phone, bio: settingsForm.bio }).eq('id', profile.id)
      await supabase.auth.updateUser({ email: settingsForm.email })
      setSettingsMessage('Profile updated successfully.')
    } catch {
      setSettingsMessage('Could not update profile right now.')
    } finally {
      setSavingSettings(false)
    }
  }

  const uploadAvatar = async (file: File | null) => {
    if (!file) return
    setUploadMessage('Uploading avatar…')
    const fileName = `${profile.id}-${file.name}`
    const { error } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
    if (error) {
      setUploadMessage(error.message)
      return
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', profile.id)
    setUploadMessage('Avatar uploaded and linked to your profile.')
    void loadData()
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
              <Icon size={19} /><span>{label}</span>{label === 'Attendance' && <em>{attendance.length}</em>}
            </button>
          ))}
          <p className="nav-section">PERSONAL</p>
          <button className="nav-item" onClick={() => setNotice(true)}><Bell size={19} /><span>Notifications</span>{unreadCount > 0 ? <i /> : null}</button>
          <button className="nav-item" onClick={() => setActive('Settings')}><Settings2 size={19} /><span>Settings</span></button>
          <button className="nav-item" onClick={onLogout}><UserRound size={19} /><span>Logout</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="support-card"><div className="support-icon"><CircleHelp size={17} /></div><div><strong>Need a hand?</strong><span>We’re here for you</span></div><ChevronRight size={16} /></div>
          <div className="student-mini"><div className="avatar avatar-mini">{profile.full_name?.slice(0, 2).toUpperCase() || 'US'}</div><div><strong>{profile.full_name || 'Student'}</strong><span>{profile.role}</span></div><MoreHorizontal size={18} /></div>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setShowMenu(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div className="crumb"><span>Student space</span><ChevronRight size={14} /><strong>{active}</strong></div>
          <div className="top-actions">
            <button className="icon-button search-button" aria-label="Search"><Search size={19} /><kbd>⌘ K</kbd></button>
            <button className="icon-button notification" onClick={() => setNotice(!notice)} aria-label="Notifications"><Bell size={19} />{unreadCount > 0 ? <b /> : null}</button>
            <button className="theme-switch" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? <Sun size={17} /> : <Moon size={17} />}</button>
            <div className="avatar">{profile.full_name?.slice(0, 2).toUpperCase() || 'US'}</div>
          </div>
        </header>

        <section className="hero-row">
          <div><div className="eyebrow"><Sparkles size={14} /> YOUR DAY, SIMPLIFIED</div><h1>{salutation}, {profile.full_name?.split(' ')[0] || 'Student'} <span>✦</span></h1><p>Here’s a clear view of your attendance journey.</p></div>
          <button className="primary-button" onClick={() => setShowModal(true)}><Plus size={18} /> Mark attendance</button>
        </section>

        {marked ? <div className="success-banner"><div><Check size={18} /></div><span><strong>Attendance submitted</strong> — Your latest session is now recorded.</span><button onClick={() => setMarked(false)}><X size={17} /></button></div> : null}

        <section className="stats-grid">
          <StatCard icon={Target} label="Overall attendance" value={attendancePercentage} detail="Live from Supabase" color="indigo" />
          <StatCard icon={CalendarDays} label="Classes attended" value={`${attendedCount} / ${totalCount}`} detail="Latest updates reflected instantly" color="cyan" />
          <StatCard icon={TrendingUp} label="Current streak" value={`${streak} days`} detail="Calculated from attendance history" color="violet" />
        </section>

        <section className="dashboard-grid">
          <article className="overview-card glass-card">
            <div className="section-heading"><div><span className="section-kicker">THIS WEEK</span><h2>Your attendance rhythm</h2></div><button className="subtle-button">This week <ChevronDown size={15} /></button></div>
            <div className="weekly-strip">
              {weeklyTrend.map((item) => <div className="day-pill" key={item.day}><span>{item.day}</span><strong>{item.percent}%</strong><i className={item.percent >= 80 ? 'present' : item.percent >= 50 ? 'pending' : 'future'} /></div>)}
            </div>
            <div className="chart-area">
              <div className="chart-labels"><span>100%</span><span>75%</span><span>50%</span><span>25%</span></div>
              <svg className="line-chart" viewBox="0 0 620 190" preserveAspectRatio="none" role="img" aria-label="Attendance trend">
                <defs><linearGradient id="line" x1="0" x2="1"><stop stopColor="#696cff"/><stop offset="1" stopColor="#41c9e2" /></linearGradient><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#6b6fff" stopOpacity="0.24"/><stop offset="1" stopColor="#6b6fff" stopOpacity="0"/></linearGradient></defs>
                <path className="grid-lines" d="M0 20H620M0 70H620M0 120H620M0 170H620" />
                {(() => {
                  const points = weeklyTrend.map((item, index) => `${index * 100 + 10},${170 - item.percent * 1.4}`).join(' ')
                  const d = weeklyTrend.map((item, index) => `${index === 0 ? 'M' : 'L'} ${index * 100 + 10} ${170 - item.percent * 1.4}`).join(' ')
                  return (
                    <>
                      <path d={`M10 170 ${d} L 610 170 Z`} fill="url(#area)"/>
                      <path d={d} fill="none" stroke="url(#line)" strokeWidth="4" strokeLinecap="round" />
                      {weeklyTrend.map((item, index) => (
                        <circle
                          key={item.day}
                          cx={index * 100 + 10}
                          cy={170 - item.percent * 1.4}
                          r="6"
                          fill="#fff"
                          stroke="#5d80f4"
                          strokeWidth="3"
                        />
                      ))}
                    </>
                  )
                })()}
              </svg>
              <div className="chart-days"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
            </div>
          </article>

          <article className="next-card glass-card">
            <div className="section-heading"><div><span className="section-kicker">UP NEXT</span><h2>Today’s class</h2></div><button className="more-button" aria-label="More options"><MoreHorizontal size={19} /></button></div>
            <div className="next-class"><div className="course-icon"><BookOpen size={22} /></div><div><span>{nextClass ? `${nextClass.start_time} – ${nextClass.end_time}` : 'No class today'}</span><h3>{nextClass?.subject_name || 'No upcoming class'}</h3><p>{nextClass?.teacher_name || 'Schedule synced'} <b>•</b> {nextClass?.room || 'TBA'}</p></div></div>
            <div className="class-timer"><div className="timer-ring"><span>42<small>min</small></span></div><div><strong>{nextClass ? 'Starts soon' : 'Enjoy your free time'}</strong><span>{nextClass ? 'Your next class is ready to begin.' : 'No classes scheduled right now.'}</span></div></div>
            <button className="wide-button" onClick={() => setShowModal(true)}>View session <ArrowRight size={17} /></button>
          </article>
        </section>

        <section className="lower-grid">
          <article className="history-card glass-card">
            <div className="section-heading"><div><span className="section-kicker">HISTORY</span><h2>Recent attendance</h2></div><button className="text-button" onClick={() => setActive('Attendance')}>View all <ArrowRight size={15} /></button></div>
            <div className="attendance-list">
              {loading ? <div className="loading-state">Loading live attendance…</div> : attendance.length ? attendance.map((item) => <div className="attendance-row" key={item.id}><div className="course-badge"><GraduationCap size={18} /></div><div className="attendance-course"><strong>{item.subject_name}</strong><span>{item.subject_code}</span></div><div className="attendance-time"><strong>{new Date(item.attendance_date).toLocaleDateString()}</strong><span>{item.classroom_name || 'Lecture'}</span></div><div className={`status ${item.status === 'present' ? 'emerald' : 'amber'}`}><i />{item.status}</div><ChevronRight className="row-arrow" size={17} /></div>) : <div className="loading-state">No attendance rows found yet.</div>}
            </div>
            <button className="export-button" onClick={handleExport}><ArrowDownToLine size={16} /> Export attendance</button>
          </article>
          <article className="moment-card">
            <div className="moment-glow" /><div className="moment-content"><div className="achievement"><Heart size={17} fill="currentColor" /> <span>YOU’RE ON FIRE</span></div><h2>Consistency looks<br />good on you.</h2><p>You’ve maintained a live attendance rate from your latest Supabase records. Keep your momentum going.</p><div className="progress-row"><div className="progress"><span /></div><b>{attendancePercentage}</b></div></div>
          </article>
        </section>
      </main>

      <nav className="bottom-nav" aria-label="Mobile navigation">
        {navigation.map(({ label, icon: Icon }) => <button key={label} onClick={() => setActive(label)} className={active === label ? 'active' : ''}><Icon size={20} /><span>{label}</span></button>)}
      </nav>

      {showMenu && <div className="mobile-overlay"><div className="mobile-drawer"><div className="drawer-header"><Logo /><button onClick={() => setShowMenu(false)} aria-label="Close navigation"><X size={20} /></button></div>{navigation.map(({label, icon: Icon}) => <button key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => {setActive(label);setShowMenu(false)}}><Icon size={19}/><span>{label}</span></button>)}<hr/><button className="nav-item" onClick={onLogout}><UserRound size={19}/><span>Logout</span></button></div></div>}
      {notice && <div className="notice-popover"><div><strong>Live updates</strong><button onClick={() => setNotice(false)}><X size={15} /></button></div><p>{unreadCount > 0 ? `${unreadCount} unread updates from Supabase.` : 'All caught up. No new notifications right now.'}</p></div>}
      {showModal && <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowModal(false)}><section className="attendance-modal" role="dialog" aria-modal="true" aria-labelledby="modal-heading" onMouseDown={event => event.stopPropagation()}><button className="modal-close" onClick={() => setShowModal(false)} aria-label="Close"><X size={19}/></button><div className="modal-icon"><ShieldCheck size={25}/></div><span className="section-kicker">SECURE CHECK-IN</span><h2 id="modal-heading">Ready to mark attendance?</h2><p>Your submission will be sent securely for your instructor’s review.</p><div className="session-detail"><div><BookOpen size={19}/><span><strong>{nextClass?.subject_name || 'No subject'}</strong><small>{nextClass?.room || 'No room'} • {nextClass?.start_time || '--'}</small></span></div><div><MapPin size={19}/><span><strong>{nextClass?.room || 'Room TBD'}</strong><small>Live schedule</small></span></div></div><button className="primary-button modal-submit" onClick={handleMarkAttendance}><Check size={18}/> Confirm attendance</button></section></div>}
    </div>
  )
}
