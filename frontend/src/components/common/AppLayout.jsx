import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout, selectCurrentUser } from '../../features/auth/authSlice'

// Nav config per role
const NAV = {
  employee: [
    { to: '/employee', label: 'Dashboard', icon: '⬡', end: true },
    { to: '/employee/attendance', label: 'Attendance', icon: '◷' },
    { to: '/employee/overtime', label: 'Overtime', icon: '⧗' },
    { to: '/employee/reports', label: 'Reports', icon: '⊞' },
  ],
  manager: [
    { to: '/manager', label: 'Dashboard', icon: '⬡', end: true },
    { to: '/manager/attendance', label: 'Team Attendance', icon: '◷' },
    { to: '/manager/overtime', label: 'OT Requests', icon: '⧗' },
    { to: '/manager/reports', label: 'Reports', icon: '⊞' },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: '⬡', end: true },
    { to: '/admin/users', label: 'Users', icon: '◈' },
    { to: '/admin/attendance', label: 'All Attendance', icon: '◷' },
    { to: '/admin/overtime', label: 'All Overtime', icon: '⧗' },
    { to: '/admin/reports', label: 'Reports', icon: '⊞' },
  ],
}

export default function AppLayout({ children }) {
  const user = useSelector(selectCurrentUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const navItems = NAV[user?.role] || []

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          AMS <span>/ v1.0</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">{user?.role}</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <strong>{user?.name}</strong>
            <span className="role-badge">{user?.role}</span>
          </div>
          <button className="btn btn-secondary btn-sm btn-full" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
