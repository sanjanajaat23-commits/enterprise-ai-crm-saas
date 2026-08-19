import { useState } from 'react'
import api from '../api'

const prompts = [
  'Which leads should I prioritize this week?',
  'Summarize my highest-value opportunities.',
  'What customer signals need attention?',
]

export default function AIAssistant() {
  const [question, setQuestion] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const ask = async e => {
    e.preventDefault(); if (!question.trim()) return
    const q = question.trim(); setLoading(true); setError('')
    try { const res = await api.post('/ai/chat', { question: q }); setHistory(prev => [...prev, { question: q, answer: res.data.answer }]); setQuestion('') }
    catch (err) { setError(err.response?.data?.detail || 'AI assistant is temporarily unavailable.') }
    finally { setLoading(false) }
  }

  return (
    <section className="page-content ai-page">
      <div className="ai-hero"><div className="ai-orb">✦</div><span className="section-kicker">NOVA INTELLIGENCE</span><h2>Your CRM, with a reasoning layer.</h2><p>Ask questions about your live customer data. Nova uses your tenant-isolated CRM context to surface useful next actions.</p></div>
      <div className="prompt-grid">{prompts.map(prompt => <button className="prompt-card" key={prompt} onClick={() => setQuestion(prompt)}><span>↗</span>{prompt}</button>)}</div>
      <div className="panel ai-chat-panel"><div className="chat-header"><div><span className="section-kicker">AI ASSISTANT</span><h3>Revenue copilot</h3></div><span className="status-pill"><span className="status-dot" /> Ready</span></div><div className="chat-history">{history.length === 0 ? <div className="empty-chat"><div className="empty-chat-icon">✦</div><h3>Ask Nova anything about your pipeline.</h3><p>Try a suggested prompt above or ask your own question.</p></div> : history.map((h, i) => <div className="chat-exchange" key={i}><div className="user-question">{h.question}</div><div className="ai-answer"><span className="ai-avatar">✦</span><p>{h.answer}</p></div></div>)}</div>{error && <div className="error-box">{error}</div>}<form onSubmit={ask} className="chat-input"><input placeholder="Ask about your leads, contacts or deals…" value={question} onChange={e => setQuestion(e.target.value)} /><button className="primary-button" disabled={loading}>{loading ? 'Thinking…' : 'Ask Nova →'}</button></form></div>
      <div className="ai-trust"><span>🔒</span><div><strong>Built for private CRM data</strong><p>Responses are grounded in the current workspace context and tenant boundaries.</p></div></div>
    </section>
  )
}
