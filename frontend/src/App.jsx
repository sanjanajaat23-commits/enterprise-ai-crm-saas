import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import AIAssistant from './pages/AIAssistant'

function isAuthed() {
  return !!localStorage.getItem('token')
}

function PrivateRoute({ children }) {
  return isAuthed() ? children : <Navigate to="/login" />
}

function Nav() {
  const navigate = useNavigate()
  if (!isAuthed()) return null
  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }
  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/leads">Leads</Link>
      <Link to="/assistant">AI Assistant</Link>
      <button onClick={logout} style={{ marginLeft: 'auto' }}>Logout</button>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/leads" element={<PrivateRoute><Leads /></PrivateRoute>} />
        <Route path="/assistant" element={<PrivateRoute><AIAssistant /></PrivateRoute>} />
        <Route path="*" element={<Navigate to={isAuthed() ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  )
}
