import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react'
import api from '../utils/api'

export default function Login() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) return <Navigate to="/admin" replace />

  const mutation = useMutation({
    mutationFn: data => api.post('/auth/login', data),
    onSuccess: res => {
      login(res.data.token, res.data.user)
      navigate('/admin')
    },
    onError: err => {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.')
    }
  })

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    mutation.mutate(form)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-void)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(245,183,49,0.04) 0%, transparent 70%)',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, var(--gold-500), var(--gold-700))',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: 'var(--glow-gold)',
            fontFamily: 'var(--font-display)',
            fontWeight: '800',
            fontSize: '20px',
            color: 'var(--bg-void)'
          }}>SC</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
            SupplyChain NG
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Sign in to access the admin dashboard
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: 'var(--shadow-elevated)'
        }}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="admin@supplychain.ng"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', display: 'flex'
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '14px', marginTop: '8px' }}
              disabled={mutation.isPending}
            >
              <LogIn size={15} />
              {mutation.isPending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: 'var(--bg-surface)',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <ShieldCheck size={13} style={{ color: 'var(--gold-500)' }} />
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--gold-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Demo Credentials
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.8' }}>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Admin:</strong> admin@supplychain.ng / Admin@1234</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Editor:</strong> editor@supplychain.ng / Editor@1234</div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <a href="/" style={{ color: 'var(--gold-500)', textDecoration: 'none' }}>← Back to Dashboard</a>
        </div>
      </div>
    </div>
  )
}
