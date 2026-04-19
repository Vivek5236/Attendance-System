import { useState } from 'react'
import { useGetAllOvertimeQuery, useReviewOvertimeMutation } from '../../services/overtimeApi'

export default function OvertimeRequests() {
  const { data, isLoading } = useGetAllOvertimeQuery()
  const [review, { isLoading: reviewing }] = useReviewOvertimeMutation()

  const [reviewForm, setReviewForm] = useState({ id: null, status: '', reviewNote: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const records = data?.data || []

  const openReview = (id, status) => {
    setReviewForm({ id, status, reviewNote: '' })
    setMessage(''); setError('')
  }

  const submitReview = async () => {
    try {
      await review({ id: reviewForm.id, status: reviewForm.status, reviewNote: reviewForm.reviewNote }).unwrap()
      setMessage(`Request ${reviewForm.status} successfully`)
      setReviewForm({ id: null, status: '', reviewNote: '' })
    } catch (err) {
      setError(err.data?.message || 'Review failed')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">OT Requests</div>
          <div className="page-sub">Review team overtime requests</div>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Inline review panel */}
      {reviewForm.id && (
        <div className="card" style={{ marginBottom: '20px', borderColor: 'var(--accent2)' }}>
          <div className="card-title">Review — {reviewForm.status === 'approved' ? '✓ Approve' : '✕ Reject'}</div>
          <div className="form-group">
            <label className="form-label">NOTE (OPTIONAL)</label>
            <input className="form-input" type="text"
              value={reviewForm.reviewNote}
              onChange={e => setReviewForm({ ...reviewForm, reviewNote: e.target.value })}
              placeholder="Add a note for the employee..." />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className={`btn ${reviewForm.status === 'approved' ? 'btn-primary' : 'btn-danger'}`}
              onClick={submitReview} disabled={reviewing}>
              {reviewing ? '...' : `Confirm ${reviewForm.status}`}
            </button>
            <button className="btn btn-secondary" onClick={() => setReviewForm({ id: null, status: '', reviewNote: '' })}>
              Cancel
            </button>
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
                  <th>Requested</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Review Note</th>
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
                    <td style={{ fontSize: '13px', maxWidth: '180px' }}>{ot.reason}</td>
                    <td><span className={`badge badge-${ot.status}`}>{ot.status}</span></td>
                    <td style={{ fontSize: '12px', color: 'var(--text2)' }}>{ot.reviewNote || '—'}</td>
                    <td>
                      {ot.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-sm btn-primary" onClick={() => openReview(ot._id, 'approved')}>
                            Approve
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => openReview(ot._id, 'rejected')}>
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text2)' }}>
                          by {ot.reviewedBy?.name || '—'}
                        </span>
                      )}
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
