// FIX: derive base URL for static assets (/uploads/) from VITE_API_URL
// Works for:
//   'http://localhost:5000/api'       → 'http://localhost:5000'
//   '/api'                            → '' (relative, Vite proxy handles in dev)
//   'https://myapp.render.com/api'    → 'https://myapp.render.com'
export const API_BASE = (() => {
  const url = import.meta.env.VITE_API_URL || ''
  if (!url || url === '/api') return ''
  return url.replace(/\/api$/, '')
})()

// Build full URL for selfie path like '/uploads/selfie-xxx.jpg'
export const selfieUrl = (path) => {
  if (!path) return null
  return `${API_BASE}${path}`
}
