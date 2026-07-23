import { useEffect, useMemo, useRef, useState } from 'react'
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
  Download,
  Grid2X2,
  GraduationCap,
  Heart,
  Home,
  LineChart,
  Lock,
  Mail,
  MapPin,
  Menu,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  UploadCloud,
  UserCog,
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
  const [profileState, setProfileState] = useState(profile)
  const [dark, setDark] = useState(profile.dark_mode)
  const [showMenu, setShowMenu] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showProfilePanel, setShowProfilePanel] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [marked, setMarked] = useState(false)
  const [notice, setNotice] = useState(false)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [timetable, setTimetable] = useState<TimetableItem[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortKey, setSortKey] = useState<'date' | 'subject' | 'status'>('date')
  const [page, setPage] = useState(1)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [settingsForm, setSettingsForm] = useState({ fullName: profile.full_name || '', email: profile.email || '', phone: profile.phone || '', bio: profile.bio || '' })
  const [profileForm, setProfileForm] = useState({
    full_name: profile.full_name || '',
    email: profile.email || '',
    phone: profile.phone || '',
    bio: profile.bio || '',
    usn: profile.usn || '',
    roll_number: profile.roll_number || '',
    branch: profile.branch || '',
    department: profile.department || '',
    year: profile.year || '',
    semester: profile.semester || '',
    section: profile.section || '',
    mobile: profile.mobile || '',
    dob: profile.dob || '',
  })
  const [savingSettings, setSavingSettings] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [settingsMessage, setSettingsMessage] = useState('')
  const [profileMessage, setProfileMessage] = useState('')
  const [uploadMessage, setUploadMessage] = useState('')
  const [formState, setFormState] = useState({ subjectId: '', status: 'present' as 'present' | 'absent' | 'leave', date: new Date().toISOString().slice(0, 10), notes: '' })
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf' | 'xlsx'>('csv')
  const [exportScope, setExportScope] = useState<'today' | 'week' | 'month' | 'semester' | 'all' | 'student' | 'class' | 'subject' | 'department' | 'semester-report'>('all')
  const [notificationPrefs, setNotificationPrefs] = useState({ email: true, push: true, digest: false })
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setProfileState(profile)
    setDark(profile.dark_mode)
    setSettingsForm({ fullName: profile.full_name || '', email: profile.email || '', phone: profile.phone || '', bio: profile.bio || '' })
    setProfileForm({
      full_name: profile.full_name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      bio: profile.bio || '',
      usn: profile.usn || '',
      roll_number: profile.roll_number || '',
      branch: profile.branch || '',
      department: profile.department || '',
      year: profile.year || '',
      semester: profile.semester || '',
      section: profile.section || '',
      mobile: profile.mobile || '',
      dob: profile.dob || '',
    })
  }, [profile])

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
    void supabase.from('profiles').update({ dark_mode: dark }).eq('id', profileState.id).then()
  }, [dark, profileState.id])

  useEffect(() => {
    const saved = window.localStorage.getItem('attendx-notification-prefs')
    if (saved) {
      try {
        setNotificationPrefs(JSON.parse(saved))
      } catch {
        // ignore
      }
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('attendx-notification-prefs', JSON.stringify(notificationPrefs))
  }, [notificationPrefs])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setShowSearch(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  async function loadData() {
    setLoading(true)
    const [attendanceRes, subjectsRes, timetableRes, notificationsRes] = await Promise.all([
      supabase.from('attendance').select('*').eq('profile_id', profileState.id).order('attendance_date', { ascending: false }).limit(12),
      supabase.from('subjects').select('*').eq('profile_id', profileState.id).order('name'),
      supabase.from('timetable').select('*').eq('profile_id', profileState.id).order('day_of_week', { ascending: true }).order('start_time', { ascending: true }),
      supabase.from('notifications').select('*').eq('profile_id', profileState.id).order('created_at', { ascending: false }).limit(8),
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

  const unreadCount = notifications.filter((item) => item.unread).length
  const filteredAttendance = useMemo(() => attendance.filter((row) => {
    const searchText = `${row.subject_name} ${row.subject_code}`.toLowerCase()
    const matchesSearch = searchText.includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || row.status === statusFilter
    return matchesSearch && matchesStatus
  }), [attendance, search, statusFilter])

  const sortedAttendance = useMemo(() => {
    const rows = [...filteredAttendance]
    rows.sort((a, b) => {
      if (sortKey === 'subject') return a.subject_name.localeCompare(b.subject_name)
      if (sortKey === 'status') return a.status.localeCompare(b.status)
      return new Date(b.attendance_date).getTime() - new Date(a.attendance_date).getTime()
    })
    return rows
  }, [filteredAttendance, sortKey])

  const pageCount = Math.max(1, Math.ceil(sortedAttendance.length / 6))
  const pagedAttendance = useMemo(() => {
    const start = (page - 1) * 6
    return sortedAttendance.slice(start, start + 6)
  }, [sortedAttendance, page])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, sortKey])

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
      profile_id: profileState.id,
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
    const scopeRows = attendance.filter((row) => {
      const date = new Date(row.attendance_date)
      const now = new Date()
      if (exportScope === 'today') return date.toDateString() === now.toDateString()
      if (exportScope === 'week') {
        const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
        return diff <= 7
      }
      if (exportScope === 'month') {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      }
      if (exportScope === 'semester') return true
      return true
    })

    const rows = scopeRows.length ? scopeRows : attendance
    const data = rows.map((row) => ({ subject: row.subject_name, code: row.subject_code, date: row.attendance_date, status: row.status, notes: row.notes || '' }))
    const fileName = `attendance-${exportScope || 'report'}`

    if (exportFormat === 'csv') {
      const csv = ['subject,code,date,status,notes', ...data.map((row) => `${row.subject},${row.code},${row.date},${row.status},${row.notes}`)]
      const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}.csv`
      link.click()
      window.URL.revokeObjectURL(url)
    } else if (exportFormat === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}.json`
      link.click()
      window.URL.revokeObjectURL(url)
    } else if (exportFormat === 'pdf') {
      const pdfContent = `%PDF-1.4\n1 0 obj<< /Type /Catalog /Pages 2 0 R>>endobj\n2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1>>endobj\n3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj\n4 0 obj<< /Length 44 >>stream\nBT /F1 12 Tf 72 720 Td (${encodeURIComponent(`Attendance export for ${profileState.full_name || 'student'}`)}) Tj ET\nendstream\nendobj\n5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000062 00000 n \n0000000119 00000 n \n0000000206 00000 n \n0000000300 00000 n \ntrailer<< /Size 6 /Root 1 0 R>>\nstartxref\n0\n%%EOF`
      const blob = new Blob([pdfContent], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } else {
      const xlsxContent = `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${data.map((row, index) => `<row r="${index + 1}"><c t="inlineStr"><is><t>${row.subject}</t></is></c><c t="inlineStr"><is><t>${row.code}</t></is></c><c t="inlineStr"><is><t>${row.date}</t></is></c><c t="inlineStr"><is><t>${row.status}</t></is></c><c t="inlineStr"><is><t>${row.notes}</t></is></c></row>`).join('')}</sheetData></worksheet>`
      const blob = new Blob([xlsxContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
    }

    setShowExportModal(false)
  }

  const handleMarkAttendance = async () => {
    if (!nextClass) return
    const payload = {
      profile_id: profileState.id,
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
      await supabase.from('profiles').update({ full_name: settingsForm.fullName, phone: settingsForm.phone, bio: settingsForm.bio }).eq('id', profileState.id)
      await supabase.auth.updateUser({ email: settingsForm.email })
      setSettingsMessage('Profile updated successfully.')
    } catch {
      setSettingsMessage('Could not update profile right now.')
    } finally {
      setSavingSettings(false)
    }
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMessage('')
    try {
      const updatePayload = {
        full_name: profileForm.full_name,
        phone: profileForm.phone,
        bio: profileForm.bio,
        usn: profileForm.usn,
        roll_number: profileForm.roll_number,
        branch: profileForm.branch,
        department: profileForm.department,
        year: profileForm.year,
        semester: profileForm.semester,
        section: profileForm.section,
        mobile: profileForm.mobile,
        dob: profileForm.dob,
      }
      await supabase.from('profiles').update(updatePayload).eq('id', profileState.id)
      if (profileForm.email && profileForm.email !== profileState.email) {
        await supabase.auth.updateUser({ email: profileForm.email })
      }
      setProfileState({ ...profileState, ...updatePayload, email: profileForm.email })
      setProfileMessage('Profile updated and synced with Supabase.')
    } catch {
      setProfileMessage('Could not update profile right now.')
    } finally {
      setSavingProfile(false)
    }
  }

  const uploadAvatar = async (file: File | null) => {
    if (!file) return
    setUploadMessage('Uploading avatar…')
    const fileName = `${profileState.id}-${file.name}`
    const { error } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
    if (error) {
      setUploadMessage(error.message)
      return
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', profileState.id)
    setProfileState({ ...profileState, avatar_url: data.publicUrl })
    setUploadMessage('Avatar uploaded and linked to your profile.')
    void loadData()
  }

  const handlePasswordChange = async () => {
    const nextPassword = window.prompt('Choose a new password for your account')
    if (!nextPassword) return
    const { error } = await supabase.auth.updateUser({ password: nextPassword })
    if (error) {
      setProfileMessage(error.message)
    } else {
      setProfileMessage('Password updated successfully.')
    }
  }

  const openGoogleAccount = () => {
    window.open('https://accounts.google.com/', '_blank', 'noopener,noreferrer')
    setProfileMessage('Google account management opened in a new tab.')
  }

  const handleAvatarClick = () => fileInputRef.current?.click()

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
          <div className="student-mini"><div className="avatar avatar-mini">{profileState.full_name?.slice(0, 2).toUpperCase() || 'US'}</div><div><strong>{profileState.full_name || 'Student'}</strong><span>{profileState.role}</span></div><MoreHorizontal size={18} /></div>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setShowMenu(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div className="crumb"><span>Student space</span><ChevronRight size={14} /><strong>{active}</strong></div>
          <div className="top-actions">
            <button className="icon-button search-button" onClick={() => setShowSearch((value) => !value)} aria-label="Search"><Search size={19} /><kbd>⌘ K</kbd></button>
            <button className="icon-button notification" onClick={() => setNotice(!notice)} aria-label="Notifications"><Bell size={19} />{unreadCount > 0 ? <b /> : null}</button>
            <button className="theme-switch" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? <Sun size={17} /> : <Moon size={17} />}</button>
            <button className="icon-button" onClick={() => setShowExportModal(true)} aria-label="Download reports"><Download size={18} /></button>
            <button className="avatar-button" onClick={() => setShowProfilePanel(true)} aria-label="Open profile panel">
              <div className="avatar">{profileState.full_name?.slice(0, 2).toUpperCase() || 'US'}</div>
            </button>
          </div>
        </header>

        {showSearch ? <div className="search-pill" style={{ marginTop: 16 }}><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search attendance records" /></div> : null}

        <section className="hero-row">
          <div><div className="eyebrow"><Sparkles size={14} /> YOUR DAY, SIMPLIFIED</div><h1>{salutation}, {profileState.full_name?.split(' ')[0] || 'Student'} <span>✦</span></h1><p>Here’s a clear view of your attendance journey.</p></div>
          <button className="primary-button" onClick={() => setShowModal(true)}><Plus size={18} /> Mark attendance</button>
        </section>

        {marked ? <div className="success-banner"><div><Check size={18} /></div><span><strong>Attendance submitted</strong> — Your latest session is now recorded.</span><button onClick={() => setMarked(false)}><X size={17} /></button></div> : null}

        {active === 'Overview' ? (
          <>
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
                      const d = weeklyTrend.map((item, index) => `${index === 0 ? 'M' : 'L'} ${index * 100 + 10} ${170 - item.percent * 1.4}`).join(' ')
                      return (
                        <>
                          <path d={`M10 170 ${d} L 610 170 Z`} fill="url(#area)"/>
                          <path d={d} fill="none" stroke="url(#line)" strokeWidth="4" strokeLinecap="round" />
                          {weeklyTrend.map((item, index) => (
                            <circle key={item.day} cx={index * 100 + 10} cy={170 - item.percent * 1.4} r="6" fill="#fff" stroke="#5d80f4" strokeWidth="3" />
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
                <button className="export-button" onClick={() => setShowExportModal(true)}><ArrowDownToLine size={16} /> Export attendance</button>
              </article>
              <article className="moment-card">
                <div className="moment-glow" /><div className="moment-content"><div className="achievement"><Heart size={17} fill="currentColor" /> <span>YOU’RE ON FIRE</span></div><h2>Consistency looks<br />good on you.</h2><p>You’ve maintained a live attendance rate from your latest Supabase records. Keep your momentum going.</p><div className="progress-row"><div className="progress"><span /></div><b>{attendancePercentage}</b></div></div>
              </article>
            </section>
          </>
        ) : null}

        {active === 'Attendance' ? (
          <section className="panel-card glass-card">
            <div className="section-heading"><div><span className="section-kicker">ATTENDANCE</span><h2>Manage attendance</h2></div><button className="primary-button" onClick={() => setShowModal(true)}><Plus size={18} /> Add record</button></div>
            <div className="filters-row">
              <label className="control-group">
                <span>Search</span>
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by subject or code" />
              </label>
              <label className="control-group">
                <span>Status</span>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="all">All</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Leave</option>
                </select>
              </label>
              <label className="control-group">
                <span>Sort</span>
                <select value={sortKey} onChange={(event) => setSortKey(event.target.value as 'date' | 'subject' | 'status')}>
                  <option value="date">Date</option>
                  <option value="subject">Subject</option>
                  <option value="status">Status</option>
                </select>
              </label>
            </div>
            <div className="table-card">
              <table className="data-table">
                <thead><tr><th>Subject</th><th>Date</th><th>Status</th><th>Classroom</th><th>Action</th></tr></thead>
                <tbody>
                  {pagedAttendance.map((row) => (
                    <tr key={row.id}>
                      <td>{row.subject_name}</td>
                      <td>{new Date(row.attendance_date).toLocaleDateString()}</td>
                      <td>{row.status}</td>
                      <td>{row.classroom_name || '—'}</td>
                      <td>
                        <button className="text-button" onClick={() => handleEdit(row)}>Edit</button>
                        <button className="text-button danger" onClick={() => void handleDelete(row.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="section-heading" style={{ marginTop: 12 }}>
              <span className="helper-text">Page {page} of {pageCount}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="subtle-button" onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
                <button className="subtle-button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Next</button>
              </div>
            </div>
            <button className="export-button" onClick={() => setShowExportModal(true)}><ArrowDownToLine size={16} /> Download report</button>
          </section>
        ) : null}

        {active === 'Insights' ? (
          <section className="insights-grid">
            <article className="panel-card glass-card">
              <div className="section-heading"><div><span className="section-kicker">INSIGHTS</span><h2>Attendance overview</h2></div></div>
              <div className="bar-list">
                {['Present', 'Absent', 'Leave'].map((label, index) => {
                  const value = index === 0 ? attendedCount : index === 1 ? Math.max(0, totalCount - attendedCount) : 1
                  return (
                    <div className="bar-item" key={label}>
                      <span>{label}</span>
                      <div className="bar-track"><i style={{ width: `${Math.max(8, value / Math.max(totalCount, 1) * 100)}%` }} /></div>
                      <strong>{value}</strong>
                    </div>
                  )
                })}
              </div>
            </article>
            <article className="panel-card glass-card">
              <div className="section-heading"><div><span className="section-kicker">LIVE</span><h2>Snapshot</h2></div></div>
              <ul className="summary-list">
                <li><span>Attendance rate</span><strong>{attendancePercentage}</strong></li>
                <li><span>Current streak</span><strong>{streak} days</strong></li>
                <li><span>Pending reminders</span><strong>{unreadCount}</strong></li>
                <li><span>Schedule items</span><strong>{timetable.length}</strong></li>
              </ul>
            </article>
          </section>
        ) : null}

        {active === 'Timetable' ? (
          <section className="panel-card glass-card">
            <div className="section-heading"><div><span className="section-kicker">TIMETABLE</span><h2>Weekly schedule</h2></div></div>
            <div className="timetable-list">
              {timetable.length ? timetable.map((item) => (
                <div className="timetable-row" key={item.id}>
                  <div><strong>{item.subject_name}</strong><span>{item.day_of_week} • {item.start_time} – {item.end_time}</span></div>
                  <div><strong>{item.room || 'TBA'}</strong><span>{item.teacher_name || 'Instructor'}</span></div>
                </div>
              )) : <div className="loading-state">No timetable rows yet.</div>}
            </div>
          </section>
        ) : null}

        {active === 'Notifications' ? (
          <section className="panel-card glass-card">
            <div className="section-heading"><div><span className="section-kicker">NOTIFICATIONS</span><h2>Inbox</h2></div></div>
            <div className="notification-list">
              {notifications.length ? notifications.map((item) => (
                <div className={`notification-item ${item.unread ? 'unread' : ''}`} key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.message}</p>
                  </div>
                  <button className="subtle-button" onClick={() => void markNotificationRead(item.id)}>{item.unread ? 'Mark read' : 'Read'}</button>
                </div>
              )) : <div className="loading-state">No notifications yet.</div>}
            </div>
          </section>
        ) : null}

        {active === 'Settings' ? (
          <section className="panel-card glass-card">
            <div className="section-heading"><div><span className="section-kicker">SETTINGS</span><h2>Preferences</h2></div></div>
            <form className="settings-form" onSubmit={saveSettings}>
              <div className="settings-grid">
                <label className="control-group">
                  <span>Full name</span>
                  <input value={settingsForm.fullName} onChange={(event) => setSettingsForm((state) => ({ ...state, fullName: event.target.value }))} />
                </label>
                <label className="control-group">
                  <span>Email</span>
                  <input type="email" value={settingsForm.email} onChange={(event) => setSettingsForm((state) => ({ ...state, email: event.target.value }))} />
                </label>
                <label className="control-group">
                  <span>Phone</span>
                  <input value={settingsForm.phone} onChange={(event) => setSettingsForm((state) => ({ ...state, phone: event.target.value }))} />
                </label>
                <label className="control-group">
                  <span>Bio</span>
                  <textarea value={settingsForm.bio} onChange={(event) => setSettingsForm((state) => ({ ...state, bio: event.target.value }))} />
                </label>
              </div>
              <button className="primary-button" type="submit" disabled={savingSettings}>{savingSettings ? 'Saving…' : 'Save settings'}</button>
              {settingsMessage ? <p className="helper-text">{settingsMessage}</p> : null}
            </form>
          </section>
        ) : null}
      </main>

      <nav className="bottom-nav" aria-label="Mobile navigation">
        {navigation.map(({ label, icon: Icon }) => <button key={label} onClick={() => setActive(label)} className={active === label ? 'active' : ''}><Icon size={20} /><span>{label}</span></button>)}
      </nav>

      {showMenu && <div className="mobile-overlay"><div className="mobile-drawer"><div className="drawer-header"><Logo /><button onClick={() => setShowMenu(false)} aria-label="Close navigation"><X size={20} /></button></div>{navigation.map(({label, icon: Icon}) => <button key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => {setActive(label);setShowMenu(false)}}><Icon size={19}/><span>{label}</span></button>)}<hr/><button className="nav-item" onClick={onLogout}><UserRound size={19}/><span>Logout</span></button></div></div>}
      {notice && <div className="notice-popover"><div><strong>Live updates</strong><button onClick={() => setNotice(false)}><X size={15} /></button></div><p>{unreadCount > 0 ? `${unreadCount} unread updates from Supabase.` : 'All caught up. No new notifications right now.'}</p></div>}
      {showModal && <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowModal(false)}><section className="attendance-modal" role="dialog" aria-modal="true" aria-labelledby="modal-heading" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setShowModal(false)} aria-label="Close"><X size={19}/></button><div className="modal-icon"><ShieldCheck size={25}/></div><span className="section-kicker">SECURE CHECK-IN</span><h2 id="modal-heading">Ready to mark attendance?</h2><p>Your submission will be sent securely for your instructor’s review.</p><div className="session-detail"><div><BookOpen size={19}/><span><strong>{nextClass?.subject_name || 'No subject'}</strong><small>{nextClass?.room || 'No room'} • {nextClass?.start_time || '--'}</small></span></div><div><MapPin size={19}/><span><strong>{nextClass?.room || 'Room TBD'}</strong><small>Live schedule</small></span></div></div><button className="primary-button modal-submit" onClick={handleMarkAttendance}><Check size={18}/> Confirm attendance</button></section></div>}
      {showProfilePanel && <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowProfilePanel(false)}><section className="profile-panel" role="dialog" aria-modal="true" aria-labelledby="profile-heading" onMouseDown={(event) => event.stopPropagation()}>
        <div className="profile-panel__hero">
          <div>
            <div className="profile-pill"><UserCog size={13} /> Premium profile</div>
            <h3 id="profile-heading">{profileState.full_name || 'Student profile'}</h3>
            <p>{profileState.email || 'Live profile data from Supabase'}</p>
          </div>
          <button className="modal-close" onClick={() => setShowProfilePanel(false)} aria-label="Close profile"><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button className="avatar-button" onClick={handleAvatarClick} aria-label="Change profile photo">
            <div className="avatar" style={{ width: 52, height: 52, borderRadius: 16 }}>{profileState.full_name?.slice(0, 2).toUpperCase() || 'US'}</div>
          </button>
          <div>
            <strong>{profileState.full_name || 'Student'}</strong>
            <p className="helper-text">{profileState.role} • {profileState.account_status || 'Active'} </p>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(event) => { void uploadAvatar(event.target.files?.[0] || null) }} />
        <div className="profile-panel__stats">
          <div className="summary-card"><strong>{attendancePercentage}</strong><span>Attendance</span></div>
          <div className="summary-card"><strong>{streak} days</strong><span>Streak</span></div>
        </div>
        {profileMessage ? <div className="auth-message success">{profileMessage}</div> : null}
        {uploadMessage ? <div className="auth-message success">{uploadMessage}</div> : null}
        <form className="profile-form-grid" onSubmit={saveProfile}>
          <label className="control-group"><span>Full name</span><input value={profileForm.full_name} onChange={(event) => setProfileForm((state) => ({ ...state, full_name: event.target.value }))} /></label>
          <label className="control-group"><span>Email</span><input type="email" value={profileForm.email} onChange={(event) => setProfileForm((state) => ({ ...state, email: event.target.value }))} /></label>
          <label className="control-group"><span>USN</span><input value={profileForm.usn} onChange={(event) => setProfileForm((state) => ({ ...state, usn: event.target.value }))} /></label>
          <label className="control-group"><span>Roll number</span><input value={profileForm.roll_number} onChange={(event) => setProfileForm((state) => ({ ...state, roll_number: event.target.value }))} /></label>
          <label className="control-group"><span>Branch</span><input value={profileForm.branch} onChange={(event) => setProfileForm((state) => ({ ...state, branch: event.target.value }))} /></label>
          <label className="control-group"><span>Department</span><input value={profileForm.department} onChange={(event) => setProfileForm((state) => ({ ...state, department: event.target.value }))} /></label>
          <label className="control-group"><span>Year</span><input value={profileForm.year} onChange={(event) => setProfileForm((state) => ({ ...state, year: event.target.value }))} /></label>
          <label className="control-group"><span>Semester</span><input value={profileForm.semester} onChange={(event) => setProfileForm((state) => ({ ...state, semester: event.target.value }))} /></label>
          <label className="control-group"><span>Section</span><input value={profileForm.section} onChange={(event) => setProfileForm((state) => ({ ...state, section: event.target.value }))} /></label>
          <label className="control-group"><span>Mobile</span><input value={profileForm.mobile} onChange={(event) => setProfileForm((state) => ({ ...state, mobile: event.target.value }))} /></label>
          <label className="control-group"><span>Date of birth</span><input value={profileForm.dob} onChange={(event) => setProfileForm((state) => ({ ...state, dob: event.target.value }))} /></label>
          <label className="control-group"><span>Bio</span><input value={profileForm.bio} onChange={(event) => setProfileForm((state) => ({ ...state, bio: event.target.value }))} /></label>
          <button className="primary-button" type="submit" style={{ gridColumn: '1 / -1' }} disabled={savingProfile}>{savingProfile ? 'Saving…' : 'Save profile'}</button>
        </form>
        <div className="profile-actions">
          <button className="profile-action-button" onClick={handlePasswordChange}><div><strong>Change password</strong><span>Secure your account</span></div><Lock size={16} /></button>
          <button className="profile-action-button" onClick={openGoogleAccount}><div><strong>Manage Google account</strong><span>Link or update sign-in</span></div><Mail size={16} /></button>
          <button className="profile-action-button" onClick={() => setNotificationPrefs((state) => ({ ...state, email: !state.email }))}><div><strong>Notification preferences</strong><span>{notificationPrefs.email ? 'Email on' : 'Email off'}</span></div><Bell size={16} /></button>
          <button className="profile-action-button" onClick={() => { setDark(!dark); setShowProfilePanel(false) }}><div><strong>Toggle dark/light mode</strong><span>{dark ? 'Dark mode on' : 'Light mode on'}</span></div>{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
          <button className="profile-action-button" onClick={() => { setActive('Settings'); setShowProfilePanel(false) }}><div><strong>Open settings</strong><span>Access preferences</span></div><Settings2 size={16} /></button>
          <button className="profile-action-button" onClick={() => { setActive('Attendance'); setShowProfilePanel(false) }}><div><strong>View attendance history</strong><span>Jump to records</span></div><CalendarDays size={16} /></button>
          <button className="profile-action-button" onClick={() => { setShowExportModal(true); setShowProfilePanel(false) }}><div><strong>Download attendance reports</strong><span>Export your data</span></div><Download size={16} /></button>
          <button className="profile-action-button" onClick={() => { void onLogout(); setShowProfilePanel(false) }}><div><strong>Log out</strong><span>Leave the workspace</span></div><UserRound size={16} /></button>
        </div>
      </section></div>}
      {showExportModal && <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowExportModal(false)}><section className="export-modal" role="dialog" aria-modal="true" aria-labelledby="export-heading" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setShowExportModal(false)} aria-label="Close export"><X size={18} /></button><div className="profile-pill"><Download size={13} /> Export tools</div><h3 id="export-heading">Download your attendance reports</h3><p className="helper-text">Students export their own data. Admins can choose wider report scopes.</p>
        <div className="filters-row" style={{ marginTop: 12 }}>
          <label className="control-group"><span>Format</span><select value={exportFormat} onChange={(event) => setExportFormat(event.target.value as 'csv' | 'json' | 'pdf' | 'xlsx')}><option value="csv">CSV</option><option value="json">JSON</option><option value="pdf">PDF</option><option value="xlsx">XLSX</option></select></label>
          <label className="control-group"><span>Scope</span><select value={exportScope} onChange={(event) => setExportScope(event.target.value as 'today' | 'week' | 'month' | 'semester' | 'all' | 'student' | 'class' | 'subject' | 'department' | 'semester-report')}>
            <option value="today">Today</option><option value="week">This week</option><option value="month">Month</option><option value="semester">Semester</option><option value="all">Complete history</option>{profileState.role.toLowerCase() === 'admin' ? <><option value="student">Individual student</option><option value="class">Class-wise</option><option value="subject">Subject-wise</option><option value="department">Department</option><option value="semester-report">Semester report</option></> : null}
          </select></label>
        </div>
        <div className="export-options">
          <div className="export-option"><div><strong>{exportFormat.toUpperCase()}</strong><span>{exportScope.replace('-', ' ')}</span></div><button className="primary-button" onClick={handleExport}>Export</button></div>
        </div>
      </section></div>}
    </div>
  )
}
