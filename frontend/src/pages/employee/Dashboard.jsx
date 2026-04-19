import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../features/auth/authSlice'
import { useGetMyAttendanceQuery } from '../../services/attendanceApi'
import { useGetMyOvertimeQuery } from '../../services/overtimeApi'
import PunchPanel from '../../components/attendance/PunchPanel'

export default function EmployeeDashboard() {
  const user = useSelector(selectCurrentUser)

  // Last 30 days attendance
  const today = new Date().toISOString().split('T')[0]
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data: attendanceData } = useGetMyAttendanceQuery({ startDate: monthAgo, endDate: today, limit: 30 })
  const { data: overtimeData } = useGetMyOvertimeQuery()

  const records = attendanceData?.data || []
  const otRequests = overtimeData?.data || []

  // Calculate stats
  const completed = records.filter(r => r.status === 'completed').length
  const incomplete = records.filter(r => r.status === 'incomplete').length
  const pendingOT = otRequests.filter(r => r.status === 'pending').length
  const approvedOT = otRequests.filter(r => r.status === 'approved').length

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Welcome back, {user?.name?.split(' ')[0]}</div>
          <div className="page-sub">{new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Days This Month</div>
          <div className="stat-value">{records.length}</div>
          <div className="stat-sub">Total attendance records</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed Days</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{completed}</div>
          <div className="stat-sub">≥ 8 hours worked</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Incomplete Days</div>
          <div className="stat-value" style={{ color: 'var(--warn)' }}>{incomplete}</div>
          <div className="stat-sub">&lt; 8 hours worked</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">OT Requests</div>
          <div className="stat-value" style={{ color: 'var(--accent2)' }}>{pendingOT}</div>
          <div className="stat-sub">{approvedOT} approved</div>
        </div>
      </div>

      {/* Punch Panel */}
      <PunchPanel />

      {/* Recent attendance */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-title">Recent Attendance</div>
        {records.length === 0 ? (
          <div className="empty"><div className="empty-icon">◷</div>No attendance records yet</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Punch In</th>
                  <th>Punch Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 7).map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{r.date}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>
                      {r.punchInTime ? new Date(r.punchInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>
                      {r.punchOutTime ? new Date(r.punchOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>
                      {r.totalWorkingHours ? `${r.totalWorkingHours}h` : '—'}
                    </td>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
