import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, Newspaper, ShieldCheck, LogOut, Globe, PenLine } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getInitials } from '../utils/format'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/market', icon: TrendingUp, label: 'Market Prices' },
  { to: '/news', icon: Newspaper, label: 'News Feed' },
]

const editorItems = [
  { to: '/my-reports', icon: PenLine, label: 'My Reports' },
]

const adminItems = [
  { to: '/admin', icon: ShieldCheck, label: 'Admin Panel' },
]

export default function Sidebar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'admin'
  const isEditor = user?.role === 'editor'

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">SC</div>
        <div className="logo-text">
          <span className="logo-title">SupplyChain</span>
          <span className="logo-sub">Nigeria · Market Intel</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <div className="sidebar-section-label">Main</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="nav-icon" size={18} />
              {item.label}
            </NavLink>
          ))}
        </div>

        {isAuthenticated && isEditor && (
          <div className="sidebar-section" style={{ marginTop: '8px' }}>
            <div className="sidebar-section-label">Editor</div>
            {editorItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon className="nav-icon" size={18} />
                {item.label}
              </NavLink>
            ))}
          </div>
        )}

        {isAuthenticated && isAdmin && (
          <div className="sidebar-section" style={{ marginTop: '8px' }}>
            <div className="sidebar-section-label">Admin</div>
            {adminItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon className="nav-icon" size={18} />
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        {isAuthenticated ? (
          <>
            <div className="user-pill" style={{ marginBottom: '8px' }}>
              <div className="user-avatar">{getInitials(user.username)}</div>
              <div className="user-info">
                <div className="user-name">{user.username}</div>
                <div className="user-role">{user.role}</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={handleLogout}>
              <LogOut size={14} /> Sign Out
            </button>
          </>
        ) : (
          <NavLink to="/login" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
            Sign In
          </NavLink>
        )}

        <div style={{ marginTop: '12px', padding: '8px', borderRadius: '8px', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Globe size={12} style={{ color: 'var(--emerald)' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Data updated daily 00:00 WAT</span>
        </div>
      </div>
    </aside>
  )
}
