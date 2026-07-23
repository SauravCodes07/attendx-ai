import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { getAuthRedirectUrl, supabase } from '../supabase'

type AuthMode = 'login' | 'signup' | 'forgot'

export default function AuthPage({ onAuth }: { onAuth: () => void }) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: unknown, session: unknown) => {
      if (session) onAuth()
    })
    return () => subscription.unsubscribe()
  }, [onAuth])

  const title = useMemo(() => {
    if (mode === 'signup') return 'Create your account'
    if (mode === 'forgot') return 'Reset your password'
    return 'Welcome back'
  }, [mode])

  const subtitle = useMemo(() => {
    if (mode === 'signup') return 'Join AttendX AI and keep your attendance in sync.'
    if (mode === 'forgot') return 'Enter your email and we will send a reset link.'
    return 'Sign in to your personal attendance space.'
  }, [mode])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: getAuthRedirectUrl() })
        if (error) throw error
        setMessage('Check your email for the reset link.')
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: getAuthRedirectUrl(),
            data: { full_name: fullName },
          },
        })
        if (error) throw error
        if (data.user && !data.session) {
          setMessage('Verification email sent. Please confirm your inbox before logging in.')
        } else {
          onAuth()
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        if (data.session) onAuth()
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAuthRedirectUrl(),
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    setLoading(false)
    if (error) setError(error.message)
  }

  return (
    <div className="app auth-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <div className="auth-card">
        <div className="auth-card__hero">
          <div className="logo" aria-label="AttendX AI"><div className="logo-mark"><span /><span /><span /></div><span>Attend<span>X</span></span></div>
          <div className="auth-badge"><Sparkles size={14} /> Premium attendance AI</div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {message ? <div className="auth-message success">{message}</div> : null}
          {error ? <div className="auth-message error">{error}</div> : null}
          {mode === 'signup' ? (
            <label className="auth-field">
              <span>Full name</span>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ava Thompson" />
            </label>
          ) : null}
          <label className="auth-field">
            <span>Email</span>
            <div className="auth-input-wrap">
              <Mail size={16} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
          </label>
          {mode !== 'forgot' ? (
            <label className="auth-field">
              <span>Password</span>
              <div className="auth-input-wrap">
                <Lock size={16} />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
                <button type="button" className="auth-icon-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
          ) : null}
          {mode === 'login' ? (
            <label className="auth-inline">
              <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} />
              <span>Remember me</span>
            </label>
          ) : null}
          <button className="primary-button auth-submit" disabled={loading} type="submit">
            {loading ? 'Working…' : mode === 'forgot' ? 'Send reset link' : mode === 'signup' ? 'Create account' : 'Sign in'} <ArrowRight size={16} />
          </button>
          {mode === 'login' ? (
            <>
              <button type="button" className="auth-secondary" onClick={handleGoogle} disabled={loading}>Continue with Google</button>
              <div className="auth-links">
                <button type="button" className="link-btn" onClick={() => setMode('forgot')}>Forgot password?</button>
                <button type="button" className="link-btn" onClick={() => setMode('signup')}>Create account</button>
              </div>
            </>
          ) : (
            <div className="auth-links">
              <button type="button" className="link-btn" onClick={() => setMode('login')}>Back to sign in</button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
