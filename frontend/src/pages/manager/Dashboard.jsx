import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../features/auth/authSlice'
import { useGetAllAttendanceQuery } from '../../services/attendanceApi'
import { useGetPendingOvertimeQuery } from '../../services/overtimeApi'
import { useGetTeamMembersQuery } from '../../services/userApi'
import { Link } from 'react-router-dom'

export default function ManagerDashboard() {
  const user = useSelector(selectCurrentUser)
  const today = new Date().toISOString().split('T')[0]

  const { data: todayAtt } = useGetAllAttendanceQuery({ startDate: today, endDate: today })
  const { data: pendingOT } = useGetPendingOvertimeQuery()
  const { data: teamData } = useGetTeamMembersQuery()

  const todayRecords = todayAtt?.data || []
  const pendingRequests = pendingOT?.data || []
  const teamMembers = teamData?.data || []

  const punchedIn = todayRecords.filter(r => r.punchInTime && !r.punchOutTime).length
  const completed = todayRecords.filter(r => r.status === 'completed').length

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Manager Dashboard</div>
          <div className="page-sub">Team overview — {new Date().toLocaleDateString()}</div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Team Size</div>
          <div className="stat-value">{teamMembers.length}</div>
          <div className="stat-sub">Assigned members</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Present Today</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{todayRecords.length}</div>
          <div className="stat-sub">{punchedIn} still working</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed Today</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{completed}</div>
          <div className="stat-sub">≥ 8 hours</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending OT</div>
          <div className="stat-value" style={{ color: 'var(--warn)' }}>{pendingRequests.length}</div>
          <div className="stat-sub">
            <Link to="/manager/overtime" style={{ color: 'var(--accent2)', fontSize: '12px' }}>Review →</Link>
          </div>
        </div>
      </div>

      {/* Today's team attendance */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-title">Today's Team Attendance</div>
        {todayRecords.length === 0 ? (
          <div className="empty"><div className="empty-icon">◷</div>No team members punched in yet today</div>
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
                {todayRecords.map(r => (
                  <tr key={r._id}>
                    <td>{r.userId?.name || '—'}</td>
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

      {/* Pending OT */}
      {pendingRequests.length > 0 && (
        <div className="card">
          <div className="card-title">Pending OT Requests</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Employee</th><th>Date</th><th>Hours</th><th>Reason</th><th></th></tr>
              </thead>
              <tbody>
                {pendingRequests.slice(0, 5).map(ot => (
                  <tr key={ot._id}>
                    <td>{ot.userId?.name}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{ot.date}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{ot.requestedHours}h</td>
                    <td style={{ fontSize: '13px', maxWidth: '200px' }}>{ot.reason}</td>
                    <td><Link to="/manager/overtime" className="btn btn-sm btn-secondary">Review</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
