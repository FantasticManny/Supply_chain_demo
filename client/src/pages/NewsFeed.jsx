import { useState } from 'react'
import { Newspaper, Search, PenLine } from 'lucide-react'
import { useReports } from '../hooks/useData'
import { useAuth } from '../hooks/useAuth'
import NewsCard from '../components/NewsCard'
import { LoadingSpinner, EmptyState } from '../components/LoadingStates'
import { useNavigate } from 'react-router-dom'

const CATEGORIES = ['Tech Hardware', 'Fuel & Energy', 'Grains & Staples', 'Protein & Livestock', 'Construction', 'Cooking Essentials']

export default function NewsFeed() {
  const { isAuthenticated } = useAuth()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)
  const navigate = useNavigate()

  const { data: reports, isLoading } = useReports('verified', activeCategory || undefined)

  const filtered = reports?.filter(r =>
    !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.content.toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <div className="page-enter">
      <div className="topbar">
        <div>
          <div className="topbar-title">News & Reports</div>
          <div className="topbar-subtitle">Verified supply chain intelligence from the field</div>
        </div>
        {isAuthenticated && (
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/my-reports')}>
            <PenLine size={13} /> Write Report
          </button>
        )}
      </div>

      <div className="page-content">
        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '20px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Search reports..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category filters */}
        <div className="filter-bar">
          <button className={`filter-chip ${!activeCategory ? 'active' : ''}`} onClick={() => setActiveCategory(null)}>
            All Topics
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(prev => prev === cat ? null : cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          {filtered.length} verified {filtered.length === 1 ? 'report' : 'reports'}
          {activeCategory ? ` in ${activeCategory}` : ''}
        </div>

        {/* News Grid */}
        {isLoading ? (
          <LoadingSpinner text="Loading reports..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="No reports found"
            description={search ? `No results for "${search}"` : 'No verified reports in this category yet.'}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(r => <NewsCard key={r.id} report={r} />)}
          </div>
        )}

        {/* Call to action for non-authenticated */}
        {!isAuthenticated && (
          <div style={{
            marginTop: '32px',
            padding: '28px',
            background: 'linear-gradient(135deg, rgba(245,183,49,0.08), rgba(245,183,49,0.02))',
            border: '1px solid rgba(245,183,49,0.2)',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Have market intelligence to share?
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', maxWidth: '400px', margin: '0 auto 16px' }}>
              Sign in to submit price reports, commodity updates, and supply chain developments for review.
            </p>
            <a href="/login" className="btn btn-primary">
              Sign In to Contribute
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
