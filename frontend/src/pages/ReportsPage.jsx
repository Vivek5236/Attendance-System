import { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentUser, selectToken } from '../features/auth/authSlice'
import { useGetAttendanceReportQuery } from '../services/reportApi'
import { useGetAllUsersQuery } from '../services/userApi'
import { useGetTeamMembersQuery } from '../services/userApi'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

export default function ReportsPage() {
  const user = useSelector(selectCurrentUser)
  const token = useSelector(selectToken)

  const isEmployee = user?.role === 'employee'
  const isManager = user?.role === 'manager'

  const [filters, setFilters] = useState({ startDate: '', endDate: '', userId: '' })
  const [applied, setApplied] = useState({})
  const [exporting, setExporting] = useState(null)

  // Fetch users for filter dropdown (admin/manager only)
  const { data: allUsersData } = useGetAllUsersQuery(undefined, { skip: user?.role !== 'admin' })
  const { data: teamData } = useGetTeamMembersQuery(undefined, { skip: user?.role !== 'manager' })

  const usersForFilter = user?.role === 'admin'
    ? (allUsersData?.data || []).filter(u => u.role === 'employee')
    : (teamData?.data || [])

  const { data: reportData, isLoading } = useGetAttendanceReportQuery(applied)
  const records = reportData?.data || []

  const applyFilters = () => setApplied({ ...filters })
  const clearFilters = () => { setFilters({ startDate: '', endDate: '', userId: '' }); setApplied({}) }

  // Download PDF or Excel via direct fetch with auth header
  const handleExport = async (type) => {
    setExporting(type)
    try {
      const params = new URLSearchParams(applied).toString()
      const url = `${BASE_URL}/reports/export/${type}${params ? '?' + params : ''}`
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      const blob = await res.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `attendance-report.${type === 'pdf' ? 'pdf' : 'xlsx'}`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (err) {
      console.error('Export failed', err)
    } finally {
      setExporting(null)
    }
  }

  const fmt = t => t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Reports</div>
          <div className="page-sub">Daily attendance report with export</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => handleExport('pdf')} disabled={exporting === 'pdf'}>
            {exporting === 'pdf' ? '...' : '↓ PDF'}
          </button>
          <button className="btn btn-secondary" onClick={() => handleExport('excel')} disabled={exporting === 'excel'}>
            {exporting === 'excel' ? '...' : '↓ Excel'}
          </button>
        </div>
      </div>

      {/* Filters */}
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
        {!isEmployee && (
          <div className="filter-group">
            <span className="filter-label">EMPLOYEE</span>
            <select className="form-select" value={filters.userId}
              onChange={e => setFilters({ ...filters, userId: e.target.value })} style={{ width: '180px' }}>
              <option value="">{isManager ? 'All Team' : 'All Employees'}</option>
              {usersForFilter.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
        )}
        <button className="btn btn-primary" onClick={applyFilters}>Apply Filters</button>
        <button className="btn btn-secondary" onClick={clearFilters}>Clear</button>
      </div>

      {/* Results */}
      <div className="card">
        <div className="card-title">
          {records.length} record{records.length !== 1 ? 's' : ''} found
        </div>
        {isLoading ? (
          <div className="loading"><div className="spinner" />Loading report...</div>
        ) : records.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">⊞</div>
            No records for selected filters
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {!isEmployee && <th>Name</th>}
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
                    {!isEmployee && (
                      <td>
                        <div style={{ fontWeight: 500 }}>{r.userId?.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text2)' }}>{r.userId?.department}</div>
                      </td>
                    )}
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{r.date}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{fmt(r.punchInTime)}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{fmt(r.punchOutTime)}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>
                      {r.totalWorkingHours ? `${r.totalWorkingHours}h` : '—'}
                    </td>
                    <td style={{ fontSize: '11px', color: 'var(--text2)' }}>
                      {r.location?.latitude
                        ? `${r.location.latitude.toFixed(4)}, ${r.location.longitude.toFixed(4)}`
                        : '—'}
                    </td>
                    <td>
                      {r.selfie
                        ? <img src={r.selfie} alt="selfie" style={{ width: '40px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />
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
