import { Package } from 'lucide-react'

export function LoadingSpinner({ text = 'Loading data...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '16px' }}>
      <div className="loading-ring" />
      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{text}</span>
    </div>
  )
}

export function EmptyState({ icon: Icon = Package, title = 'No data found', description = '' }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={28} />
      </div>
      <div className="empty-title">{title}</div>
      {description && <p className="empty-desc">{description}</p>}
    </div>
  )
}

export function ErrorState({ message = 'Something went wrong. Please try again.' }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ color: 'var(--ruby)', fontSize: '14px', marginBottom: '8px' }}>⚠️ Error</div>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{message}</div>
    </div>
  )
}
