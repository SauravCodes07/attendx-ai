import React, { useState } from 'react'

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
    <div className={`premium-input-group ${focused ? 'focused' : ''} ${hasValue ? 'has-value' : ''} ${className}`}>
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
