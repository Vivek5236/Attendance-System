import { useGetAllUsersQuery } from '../../services/userApi'
import { useGetAllAttendanceQuery } from '../../services/attendanceApi'
import { useGetAllOvertimeQuery } from '../../services/overtimeApi'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const today = new Date().toISOString().split('T')[0]

  const { data: usersData } = useGetAllUsersQuery()
  const { data: todayAtt } = useGetAllAttendanceQuery({ startDate: today, endDate: today })
  const { data: otData } = useGetAllOvertimeQuery()

  const users = usersData?.data || []
  const todayRecords = todayAtt?.data || []
  const otRecords = otData?.data || []

  const employees = users.filter(u => u.role === 'employee').length
  const managers = users.filter(u => u.role === 'manager').length
  const pendingOT = otRecords.filter(o => o.status === 'pending').length
  const completedToday = todayRecords.filter(r => r.status === 'completed').length

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Admin Dashboard</div>
          <div className="page-sub">System overview — {new Date().toLocaleDateString()}</div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{users.length}</div>
          <div className="stat-sub">{employees} employees · {managers} managers</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Present Today</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{todayRecords.length}</div>
          <div className="stat-sub">{completedToday} completed days</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending OT</div>
          <div className="stat-value" style={{ color: 'var(--warn)' }}>{pendingOT}</div>
          <div className="stat-sub">
            <Link to="/admin/overtime" style={{ color: 'var(--accent2)', fontSize: '12px' }}>Review →</Link>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total OT Requests</div>
          <div className="stat-value" style={{ color: 'var(--accent2)' }}>{otRecords.length}</div>
          <div className="stat-sub">{otRecords.filter(o => o.status === 'approved').length} approved</div>
        </div>
      </div>

      {/* Today's attendance snapshot */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-title">Today's Attendance Snapshot</div>
        {todayRecords.length === 0 ? (
          <div className="empty"><div className="empty-icon">◷</div>No one has punched in yet today</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Punch In</th>
                  <th>Punch Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayRecords.slice(0, 8).map(r => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 500 }}>{r.userId?.name}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text2)' }}>{r.userId?.department}</td>
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

      {/* Recent users */}
      <div className="card">
        <div className="card-title">Recent Users</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th></tr>
            </thead>
            <tbody>
              {users.slice(0, 6).map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td style={{ fontSize: '13px', color: 'var(--text2)' }}>{u.email}</td>
                  <td><span className="role-badge">{u.role}</span></td>
                  <td style={{ fontSize: '13px', color: 'var(--text2)' }}>{u.department}</td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-completed' : 'badge-rejected'}`}>
                      {u.isActive ? 'active' : 'inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
