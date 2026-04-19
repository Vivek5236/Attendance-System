import { useState } from 'react'
import { useGetMyAttendanceQuery } from '../../services/attendanceApi'

export default function MyAttendance() {
  const [filters, setFilters] = useState({ startDate: '', endDate: '' })
  const [applied, setApplied] = useState({})

  const { data, isLoading } = useGetMyAttendanceQuery(applied)
  const records = data?.data || []

  const applyFilters = () => setApplied({ ...filters })
  const clearFilters = () => { setFilters({ startDate: '', endDate: '' }); setApplied({}) }

  const fmt = (t) => t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">My Attendance</div>
          <div className="page-sub">View your attendance history</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <span className="filter-label">FROM</span>
          <input className="form-input" type="date" value={filters.startDate}
            onChange={e => setFilters({ ...filters, startDate: e.target.value })} style={{ width: '160px' }} />
        </div>
        <div className="filter-group">
          <span className="filter-label">TO</span>
          <input className="form-input" type="date" value={filters.endDate}
            onChange={e => setFilters({ ...filters, endDate: e.target.value })} style={{ width: '160px' }} />
        </div>
        <button className="btn btn-primary" onClick={applyFilters}>Apply</button>
        <button className="btn btn-secondary" onClick={clearFilters}>Clear</button>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="loading"><div className="spinner" /> Loading...</div>
        ) : records.length === 0 ? (
          <div className="empty"><div className="empty-icon">◷</div>No records found</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
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
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{r.date}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{fmt(r.punchInTime)}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{fmt(r.punchOutTime)}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>
                      {r.totalWorkingHours ? `${r.totalWorkingHours}h` : '—'}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text2)' }}>
                      {r.location?.latitude
                        ? `${r.location.latitude.toFixed(3)}, ${r.location.longitude.toFixed(3)}`
                        : '—'}
                    </td>
                    <td>
                      {r.selfie ? (
                        <img src={r.selfie} alt="selfie" style={{ width: '40px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />
                      ) : '—'}
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
