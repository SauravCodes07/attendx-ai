import React, { useEffect, useState } from 'react'
import {
  Check,
  Edit,
  Trash2,
  Users,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  MapPin,
  Image,
  Layers,
  ChevronDown,
  X,
} from 'lucide-react'
import { supabase } from '../supabase'
import type { AttendanceRecord, Profile } from '../types'
import EmptyState from './EmptyState'

interface AdminPanelProps {
  adminProfile: Profile
  onExportClick: () => void
}

interface AttendanceWithProfile extends AttendanceRecord {
  profiles: Profile | null
}

export default function AdminPanel({ adminProfile, onExportClick }: AdminPanelProps) {
  const [records, setRecords] = useState<AttendanceWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Bulk operations state
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Modal edit state
  const [editingRow, setEditingRow] = useState<AttendanceWithProfile | null>(null)
  const [editStatus, setEditStatus] = useState<'present' | 'absent' | 'leave'>('present')
  const [editNotes, setEditNotes] = useState('')

  // Photo viewer state
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null)

  const loadAllRecords = async () => {
    setLoading(true)
    try {
      // Query all records joining profiles
      const { data, error } = await supabase
        .from('attendance')
        .select('*, profiles(*)')
        .order('attendance_date', { ascending: false })

      if (error) throw error
      setRecords((data as any) || [])
    } catch (err: any) {
      console.error(err)
      setErrorMessage(err.message || 'Failed to retrieve administrative records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllRecords()
  }, [])

  // Action handlers
  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .update({ notes: 'Approved by Administrator' })
        .eq('id', id)

      if (error) throw error

      setSuccessMessage('Attendance verified & approved.')
      setTimeout(() => setSuccessMessage(''), 3000)
      loadAllRecords()
    } catch (err: any) {
      setErrorMessage(err.message || 'Approval action failed.')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRow) return

    try {
      const { error } = await supabase
        .from('attendance')
        .update({
          status: editStatus,
          notes: editNotes || editingRow.notes,
        })
        .eq('id', editingRow.id)

      if (error) throw error

      setSuccessMessage('Record modified successfully.')
      setTimeout(() => setSuccessMessage(''), 3000)
      setEditingRow(null)
      loadAllRecords()
    } catch (err: any) {
      setErrorMessage(err.message || 'Edit action failed.')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return

    try {
      const { error } = await supabase.from('attendance').delete().eq('id', id)
      if (error) throw error

      setSuccessMessage('Attendance record deleted.')
      setTimeout(() => setSuccessMessage(''), 3000)
      loadAllRecords()
    } catch (err: any) {
      setErrorMessage(err.message || 'Delete action failed.')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  // Bulk Operations
  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredRecords.map((r) => r.id))
    }
  }

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return

    try {
      const { error } = await supabase
        .from('attendance')
        .update({ notes: 'Bulk approved by Administrator' })
        .in('id', selectedIds)

      if (error) throw error

      setSuccessMessage(`Approved ${selectedIds.length} records successfully.`)
      setTimeout(() => setSuccessMessage(''), 3000)
      setSelectedIds([])
      loadAllRecords()
    } catch (err: any) {
      setErrorMessage(err.message || 'Bulk approval failed.')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} records?`)) return

    try {
      const { error } = await supabase.from('attendance').delete().in('id', selectedIds)
      if (error) throw error

      setSuccessMessage(`Deleted ${selectedIds.length} records.`)
      setTimeout(() => setSuccessMessage(''), 3000)
      setSelectedIds([])
      loadAllRecords()
    } catch (err: any) {
      setErrorMessage(err.message || 'Bulk delete failed.')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  // Filter records
  const filteredRecords = records.filter((row) => {
    const studentName = row.profiles?.full_name || 'unknown'
    const subject = row.subject_name || ''
    const matchesSearch =
      studentName.toLowerCase().includes(search.toLowerCase()) ||
      subject.toLowerCase().includes(search.toLowerCase()) ||
      row.subject_code.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'all' || row.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <section className="panel-card glass-card" style={{ gap: '20px' }}>
      <div className="section-heading">
        <div>
          <span className="section-kicker">ADMIN PANEL</span>
          <h2>Coordinator Control Room</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="primary-button" onClick={onExportClick}>
            <FileSpreadsheet size={16} /> Export Reports
          </button>
        </div>
      </div>

      {successMessage && <div className="auth-message success">{successMessage}</div>}
      {errorMessage && <div className="auth-message error">{errorMessage}</div>}

      <div className="filters-row" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
        <label className="control-group">
          <span>Search Student or Class</span>
          <div className="auth-input-wrap" style={{ padding: '8px 12px' }}>
            <Search size={16} style={{ color: 'var(--muted)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. Ava Thompson, Physics"
            />
          </div>
        </label>

        <label className="control-group">
          <span>Filter Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: '12px',
              background: 'rgba(247,248,252,.9)',
              border: '1px solid var(--line)',
              color: 'inherit',
              outline: 'none',
            }}
          >
            <option value="all">All</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="leave">Leave</option>
          </select>
        </label>
      </div>

      {selectedIds.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            background: 'rgba(103, 107, 255, 0.08)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 600 }}>
            {selectedIds.length} items selected for bulk actions
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="subtle-button"
              onClick={handleBulkApprove}
              style={{ color: '#39ba88', background: 'rgba(57,186,136,0.1)' }}
            >
              Approve Selected
            </button>
            <button
              className="subtle-button"
              onClick={handleBulkDelete}
              style={{ color: '#c35a5a', background: 'rgba(195,90,90,0.1)' }}
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading administrative registers...</div>
      ) : filteredRecords.length > 0 ? (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={
                      filteredRecords.length > 0 &&
                      selectedIds.length === filteredRecords.length
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Student</th>
                <th>Subject & Code</th>
                <th>Date</th>
                <th>Status</th>
                <th>Beacon/Room</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        onClick={() => {
                          if (row.profiles?.avatar_url) {
                            setPreviewPhotoUrl(row.profiles.avatar_url)
                          }
                        }}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.06)',
                          display: 'grid',
                          placeItems: 'center',
                          cursor: row.profiles?.avatar_url ? 'pointer' : 'default',
                          overflow: 'hidden',
                        }}
                      >
                        {row.profiles?.avatar_url ? (
                          <img
                            src={row.profiles.avatar_url}
                            alt="Student"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Image size={14} style={{ color: 'var(--muted)' }} />
                        )}
                      </div>
                      <div>
                        <strong style={{ fontSize: '12px', display: 'block' }}>
                          {row.profiles?.full_name || 'New Student'}
                        </strong>
                        <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                          {row.profiles?.roll_number || 'No Roll'} • {row.profiles?.branch || 'General'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>{row.subject_name}</div>
                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{row.subject_code}</span>
                  </td>
                  <td>{new Date(row.attendance_date).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`status ${
                        row.status === 'present'
                          ? 'emerald'
                          : row.status === 'absent'
                          ? 'amber'
                          : 'violet'
                      }`}
                    >
                      <i />
                      {row.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                      <MapPin size={12} style={{ color: 'var(--purple)' }} />
                      <span>{row.classroom_name || 'TBA'}</span>
                    </div>
                    {row.notes && (
                      <span
                        style={{
                          fontSize: '10px',
                          color: 'var(--muted)',
                          display: 'block',
                          maxWidth: '120px',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                        }}
                        title={row.notes}
                      >
                        {row.notes}
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="subtle-button"
                        onClick={() => handleApprove(row.id)}
                        title="Quick Approve"
                        style={{ padding: '6px', color: '#39ba88' }}
                      >
                        <Check size={14} />
                      </button>
                      <button
                        className="subtle-button"
                        onClick={() => {
                          setEditingRow(row)
                          setEditStatus(row.status)
                          setEditNotes(row.notes || '')
                        }}
                        title="Edit Details"
                        style={{ padding: '6px' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="subtle-button"
                        onClick={() => handleDelete(row.id)}
                        title="Delete Record"
                        style={{ padding: '6px', color: '#c35a5a' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No registers found"
          description="There are no attendance records in the campus workspace matching current search."
        />
      )}

      {/* Edit Dialog Overlay */}
      {editingRow && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setEditingRow(null)}>
          <form
            className="attendance-modal"
            onSubmit={handleEditSave}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ display: 'grid', gap: '14px', maxWidth: '400px' }}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setEditingRow(null)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
              Modify Attendance Register
            </h3>
            <p className="helper-text" style={{ margin: 0 }}>
              Adjust details for {editingRow.profiles?.full_name || 'student'}.
            </p>

            <label className="control-group">
              <span>Status</span>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as 'present' | 'absent' | 'leave')}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'rgba(247,248,252,.9)',
                  border: '1px solid var(--line)',
                  color: 'inherit',
                  outline: 'none',
                }}
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="leave">Leave</option>
              </select>
            </label>

            <label className="control-group">
              <span>Correction Remarks</span>
              <input
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Approved medical leave / correction entry"
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'rgba(247,248,252,.9)',
                  border: '1px solid var(--line)',
                }}
              />
            </label>

            <button className="primary-button" type="submit" style={{ marginTop: '8px' }}>
              Confirm Save
            </button>
          </form>
        </div>
      )}

      {/* Image Preview Overlay */}
      {previewPhotoUrl && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setPreviewPhotoUrl(null)}>
          <div
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '320px',
              width: '100%',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              background: 'var(--card)',
              border: '1px solid var(--line)',
            }}
          >
            <button
              onClick={() => setPreviewPhotoUrl(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 0,
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                zIndex: 10,
              }}
            >
              <X size={16} />
            </button>
            <img src={previewPhotoUrl} alt="Student Preview" style={{ width: '100%', height: '320px', objectFit: 'cover' }} />
          </div>
        </div>
      )}
    </section>
  )
}
