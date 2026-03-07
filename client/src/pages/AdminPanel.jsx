import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAllReports } from '../hooks/useData'
import { useAuth } from '../hooks/useAuth'
import { CheckCircle, XCircle, Trash2, Clock, Eye, Shield } from 'lucide-react'
import { timeAgo, formatDate } from '../utils/format'
import { LoadingSpinner } from '../components/LoadingStates'
import api from '../utils/api'

export default function AdminPanel() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: reports, isLoading } = useAllReports()
  const [activeFilter, setActiveFilter] = useState('pending')
  const [actionMsg, setActionMsg] = useState('')

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/reports/${id}/verify`, { status }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries(['reports-all'])
      queryClient.invalidateQueries(['reports'])
      setActionMsg(`Report ${vars.status} successfully`)
      setTimeout(() => setActionMsg(''), 3000)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: id => api.delete(`/reports/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['reports-all'])
      queryClient.invalidateQueries(['reports'])
      setActionMsg('Report deleted')
      setTimeout(() => setActionMsg(''), 3000)
    }
  })

  const filtered = reports?.filter(r => {
    if (activeFilter === 'all') return true
    return r.status === activeFilter
  }) || []

  const counts = {
    pending: reports?.filter(r => r.status === 'pending').length || 0,
    verified: reports?.filter(r => r.status === 'verified').length || 0,
    rejected: reports?.filter(r => r.status === 'rejected').length || 0
  }

  return (
    <div className="page-enter">
      <div className="topbar">
        <div>
          <div className="topbar-title">Admin Panel</div>
          <div className="topbar-subtitle">Report moderation and system management</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'var(--violet-dim)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '20px' }}>
          <Shield size={13} style={{ color: 'var(--violet)' }} />
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--violet)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {user?.role}
          </span>
        </div>
      </div>

      <div className="page-content">
        {actionMsg && (
          <div className="alert alert-success" style={{ marginBottom: '20px' }}>
            <CheckCircle size={16} /> {actionMsg}
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          <div className="stat-card" style={{ '--accent-gradient': 'linear-gradient(90deg, #F59E0B, #F59E0B88)' }}>
            <div className="stat-label">Pending Review</div>
            <div className="stat-value" style={{ color: 'var(--amber)' }}>{counts.pending}</div>
          </div>
          <div className="stat-card" style={{ '--accent-gradient': 'linear-gradient(90deg, #10B981, #10B98188)' }}>
            <div className="stat-label">Verified</div>
            <div className="stat-value" style={{ color: 'var(--emerald)' }}>{counts.verified}</div>
          </div>
          <div className="stat-card" style={{ '--accent-gradient': 'linear-gradient(90deg, #EF4444, #EF444488)' }}>
            <div className="stat-label">Rejected</div>
            <div className="stat-value" style={{ color: 'var(--ruby)' }}>{counts.rejected}</div>
          </div>
          <div className="stat-card" style={{ '--accent-gradient': 'linear-gradient(90deg, #8B5CF6, #8B5CF688)' }}>
            <div className="stat-label">Total Reports</div>
            <div className="stat-value">{reports?.length || 0}</div>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {['pending', 'verified', 'rejected', 'all'].map(f => (
            <button
              key={f}
              className={`btn btn-sm ${activeFilter === f ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && (
                <span style={{
                  background: activeFilter === f ? 'rgba(0,0,0,0.2)' : 'var(--bg-elevated)',
                  borderRadius: '10px',
                  padding: '1px 7px',
                  fontSize: '11px',
                  marginLeft: '2px'
                }}>
                  {counts[f] || 0}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Reports Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-header">
            <div className="card-title">{filtered.length} Reports</div>
          </div>

          {isLoading ? <LoadingSpinner /> : (
            <div style={{ overflowX: 'auto' }}>
              <table className="price-table">
                <thead>
                  <tr>
                    <th>Report</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id}>
                      <td style={{ maxWidth: '340px' }}>
                        <div className="item-name" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                          {r.title}
                        </div>
                        <div className="item-unit" style={{ marginTop: '4px', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.content?.slice(0, 80)}...
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600' }}>
                          {r.User?.username}
                        </div>
                      </td>
                      <td>
                        {r.category && (
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: 'var(--bg-elevated)',
                            color: 'var(--text-secondary)'
                          }}>
                            {r.category}
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {timeAgo(r.created_at)}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {formatDate(r.created_at)}
                        </div>
                      </td>
                      <td>
                        {r.status === 'verified' && (
                          <span className="verified-badge"><CheckCircle size={10} /> Verified</span>
                        )}
                        {r.status === 'pending' && (
                          <span className="pending-badge"><Clock size={10} /> Pending</span>
                        )}
                        {r.status === 'rejected' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '12px', background: 'var(--ruby-dim)', color: 'var(--ruby)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>
                            <XCircle size={10} /> Rejected
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                          <Eye size={12} /> {r.views || 0}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {r.status !== 'verified' && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => updateMutation.mutate({ id: r.id, status: 'verified' })}
                              disabled={updateMutation.isPending}
                              title="Verify"
                            >
                              <CheckCircle size={13} />
                            </button>
                          )}
                          {r.status !== 'rejected' && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => updateMutation.mutate({ id: r.id, status: 'rejected' })}
                              disabled={updateMutation.isPending}
                              title="Reject"
                            >
                              <XCircle size={13} />
                            </button>
                          )}
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--ruby)', borderColor: 'rgba(239,68,68,0.2)' }}
                            onClick={() => {
                              if (confirm('Delete this report permanently?')) {
                                deleteMutation.mutate(r.id)
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No {activeFilter !== 'all' ? activeFilter : ''} reports found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
