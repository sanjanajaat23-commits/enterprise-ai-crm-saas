import { useState } from 'react'
import api from '../api'

export default function AIAssistant() {
  const [question, setQuestion] = useState('')
  const [history, setHistory] = useState([]) // {question, answer}
  const [loading, setLoading] = useState(false)

  const ask = async (e) => {
    e.preventDefault()
    if (!question.trim()) return
    setLoading(true)
    try {
      const res = await api.post('/ai/chat', { question })
      setHistory([...history, { question, answer: res.data.answer }])
      setQuestion('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h2>AI Assistant</h2>
      <p style={{ color: '#666' }}>Ask questions about your leads and deals — answered by Gemini using your live CRM data.</p>

      <div className="card">
        <form onSubmit={ask} style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="e.g. Which leads should I prioritize this week?"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            style={{ marginBottom: 0 }}
          />
          <button type="submit" disabled={loading}>{loading ? '...' : 'Ask'}</button>
        </form>
      </div>

      {history.slice().reverse().map((h, i) => (
        <div className="card" key={i}>
          <p><strong>Q: {h.question}</strong></p>
          <p style={{ whiteSpace: 'pre-wrap' }}>{h.answer}</p>
        </div>
      ))}
    </div>
  )
}
