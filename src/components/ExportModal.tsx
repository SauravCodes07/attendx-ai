import React, { useState } from 'react'
import { X, Download } from 'lucide-react'

interface ExportModalProps {
  onClose: () => void
  onExport: (format: 'csv' | 'json' | 'pdf' | 'xlsx', scope: string) => void
  isAdmin: boolean
}

export default function ExportModal({ onClose, onExport, isAdmin }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf' | 'xlsx'>('csv')
  const [exportScope, setExportScope] = useState('all')

  const handleTrigger = () => {
    onExport(exportFormat, exportScope)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="export-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-heading"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close export">
          <X size={18} />
        </button>

        <div className="profile-pill">
          <Download size={13} /> Export tools
        </div>
        <h3 id="export-heading" style={{ margin: '12px 0 6px 0' }}>
          Download your attendance reports
        </h3>
        <p className="helper-text">
          Students export their own data. Admins can choose wider report scopes.
        </p>

        <div className="filters-row" style={{ marginTop: '16px', gap: '12px' }}>
          <label className="control-group">
            <span>Format</span>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json' | 'pdf' | 'xlsx')}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(247,248,252,.9)',
                border: '1px solid var(--line)',
                color: 'inherit',
                outline: 'none',
              }}
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="pdf">PDF</option>
              <option value="xlsx">XLSX</option>
            </select>
          </label>
          <label className="control-group">
            <span>Scope</span>
            <select
              value={exportScope}
              onChange={(e) => setExportScope(e.target.value)}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(247,248,252,.9)',
                border: '1px solid var(--line)',
                color: 'inherit',
                outline: 'none',
              }}
            >
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">Month</option>
              <option value="semester">Semester</option>
              <option value="all">Complete history</option>
              {isAdmin && (
                <>
                  <option value="student">Individual student</option>
                  <option value="class">Class-wise</option>
                  <option value="subject">Subject-wise</option>
                  <option value="department">Department</option>
                  <option value="semester-report">Semester report</option>
                </>
              )}
            </select>
          </label>
        </div>

        <div className="export-options" style={{ marginTop: '20px' }}>
          <div className="export-option">
            <div>
              <strong style={{ fontSize: '13px' }}>{exportFormat.toUpperCase()}</strong>
              <span style={{ fontSize: '11px', textTransform: 'capitalize', display: 'block', color: 'var(--muted)', marginTop: '2px' }}>
                Scope: {exportScope.replace('-', ' ')}
              </span>
            </div>
            <button className="primary-button" onClick={handleTrigger}>
              Export
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
