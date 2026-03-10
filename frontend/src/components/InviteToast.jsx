import { useEffect } from 'react'

export default function InviteToast({ invite, onAccept, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 8000)
    return () => clearTimeout(t)
  }, [invite])

  return (
    <div style={S.wrap}>
      <div style={S.icon}>✉</div>
      <div style={S.body}>
        <p style={S.title}><strong>{invite.sender}</strong> invited you to <strong>#{invite.room}</strong></p>
        <div style={S.actions}>
          <button style={S.accept} onClick={() => onAccept(invite.room)}>Join room</button>
          <button style={S.dismiss} onClick={onDismiss}>Dismiss</button>
        </div>
      </div>
    </div>
  )
}

const S = {
  wrap: { position: 'fixed', bottom: 20, right: 20, display: 'flex', gap: 12,
    background: 'var(--raised)', border: '1px solid var(--line-bright)',
    borderRadius: 10, padding: '14px 16px', maxWidth: 300, zIndex: 200,
    animation: 'up 0.25s ease', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' },
  icon: { fontSize: 18, flexShrink: 0, marginTop: 1 },
  body: { flex: 1 },
  title: { fontSize: 13, lineHeight: 1.4, marginBottom: 8 },
  actions: { display: 'flex', gap: 6 },
  accept: { padding: '5px 10px', background: 'var(--purple)', border: 'none',
    borderRadius: 6, color: '#fff', fontSize: 12, fontWeight: 600,
    fontFamily: 'var(--font)', cursor: 'pointer' },
  dismiss: { padding: '5px 10px', background: 'none', border: '1px solid var(--line)',
    borderRadius: 6, color: 'var(--text-dim)', fontSize: 12,
    fontFamily: 'var(--font)', cursor: 'pointer' }
}
