import React, { useState } from 'react'
import { X, ShieldCheck, BookOpen, MapPin, Check, Plus } from 'lucide-react'
import type { TimetableItem, Subject } from '../types'

interface MarkAttendanceModalProps {
  nextClass: TimetableItem | null
  subjects: Subject[]
  onClose: () => void
  onConfirmCheckin: () => void
  onSaveManualRecord: (record: {
    subjectName: string
    subjectCode: string
    status: 'present' | 'absent' | 'leave'
    date: string
    notes: string
  }) => void
  editingRecord?: {
    id: string
    subject_name: string
    status: 'present' | 'absent' | 'leave'
    attendance_date: string
    notes: string | null
  } | null
}

export default function MarkAttendanceModal({
  nextClass,
  subjects,
  onClose,
  onConfirmCheckin,
  onSaveManualRecord,
  editingRecord = null,
}: MarkAttendanceModalProps) {
  // If editing a record or clicking "Add record" from the table list
  const isManualMode = editingRecord !== null || !nextClass

  const [formState, setFormState] = useState({
    subjectId: subjects[0]?.id || '',
    status: (editingRecord?.status || 'present') as 'present' | 'absent' | 'leave',
    date: editingRecord?.attendance_date ? editingRecord.attendance_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
    notes: editingRecord?.notes || '',
  })

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedSub = subjects.find((s) => s.id === formState.subjectId) || subjects[0]
    onSaveManualRecord({
      subjectName: selectedSub?.name || 'Manual Entry',
      subjectCode: selectedSub?.code || 'MANUAL',
      status: formState.status,
      date: formState.date,
      notes: formState.notes,
    })
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="attendance-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-heading"
        onMouseDown={(event) => event.stopPropagation()}
        style={{ maxWidth: isManualMode ? '480px' : '425px' }}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={19} />
        </button>

        <div className="modal-icon">
          <ShieldCheck size={25} />
        </div>
        <span className="section-kicker">SECURE CHECK-IN</span>
        <h2 id="modal-heading">
          {editingRecord
            ? 'Edit attendance record'
            : isManualMode
            ? 'Add attendance record'
            : 'Ready to mark attendance?'}
        </h2>
        <p>
          {isManualMode
            ? 'Input the attendance status details and save them to Supabase.'
            : 'Your submission will be sent securely for your instructor’s review.'}
        </p>

        {!isManualMode ? (
          <>
            <div className="session-detail">
              <div>
                <BookOpen size={19} />
                <span>
                  <strong>{nextClass?.subject_name || 'No subject'}</strong>
                  <small>
                    {nextClass?.room || 'No room'} • {nextClass?.start_time || '--'}
                  </small>
                </span>
              </div>
              <div>
                <MapPin size={19} />
                <span>
                  <strong>{nextClass?.room || 'Room TBD'}</strong>
                  <small>Live schedule coordinates</small>
                </span>
              </div>
            </div>
            <button className="primary-button modal-submit" onClick={onConfirmCheckin}>
              <Check size={18} /> Confirm attendance
            </button>
          </>
        ) : (
          <form onSubmit={handleManualSubmit} style={{ display: 'grid', gap: '14px', marginTop: '16px' }}>
            {!editingRecord && (
              <label className="control-group">
                <span>Select Subject</span>
                <select
                  value={formState.subjectId}
                  onChange={(e) => setFormState({ ...formState, subjectId: e.target.value })}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(247,248,252,.9)',
                    border: '1px solid var(--line)',
                    color: 'inherit',
                    outline: 'none',
                  }}
                  required
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="settings-grid">
              <label className="control-group">
                <span>Status</span>
                <select
                  value={formState.status}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      status: e.target.value as 'present' | 'absent' | 'leave',
                    })
                  }
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
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
                <span>Date</span>
                <input
                  type="date"
                  value={formState.date}
                  onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                  required
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(247,248,252,.9)',
                    border: '1px solid var(--line)',
                  }}
                />
              </label>
            </div>

            <label className="control-group">
              <span>Remarks / Location Coordinates</span>
              <input
                value={formState.notes}
                onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                placeholder="Lecture Hall 3, smart beacon verified"
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(247,248,252,.9)',
                  border: '1px solid var(--line)',
                }}
              />
            </label>

            <button className="primary-button modal-submit" type="submit" style={{ marginTop: '8px' }}>
              <Plus size={18} /> {editingRecord ? 'Save Changes' : 'Add Record'}
            </button>
          </form>
        )}
      </section>
    </div>
  )
}
