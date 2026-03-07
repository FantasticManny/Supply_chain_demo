import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
import { formatNaira } from '../utils/format'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-default)',
      borderRadius: '10px',
      padding: '12px 16px',
      boxShadow: 'var(--shadow-elevated)'
    }}>
      <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '14px', fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--gold-500)' }}>
        {formatNaira(payload[0]?.value)}
      </div>
    </div>
  )
}

export default function StateComparisonChart({ data }) {
  if (!data || !data.length) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '280px', color: 'var(--text-muted)' }}>
      Select an item to see state comparison
    </div>
  )

  const min = Math.min(...data.map(d => d.avg_price))
  const max = Math.max(...data.map(d => d.avg_price))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={v => formatNaira(v, true)}
          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="state_name"
          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
          axisLine={false}
          tickLine={false}
          width={130}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="avg_price" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => {
            const pct = (entry.avg_price - min) / (max - min)
            const r = Math.round(16 + pct * (239 - 16))
            const g = Math.round(185 - pct * (185 - 68))
            const b = Math.round(129 - pct * (129 - 68))
            return <Cell key={i} fill={`rgb(${r},${g},${b})`} />
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
