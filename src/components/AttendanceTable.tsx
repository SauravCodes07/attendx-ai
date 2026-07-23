import React from 'react'
import { Plus, ArrowDownToLine, CalendarX } from 'lucide-react'
import type { AttendanceRecord } from '../types'
import EmptyState from './EmptyState'

interface AttendanceTableProps {
  pagedAttendance: AttendanceRecord[]
  attendance: AttendanceRecord[]
  search: string
  setSearch: (val: string) => void
  statusFilter: string
  setStatusFilter: (val: string) => void
  sortKey: 'date' | 'subject' | 'status'
  setSortKey: (key: 'date' | 'subject' | 'status') => void
  page: number
  pageCount: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  onAddClick: () => void
  onEdit: (row: AttendanceRecord) => void
  onDelete: (id: string) => void
  onExportClick: () => void
}

export default function AttendanceTable({
  pagedAttendance,
  attendance,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  sortKey,
  setSortKey,
  page,
  pageCount,
  setPage,
  onAddClick,
  onEdit,
  onDelete,
  onExportClick,
}: AttendanceTableProps) {
  return (
    <section className="panel-card glass-card">
      <div className="section-heading">
        <div>
          <span className="section-kicker">ATTENDANCE</span>
          <h2>Manage attendance</h2>
        </div>
        <button className="primary-button" onClick={onAddClick}>
          <Plus size={18} /> Add record
        </button>
      </div>

      <div className="filters-row">
        <label className="control-group">
          <span>Search</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by subject or code"
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(247,248,252,.9)',
              border: '1px solid var(--line)',
            }}
          />
        </label>
        <label className="control-group">
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
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
        <label className="control-group">
          <span>Sort</span>
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as 'date' | 'subject' | 'status')}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(247,248,252,.9)',
              border: '1px solid var(--line)',
              color: 'inherit',
              outline: 'none',
            }}
          >
            <option value="date">Date</option>
            <option value="subject">Subject</option>
            <option value="status">Status</option>
          </select>
        </label>
      </div>

      {pagedAttendance.length > 0 ? (
        <>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Classroom</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pagedAttendance.map((row) => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 600 }}>{row.subject_name}</td>
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
                    <td>{row.classroom_name || '—'}</td>
                    <td>
                      <button
                        className="text-button"
                        onClick={() => onEdit(row)}
                        style={{ marginRight: '12px' }}
                      >
                        Edit
                      </button>
                      <button className="text-button danger" onClick={() => onDelete(row.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="section-heading" style={{ marginTop: 12 }}>
            <span className="helper-text">
              Page {page} of {pageCount}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="subtle-button"
                disabled={page <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </button>
              <button
                className="subtle-button"
                disabled={page >= pageCount}
                onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          icon={CalendarX}
          title="No attendance data found"
          description={
            attendance.length === 0
              ? 'You have not added any attendance records yet.'
              : 'No records match your search query and filters.'
          }
          actionLabel={attendance.length === 0 ? 'Add Attendance Record' : undefined}
          onAction={attendance.length === 0 ? onAddClick : undefined}
        />
      )}

      {attendance.length > 0 && (
        <button className="export-button" onClick={onExportClick}>
          <ArrowDownToLine size={16} /> Download report
        </button>
      )}
    </section>
  )
}
