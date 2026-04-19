import { useRef, useState, useEffect, useCallback } from 'react'

export default function WebcamCapture({ onCapture, onClose }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [captured, setCaptured] = useState(null)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  // Start webcam on mount
  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => setReady(true)
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
  }

  const takeSelfie = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
    setCaptured(dataUrl)
    stopCamera()
  }, [])

  const retake = () => {
    setCaptured(null)
    startCamera()
  }

  const confirm = () => {
    if (captured) {
      onCapture(captured)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-title">📷 Capture Selfie for Punch In</div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Show live video or captured image */}
        {!captured ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', borderRadius: '8px' }} />
            {!ready && <div className="loading"><div className="spinner" /> Starting camera...</div>}
          </>
        ) : (
          <img src={captured} alt="selfie" className="selfie-preview" />
        )}

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          {!captured ? (
            <button className="btn btn-primary" onClick={takeSelfie} disabled={!ready}>
              📸 Take Photo
            </button>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={retake}>Retake</button>
              <button className="btn btn-primary" onClick={confirm}>✓ Use This Photo</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
