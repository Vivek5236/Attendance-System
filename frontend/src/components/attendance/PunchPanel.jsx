import { useState, useEffect } from 'react'
import {
  useGetTodayAttendanceQuery,
  usePunchInMutation,
  usePunchOutMutation,
} from '../../services/attendanceApi'
import WebcamCapture from './WebcamCapture'

export default function PunchPanel() {
  const { data, isLoading, refetch } = useGetTodayAttendanceQuery()
  const [punchIn] = usePunchInMutation()
  const [punchOut] = usePunchOutMutation()

  const [showCamera, setShowCamera] = useState(false)
  const [location, setLocation] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(false)

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Get location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => setLocation(null)
      )
    }
  }, [])

  const attendance = data?.data

  const handlePunchInClick = () => {
    setError('')
    setMessage('')
    setShowCamera(true)
  }

  const handleSelfieCapture = async (selfieBase64) => {
    setShowCamera(false)
    setLoading(true)
    try {
      await punchIn({
        selfie: selfieBase64,
        latitude: location?.latitude,
        longitude: location?.longitude,
      }).unwrap()
      setMessage('✓ Punched in successfully!')
      refetch()
    } catch (err) {
      setError(err.data?.message || 'Punch in failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePunchOut = async () => {
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const res = await punchOut().unwrap()
      setMessage(`✓ Punched out! Total: ${res.data.totalWorkingHours}h`)
      refetch()
    } catch (err) {
      setError(err.data?.message || 'Punch out failed')
    } finally {
      setLoading(false)
    }
  }

  const fmt = (t) => t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'

  if (isLoading) return <div className="loading"><div className="spinner" /> Loading...</div>

  const isPunchedIn = !!attendance?.punchInTime
  const isPunchedOut = !!attendance?.punchOutTime

  return (
    <div className="card">
      <div className="card-title">Today's Attendance</div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="punch-panel">
        {/* Left: live clock */}
        <div className="punch-status">
          <div className="punch-date">
            {currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="punch-time">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          {location ? (
            <div className="location-info">
              📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </div>
          ) : (
            <div className="location-info">📍 Location unavailable</div>
          )}
        </div>

        {/* Right: punch controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px' }}>
          {!isPunchedIn && (
            <button
              className="btn btn-primary"
              onClick={handlePunchInClick}
              disabled={loading}
            >
              {loading ? '...' : '⏵ Punch In'}
            </button>
          )}
          {isPunchedIn && !isPunchedOut && (
            <button
              className="btn btn-danger"
              onClick={handlePunchOut}
              disabled={loading}
            >
              {loading ? '...' : '⏹ Punch Out'}
            </button>
          )}

          {/* Status info */}
          {isPunchedIn && (
            <div style={{ fontSize: '13px', color: 'var(--text2)' }}>
              <div>In: <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{fmt(attendance.punchInTime)}</span></div>
              {isPunchedOut && (
                <>
                  <div>Out: <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{fmt(attendance.punchOutTime)}</span></div>
                  <div>Hours: <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{attendance.totalWorkingHours}h</span></div>
                  <div style={{ marginTop: '6px' }}>
                    <span className={`badge badge-${attendance.status}`}>{attendance.status}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {!isPunchedIn && (
            <div style={{ fontSize: '12px', color: 'var(--text2)' }}>
              Not punched in yet today
            </div>
          )}
        </div>
      </div>

      {/* Selfie preview if punched in */}
      {attendance?.selfie && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '6px', fontFamily: 'var(--mono)' }}>PUNCH-IN SELFIE</div>
          <img
            src={attendance.selfie}
            alt="Punch-in selfie"
            style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }}
          />
        </div>
      )}

      {showCamera && (
        <WebcamCapture
          onCapture={handleSelfieCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  )
}
