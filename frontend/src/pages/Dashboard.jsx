import { useEffect, useMemo, useState } from 'react'
import api from '../api'

const money = value => `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`

export default function Dashboard() {
  const [deals, setDeals] = useState([])
  const [contacts, setContacts] = useState([])
  const [newContact, setNewContact] = useState({ name: '', email: '', job_title: '', notes: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [dealsRes, contactsRes] = await Promise.all([api.get('/deals'), api.get('/contacts')])
      setDeals(Array.isArray(dealsRes.data) ? dealsRes.data : [])
      setContacts(Array.isArray(contactsRes.data) ? contactsRes.data : [])
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        window.location.replace('/login')
        return
      }
      setError(err.response?.data?.detail || 'Unable to load workspace data.')
    } finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  const addContact = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      await api.post('/contacts', newContact)
      setNewContact({ name: '', email: '', job_title: '', notes: '' })
      await loadData()
    } catch (err) {
      if (err.response?.status === 401) { localStorage.removeItem('token'); window.location.replace('/login'); return }
      setError(err.response?.data?.detail || 'Unable to create contact.')
    } finally { setSaving(false) }
  }

  const metrics = useMemo(() => {
    const pipeline = deals.reduce((sum, d) => sum + Number(d.value || 0), 0)
    const won = deals.filter(d => String(d.stage).toLowerCase().includes('won')).reduce((sum, d) => sum + Number(d.value || 0), 0)
    return { pipeline, won, open: deals.filter(d => !String(d.stage).toLowerCase().includes('lost') && !String(d.stage).toLowerCase().includes('won')).length }
  }, [deals])

  if (loading) return <section className="page-content"><div className="loading-state">Loading revenue workspace…</div></section>

  return (
    <section className="page-content">
      <div className="hero-row">
        <div><span className="section-kicker">REVENUE PULSE</span><h2>Know where to focus today.</h2><p>Track your pipeline, contacts and AI-ready customer context from one workspace.</p></div>
        <button className="primary-button" onClick={() => document.getElementById('new-contact')?.scrollIntoView({ behavior: 'smooth' })}>+ Add contact</button>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="metric-grid">
        <div className="metric-card"><span>PIPELINE VALUE</span><strong>{money(metrics.pipeline)}</strong><small>Across {deals.length} active records</small></div>
        <div className="metric-card"><span>WON REVENUE</span><strong>{money(metrics.won)}</strong><small>Closed-won pipeline</small></div>
        <div className="metric-card"><span>OPEN OPPORTUNITIES</span><strong>{metrics.open}</strong><small>Deals needing attention</small></div>
        <div className="metric-card accent"><span>CONTACTS</span><strong>{contacts.length}</strong><small>AI-ready customer profiles</small></div>
      </div>

      <div className="dashboard-grid">
        <div className="panel" id="new-contact">
          <div className="panel-heading"><div><span className="section-kicker">CUSTOMER DATA</span><h3>Add customer context</h3></div><span className="panel-icon">+</span></div>
          <p className="muted">Notes become context for lead scoring and AI-assisted outreach.</p>
          <form onSubmit={addContact} className="stack-form">
            <div className="form-row"><input placeholder="Full name" required value={newContact.name} onChange={e => setNewContact({ ...newContact, name: e.target.value })} /><input placeholder="Email" type="email" value={newContact.email} onChange={e => setNewContact({ ...newContact, email: e.target.value })} /></div>
            <input placeholder="Job title / role" value={newContact.job_title} onChange={e => setNewContact({ ...newContact, job_title: e.target.value })} />
            <textarea placeholder="Customer notes, pain points, recent conversations…" value={newContact.notes} onChange={e => setNewContact({ ...newContact, notes: e.target.value })} />
            <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Create customer profile'}</button>
          </form>
        </div>

        <div className="panel">
          <div className="panel-heading"><div><span className="section-kicker">CONTACT DIRECTORY</span><h3>Recent contacts</h3></div><span className="count-badge">{contacts.length}</span></div>
          <div className="contact-list">
            {contacts.length === 0 ? <div className="empty-state">No contacts yet. Add your first customer profile.</div> : contacts.slice(0, 8).map(c => <div className="contact-row" key={c.id}><div className="avatar small">{c.name?.slice(0, 2).toUpperCase()}</div><div><strong>{c.name}</strong><span>{c.job_title || 'Customer'} · {c.email || 'No email'}</span></div><span className="chevron">›</span></div>)}
          </div>
        </div>
      </div>

      <div className="insight-banner"><div className="insight-icon">✦</div><div><span className="section-kicker">AI REVENUE INTELLIGENCE</span><h3>Let Nova find your next best action.</h3><p>Score leads, draft follow-ups and ask questions against your live CRM context.</p></div><a className="primary-button" href="/assistant">Open AI Workspace →</a></div>
    </section>
  )
}
