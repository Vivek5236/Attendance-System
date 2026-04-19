import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout, selectCurrentUser } from '../features/auth/authSlice.js'

const NAV = {
  employee: [
    { to: '/employee', label: 'Dashboard', end: true },
    { to: '/employee/attendance', label: 'My Attendance' },
    { to: '/employee/overtime', label: 'Overtime' },
    { to: '/employee/reports', label: 'Reports' },
  ],
  manager: [
    { to: '/manager', label: 'Dashboard', end: true },
    { to: '/manager/attendance', label: 'Team Attendance' },
    { to: '/manager/overtime', label: 'OT Requests' },
    { to: '/manager/reports', label: 'Reports' },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/attendance', label: 'All Attendance' },
    { to: '/admin/overtime', label: 'All Overtime' },
    { to: '/admin/reports', label: 'Reports' },
  ],
}

const ROLE_COLOR = {
  employee: 'bg-blue-100 text-blue-700',
  manager: 'bg-purple-100 text-purple-700',
  admin: 'bg-red-100 text-red-700',
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 py-5 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">AttendanceMS</h1>
          <p className="text-xs text-gray-500 mt-0.5">Management System</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <div className="mb-2 px-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLOR[user?.role] || ''}`}>
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  )
}
