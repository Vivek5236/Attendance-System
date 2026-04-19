import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectCurrentUser } from './features/auth/authSlice'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard'
import MyAttendance from './pages/employee/MyAttendance'
import MyOvertime from './pages/employee/MyOvertime'

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard'
import TeamAttendance from './pages/manager/TeamAttendance'
import OvertimeRequests from './pages/manager/OvertimeRequests'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AllUsers from './pages/admin/AllUsers'
import AdminAttendance from './pages/admin/AllAttendance'
import AdminOvertime from './pages/admin/AllOvertime'

// Shared Pages
import ReportsPage from './pages/ReportsPage'

// Layout
import AppLayout from './components/common/AppLayout'

// Protected route wrapper
const ProtectedRoute = ({ children, roles }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />
  return children
}

// Redirect to correct dashboard based on role
const RoleRedirect = () => {
  const user = useSelector(selectCurrentUser)
  if (user?.role === 'admin') return <Navigate to="/admin" replace />
  if (user?.role === 'manager') return <Navigate to="/manager" replace />
  return <Navigate to="/employee" replace />
}

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated)

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={isAuthenticated ? <RoleRedirect /> : <LoginPage />} />
        <Route path="/signup" element={isAuthenticated ? <RoleRedirect /> : <SignupPage />} />

        {/* Role redirect */}
        <Route path="/" element={isAuthenticated ? <RoleRedirect /> : <Navigate to="/login" replace />} />

        {/* Employee routes */}
        <Route path="/employee" element={
          <ProtectedRoute roles={['employee']}>
            <AppLayout><EmployeeDashboard /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/employee/attendance" element={
          <ProtectedRoute roles={['employee']}>
            <AppLayout><MyAttendance /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/employee/overtime" element={
          <ProtectedRoute roles={['employee']}>
            <AppLayout><MyOvertime /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/employee/reports" element={
          <ProtectedRoute roles={['employee']}>
            <AppLayout><ReportsPage /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Manager routes */}
        <Route path="/manager" element={
          <ProtectedRoute roles={['manager']}>
            <AppLayout><ManagerDashboard /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/manager/attendance" element={
          <ProtectedRoute roles={['manager']}>
            <AppLayout><TeamAttendance /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/manager/overtime" element={
          <ProtectedRoute roles={['manager']}>
            <AppLayout><OvertimeRequests /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/manager/reports" element={
          <ProtectedRoute roles={['manager']}>
            <AppLayout><ReportsPage /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AppLayout><AdminDashboard /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['admin']}>
            <AppLayout><AllUsers /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/attendance" element={
          <ProtectedRoute roles={['admin']}>
            <AppLayout><AdminAttendance /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/overtime" element={
          <ProtectedRoute roles={['admin']}>
            <AppLayout><AdminOvertime /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute roles={['admin']}>
            <AppLayout><ReportsPage /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
