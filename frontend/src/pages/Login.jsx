import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ company_name: '', admin_email: '', admin_password: '', admin_full_name: '' })
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = mode === 'signup'
        ? await api.post('/auth/signup', form)
        : await api.post('/auth/login', loginForm)

      if (!res.data?.access_token) throw new Error('Authentication response did not include a token.')
      localStorage.setItem('token', res.data.access_token)
      window.location.replace('/dashboard')
    } catch (err) {
      const detail = err.response?.data?.detail
      const validation = Array.isArray(detail) ? detail.map(item => item.msg).join(', ') : detail
      setError(validation || err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-brand"><div className="brand-mark">N</div><strong>NovaCRM</strong></div>
        <div className="auth-hero">
          <div className="mini-badge">✦ AI-POWERED SALES</div>
          <h1>Turn customer data into your next best action.</h1>
          <p>One workspace for pipeline intelligence, customer context and AI-assisted selling.</p>
          <div className="proof-grid"><div><strong>24/7</strong><span>AI assistance</span></div><div><strong>100%</strong><span>Tenant isolated</span></div><div><strong>Fast</strong><span>Revenue insights</span></div></div>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-card">
          <div className="eyebrow">WELCOME TO NOVACRM</div>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your workspace'}</h2>
          <p className="muted">{mode === 'login' ? 'Sign in to your revenue workspace.' : 'Start a private CRM workspace for your team.'}</p>
          <div className="auth-tabs">
            <button type="button" className={mode === 'login' ? 'tab active' : 'tab'} onClick={() => { setMode('login'); setError('') }}>Sign in</button>
            <button type="button" className={mode === 'signup' ? 'tab active' : 'tab'} onClick={() => { setMode('signup'); setError('') }}>Create account</button>
          </div>
          {error && <div className="error-box">{error}</div>}
          <form onSubmit={submit} className="auth-form">
            {mode === 'signup' && <><label>Company name<input required placeholder="Acme Inc." value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} /></label><label>Your name<input required placeholder="Sanjana Jaat" value={form.admin_full_name} onChange={e => setForm({ ...form, admin_full_name: e.target.value })} /></label></>}
            <label>Email<input required type="email" placeholder="you@company.com" value={mode === 'signup' ? form.admin_email : loginForm.email} onChange={e => mode === 'signup' ? setForm({ ...form, admin_email: e.target.value }) : setLoginForm({ ...loginForm, email: e.target.value })} /></label>
            <label>Password<input required type="password" placeholder="••••••••" value={mode === 'signup' ? form.admin_password : loginForm.password} onChange={e => mode === 'signup' ? setForm({ ...form, admin_password: e.target.value }) : setLoginForm({ ...loginForm, password: e.target.value })} /></label>
            <button className="primary-button full-width" type="submit" disabled={loading}>{loading ? 'Working…' : mode === 'login' ? 'Sign in to workspace →' : 'Create workspace →'}</button>
          </form>
          <div className="trust-line"><span>✓</span> Private tenant-isolated workspace</div>
        </div>
      </div>
    </div>
  )
}
