import { useGetAllOvertimeQuery, useReviewOvertimeMutation } from '../../services/overtimeApi'
import { useState } from 'react'

export default function AdminOvertime() {
  const { data, isLoading } = useGetAllOvertimeQuery()
  const [review] = useReviewOvertimeMutation()

  const [reviewForm, setReviewForm] = useState({ id: null, status: '', reviewNote: '' })
  const [message, setMessage] = useState('')

  const records = data?.data || []

  const submitReview = async () => {
    try {
      await review({ id: reviewForm.id, status: reviewForm.status, reviewNote: reviewForm.reviewNote }).unwrap()
      setMessage(`Request ${reviewForm.status}`)
      setReviewForm({ id: null, status: '', reviewNote: '' })
    } catch (err) {
      setMessage(err.data?.message || 'Failed')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">All Overtime</div>
          <div className="page-sub">System-wide overtime requests</div>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      {reviewForm.id && (
        <div className="card" style={{ marginBottom: '20px', borderColor: 'var(--accent2)' }}>
          <div className="card-title">Confirm {reviewForm.status}</div>
          <div className="form-group">
            <label className="form-label">NOTE</label>
            <input className="form-input" value={reviewForm.reviewNote}
              onChange={e => setReviewForm({ ...reviewForm, reviewNote: e.target.value })}
              placeholder="Optional note..." />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className={`btn ${reviewForm.status === 'approved' ? 'btn-primary' : 'btn-danger'}`}
              onClick={submitReview}>Confirm</button>
            <button className="btn btn-secondary" onClick={() => setReviewForm({ id: null, status: '', reviewNote: '' })}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        {isLoading ? (
          <div className="loading"><div className="spinner" />Loading...</div>
        ) : records.length === 0 ? (
          <div className="empty"><div className="empty-icon">⧗</div>No overtime requests</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Hours</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Reviewed By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(ot => (
                  <tr key={ot._id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{ot.userId?.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text2)' }}>{ot.userId?.department}</div>
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{ot.date}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{ot.requestedHours}h</td>
                    <td style={{ fontSize: '13px', maxWidth: '160px' }}>{ot.reason}</td>
                    <td><span className={`badge badge-${ot.status}`}>{ot.status}</span></td>
                    <td style={{ fontSize: '12px', color: 'var(--text2)' }}>{ot.reviewedBy?.name || '—'}</td>
                    <td>
                      {ot.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-sm btn-primary" onClick={() => setReviewForm({ id: ot._id, status: 'approved', reviewNote: '' })}>✓</button>
                          <button className="btn btn-sm btn-danger" onClick={() => setReviewForm({ id: ot._id, status: 'rejected', reviewNote: '' })}>✕</button>
                        </div>
                      ) : '—'}
                    </td>
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
