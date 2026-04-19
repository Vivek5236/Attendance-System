import { useState } from 'react'
import { useGetMyOvertimeQuery, useRequestOvertimeMutation } from '../../services/overtimeApi'
import { useGetMyAttendanceQuery } from '../../services/attendanceApi'

export default function MyOvertime() {
  const { data: otData, isLoading } = useGetMyOvertimeQuery()
  const { data: attData } = useGetMyAttendanceQuery({ limit: 30 })
  const [requestOT, { isLoading: requesting }] = useRequestOvertimeMutation()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ attendanceId: '', requestedHours: '', reason: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const otRecords = otData?.data || []
  // Only show attendance records that don't already have an OT request
  const existingOTAttIds = new Set(otRecords.map(o => o.attendanceId?._id))
  const eligibleAttendance = (attData?.data || []).filter(a => a.punchOutTime && !existingOTAttIds.has(a._id))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      await requestOT(form).unwrap()
      setSuccess('Overtime request submitted successfully!')
      setForm({ attendanceId: '', requestedHours: '', reason: '' })
      setShowForm(false)
    } catch (err) {
      setError(err.data?.message || 'Request failed')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">My Overtime</div>
          <div className="page-sub">Request and track overtime</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }}>
          {showForm ? '✕ Cancel' : '+ Request OT'}
        </button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* OT Request Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-title">New Overtime Request</div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">SELECT ATTENDANCE DATE</label>
              <select className="form-select" value={form.attendanceId}
                onChange={e => setForm({ ...form, attendanceId: e.target.value })} required>
                <option value="">-- Select a date --</option>
                {eligibleAttendance.map(a => (
                  <option key={a._id} value={a._id}>
                    {a.date} — {a.totalWorkingHours}h worked
                  </option>
                ))}
              </select>
              {eligibleAttendance.length === 0 && (
                <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px' }}>
                  No eligible attendance records (must be punched out and no existing OT request)
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">OVERTIME HOURS REQUESTED</label>
              <input className="form-input" type="number" min="0.5" max="8" step="0.5"
                value={form.requestedHours}
                onChange={e => setForm({ ...form, requestedHours: e.target.value })}
                placeholder="e.g. 2" required />
            </div>
            <div className="form-group">
              <label className="form-label">REASON</label>
              <textarea className="form-input" rows={3} value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                placeholder="Describe why overtime is needed..." required
                style={{ resize: 'vertical' }} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={requesting}>
              {requesting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      )}

      {/* OT List */}
      <div className="card">
        <div className="card-title">Overtime History</div>
        {isLoading ? (
          <div className="loading"><div className="spinner" />Loading...</div>
        ) : otRecords.length === 0 ? (
          <div className="empty"><div className="empty-icon">⧗</div>No overtime requests yet</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Requested Hrs</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Review Note</th>
                  <th>Reviewed By</th>
                </tr>
              </thead>
              <tbody>
                {otRecords.map(ot => (
                  <tr key={ot._id}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{ot.date}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{ot.requestedHours}h</td>
                    <td style={{ maxWidth: '200px', fontSize: '13px' }}>{ot.reason}</td>
                    <td><span className={`badge badge-${ot.status}`}>{ot.status}</span></td>
                    <td style={{ fontSize: '12px', color: 'var(--text2)' }}>{ot.reviewNote || '—'}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text2)' }}>{ot.reviewedBy?.name || '—'}</td>
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
