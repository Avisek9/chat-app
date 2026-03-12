import { useState } from 'react'

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login') 
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const getCsrfToken = () => {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
    return match ? decodeURIComponent(match[1]) : ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setInfo(''); setLoading(true)

    if (mode === 'register') {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
        body: JSON.stringify({ username: username.trim(), password })
      })
      const data = await res.json()
      setLoading(false)
      if (!res.ok) { setError(data.error); return }
      setInfo('Account created. You can now log in.')
      setMode('login')
      setPassword('')
      return
    }

    
    const params = new URLSearchParams({ username: username.trim(), password })
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-XSRF-TOKEN': getCsrfToken() },
      body: params,
      credentials: 'include'
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Login failed'); return }
    onLogin(data.username)
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.brand}>
          <span style={S.brandMark}>N</span>
          <span style={S.brandName}>NexChat</span>
        </div>

        <div style={S.tabs}>
          {['login','register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setInfo('') }}
              style={{ ...S.tab, ...(mode === m ? S.tabOn : {}) }}>
              {m === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        {error && <p style={S.err}>{error}</p>}
        {info  && <p style={S.ok}>{info}</p>}

        <form onSubmit={handleSubmit} style={S.form}>
          <label style={S.label}>Username</label>
          <input style={S.input} value={username} onChange={e => setUsername(e.target.value)}
            placeholder="your_username" autoFocus maxLength={20} />

          <label style={{ ...S.label, marginTop: 12 }}>Password</label>
          <input style={S.input} type="password" value={password}
            onChange={e => setPassword(e.target.value)} placeholder="••••••••" />

          <button style={{ ...S.btn, opacity: loading ? 0.5 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in →' : 'Create account →'}
          </button>
        </form>
      </div>
    </div>
  )
}

const S = {
  page: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(110,95,240,0.08), transparent)' },
  card: { width: 360, background: 'var(--surface)', border: '1px solid var(--line)',
    borderRadius: 12, padding: '32px 28px', animation: 'up 0.3s ease' },
  brand: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 },
  brandMark: { width: 32, height: 32, background: 'var(--purple)', borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 16, color: '#fff' },
  brandName: { fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' },
  tabs: { display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg)',
    padding: 4, borderRadius: 8 },
  tab: { flex: 1, padding: '7px 0', background: 'none', border: 'none',
    borderRadius: 6, color: 'var(--text-dim)', fontSize: 13, fontWeight: 500,
    cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all 0.15s' },
  tabOn: { background: 'var(--raised)', color: 'var(--text)' },
  err: { fontSize: 12, color: 'var(--red)', marginBottom: 12, fontFamily: 'var(--mono)' },
  ok:  { fontSize: 12, color: 'var(--green)', marginBottom: 12, fontFamily: 'var(--mono)' },
  form: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 5,
    textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 7,
    padding: '10px 12px', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font)',
    outline: 'none', marginBottom: 4 },
  btn: { marginTop: 18, padding: '11px', background: 'var(--purple)', border: 'none',
    borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 14,
    fontFamily: 'var(--font)', cursor: 'pointer', transition: 'opacity 0.15s' }
}
