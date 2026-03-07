import { CheckCircle, Clock, Eye, ExternalLink } from 'lucide-react'
import { timeAgo, formatDate } from '../utils/format'

const CATEGORY_COLORS = {
  'Tech Hardware': '#0EA5E9',
  'Fuel & Energy': '#F59E0B',
  'Grains & Staples': '#10B981',
  'Protein & Livestock': '#EF4444',
  'Construction': '#8B5CF6',
  'Cooking Essentials': '#F97316'
}

export default function NewsCard({ report, onClick }) {
  const color = CATEGORY_COLORS[report.category] || '#F5B731'

  return (
    <div
      className="news-card"
      style={{ '--accent-color': color, cursor: onClick ? 'pointer' : 'default' }}
      onClick={() => onClick?.(report)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
        <div>
          {report.category && (
            <span className="category-badge" style={{
              background: `${color}18`,
              color,
              border: `1px solid ${color}30`,
              marginBottom: '8px',
              display: 'inline-flex'
            }}>
              {report.category}
            </span>
          )}
          <div className="news-title">{report.title}</div>
        </div>
        {report.status === 'verified' ? (
          <div className="verified-badge" style={{ flexShrink: 0, marginTop: '4px' }}>
            <CheckCircle size={10} /> Verified
          </div>
        ) : (
          <div className="pending-badge" style={{ flexShrink: 0, marginTop: '4px' }}>
            <Clock size={10} /> Pending
          </div>
        )}
      </div>

      <p className="news-excerpt">{report.content}</p>

      <div className="news-meta">
        <span>By {report.User?.username || 'Anonymous'}</span>
        <span>•</span>
        <span>{timeAgo(report.created_at) || formatDate(report.created_at)}</span>
        {report.views > 0 && (
          <>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Eye size={11} /> {report.views.toLocaleString()}
            </span>
          </>
        )}
        {report.source_url && (
          <>
            <span>•</span>
            <a
              href={report.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: color, display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
              onClick={e => e.stopPropagation()}
            >
              Source <ExternalLink size={10} />
            </a>
          </>
        )}
      </div>
    </div>
  )
}
