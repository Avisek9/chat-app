import { useState } from 'react'

export default function InviteModal({ room, onlineUsers, currentUser, onClose }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState({}) // username -> 'sending' | 'ok' | 'err:msg'

  const candidates = onlineUsers.filter(u =>
    u !== currentUser && u.toLowerCase().includes(query.toLowerCase())
  )

  const invite = async (username) => {
    setStatus(s => ({ ...s, [username]: 'sending' }))
    try {
      const csrf = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? ''
      const res = await fetch(`/api/rooms/${room}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': decodeURIComponent(csrf) },
        body: JSON.stringify({ username }),
        credentials: 'include'
      })
      const data = await res.json()
      setStatus(s => ({ ...s, [username]: res.ok ? 'ok' : `err:${data.error}` }))
    } catch {
      setStatus(s => ({ ...s, [username]: 'err:Network error' }))
    }
  }

  return (
    <div style={S.backdrop} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.header}>
          <div>
            <p style={S.title}>Invite to <span style={{ color: 'var(--purple-soft)' }}>#{room}</span></p>
            <p style={S.sub}>Pick someone who's online right now</p>
          </div>
          <button style={S.close} onClick={onClose}>✕</button>
        </div>

        <input style={S.search} placeholder="Search users..."
          value={query} onChange={e => setQuery(e.target.value)} autoFocus />

        <div style={S.list}>
          {candidates.length === 0 && (
            <p style={S.empty}>{query ? 'No match' : 'No one else is online'}</p>
          )}
          {candidates.map(u => {
            const s = status[u]
            const sent = s === 'ok'
            const errMsg = s?.startsWith('err:') ? s.slice(4) : null
            return (
              <div key={u} style={S.row}>
                <div style={S.avatar}>{u[0].toUpperCase()}</div>
                <span style={S.uname}>{u}</span>
                {errMsg && <span style={S.errTag}>{errMsg}</span>}
                <button
                  style={{ ...S.invBtn, ...(sent ? S.invBtnDone : {}) }}
                  onClick={() => !sent && invite(u)}
                  disabled={sent || s === 'sending'}
                >
                  {s === 'sending' ? '...' : sent ? '✓ Sent' : 'Invite'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const S = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { width: 380, background: 'var(--surface)', border: '1px solid var(--line)',
    borderRadius: 12, overflow: 'hidden', animation: 'up 0.2s ease' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '18px 18px 12px' },
  title: { fontWeight: 600, fontSize: 15 },
  sub: { fontSize: 12, color: 'var(--text-dim)', marginTop: 2 },
  close: { background: 'none', border: 'none', color: 'var(--text-dim)',
    cursor: 'pointer', fontSize: 14, padding: 4 },
  search: { width: '100%', background: 'var(--bg)', border: 'none',
    borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
    padding: '10px 18px', color: 'var(--text)', fontFamily: 'var(--font)',
    fontSize: 13, outline: 'none' },
  list: { maxHeight: 260, overflowY: 'auto', padding: '8px 0' },
  empty: { padding: '16px 18px', fontSize: 13, color: 'var(--text-dim)',
    fontFamily: 'var(--mono)' },
  row: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px' },
  avatar: { width: 28, height: 28, borderRadius: '50%', background: 'var(--purple)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 },
  uname: { flex: 1, fontSize: 14 },
  errTag: { fontSize: 11, color: 'var(--red)', fontFamily: 'var(--mono)' },
  invBtn: { padding: '5px 12px', background: 'var(--purple)', border: 'none',
    borderRadius: 6, color: '#fff', fontSize: 12, fontWeight: 600,
    fontFamily: 'var(--font)', cursor: 'pointer' },
  invBtnDone: { background: 'var(--green-faint)', color: 'var(--green)', cursor: 'default' }
}
