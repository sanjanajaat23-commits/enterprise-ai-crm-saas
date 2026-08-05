import { useEffect, useState } from 'react'
import api from '../api'

export default function Dashboard() {
  const [deals, setDeals] = useState([])
  const [contacts, setContacts] = useState([])
  const [newContact, setNewContact] = useState({ name: '', email: '', job_title: '', notes: '' })

  const loadData = async () => {
    const [dealsRes, contactsRes] = await Promise.all([
      api.get('/deals'),
      api.get('/contacts'),
    ])
    setDeals(dealsRes.data)
    setContacts(contactsRes.data)
  }

  useEffect(() => { loadData() }, [])

  const addContact = async (e) => {
    e.preventDefault()
    await api.post('/contacts', newContact)
    setNewContact({ name: '', email: '', job_title: '', notes: '' })
    loadData()
  }

  const totalValue = deals.reduce((sum, d) => sum + Number(d.value || 0), 0)

  return (
    <div className="container">
      <h2>Dashboard</h2>

      <div className="card">
        <strong>Pipeline value:</strong> ${totalValue.toLocaleString()} across {deals.length} deals
      </div>

      <div className="card">
        <h3>Add contact</h3>
        <form onSubmit={addContact}>
          <input placeholder="Name" required
            value={newContact.name}
            onChange={e => setNewContact({ ...newContact, name: e.target.value })} />
          <input placeholder="Email" type="email"
            value={newContact.email}
            onChange={e => setNewContact({ ...newContact, email: e.target.value })} />
          <input placeholder="Job title"
            value={newContact.job_title}
            onChange={e => setNewContact({ ...newContact, job_title: e.target.value })} />
          <textarea placeholder="Notes (used as AI context)"
            value={newContact.notes}
            onChange={e => setNewContact({ ...newContact, notes: e.target.value })} />
          <button type="submit">Add contact</button>
        </form>
      </div>

      <div className="card">
        <h3>Contacts ({contacts.length})</h3>
        {contacts.map(c => (
          <div key={c.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <strong>{c.name}</strong> — {c.job_title || 'No title'} — {c.email}
          </div>
        ))}
      </div>
    </div>
  )
}
