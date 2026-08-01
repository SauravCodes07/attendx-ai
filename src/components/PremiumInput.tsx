import React, { useEffect, useRef, useState } from 'react'
import { AlertCircle, Loader2, RotateCcw, Trash2, UploadCloud, User } from 'lucide-react'
import { getAvatarDisplayUrl } from '../avatar'

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
  onFileSelect: (file: File) => void | Promise<void>
  accept?: string
  optional?: boolean
  className?: string
  isUploading?: boolean
  uploadProgress?: number
  uploadStage?: string
  error?: string
  onRemove?: () => void | Promise<void>
}

export function PremiumFileUpload({
  label = 'Profile photo',
  hint = 'Click to upload or drag a photo',
  previewUrl,
  initials = 'U',
  onFileSelect,
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  optional = false,
  className = '',
  isUploading = false,
  uploadProgress = 0,
  uploadStage,
  error,
  onRemove,
}: PremiumFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const selectedFileRef = useRef<File | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [displayPreview, setDisplayPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const previewSource = localPreview || previewUrl || null

  useEffect(() => {
    let active = true
    void getAvatarDisplayUrl(previewSource).then((url) => {
      if (active) setDisplayPreview(url)
    })

    return () => {
      active = false
    }
  }, [previewSource])

  useEffect(() => () => {
    if (localPreview?.startsWith('blob:')) URL.revokeObjectURL(localPreview)
  }, [localPreview])

  const selectFile = (file: File) => {
    selectedFileRef.current = file
    if (localPreview?.startsWith('blob:')) URL.revokeObjectURL(localPreview)
    setLocalPreview(URL.createObjectURL(file))
    void onFileSelect(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) selectFile(file)
    e.target.value = ''
  }

  const handleRemove = () => {
    if (localPreview?.startsWith('blob:')) URL.revokeObjectURL(localPreview)
    selectedFileRef.current = null
    setLocalPreview(null)
    void onRemove?.()
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
        className={`premium-file-upload ${isDragging ? 'is-dragging' : ''} ${error ? 'has-error' : ''}`}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault()
          if (!isUploading) setIsDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          const file = event.dataTransfer.files?.[0]
          if (file && !isUploading) selectFile(file)
        }}
        disabled={isUploading}
        aria-busy={isUploading}
      >
        <div className="premium-file-upload__preview">
          {displayPreview ? (
            <img src={displayPreview} alt="Selected profile photo preview" />
          ) : (
            <User size={20} />
          )}
        </div>
        <div className="premium-file-upload__copy">
          <strong>{isUploading ? uploadStage || 'Uploading photo' : previewSource ? 'Change photo' : 'Upload photo'}</strong>
          <span>{isUploading ? `${uploadProgress}% complete` : isDragging ? 'Drop the image to upload' : hint}</span>
        </div>
        {isUploading ? <Loader2 size={18} className="premium-file-upload__icon spin" /> : <UploadCloud size={18} className="premium-file-upload__icon" />}
      </button>
      {isUploading && <div className="premium-file-upload__progress" aria-label={`Upload ${uploadProgress}% complete`}><span style={{ width: `${uploadProgress}%` }} /></div>}
      {error && <div className="premium-file-upload__error"><AlertCircle size={14} /><span>{error}</span></div>}
      {(selectedFileRef.current || previewUrl) && !isUploading && (
        <div className="premium-file-upload__actions">
          {error && selectedFileRef.current && <button type="button" onClick={() => selectedFileRef.current && selectFile(selectedFileRef.current)}><RotateCcw size={14} /> Retry upload</button>}
          {previewUrl && onRemove && <button type="button" onClick={handleRemove}><Trash2 size={14} /> Remove photo</button>}
        </div>
      )}
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
