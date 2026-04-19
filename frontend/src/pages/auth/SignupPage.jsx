import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useSignupMutation } from '../../services/authApi'
import { setCredentials } from '../../features/auth/authSlice'

export default function SignupPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [signup, { isLoading }] = useSignupMutation()

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee', department: '' })
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await signup(form).unwrap()
      dispatch(setCredentials(res.data))
      const role = res.data.user.role
      if (role === 'admin') navigate('/admin')
      else if (role === 'manager') navigate('/manager')
      else navigate('/employee')
    } catch (err) {
      setError(err.data?.message || 'Signup failed')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">AMS</div>
        <div className="auth-sub">Create your account</div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">FULL NAME</label>
            <input className="form-input" type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
          </div>
          <div className="form-group">
            <label className="form-label">EMAIL</label>
            <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">PASSWORD</label>
            <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required minLength={6} />
          </div>
          <div className="form-group">
            <label className="form-label">DEPARTMENT</label>
            <input className="form-input" type="text" name="department" value={form.department} onChange={handleChange} placeholder="Engineering" />
          </div>
          <div className="form-group">
            <label className="form-label">ROLE</label>
            <select className="form-select" name="role" value={form.role} onChange={handleChange}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <hr className="divider" />
        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text2)' }}>
          Have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
