import { useEffect, useRef, useState, useCallback } from 'react'
import Message from './Message'
import TypingIndicator from './TypingIndicator'

export default function ChatWindow({ username, activeChat, messages, typers, onSendMessage, onTyping }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const typingTimer = useRef(null)
  const wasTyping = useRef(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fireTyping = useCallback(() => {
    if (!wasTyping.current) { wasTyping.current = true; onTyping?.() }
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => { wasTyping.current = false }, 2000)
  }, [onTyping])

  const send = () => {
    if (!input.trim()) return
    onSendMessage(input.trim())
    setInput('')
    wasTyping.current = false
    clearTimeout(typingTimer.current)
  }

  if (!activeChat) return (
    <div style={S.empty}>
      <p style={S.emptyTitle}>Pick a room or start a DM</p>
      <p style={S.emptySub}>Use the sidebar to join or create a room</p>
    </div>
  )

  const isDM = activeChat.type === 'dm'

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <span style={S.headerTitle}>
          {isDM ? <><span style={S.onlineDot} />{activeChat.id}</> : <><span style={S.hashSign}>#</span>{activeChat.id}</>}
        </span>
        {isDM && <span style={S.dmChip}>Direct message</span>}
      </div>

      <div style={S.feed}>
        {messages.length === 0 && (
          <p style={S.feedEmpty}>No messages yet. Say something.</p>
        )}
        {messages.map((msg, i) => (
          <Message key={msg.messageId || `${msg.timestamp}-${i}`}
            msg={msg}
            isSelf={msg.sender === username}
            sameAuthorAsPrev={i > 0 && messages[i-1].sender === msg.sender && messages[i-1].type === msg.type}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <TypingIndicator typers={typers} />

      <div style={S.bar}>
        <textarea style={S.input} rows={1}
          placeholder={`Message ${isDM ? activeChat.id : '#' + activeChat.id}`}
          value={input}
          onChange={e => { setInput(e.target.value); fireTyping() }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
        />
        <button style={{ ...S.sendBtn, opacity: input.trim() ? 1 : 0.3 }} onClick={send}>↑</button>
      </div>
    </div>
  )
}

const S = {
  wrap: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { padding: '13px 18px', borderBottom: '1px solid var(--line)',
    display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
    background: 'var(--surface)' },
  headerTitle: { fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 },
  hashSign: { color: 'var(--text-ghost)' },
  onlineDot: { width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' },
  dmChip: { fontSize: 10, background: 'var(--purple-faint)', color: 'var(--purple-soft)',
    border: '1px solid var(--purple)', padding: '2px 7px', borderRadius: 4,
    fontFamily: 'var(--mono)' },
  feed: { flex: 1, overflowY: 'auto', padding: '14px 0' },
  feedEmpty: { padding: '20px 18px', fontSize: 13, color: 'var(--text-ghost)', fontFamily: 'var(--mono)' },
  bar: { display: 'flex', gap: 8, padding: '10px 14px', borderTop: '1px solid var(--line)',
    background: 'var(--surface)', flexShrink: 0, alignItems: 'flex-end' },
  input: { flex: 1, background: 'var(--raised)', border: '1px solid var(--line)',
    borderRadius: 8, padding: '10px 13px', color: 'var(--text)', fontFamily: 'var(--font)',
    fontSize: 14, resize: 'none', outline: 'none', lineHeight: 1.5, maxHeight: 110 },
  sendBtn: { width: 36, height: 36, background: 'var(--purple)', border: 'none',
    borderRadius: 8, color: '#fff', fontSize: 16, fontWeight: 700,
    cursor: 'pointer', flexShrink: 0, transition: 'opacity 0.15s' },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 6 },
  emptyTitle: { fontWeight: 600, fontSize: 15, color: 'var(--text-dim)' },
  emptySub: { fontSize: 13, color: 'var(--text-ghost)', fontFamily: 'var(--mono)' }
}
