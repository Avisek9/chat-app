import { useState, useCallback, useEffect, useRef } from 'react'
import LoginScreen from './components/LoginScreen'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import InviteToast from './components/InviteToast'
import { useWebSocket } from './hooks/useWebSocket'

const TYPING_EXPIRE = 2500

export default function App() {
  const [username, setUsername] = useState(null)
  const [activeChat, setActiveChat] = useState(null)
  const [joinedRooms, setJoinedRooms] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [messages, setMessages] = useState({})
  const [pendingInvite, setPendingInvite] = useState(null)

  const typersRef = useRef({})
  const [typers, setTypers] = useState({})

  const key = (chat) => chat ? `${chat.type}:${chat.id}` : null

  const addMsg = useCallback((k, msg) => {
    setMessages(prev => ({ ...prev, [k]: [...(prev[k] || []), msg] }))
  }, [])

  const loadHistory = useCallback(async (chat) => {
    const k = key(chat)
    setMessages(prev => prev[k] ? prev : { ...prev, [k]: [] })
    try {
      const url = chat.type === 'room'
        ? `/api/history/room/${chat.id}`
        : `/api/history/dm?userA=${username}&userB=${chat.id}`
      const res = await fetch(url, { credentials: 'include' })
      const history = await res.json()
      if (history.length > 0) {
        setMessages(prev => ({ ...prev, [k]: prev[k]?.length ? prev[k] : history }))
      }
    } catch (err) {
      console.error('history fetch failed', err)
    }
  }, [username])

  const trackTyping = useCallback((msg) => {
    const k = msg.room ? `room:${msg.room}` : `dm:${msg.sender}`
    if (!typersRef.current[k]) typersRef.current[k] = {}
    clearTimeout(typersRef.current[k][msg.sender])
    typersRef.current[k][msg.sender] = setTimeout(() => {
      delete typersRef.current[k][msg.sender]
      setTypers(p => ({ ...p, [k]: Object.keys(typersRef.current[k] || {}) }))
    }, TYPING_EXPIRE)
    setTypers(p => ({ ...p, [k]: Object.keys(typersRef.current[k]) }))
  }, [])

  const { connected, joinRoom, sendRoomMessage, sendPrivateMessage, sendTypingRoom, sendTypingPrivate } =
    useWebSocket({
      username,
      onMessage: useCallback((msg) => addMsg(`room:${msg.room}`, msg), [addMsg]),
      onPrivateMessage: useCallback((msg) => {
        const other = msg.sender === username ? msg.recipient : msg.sender
        addMsg(`dm:${other}`, msg)
      }, [addMsg, username]),
      onOnlineUsers: setOnlineUsers,
      onTyping: trackTyping,
      onInvite: setPendingInvite,
    })

  
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.username) {
          setUsername(data.username)
          setJoinedRooms(data.rooms || [])
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!username) return
    fetch('/api/users/online', { credentials: 'include' }).then(r => r.json()).then(setOnlineUsers).catch(() => {})
  }, [username])

  const handleJoinRoom = useCallback(async (room) => {
    const chat = { type: 'room', id: room }
    if (!joinedRooms.includes(room)) {
      // Register room on server so invite system works
      await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '') },
        body: JSON.stringify({ room }),
        credentials: 'include'
      })
      setJoinedRooms(p => [...p, room])
      joinRoom(room)
    }
    setActiveChat(chat)
    loadHistory(chat)
  }, [joinedRooms, joinRoom, loadHistory])

  const handleLogout = async () => {
    const csrf = decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '')
    await fetch('/api/auth/logout', { method: 'POST', headers: { 'X-XSRF-TOKEN': csrf }, credentials: 'include' })
    setUsername(null)
    setJoinedRooms([])
    setActiveChat(null)
    setMessages({})
  }

  const handleSend = useCallback((content) => {
    if (!activeChat) return
    activeChat.type === 'room'
      ? sendRoomMessage(activeChat.id, content)
      : sendPrivateMessage(activeChat.id, content)
  }, [activeChat, sendRoomMessage, sendPrivateMessage])

  const handleTyping = useCallback(() => {
    if (!activeChat) return
    activeChat.type === 'room' ? sendTypingRoom(activeChat.id) : sendTypingPrivate(activeChat.id)
  }, [activeChat, sendTypingRoom, sendTypingPrivate])

  if (!username) return <LoginScreen onLogin={setUsername} />

  const activeKey = key(activeChat)
  const activeMessages = (activeKey && messages[activeKey]) || []
  const activeTypers = ((activeKey && typers[activeKey]) || []).filter(u => u !== username)

  return (
    <div style={S.app}>
      {!connected && (
        <div style={S.banner}>
          <span style={{ animation: 'blink 1s infinite' }}>●</span> Reconnecting...
        </div>
      )}

      <Sidebar
        username={username}
        joinedRooms={joinedRooms}
        activeChat={activeChat}
        onSelectRoom={(room) => { const c = { type: 'room', id: room }; setActiveChat(c); loadHistory(c) }}
        onSelectDM={(u) => { const c = { type: 'dm', id: u }; setActiveChat(c); loadHistory(c) }}
        onlineUsers={onlineUsers}
        onJoinRoom={handleJoinRoom}
        onLogout={handleLogout}
      />

      <ChatWindow
        username={username}
        activeChat={activeChat}
        messages={activeMessages}
        typers={activeTypers}
        onSendMessage={handleSend}
        onTyping={handleTyping}
      />

      {pendingInvite && (
        <InviteToast
          invite={pendingInvite}
          onAccept={(room) => { handleJoinRoom(room); setPendingInvite(null) }}
          onDismiss={() => setPendingInvite(null)}
        />
      )}
    </div>
  )
}

const S = {
  app: { height: '100%', display: 'flex', overflow: 'hidden' },
  banner: { position: 'fixed', top: 10, left: '50%', transform: 'translateX(-50%)',
    background: 'var(--raised)', border: '1px solid var(--line-bright)',
    borderRadius: 8, padding: '6px 14px', fontSize: 11, fontFamily: 'var(--mono)',
    color: 'var(--text-dim)', zIndex: 999, display: 'flex', alignItems: 'center', gap: 7 }
}
