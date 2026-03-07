import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine, Area, AreaChart
} from 'recharts'
import { formatNaira, formatDate } from '../utils/format'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-default)',
      borderRadius: '10px',
      padding: '12px 16px',
      boxShadow: 'var(--shadow-elevated)',
      minWidth: '180px'
    }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label ? new Date(label).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
      </div>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}>
          <span style={{ fontSize: '12px', color: entry.color }}>{entry.name}</span>
          <span style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            {formatNaira(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function PriceTrendChart({ data, title, unit }) {
  if (!data || !data.length) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '280px', color: 'var(--text-muted)' }}>
      No price history available
    </div>
  )

  const chartData = data.map(d => ({
    date: d.date,
    'Avg Price': d.avg_price,
    'Min Price': d.min_price,
    'Max Price': d.max_price
  }))

  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F5B731" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#F5B731" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="maxGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.08} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={d => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={v => formatNaira(v, true)}
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)', paddingTop: '12px' }}
          />
          <Area type="monotone" dataKey="Max Price" stroke="#EF4444" strokeWidth={1.5}
            fill="url(#maxGradient)" strokeDasharray="4 4" dot={false} />
          <Area type="monotone" dataKey="Avg Price" stroke="#F5B731" strokeWidth={2.5}
            fill="url(#avgGradient)" dot={false} activeDot={{ r: 5, fill: '#F5B731', stroke: 'var(--bg-void)', strokeWidth: 2 }} />
          <Area type="monotone" dataKey="Min Price" stroke="#10B981" strokeWidth={1.5}
            fill="none" strokeDasharray="4 4" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
