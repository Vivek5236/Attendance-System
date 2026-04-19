import { useState } from 'react'
import { useGetAllAttendanceQuery } from '../../services/attendanceApi'
import { useGetTeamMembersQuery } from '../../services/userApi'

export default function TeamAttendance() {
  const [filters, setFilters] = useState({ startDate: '', endDate: '', userId: '' })
  const [applied, setApplied] = useState({})

  const { data, isLoading } = useGetAllAttendanceQuery(applied)
  const { data: teamData } = useGetTeamMembersQuery()

  const records = data?.data || []
  const team = teamData?.data || []

  const applyFilters = () => setApplied({ ...filters })
  const clearFilters = () => { setFilters({ startDate: '', endDate: '', userId: '' }); setApplied({}) }

  const fmt = t => t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Team Attendance</div>
          <div className="page-sub">View all team attendance records</div>
        </div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <span className="filter-label">FROM</span>
          <input className="form-input" type="date" value={filters.startDate}
            onChange={e => setFilters({ ...filters, startDate: e.target.value })} style={{ width: '150px' }} />
        </div>
        <div className="filter-group">
          <span className="filter-label">TO</span>
          <input className="form-input" type="date" value={filters.endDate}
            onChange={e => setFilters({ ...filters, endDate: e.target.value })} style={{ width: '150px' }} />
        </div>
        <div className="filter-group">
          <span className="filter-label">MEMBER</span>
          <select className="form-select" value={filters.userId}
            onChange={e => setFilters({ ...filters, userId: e.target.value })} style={{ width: '160px' }}>
            <option value="">All Members</option>
            {team.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={applyFilters}>Apply</button>
        <button className="btn btn-secondary" onClick={clearFilters}>Clear</button>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="loading"><div className="spinner" />Loading...</div>
        ) : records.length === 0 ? (
          <div className="empty"><div className="empty-icon">◷</div>No records found</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Punch In</th>
                  <th>Punch Out</th>
                  <th>Hours</th>
                  <th>Location</th>
                  <th>Selfie</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{r.userId?.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text2)' }}>{r.userId?.department}</div>
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{r.date}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{fmt(r.punchInTime)}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{fmt(r.punchOutTime)}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>
                      {r.totalWorkingHours ? `${r.totalWorkingHours}h` : '—'}
                    </td>
                    <td style={{ fontSize: '11px', color: 'var(--text2)' }}>
                      {r.location?.latitude ? `${r.location.latitude.toFixed(3)}, ${r.location.longitude.toFixed(3)}` : '—'}
                    </td>
                    <td>
                      {r.selfie
                        ? <img src={r.selfie} alt="s" style={{ width: '36px', height: '28px', objectFit: 'cover', borderRadius: '4px' }} />
                        : '—'}
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
