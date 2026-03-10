export default function TypingIndicator({ typers }) {
  if (!typers?.length) return <div style={{ height: 20 }} />
  const who = typers.length === 1 ? `${typers[0]} is typing` : `${typers.join(', ')} are typing`
  return (
    <div style={S.wrap}>
      <span style={{ ...S.dot, animationDelay: '0ms' }} />
      <span style={{ ...S.dot, animationDelay: '150ms' }} />
      <span style={{ ...S.dot, animationDelay: '300ms' }} />
      <span style={S.label}>{who}</span>
    </div>
  )
}

const S = {
  wrap: { display: 'flex', alignItems: 'center', gap: 4, padding: '2px 26px', height: 20 },
  dot: { width: 4, height: 4, borderRadius: '50%', background: 'var(--text-ghost)',
    display: 'inline-block', animation: 'bounce 1s infinite' },
  label: { fontSize: 11, color: 'var(--text-ghost)', fontFamily: 'var(--mono)', marginLeft: 2 }
}
