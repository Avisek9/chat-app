function timeStr(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function colorForName(name) {
  const palette = ['#6e5ff0','#e05f8a','#34d375','#e08534','#4cb8e0','#c45fd0']
  let h = 0
  for (const c of (name || '')) h = (h * 31 + c.charCodeAt(0)) % palette.length
  return palette[h]
}

export default function Message({ msg, isSelf, sameAuthorAsPrev }) {
  if (msg.type === 'JOIN' || msg.type === 'LEAVE') {
    return (
      <div style={S.event}>
        <span style={{ color: msg.type === 'JOIN' ? 'var(--green)' : 'var(--red)' }}>
          {msg.type === 'JOIN' ? '→' : '←'}
        </span>
        {' '}{msg.content}
        <span style={S.eventTime}>{timeStr(msg.timestamp)}</span>
      </div>
    )
  }

  const grouped = sameAuthorAsPrev && !isSelf

  return (
    <div style={{ ...S.row, flexDirection: isSelf ? 'row-reverse' : 'row',
      marginTop: sameAuthorAsPrev ? 2 : 10, animation: 'up 0.15s ease' }}>

      {!isSelf && (
        grouped
          ? <div style={S.avatarSpacer} />
          : <div style={{ ...S.avatar, background: colorForName(msg.sender) }}>
              {msg.sender[0].toUpperCase()}
            </div>
      )}

      <div style={{ maxWidth: '68%' }}>
        {!sameAuthorAsPrev && (
          <div style={{ ...S.meta, justifyContent: isSelf ? 'flex-end' : 'flex-start' }}>
            {!isSelf && <span style={{ ...S.name, color: colorForName(msg.sender) }}>{msg.sender}</span>}
            {msg.type === 'PRIVATE' && <span style={S.dmTag}>dm</span>}
            <span style={S.time}>{timeStr(msg.timestamp)}</span>
          </div>
        )}
        <div style={{ ...S.bubble,
          background: isSelf ? 'var(--purple)' : 'var(--raised)',
          borderRadius: isSelf ? '10px 3px 10px 10px' : '3px 10px 10px 10px' }}>
          {msg.content}
        </div>
        {isSelf && <div style={S.receipt}>sent {timeStr(msg.timestamp)}</div>}
      </div>
    </div>
  )
}

const S = {
  row: { display: 'flex', gap: 8, padding: '0 16px', alignItems: 'flex-end' },
  avatar: { width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, color: '#fff' },
  avatarSpacer: { width: 28, flexShrink: 0 },
  meta: { display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 },
  name: { fontSize: 12, fontWeight: 600 },
  dmTag: { fontSize: 9, background: 'var(--purple-faint)', color: 'var(--purple-soft)',
    border: '1px solid var(--purple)', padding: '1px 4px', borderRadius: 4,
    fontFamily: 'var(--mono)' },
  time: { fontSize: 10, color: 'var(--text-ghost)', fontFamily: 'var(--mono)' },
  bubble: { padding: '8px 11px', fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word',
    color: 'var(--text)' },
  receipt: { fontSize: 9, color: 'var(--text-ghost)', textAlign: 'right',
    marginTop: 2, fontFamily: 'var(--mono)' },
  event: { textAlign: 'center', fontSize: 11, color: 'var(--text-ghost)',
    fontFamily: 'var(--mono)', padding: '5px 0', display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: 5 },
  eventTime: { fontSize: 10, marginLeft: 3 }
}
