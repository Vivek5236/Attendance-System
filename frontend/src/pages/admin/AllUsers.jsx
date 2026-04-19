import { useState } from 'react'
import { useGetAllUsersQuery, useUpdateUserMutation, useGetManagersQuery } from '../../services/userApi'

export default function AllUsers() {
  const { data, isLoading } = useGetAllUsersQuery()
  const { data: managersData } = useGetManagersQuery()
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation()

  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const users = data?.data || []
  const managers = managersData?.data || []

  const startEdit = (user) => {
    setEditId(user._id)
    setEditForm({
      name: user.name,
      department: user.department,
      role: user.role,
      managerId: user.managerId || '',
      isActive: user.isActive,
    })
    setMessage(''); setError('')
  }

  const saveEdit = async () => {
    try {
      await updateUser({ id: editId, ...editForm }).unwrap()
      setMessage('User updated successfully')
      setEditId(null)
    } catch (err) {
      setError(err.data?.message || 'Update failed')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">All Users</div>
          <div className="page-sub">Manage user accounts and roles</div>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Edit form */}
      {editId && (
        <div className="card" style={{ marginBottom: '20px', borderColor: 'var(--accent2)' }}>
          <div className="card-title">Edit User</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">NAME</label>
              <input className="form-input" value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">DEPARTMENT</label>
              <input className="form-input" value={editForm.department}
                onChange={e => setEditForm({ ...editForm, department: e.target.value })} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">ROLE</label>
              <select className="form-select" value={editForm.role}
                onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">MANAGER</label>
              <select className="form-select" value={editForm.managerId}
                onChange={e => setEditForm({ ...editForm, managerId: e.target.value })}>
                <option value="">None</option>
                {managers.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">STATUS</label>
              <select className="form-select" value={editForm.isActive}
                onChange={e => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button className="btn btn-primary" onClick={saveEdit} disabled={updating}>
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
            <button className="btn btn-secondary" onClick={() => setEditId(null)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        {isLoading ? (
          <div className="loading"><div className="spinner" />Loading...</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Manager</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text2)' }}>{u.email}</td>
                    <td><span className="role-badge">{u.role}</span></td>
                    <td style={{ fontSize: '13px', color: 'var(--text2)' }}>{u.department}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text2)' }}>
                      {managers.find(m => m._id === u.managerId)?.name || '—'}
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-completed' : 'badge-rejected'}`}>
                        {u.isActive ? 'active' : 'inactive'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => startEdit(u)}>
                        Edit
                      </button>
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
