import { useEffect, useMemo, useState } from 'react'
import api from '../api'

function scoreClass(score) { return score >= 70 ? 'score-high' : score >= 40 ? 'score-mid' : 'score-low' }
function money(value) { return `$${Number(value || 0).toLocaleString()}` }

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [contacts, setContacts] = useState([])
  const [newLead, setNewLead] = useState({ contact_id: '', source: '', raw_context: '' })
  const [draft, setDraft] = useState({})
  const [loadingId, setLoadingId] = useState(null)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const [leadsRes, contactsRes] = await Promise.all([api.get('/leads'), api.get('/contacts')])
      setLeads(leadsRes.data); setContacts(contactsRes.data)
    } catch (err) { setError(err.response?.data?.detail || 'Unable to load pipeline.') }
  }
  useEffect(() => { load() }, [])

  const addLead = async e => {
    e.preventDefault(); setError('')
    try { await api.post('/leads', { ...newLead, contact_id: Number(newLead.contact_id) }); setNewLead({ contact_id: '', source: '', raw_context: '' }); await load() }
    catch (err) { setError(err.response?.data?.detail || 'Unable to create lead.') }
  }

  const scoreLead = async leadId => {
    setLoadingId(leadId); setError('')
    try { await api.post('/ai/score-lead', { lead_id: leadId }); await load() }
    catch (err) { setError(err.response?.data?.detail || 'AI scoring failed. Try again.') }
    finally { setLoadingId(null) }
  }

  const draftEmail = async contactId => {
    setLoadingId(`email-${contactId}`); setError('')
    try { const res = await api.post('/ai/draft-email', { contact_id: contactId, goal: 'follow up on their interest and move toward a demo', tone: 'friendly professional' }); setDraft(prev => ({ ...prev, [contactId]: res.data.email_body })) }
    catch (err) { setError(err.response?.data?.detail || 'Email generation failed. Try again.') }
    finally { setLoadingId(null) }
  }

  const stats = useMemo(() => ({ high: leads.filter(l => l.ai_score >= 70).length, scored: leads.filter(l => l.ai_score != null).length, total: leads.length }), [leads])
  const contactName = id => contacts.find(c => c.id === id)?.name || `Contact #${id}`

  return (
    <section className="page-content">
      <div className="hero-row"><div><span className="section-kicker">PIPELINE INTELLIGENCE</span><h2>Prioritize the deals that matter.</h2><p>Use AI scoring and customer context to focus your next sales action.</p></div></div>
      {error && <div className="error-box">{error}</div>}
      <div className="metric-grid compact"><div className="metric-card"><span>TOTAL LEADS</span><strong>{stats.total}</strong><small>Active pipeline records</small></div><div className="metric-card"><span>AI-SCORED</span><strong>{stats.scored}</strong><small>Leads with intelligence</small></div><div className="metric-card accent"><span>HIGH INTENT</span><strong>{stats.high}</strong><small>Score ≥ 70 · prioritize first</small></div></div>

      <div className="panel create-lead-panel"><div className="panel-heading"><div><span className="section-kicker">NEW OPPORTUNITY</span><h3>Create a lead</h3></div></div><form onSubmit={addLead} className="stack-form"><div className="form-row"><select required value={newLead.contact_id} onChange={e => setNewLead({ ...newLead, contact_id: e.target.value })}><option value="">Select contact…</option>{contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><input placeholder="Source · website, referral, outbound…" value={newLead.source} onChange={e => setNewLead({ ...newLead, source: e.target.value })} /></div><textarea placeholder="Interaction context, pain points, buying signals…" value={newLead.raw_context} onChange={e => setNewLead({ ...newLead, raw_context: e.target.value })} /><button className="primary-button" type="submit">Create lead →</button></form></div>

      <div className="lead-list">{leads.length === 0 ? <div className="empty-state panel">No leads yet. Create one above to activate AI scoring.</div> : leads.map(lead => <article className="lead-card" key={lead.id}><div className="lead-main"><div className="lead-top"><div><span className="section-kicker">OPPORTUNITY #{lead.id}</span><h3>{contactName(lead.contact_id)}</h3></div>{lead.ai_score != null && <span className={`score-badge ${scoreClass(lead.ai_score)}`}>AI {Math.round(lead.ai_score)}</span>}</div><div className="lead-meta"><span>Source: {lead.source || 'Unknown'}</span><span>Status: {lead.status}</span></div>{lead.ai_score_reason && <div className="ai-reason"><span>✦</span><p>{lead.ai_score_reason}</p></div>}<div className="lead-actions"><button className="primary-button" onClick={() => scoreLead(lead.id)} disabled={loadingId === lead.id}>{loadingId === lead.id ? 'Analyzing…' : '✦ Score with AI'}</button><button className="secondary-button" onClick={() => draftEmail(lead.contact_id)} disabled={loadingId === `email-${lead.contact_id}`}>{loadingId === `email-${lead.contact_id}` ? 'Drafting…' : 'Draft follow-up'}</button></div>{draft[lead.contact_id] && <div className="email-draft"><div className="section-kicker">AI-GENERATED FOLLOW-UP</div><p>{draft[lead.contact_id]}</p></div>}</div></article>)}</div>
    </section>
  )
}
