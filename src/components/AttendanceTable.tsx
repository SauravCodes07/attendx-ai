import React from 'react'
import { Plus, ArrowDownToLine, CalendarX } from 'lucide-react'
import type { AttendanceRecord } from '../types'
import EmptyState from './EmptyState'
import { PremiumInput, PremiumSelect } from './PremiumInput'

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
        <PremiumInput
          label="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by subject or code"
        />
        <PremiumSelect
          label="Status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">All</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="leave">Leave</option>
        </PremiumSelect>
        <PremiumSelect
          label="Sort"
          value={sortKey}
          onChange={(event) => setSortKey(event.target.value as 'date' | 'subject' | 'status')}
        >
          <option value="date">Date</option>
          <option value="subject">Subject</option>
          <option value="status">Status</option>
        </PremiumSelect>
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
        <div style={{ padding: '24px 0', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--ink)', marginBottom: '6px' }}>0%</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>No attendance records yet</div>
        </div>
      )}

      {attendance.length > 0 && (
        <button className="export-button" onClick={onExportClick}>
          <ArrowDownToLine size={16} /> Download report
        </button>
      )}
    </section>
  )
}
