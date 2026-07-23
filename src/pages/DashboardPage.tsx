import React, { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '../supabase'
import type { AttendanceRecord, NotificationItem, Profile, Subject, TimetableItem } from '../types'

// Subcomponents imports
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import StatCard from '../components/StatCard'
import WeeklyChart from '../components/WeeklyChart'
import NextClassCard from '../components/NextClassCard'
import AttendanceHistory from '../components/AttendanceHistory'
import MomentCard from '../components/MomentCard'
import AttendanceTable from '../components/AttendanceTable'
import InsightsPanel from '../components/InsightsPanel'
import TimetablePanel from '../components/TimetablePanel'
import NotificationsPanel from '../components/NotificationsPanel'
import SettingsPanel from '../components/SettingsPanel'
import ProfilePanel from '../components/ProfilePanel'
import MarkAttendanceModal from '../components/MarkAttendanceModal'
import ExportModal from '../components/ExportModal'
import SearchOverlay from '../components/SearchOverlay'
import MobileDrawer from '../components/MobileDrawer'
import Toast from '../components/Toast'
import AdminPanel from '../components/AdminPanel'

// Lucide icon helper imports
import { Target, CalendarDays, TrendingUp, Check } from 'lucide-react'

type PageKey = 'Overview' | 'Attendance' | 'Insights' | 'Timetable' | 'Notifications' | 'Settings' | 'Admin'

interface DashboardPageProps {
  profile: Profile
  onLogout: () => void
}

export default function DashboardPage({ profile, onLogout }: DashboardPageProps) {
  const [active, setActive] = useState<PageKey>('Overview')
  const [profileState, setProfileState] = useState(profile)
  const [isDark, setIsDark] = useState(profile.dark_mode)

  // Drawer & dialog overlays states
  const [showMenu, setShowMenu] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showProfilePanel, setShowProfilePanel] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  // Toast status states
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Attendance marked success banner state
  const [marked, setMarked] = useState(false)

  // Database core states
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [timetable, setTimetable] = useState<TimetableItem[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  // Table search & filter states
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortKey, setSortKey] = useState<'date' | 'subject' | 'status'>('date')
  const [page, setPage] = useState(1)
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
  }

  // Load database registers cleanly
  const loadData = async () => {
    setLoading(true)
    try {
      const [attendanceRes, subjectsRes, timetableRes, notificationsRes] = await Promise.all([
        supabase
          .from('attendance')
          .select('*')
          .eq('profile_id', profileState.id)
          .order('attendance_date', { ascending: false }),
        supabase
          .from('subjects')
          .select('*')
          .eq('profile_id', profileState.id)
          .order('name'),
        supabase
          .from('timetable')
          .select('*')
          .eq('profile_id', profileState.id)
          .order('day_of_week', { ascending: true })
          .order('start_time', { ascending: true }),
        supabase
          .from('notifications')
          .select('*')
          .eq('profile_id', profileState.id)
          .order('created_at', { ascending: false }),
      ])

      // Inline error checking to avoid page crashes
      if (attendanceRes.error) showToast(attendanceRes.error.message, 'error')
      if (subjectsRes.error) showToast(subjectsRes.error.message, 'error')
      if (timetableRes.error) showToast(timetableRes.error.message, 'error')
      if (notificationsRes.error) showToast(notificationsRes.error.message, 'error')

      if (attendanceRes.data) setAttendance(attendanceRes.data as AttendanceRecord[])
      if (subjectsRes.data) setSubjects(subjectsRes.data as Subject[])
      if (timetableRes.data) setTimetable(timetableRes.data as TimetableItem[])
      if (notificationsRes.data) setNotifications(notificationsRes.data as NotificationItem[])
    } catch (err: any) {
      showToast(err.message || 'Error occurred while synchronization with Supabase.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setProfileState(profile)
    setIsDark(profile.dark_mode)
  }, [profile])

  // Realtime Supabase change listener subscriptions
  useEffect(() => {
    loadData()

    const channel = supabase
      .channel('realtime-dashboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => {
        loadData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        loadData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timetable' }, () => {
        loadData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profileState.id])

  // Command-K keyboard listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setShowSearch((val) => !val)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Sync dark theme mode adjustments
  const toggleTheme = () => {
    const nextVal = !isDark
    setIsDark(nextVal)
    document.documentElement.classList.toggle('dark', nextVal)
    void supabase.from('profiles').update({ dark_mode: nextVal }).eq('id', profileState.id)
  }

  const handleProfileUpdate = async (updatedFields: Partial<Profile>) => {
    const { error } = await supabase
      .from('profiles')
      .update(updatedFields)
      .eq('id', profileState.id)

    if (error) {
      throw error
    }

    setProfileState((prev) => ({ ...prev, ...updatedFields }))
  }

  const handlePasswordChange = async () => {
    const nextPassword = window.prompt('Please enter your new password:')
    if (!nextPassword) return

    const { error } = await supabase.auth.updateUser({ password: nextPassword })
    if (error) {
      showToast(error.message, 'error')
    } else {
      showToast('Password changed successfully.')
    }
  }

  // Attendance metrics computations
  const totalCount = attendance.length
  const attendedCount = useMemo(() => {
    return attendance.filter((item) => item.status === 'present').length
  }, [attendance])

  const attendancePercentage = useMemo(() => {
    if (totalCount === 0) return '0%'
    return `${Math.round((attendedCount / totalCount) * 100)}%`
  }, [attendedCount, totalCount])

  const streak = useMemo(() => {
    if (attendance.length === 0) return 0
    let count = 0
    const sorted = [...attendance].sort(
      (a, b) => new Date(a.attendance_date).getTime() - new Date(b.attendance_date).getTime()
    )
    for (const item of sorted.reverse()) {
      if (item.status === 'present') count++
      else break
    }
    return count
  }, [attendance])

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => item.unread).length
  }, [notifications])

  // Timetable scheduling check-in parsing
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' })
  const todayClasses = useMemo(() => {
    return timetable.filter((item) => item.day_of_week.toLowerCase() === today.toLowerCase())
  }, [timetable, today])
  const nextClass = todayClasses[0] || timetable[0] || null

  const markNotificationRead = async (id: string) => {
    const { error } = await supabase.from('notifications').update({ unread: false }).eq('id', id)
    if (!error) {
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, unread: false } : item))
      )
    }
  }

  // Quick check-in from Overview panel modal trigger
  const handleMarkAttendance = async () => {
    if (!nextClass) return

    const payload = {
      profile_id: profileState.id,
      subject_name: nextClass.subject_name,
      subject_code: nextClass.title,
      classroom_name: nextClass.room,
      attendance_date: new Date().toISOString(),
      status: 'present' as const,
      notes: 'Smart check-in verified by dashboard beacon',
    }

    const { error } = await supabase.from('attendance').insert([payload])
    if (error) {
      showToast(error.message, 'error')
    } else {
      setMarked(true)
      setShowModal(false)
      showToast('Attendance recorded successfully!')
      setTimeout(() => setMarked(false), 4000)
      loadData()
    }
  }

  // Save manually input record or edited correction details from Attendance tab
  const handleSaveManualRecord = async (record: {
    subjectName: string
    subjectCode: string
    status: 'present' | 'absent' | 'leave'
    date: string
    notes: string
  }) => {
    const payload = {
      profile_id: profileState.id,
      subject_name: record.subjectName,
      subject_code: record.subjectCode,
      classroom_name: 'Lecture Hall',
      attendance_date: `${record.date}T12:00:00.000Z`,
      status: record.status,
      notes: record.notes || null,
    }

    let error
    if (editingRecord) {
      const res = await supabase.from('attendance').update(payload).eq('id', editingRecord.id)
      error = res.error
    } else {
      const res = await supabase.from('attendance').insert([payload])
      error = res.error
    }

    if (error) {
      showToast(error.message, 'error')
    } else {
      showToast(editingRecord ? 'Record updated.' : 'Record added successfully.')
      setEditingRecord(null)
      setShowModal(false)
      loadData()
    }
  }

  const handleEditRecordTrigger = (record: AttendanceRecord) => {
    setEditingRecord(record)
    setShowModal(true)
  }

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('Delete this record permanently?')) return

    const { error } = await supabase.from('attendance').delete().eq('id', id)
    if (error) {
      showToast(error.message, 'error')
    } else {
      showToast('Record deleted.')
      loadData()
    }
  }

  // Export spreadsheet generating engine
  const handleExport = (format: 'csv' | 'json' | 'pdf' | 'xlsx', scope: string) => {
    const scopeRows = attendance.filter((row) => {
      const date = new Date(row.attendance_date)
      const now = new Date()
      if (scope === 'today') return date.toDateString() === now.toDateString()
      if (scope === 'week') {
        const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
        return diff <= 7
      }
      if (scope === 'month') {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      }
      return true
    })

    const rows = scopeRows.length ? scopeRows : attendance
    const data = rows.map((row) => ({
      subject: row.subject_name,
      code: row.subject_code,
      date: row.attendance_date,
      status: row.status,
      notes: row.notes || '',
    }))

    const fileName = `attendx-export-${scope}-${Date.now()}`

    if (format === 'csv') {
      const csvContent = [
        'subject,code,date,status,notes',
        ...data.map((row) => `"${row.subject}","${row.code}","${row.date}","${row.status}","${row.notes}"`),
      ].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}.csv`
      link.click()
    } else if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}.json`
      link.click()
    } else if (format === 'pdf') {
      const pdfText = `ATTENDX EXPORT REPORT\nScope: ${scope}\nDate: ${new Date().toLocaleDateString()}\n\n` + 
        data.map((r) => `${r.date.slice(0, 10)} | ${r.code} | ${r.subject} | ${r.status}`).join('\n')
      const blob = new Blob([pdfText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}.txt`
      link.click()
    } else {
      const xlsxContent = `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${data
        .map(
          (row, idx) =>
            `<row r="${idx + 1}"><c t="inlineStr"><is><t>${row.subject}</t></is></c><c t="inlineStr"><is><t>${row.code}</t></is></c><c t="inlineStr"><is><t>${row.date}</t></is></c><c t="inlineStr"><is><t>${row.status}</t></is></c></row>`
        )
        .join('')}</sheetData></worksheet>`
      const blob = new Blob([xlsxContent], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}.xlsx`
      link.click()
    }

    setShowExportModal(false)
    showToast('Report downloaded successfully.')
  }

  // Filter & Page registers list state values
  const filteredAttendance = useMemo(() => {
    return attendance.filter((row) => {
      const searchText = `${row.subject_name} ${row.subject_code}`.toLowerCase()
      const matchesSearch = searchText.includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || row.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [attendance, search, statusFilter])

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

  // Weekly analytics rhythm
  const weeklyTrend = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map((day) => {
      const records = attendance.filter(
        (row) =>
          new Date(row.attendance_date).toLocaleDateString('en-US', { weekday: 'short' }) === day
      )
      const present = records.filter((row) => row.status === 'present').length
      const percent = records.length ? Math.round((present / records.length) * 100) : 0
      return { day, percent }
    })
  }, [attendance])

  const isAdmin = profileState.email === 'sauravd.it25@sbjit.edu.in'

  return (
    <div className={`app ${isDark ? 'dark' : ''}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <Sidebar
        active={active}
        setActive={setActive}
        profile={profileState}
        onLogout={onLogout}
        attendanceCount={attendance.length}
        unreadCount={unreadCount}
        isAdmin={isAdmin}
      />

      <main className="content">
        <Topbar
          active={active}
          isAdmin={isAdmin}
          unreadCount={unreadCount}
          isDark={isDark}
          toggleTheme={toggleTheme}
          onSearchClick={() => setShowSearch(true)}
          onNotificationClick={() => setActive('Notifications')}
          onExportClick={() => setShowExportModal(true)}
          onProfileClick={() => setShowProfilePanel(true)}
          onMenuClick={() => setShowMenu(true)}
          profile={profileState}
        />

        {/* Success / Marked Warning Banners */}
        {marked && (
          <div className="success-banner" style={{ marginTop: '16px' }}>
            <div>
              <Check size={18} />
            </div>
            <span>
              <strong>Attendance verified</strong> — beacon check-in completed.
            </span>
          </div>
        )}

        {/* Dashboard Overview Main Tab */}
        {active === 'Overview' && (
          <>
            <section className="stats-grid" style={{ marginTop: '24px' }}>
              <StatCard
                icon={Target}
                label="Overall attendance"
                value={attendancePercentage}
                detail="Live sync active"
                color="indigo"
              />
              <StatCard
                icon={CalendarDays}
                label="Sessions Attended"
                value={`${attendedCount} / ${totalCount}`}
                detail="Updated instantly"
                color="cyan"
              />
              <StatCard
                icon={TrendingUp}
                label="Current Streak"
                value={`${streak} days`}
                detail="Consecutive presents"
                color="violet"
              />
            </section>

            <section className="dashboard-grid">
              <WeeklyChart weeklyTrend={weeklyTrend} hasData={attendance.length > 0} />
              <NextClassCard nextClass={nextClass} onMarkClick={() => setShowModal(true)} />
            </section>

            <section className="lower-grid">
              <AttendanceHistory
                attendance={attendance.slice(0, 5)}
                loading={loading}
                onViewAllClick={() => setActive('Attendance')}
                onExportClick={() => setShowExportModal(true)}
              />
              <MomentCard attendancePercentage={attendancePercentage} streak={streak} />
            </section>
          </>
        )}

        {/* Attendance Registers List Tab */}
        {active === 'Attendance' && (
          <AttendanceTable
            pagedAttendance={pagedAttendance}
            attendance={attendance}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortKey={sortKey}
            setSortKey={setSortKey}
            page={page}
            pageCount={pageCount}
            setPage={setPage}
            onAddClick={() => {
              setEditingRecord(null)
              setShowModal(true)
            }}
            onEdit={handleEditRecordTrigger}
            onDelete={handleDeleteRecord}
            onExportClick={() => setShowExportModal(true)}
          />
        )}

        {/* Analytics Insights Tab */}
        {active === 'Insights' && (
          <InsightsPanel
            hasData={attendance.length > 0}
            attendedCount={attendedCount}
            totalCount={totalCount}
            attendancePercentage={attendancePercentage}
            streak={streak}
            unreadCount={unreadCount}
            timetableLength={timetable.length}
          />
        )}

        {/* Timetable Schedule Tab */}
        {active === 'Timetable' && <TimetablePanel timetable={timetable} />}

        {/* Notifications Inbox Tab */}
        {active === 'Notifications' && (
          <NotificationsPanel notifications={notifications} onMarkRead={markNotificationRead} />
        )}

        {/* Preferences Settings Tab */}
        {active === 'Settings' && (
          <SettingsPanel
            profile={profileState}
            onProfileUpdate={handleProfileUpdate}
            onPasswordChange={handlePasswordChange}
            onExportTrigger={handleExport}
          />
        )}

        {/* Administrative Dashboard Tab */}
        {active === 'Admin' && isAdmin && (
          <AdminPanel adminProfile={profileState} onExportClick={() => setShowExportModal(true)} />
        )}
      </main>

      {/* Global Toast Alerts */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Slide-out & Overlay Dialog Components */}
      {showModal && (
        <MarkAttendanceModal
          nextClass={nextClass}
          subjects={subjects}
          onClose={() => {
            setShowModal(false)
            setEditingRecord(null)
          }}
          onConfirmCheckin={handleMarkAttendance}
          onSaveManualRecord={handleSaveManualRecord}
          editingRecord={editingRecord}
        />
      )}

      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          isAdmin={isAdmin}
        />
      )}

      {showSearch && (
        <SearchOverlay
          onClose={() => setShowSearch(false)}
          search={search}
          setSearch={setSearch}
          attendance={attendance}
          setActiveTab={(tab) => {
            setActive(tab)
            setShowSearch(false)
          }}
        />
      )}

      {showProfilePanel && (
        <ProfilePanel
          profile={profileState}
          onClose={() => setShowProfilePanel(false)}
          onProfileUpdate={handleProfileUpdate}
          onLogout={onLogout}
          onPasswordChange={handlePasswordChange}
          onExportClick={() => {
            setShowProfilePanel(false)
            setShowExportModal(true)
          }}
          onActiveTabChange={setActive}
          attendancePercentage={attendancePercentage}
          streak={streak}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      )}

      {showMenu && (
        <MobileDrawer
          active={active}
          setActive={setActive}
          onClose={() => setShowMenu(false)}
          onLogout={onLogout}
          isAdmin={isAdmin}
          profile={profileState}
        />
      )}
    </div>
  )
}
