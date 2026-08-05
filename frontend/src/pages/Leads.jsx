import { useEffect, useState } from 'react'
import api from '../api'

function scoreClass(score) {
  if (score == null) return ''
  if (score >= 70) return 'score-high'
  if (score >= 40) return 'score-mid'
  return 'score-low'
}

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [contacts, setContacts] = useState([])
  const [newLead, setNewLead] = useState({ contact_id: '', source: '', raw_context: '' })
  const [draft, setDraft] = useState({})
  const [loadingId, setLoadingId] = useState(null)

  const load = async () => {
    const [leadsRes, contactsRes] = await Promise.all([
      api.get('/leads'),
      api.get('/contacts'),
    ])
    setLeads(leadsRes.data)
    setContacts(contactsRes.data)
  }

  useEffect(() => { load() }, [])

  const addLead = async (e) => {
    e.preventDefault()
    await api.post('/leads', { ...newLead, contact_id: Number(newLead.contact_id) })
    setNewLead({ contact_id: '', source: '', raw_context: '' })
    load()
  }

  const scoreLead = async (leadId) => {
    setLoadingId(leadId)
    try {
      await api.post('/ai/score-lead', { lead_id: leadId })
      await load()
    } finally {
      setLoadingId(null)
    }
  }

  const draftEmail = async (contactId) => {
    const res = await api.post('/ai/draft-email', {
      contact_id: contactId,
      goal: 'follow up on their interest and move toward a demo',
      tone: 'friendly professional',
    })
    setDraft({ ...draft, [contactId]: res.data.email_body })
  }

  const contactName = (id) => contacts.find(c => c.id === id)?.name || `#${id}`

  return (
    <div className="container">
      <h2>Leads</h2>

      <div className="card">
        <h3>New lead</h3>
        <form onSubmit={addLead}>
          <select required value={newLead.contact_id}
            onChange={e => setNewLead({ ...newLead, contact_id: e.target.value })}>
            <option value="">Select contact...</option>
            {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input placeholder="Source (e.g. website, referral)"
            value={newLead.source}
            onChange={e => setNewLead({ ...newLead, source: e.target.value })} />
          <textarea placeholder="Context (emails exchanged, call notes, etc — used for AI scoring)"
            value={newLead.raw_context}
            onChange={e => setNewLead({ ...newLead, raw_context: e.target.value })} />
          <button type="submit">Create lead</button>
        </form>
      </div>

      {leads.map(lead => (
        <div className="card" key={lead.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>{contactName(lead.contact_id)}</strong>
            {lead.ai_score != null && (
              <span className={`score-badge ${scoreClass(lead.ai_score)}`}>
                AI score: {Math.round(lead.ai_score)}
              </span>
            )}
          </div>
          <p style={{ color: '#666', fontSize: 13 }}>Source: {lead.source || 'n/a'} · Status: {lead.status}</p>
          {lead.ai_score_reason && <p><em>{lead.ai_score_reason}</em></p>}

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => scoreLead(lead.id)} disabled={loadingId === lead.id}>
              {loadingId === lead.id ? 'Scoring…' : 'Score with Gemini'}
            </button>
            <button onClick={() => draftEmail(lead.contact_id)}>Draft follow-up email</button>
          </div>

          {draft[lead.contact_id] && (
            <div style={{ marginTop: 10, background: '#f5f6fa', padding: 12, borderRadius: 8 }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                {draft[lead.contact_id]}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
