import { useState } from 'react'
import { Search, ArrowUpRight, ArrowDownRight, BarChart2 } from 'lucide-react'
import { useItems, useCategories, useLocations, usePriceHistory, useStateComparison } from '../hooks/useData'
import { usePriceSummary } from '../hooks/useData'
import { formatNaira, deltaClass } from '../utils/format'
import PriceTrendChart from '../components/PriceTrendChart'
import StateComparisonChart from '../components/StateComparisonChart'
import { LoadingSpinner } from '../components/LoadingStates'

const CATEGORY_COLORS = {
  'Tech Hardware': '#0EA5E9',
  'Fuel & Energy': '#F59E0B',
  'Grains & Staples': '#10B981',
  'Protein & Livestock': '#EF4444',
  'Construction': '#8B5CF6',
  'Cooking Essentials': '#F97316'
}

export default function MarketPrices() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [activeTab, setActiveTab] = useState('trend') // 'trend' | 'states'

  const { data: categories } = useCategories()
  const { data: locations } = useLocations()
  const { data: prices, isLoading } = usePriceSummary()
  const { data: chartData, isLoading: chartLoading } = usePriceHistory(
    selectedItem?.item_id,
    selectedLocation
  )
  const { data: stateData, isLoading: stateLoading } = useStateComparison(selectedItem?.item_id)

  const filtered = prices?.filter(p => {
    const matchSearch = !search || p.item_name.toLowerCase().includes(search.toLowerCase())
    const matchCat = !activeCategory || p.category === activeCategory
    return matchSearch && matchCat
  }) || []

  function handleItemSelect(item) {
    setSelectedItem(prev => prev?.item_id === item.item_id ? null : item)
  }

  return (
    <div className="page-enter">
      <div className="topbar">
        <div>
          <div className="topbar-title">Market Prices</div>
          <div className="topbar-subtitle">Real-time commodity intelligence across Nigerian states</div>
        </div>
        <div className="live-badge"><div className="live-dot" /> Live Data</div>
      </div>

      <div className="page-content">
        {/* Search + Filters */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '360px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Location filter */}
          {selectedItem && (
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={selectedLocation || ''}
              onChange={e => setSelectedLocation(e.target.value || null)}
            >
              <option value="">All States</option>
              {locations?.map(l => <option key={l.id} value={l.id}>{l.state_name}</option>)}
            </select>
          )}
        </div>

        {/* Category chips */}
        <div className="filter-bar">
          <button className={`filter-chip ${!activeCategory ? 'active' : ''}`} onClick={() => setActiveCategory(null)}>
            All Categories
          </button>
          {categories?.map(cat => (
            <button
              key={cat.id}
              className={`filter-chip ${activeCategory === cat.name ? 'active' : ''}`}
              style={activeCategory === cat.name ? {
                background: `${CATEGORY_COLORS[cat.name] || '#F5B731'}18`,
                borderColor: `${CATEGORY_COLORS[cat.name] || '#F5B731'}40`,
                color: CATEGORY_COLORS[cat.name] || '#F5B731'
              } : {}}
              onClick={() => setActiveCategory(prev => prev === cat.name ? null : cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedItem ? '1fr 1fr' : '1fr', gap: '20px' }}>
          {/* Price Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-header">
              <div>
                <div className="card-title">
                  {filtered.length} Items {activeCategory ? `— ${activeCategory}` : ''}
                </div>
                <div className="card-subtitle">Click any item to analyse price trends</div>
              </div>
            </div>

            {isLoading ? <LoadingSpinner /> : (
              <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
                <table className="price-table">
                  <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                    <tr>
                      <th>Item</th>
                      <th>Avg Price</th>
                      <th>24h Δ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(item => (
                      <tr
                        key={item.item_id}
                        style={{
                          cursor: 'pointer',
                          background: selectedItem?.item_id === item.item_id ? 'var(--bg-hover)' : '',
                          borderLeft: selectedItem?.item_id === item.item_id ? `3px solid ${CATEGORY_COLORS[item.category] || 'var(--gold-500)'}` : '3px solid transparent'
                        }}
                        onClick={() => handleItemSelect(item)}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '8px', height: '8px', borderRadius: '50%',
                              background: CATEGORY_COLORS[item.category] || '#888',
                              flexShrink: 0
                            }} />
                            <div>
                              <div className="item-name">{item.item_name}</div>
                              <div className="item-unit">{item.category} · per {item.unit}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="price-amount">{formatNaira(item.avg_price)}</span></td>
                        <td>
                          <div className={deltaClass(item.delta)}>
                            {item.delta > 0 ? <ArrowUpRight size={13} /> : item.delta < 0 ? <ArrowDownRight size={13} /> : '—'}
                            {item.delta !== 0 ? `${item.delta > 0 ? '+' : ''}${item.delta}%` : '0%'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Analysis Panel */}
          {selectedItem && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Item Header */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: CATEGORY_COLORS[selectedItem.category], textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                      {selectedItem.category}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {selectedItem.item_name}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Per {selectedItem.unit} · National average
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '800', color: 'var(--gold-500)' }}>
                      {formatNaira(selectedItem.avg_price)}
                    </div>
                    <div className={`${deltaClass(selectedItem.delta)}`} style={{ justifyContent: 'flex-end' }}>
                      {selectedItem.delta > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                      {selectedItem.delta > 0 ? '+' : ''}{selectedItem.delta}% today
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab switcher */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className={`btn btn-sm ${activeTab === 'trend' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setActiveTab('trend')}
                >
                  <BarChart2 size={13} /> Price Trend
                </button>
                <button
                  className={`btn btn-sm ${activeTab === 'states' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setActiveTab('states')}
                >
                  <BarChart2 size={13} /> State Comparison
                </button>
              </div>

              {/* Chart */}
              <div className="card">
                {activeTab === 'trend' ? (
                  <>
                    <div className="card-header">
                      <div>
                        <div className="card-title">60-Day Price History</div>
                        <div className="card-subtitle">
                          {selectedLocation
                            ? `Filtered by: ${locations?.find(l => l.id == selectedLocation)?.state_name}`
                            : 'National average across all states'}
                        </div>
                      </div>
                    </div>
                    {chartLoading ? <LoadingSpinner /> : <PriceTrendChart data={chartData?.history} />}
                  </>
                ) : (
                  <>
                    <div className="card-header">
                      <div>
                        <div className="card-title">Price by State</div>
                        <div className="card-subtitle">7-day average — green=cheapest, red=most expensive</div>
                      </div>
                    </div>
                    {stateLoading ? <LoadingSpinner /> : <StateComparisonChart data={stateData} />}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
