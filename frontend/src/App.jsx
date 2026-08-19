import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import AIAssistant from './pages/AIAssistant'

function isAuthed() {
  return Boolean(localStorage.getItem('token'))
}

function PrivateRoute({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />
}

function AppShell({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: '⌂' },
    { to: '/leads', label: 'Leads & Pipeline', icon: '◈' },
    { to: '/assistant', label: 'AI Workspace', icon: '✦' },
  ]

  const title = location.pathname === '/leads'
    ? 'Leads & Pipeline'
    : location.pathname === '/assistant'
      ? 'AI Workspace'
      : 'Revenue Overview'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">N</div>
          <div>
            <strong>NovaCRM</strong>
            <span>AI revenue workspace</span>
          </div>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="security-note">
            <span>●</span>
            <div><strong>Private workspace</strong><small>Tenant-isolated data</small></div>
          </div>
          <button className="ghost-button full-width" onClick={logout}>Sign out</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="eyebrow">NOVA CRM / WORKSPACE</div>
            <h1>{title}</h1>
          </div>
          <div className="topbar-actions">
            <span className="status-pill"><span className="status-dot" /> AI online</span>
            <div className="avatar">SC</div>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><AppShell><Dashboard /></AppShell></PrivateRoute>} />
        <Route path="/leads" element={<PrivateRoute><AppShell><Leads /></AppShell></PrivateRoute>} />
        <Route path="/assistant" element={<PrivateRoute><AppShell><AIAssistant /></AppShell></PrivateRoute>} />
        <Route path="*" element={<Navigate to={isAuthed() ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
