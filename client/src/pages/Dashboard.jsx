import { useState } from 'react'
import { TrendingUp, TrendingDown, Package, MapPin, Newspaper, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { usePriceSummary, useReports, useLocations, usePriceHistory } from '../hooks/useData'
import { formatNaira, deltaClass } from '../utils/format'
import PriceTrendChart from '../components/PriceTrendChart'
import NewsCard from '../components/NewsCard'
import { LoadingSpinner, ErrorState } from '../components/LoadingStates'

const CATEGORY_COLORS = {
  'Tech Hardware': '#0EA5E9',
  'Fuel & Energy': '#F59E0B',
  'Grains & Staples': '#10B981',
  'Protein & Livestock': '#EF4444',
  'Construction': '#8B5CF6',
  'Cooking Essentials': '#F97316'
}

function StatCard({ label, value, delta, icon: Icon, color = 'var(--gold-500)', prefix = '' }) {
  const up = parseFloat(delta) >= 0
  return (
    <div className="stat-card" style={{ '--accent-gradient': `linear-gradient(90deg, ${color}, ${color}88)` }}>
      <div className="stat-icon" style={{ background: `${color}18` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{prefix}{value}</div>
      {delta !== undefined && (
        <div className={`stat-delta ${up ? 'delta-up' : 'delta-down'}`}>
          {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(delta)}% vs yesterday
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { data: prices, isLoading: pricesLoading, isError, refetch } = usePriceSummary()
  const { data: reports } = useReports()
  const [selectedItem, setSelectedItem] = useState(null)
  const { data: chartData } = usePriceHistory(selectedItem?.item_id)

  // Compute summary stats
  const rising = prices?.filter(p => p.delta > 0).length || 0
  const falling = prices?.filter(p => p.delta < 0).length || 0
  const topMover = prices?.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0]

  const fuelItems = prices?.filter(p => p.category === 'Fuel & Energy') || []
  const avgFuel = fuelItems.length ? Math.round(fuelItems.reduce((s, p) => s + p.avg_price, 0) / fuelItems.length) : 0

  return (
    <div className="page-enter">
      {/* Topbar */}
      <div className="topbar">
        <div>
          <div className="topbar-title">Market Dashboard</div>
          <div className="topbar-subtitle">Nigerian Commodity & Tech Price Intelligence</div>
        </div>
        <div className="live-badge"><div className="live-dot" /> Live</div>
        <button className="btn btn-ghost btn-sm" onClick={() => refetch()}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="page-content">
        {/* KPI Stats */}
        <div className="stats-grid stagger-in" style={{ marginBottom: '28px' }}>
          <StatCard
            label="Tracked Items"
            value={prices?.length || '—'}
            icon={Package}
            color="#F5B731"
          />
          <StatCard
            label="Rising Prices"
            value={rising}
            icon={TrendingUp}
            color="#EF4444"
            delta={prices?.length ? ((rising / prices.length) * 100).toFixed(1) : undefined}
          />
          <StatCard
            label="Falling Prices"
            value={falling}
            icon={TrendingDown}
            color="#10B981"
          />
          <StatCard
            label="Avg Fuel (Petrol)"
            value={formatNaira(avgFuel)}
            icon={MapPin}
            color="#F59E0B"
          />
        </div>

        {/* Main Grid */}
        <div className="grid-2" style={{ marginBottom: '24px' }}>
          {/* Price Table */}
          <div className="card" style={{ gridColumn: '1', overflow: 'hidden' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Live Market Prices</div>
                <div className="card-subtitle">Latest averages across all states</div>
              </div>
            </div>

            {pricesLoading ? <LoadingSpinner /> : isError ? <ErrorState /> : (
              <div style={{ overflowX: 'auto', maxHeight: '420px', overflowY: 'auto' }}>
                <table className="price-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Avg Price</th>
                      <th>24h Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices?.map(item => (
                      <tr
                        key={item.item_id}
                        style={{ cursor: 'pointer', background: selectedItem?.item_id === item.item_id ? 'var(--bg-hover)' : '' }}
                        onClick={() => setSelectedItem(selectedItem?.item_id === item.item_id ? null : item)}
                      >
                        <td>
                          <div className="item-name">{item.item_name}</div>
                          <div className="item-unit">per {item.unit}</div>
                        </td>
                        <td>
                          <span className="category-badge" style={{
                            background: `${CATEGORY_COLORS[item.category] || '#888'}18`,
                            color: CATEGORY_COLORS[item.category] || '#888',
                            border: `1px solid ${CATEGORY_COLORS[item.category] || '#888'}30`
                          }}>
                            {item.category}
                          </span>
                        </td>
                        <td><span className="price-amount">{formatNaira(item.avg_price)}</span></td>
                        <td>
                          <div className={deltaClass(item.delta)}>
                            {item.delta > 0 ? <ArrowUpRight size={13} /> : item.delta < 0 ? <ArrowDownRight size={13} /> : null}
                            {item.delta > 0 ? '+' : ''}{item.delta}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Chart Panel */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  {selectedItem ? selectedItem.item_name : 'Price Trend'}
                </div>
                <div className="card-subtitle">
                  {selectedItem ? `60-day history — click any row to select` : 'Select an item from the table to view trend'}
                </div>
              </div>
            </div>

            {selectedItem && chartData ? (
              <PriceTrendChart data={chartData.history} unit={selectedItem.unit} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '280px', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--bg-elevated)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={22} style={{ color: 'var(--gold-500)' }} />
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Click any row in the<br />market table to view trend
                </div>
              </div>
            )}

            {selectedItem && (
              <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                {chartData?.history?.length > 0 && (() => {
                  const last = chartData.history[chartData.history.length - 1]
                  const first = chartData.history[0]
                  const change = ((last.avg_price - first.avg_price) / first.avg_price * 100).toFixed(2)
                  return (
                    <>
                      <div style={{ flex: 1, padding: '10px', background: 'var(--bg-surface)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>60d High</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--ruby)' }}>
                          {formatNaira(Math.max(...chartData.history.map(h => h.max_price)))}
                        </div>
                      </div>
                      <div style={{ flex: 1, padding: '10px', background: 'var(--bg-surface)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>60d Low</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--emerald)' }}>
                          {formatNaira(Math.min(...chartData.history.map(h => h.min_price)))}
                        </div>
                      </div>
                      <div style={{ flex: 1, padding: '10px', background: 'var(--bg-surface)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>60d Δ</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: '700', color: parseFloat(change) >= 0 ? 'var(--ruby)' : 'var(--emerald)' }}>
                          {change > 0 ? '+' : ''}{change}%
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            )}
          </div>
        </div>

        {/* News Section */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Latest Market Reports</div>
              <div className="card-subtitle">Verified supply chain intelligence</div>
            </div>
            <a href="/news" className="btn btn-ghost btn-sm">
              <Newspaper size={13} /> View All
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {reports?.slice(0, 4).map(r => (
              <NewsCard key={r.id} report={r} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
