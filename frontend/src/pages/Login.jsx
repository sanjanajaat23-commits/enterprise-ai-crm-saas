import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [form, setForm] = useState({
    company_name: '', admin_email: '', admin_password: '', admin_full_name: ''
  })
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/auth/signup', form)
      localStorage.setItem('token', res.data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const body = new URLSearchParams()
      body.append('username', loginForm.email)
      body.append('password', loginForm.password)
      const res = await api.post('/auth/login', body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      localStorage.setItem('token', res.data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <h1>AI CRM SaaS</h1>
      <div className="card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button onClick={() => setMode('login')} style={{ opacity: mode === 'login' ? 1 : 0.5 }}>Login</button>
          <button onClick={() => setMode('signup')} style={{ opacity: mode === 'signup' ? 1 : 0.5 }}>Sign up company</button>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <input placeholder="Email" type="email" required
              value={loginForm.email}
              onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
            <input placeholder="Password" type="password" required
              value={loginForm.password}
              onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
            <button type="submit">Login</button>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <input placeholder="Company name" required
              value={form.company_name}
              onChange={e => setForm({ ...form, company_name: e.target.value })} />
            <input placeholder="Your full name" required
              value={form.admin_full_name}
              onChange={e => setForm({ ...form, admin_full_name: e.target.value })} />
            <input placeholder="Admin email" type="email" required
              value={form.admin_email}
              onChange={e => setForm({ ...form, admin_email: e.target.value })} />
            <input placeholder="Password" type="password" required
              value={form.admin_password}
              onChange={e => setForm({ ...form, admin_password: e.target.value })} />
            <button type="submit">Create company account</button>
          </form>
        )}
      </div>
    </div>
  )
}
