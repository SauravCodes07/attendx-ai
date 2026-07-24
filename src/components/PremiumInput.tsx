import React, { useRef, useState } from 'react'
import { UploadCloud, User } from 'lucide-react'

interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function PremiumInput({ label, value, onFocus, onBlur, className = '', ...props }: PremiumInputProps) {
  const [focused, setFocused] = useState(false)
  const hasValue = value !== undefined && value !== null && value.toString() !== ''

  return (
    <div className={`premium-input-group ${focused ? 'focused' : ''} ${hasValue ? 'has-value' : ''} ${className}`}>
      <label>{label}</label>
      <input
        className="premium-input"
        value={value}
        onFocus={(e) => {
          setFocused(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          onBlur?.(e)
        }}
        {...props}
      />
    </div>
  )
}

interface PremiumSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  children: React.ReactNode
}

export function PremiumSelect({ label, value, onFocus, onBlur, children, className = '', ...props }: PremiumSelectProps) {
  const [focused, setFocused] = useState(false)
  const hasValue = value !== undefined && value !== null && value.toString() !== ''

  return (
    <div className={`premium-input-group ${focused ? 'focused' : ''} ${hasValue ? 'has-value' : ''} ${className}`}>
      <label>{label}</label>
      <select
        className="premium-select"
        value={value}
        onFocus={(e) => {
          setFocused(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          onBlur?.(e)
        }}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

interface PremiumTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

export function PremiumTextarea({ label, value, onFocus, onBlur, className = '', ...props }: PremiumTextareaProps) {
  const [focused, setFocused] = useState(false)
  const hasValue = value !== undefined && value !== null && value.toString() !== ''

  return (
    <div className={`premium-input-group premium-input-group--textarea ${focused ? 'focused' : ''} ${hasValue ? 'has-value' : ''} ${className}`}>
      <label>{label}</label>
      <textarea
        className="premium-textarea"
        value={value}
        onFocus={(e) => {
          setFocused(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          onBlur?.(e)
        }}
        {...props}
      />
    </div>
  )
}

interface PremiumDatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

export function PremiumDatePicker({ label, value, onFocus, onBlur, className = '', ...props }: PremiumDatePickerProps) {
  const [focused, setFocused] = useState(false)
  const hasValue = value !== undefined && value !== null && value.toString() !== ''

  return (
    <div className={`premium-input-group ${focused ? 'focused' : ''} ${hasValue ? 'has-value' : ''} ${className}`}>
      <label>{label}</label>
      <input
        type="date"
        className="premium-input premium-date"
        value={value}
        onFocus={(e) => {
          setFocused(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          onBlur?.(e)
        }}
        {...props}
      />
    </div>
  )
}

interface PremiumFileUploadProps {
  label?: string
  hint?: string
  previewUrl?: string | null
  initials?: string
  onFileSelect: (file: File) => void
  accept?: string
  optional?: boolean
  className?: string
}

export function PremiumFileUpload({
  label = 'Profile photo',
  hint = 'Click to upload or drag a photo',
  previewUrl,
  initials = 'U',
  onFileSelect,
  accept = 'image/*',
  optional = false,
  className = '',
}: PremiumFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
  }

  return (
    <div className={`premium-file-upload-wrap ${className}`}>
      {label && (
        <span className="premium-file-upload-label">
          {label}
          {optional && <em> (optional)</em>}
        </span>
      )}
      <button
        type="button"
        className="premium-file-upload"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="premium-file-upload__preview">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" />
          ) : (
            <User size={20} />
          )}
        </div>
        <div className="premium-file-upload__copy">
          <strong>{previewUrl ? 'Change photo' : 'Upload photo'}</strong>
          <span>{hint}</span>
        </div>
        <UploadCloud size={18} className="premium-file-upload__icon" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </div>
  )
}
