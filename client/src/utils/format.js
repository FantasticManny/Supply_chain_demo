// Format number as Nigerian Naira
export function formatNaira(amount, compact = false) {
  if (amount === null || amount === undefined) return '—'
  const num = parseFloat(amount)
  if (compact && num >= 1_000_000) {
    return `₦${(num / 1_000_000).toFixed(2)}M`
  }
  if (compact && num >= 1_000) {
    return `₦${(num / 1_000).toFixed(1)}K`
  }
  return `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
}

// Format date as "Feb 12, 2025"
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

// Format relative time: "3 hours ago"
export function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// Get delta color class
export function deltaClass(delta) {
  const d = parseFloat(delta)
  if (d > 0) return 'delta-up'
  if (d < 0) return 'delta-down'
  return 'delta-neutral'
}

// Generate a color from a string
export function stringToColor(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = Math.abs(hash) % 360
  return `hsl(${h}, 60%, 55%)`
}

// Truncate text
export function truncate(str, n = 100) {
  if (!str) return ''
  return str.length > n ? str.slice(0, n) + '...' : str
}

// Get initials from name
export function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}
