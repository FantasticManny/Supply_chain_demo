import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMyReports } from '../hooks/useData'
import { useAuth } from '../hooks/useAuth'
import { PenLine, Trash2, CheckCircle, Clock, XCircle, X, Edit2, AlertCircle } from 'lucide-react'
import { timeAgo, formatDate } from '../utils/format'
import { LoadingSpinner, EmptyState } from '../components/LoadingStates'
import api from '../utils/api'

const CATEGORIES = ['Tech Hardware', 'Fuel & Energy', 'Grains & Staples', 'Protein & Livestock', 'Construction', 'Cooking Essentials']

function ReportModal({ report, onClose }) {
  const queryClient = useQueryClient()
  const isEdit = !!report
  const [form, setForm] = useState({
    title: report?.title || '',
    content: report?.content || '',
    source_url: report?.source_url || '',
    category: report?.category || ''
  })
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: data => isEdit
      ? api.put(`/reports/${report.id}`, data)
      : api.post('/reports', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['reports-mine'])
      queryClient.invalidateQueries(['reports'])
      onClose()
    },
    onError: err => {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to save report')
    }
  })

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.title.trim() || !form.content.trim()) return setError('Title and content are required')
    if (form.title.length < 10) return setError('Title must be at least 10 characters')
    if (form.content.length < 50) return setError('Content must be at least 50 characters')
    mutation.mutate(form)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '640px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {isEdit ? 'Edit Report' : 'Write a Report'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {isEdit ? 'Update your pending report' : 'Reports are reviewed by an admin before publishing'}
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '16px' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Headline *</label>
            <input
              className="form-input"
              placeholder="Clear, factual headline..."
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              maxLength={300}
            />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {form.title.length}/300 characters (min 10)
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Report Content *</label>
            <textarea
              className="form-textarea"
              placeholder="Describe the market development, price change, or supply chain event in detail. Include specific figures, locations, and sources where possible..."
              value={form.content}
              onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              style={{ minHeight: '180px', resize: 'vertical' }}
            />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {form.content.length} characters (min 50)
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Source URL <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(optional)</span></label>
            <input
              className="form-input"
              placeholder="https://..."
              value={form.source_url}
              onChange={e => setForm(p => ({ ...p, source_url: e.target.value }))}
              type="url"
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              <PenLine size={14} />
              {mutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Submit for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  if (status === 'verified') return (
    <span className="verified-badge"><CheckCircle size={10} /> Verified</span>
  )
  if (status === 'pending') return (
    <span className="pending-badge"><Clock size={10} /> Pending Review</span>
  )
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '12px', background: 'var(--ruby-dim)', color: 'var(--ruby)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>
      <XCircle size={10} /> Rejected
    </span>
  )
}

export default function EditorReports() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: reports, isLoading } = useMyReports()
  const [showModal, setShowModal] = useState(false)
  const [editingReport, setEditingReport] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [actionMsg, setActionMsg] = useState('')

  const deleteMutation = useMutation({
    mutationFn: id => api.delete(`/reports/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['reports-mine'])
      queryClient.invalidateQueries(['reports'])
      setActionMsg('Report deleted successfully')
      setTimeout(() => setActionMsg(''), 3000)
    },
    onError: err => {
      setActionMsg(err.response?.data?.error || 'Failed to delete report')
      setTimeout(() => setActionMsg(''), 4000)
    }
  })

  const filtered = reports?.filter(r => {
    if (activeFilter === 'all') return true
    return r.status === activeFilter
  }) || []

  const counts = {
    pending: reports?.filter(r => r.status === 'pending').length || 0,
    verified: reports?.filter(r => r.status === 'verified').length || 0,
    rejected: reports?.filter(r => r.status === 'rejected').length || 0,
  }

  function handleEdit(report) {
    setEditingReport(report)
    setShowModal(true)
  }

  function handleDelete(report) {
    if (window.confirm(`Delete "${report.title}"? This cannot be undone.`)) {
      deleteMutation.mutate(report.id)
    }
  }

  return (
    <div className="page-enter">
      <div className="topbar">
        <div>
          <div className="topbar-title">My Reports</div>
          <div className="topbar-subtitle">Write and manage your market intelligence reports</div>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => { setEditingReport(null); setShowModal(true) }}
        >
          <PenLine size={13} /> Write Report
        </button>
      </div>

      <div className="page-content">
        {actionMsg && (
          <div className={`alert ${actionMsg.includes('deleted') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '20px' }}>
            <CheckCircle size={15} /> {actionMsg}
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          <div className="stat-card" style={{ '--accent-gradient': 'linear-gradient(90deg, #F59E0B, #F59E0B88)' }}>
            <div className="stat-label">Pending Review</div>
            <div className="stat-value" style={{ color: 'var(--amber)' }}>{counts.pending}</div>
          </div>
          <div className="stat-card" style={{ '--accent-gradient': 'linear-gradient(90deg, #10B981, #10B98188)' }}>
            <div className="stat-label">Verified & Published</div>
            <div className="stat-value" style={{ color: 'var(--emerald)' }}>{counts.verified}</div>
          </div>
          <div className="stat-card" style={{ '--accent-gradient': 'linear-gradient(90deg, #EF4444, #EF444488)' }}>
            <div className="stat-label">Rejected</div>
            <div className="stat-value" style={{ color: 'var(--ruby)' }}>{counts.rejected}</div>
          </div>
          <div className="stat-card" style={{ '--accent-gradient': 'linear-gradient(90deg, #8B5CF6, #8B5CF688)' }}>
            <div className="stat-label">Total Submitted</div>
            <div className="stat-value">{reports?.length || 0}</div>
          </div>
        </div>

        {/* Info banner */}
        <div style={{ padding: '12px 16px', background: 'rgba(245,183,49,0.06)', border: '1px solid rgba(245,183,49,0.15)', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={14} style={{ color: 'var(--amber)', flexShrink: 0 }} />
          You can edit or delete reports that are still <strong style={{ color: 'var(--text-secondary)' }}>pending review</strong>. Once a report is verified or rejected, it is locked.
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {['all', 'pending', 'verified', 'rejected'].map(f => (
            <button
              key={f}
              className={`btn btn-sm ${activeFilter === f ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && (
                <span style={{
                  background: activeFilter === f ? 'rgba(0,0,0,0.2)' : 'var(--bg-elevated)',
                  borderRadius: '10px', padding: '1px 7px', fontSize: '11px', marginLeft: '2px'
                }}>
                  {counts[f] || 0}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Reports list */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-header">
            <div className="card-title">{filtered.length} {activeFilter !== 'all' ? activeFilter : ''} Reports</div>
          </div>

          {isLoading ? <LoadingSpinner /> : filtered.length === 0 ? (
            <EmptyState
              icon={PenLine}
              title={activeFilter === 'all' ? "No reports yet" : `No ${activeFilter} reports`}
              description={activeFilter === 'all' ? "Write your first market intelligence report." : `You have no ${activeFilter} reports.`}
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="price-table">
                <thead>
                  <tr>
                    <th>Report</th>
                    <th>Category</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id}>
                      <td style={{ maxWidth: '360px' }}>
                        <div className="item-name" style={{ fontSize: '13px', lineHeight: '1.4' }}>{r.title}</div>
                        <div className="item-unit" style={{ marginTop: '4px', maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.content?.slice(0, 90)}...
                        </div>
                        {r.source_url && (
                          <a href={r.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--gold-500)', marginTop: '4px', display: 'inline-block' }}>
                            Source link ↗
                          </a>
                        )}
                      </td>
                      <td>
                        {r.category && (
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                            {r.category}
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{timeAgo(r.created_at)}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatDate(r.created_at)}</div>
                      </td>
                      <td><StatusBadge status={r.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {r.status === 'pending' ? (
                            <>
                              <button
                                className="btn btn-ghost btn-sm"
                                style={{ color: 'var(--gold-500)' }}
                                onClick={() => handleEdit(r)}
                                title="Edit report"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                className="btn btn-ghost btn-sm"
                                style={{ color: 'var(--ruby)', borderColor: 'rgba(239,68,68,0.2)' }}
                                onClick={() => handleDelete(r)}
                                disabled={deleteMutation.isPending}
                                title="Delete report"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '4px 8px' }}>
                              {r.status === 'verified' ? 'Published' : 'Locked'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ReportModal
          report={editingReport}
          onClose={() => { setShowModal(false); setEditingReport(null) }}
        />
      )}
    </div>
  )
}
