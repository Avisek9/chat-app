import { useState } from 'react'
import InviteModal from './InviteModal'

export default function Sidebar({ username, joinedRooms, activeChat, onSelectRoom, onSelectDM, onlineUsers, onJoinRoom, onLogout }) {
  const [tab, setTab] = useState('rooms')
  const [newRoom, setNewRoom] = useState('')
  const [inviteRoom, setInviteRoom] = useState(null)

  const submitNewRoom = (e) => {
    e.preventDefault()
    const r = newRoom.trim().toLowerCase().replace(/\s+/g, '-')
    if (r) { onJoinRoom(r); setNewRoom('') }
  }

  return (
    <aside style={S.sidebar}>
      <div style={S.top}>
        <div style={S.brand}>
          <span style={S.brandMark}>N</span>
          <span style={S.brandName}>NexChat</span>
        </div>
        <div style={S.whoami}>
          <span style={S.dot} />
          <span style={S.me}>{username}</span>
          <button style={S.logoutBtn} onClick={onLogout} title="Sign out">⏻</button>
        </div>
      </div>

      <div style={S.tabs}>
        <button onClick={() => setTab('rooms')} style={{ ...S.tab, ...(tab === 'rooms' ? S.tabOn : {}) }}>
          Rooms
        </button>
        <button onClick={() => setTab('dms')} style={{ ...S.tab, ...(tab === 'dms' ? S.tabOn : {}) }}>
          Direct
        </button>
      </div>

      <div style={S.body}>
        {tab === 'rooms' ? (
          <>
            {joinedRooms.length > 0 && (
              <>
                <p style={S.section}>Joined</p>
                {joinedRooms.map(room => (
                  <div key={room} style={S.roomRow}>
                    <button onClick={() => onSelectRoom(room)}
                      style={{ ...S.item, ...(activeChat?.type === 'room' && activeChat.id === room ? S.itemOn : {}) }}>
                      <span style={S.hash}>#</span>{room}
                    </button>
                    <button style={S.inviteIcon} title="Invite someone"
                      onClick={() => setInviteRoom(room)}>+</button>
                  </div>
                ))}
              </>
            )}

            <p style={S.section}>New room</p>
            <form onSubmit={submitNewRoom} style={S.newRoomRow}>
              <input style={S.newRoomInput} value={newRoom} maxLength={20}
                placeholder="room-name" onChange={e => setNewRoom(e.target.value)} />
              <button type="submit" style={S.newRoomBtn}>→</button>
            </form>
          </>
        ) : (
          <>
            <p style={S.section}>Online · {onlineUsers.filter(u => u !== username).length}</p>
            {onlineUsers.filter(u => u !== username).length === 0
              ? <p style={S.empty}>Nobody else here yet</p>
              : onlineUsers.filter(u => u !== username).map(u => (
                  <button key={u} onClick={() => onSelectDM(u)}
                    style={{ ...S.item, ...(activeChat?.type === 'dm' && activeChat.id === u ? S.itemOn : {}) }}>
                    <span style={S.onlineDot} />{u}
                  </button>
                ))
            }
          </>
        )}
      </div>

      {inviteRoom && (
        <InviteModal
          room={inviteRoom}
          onlineUsers={onlineUsers}
          currentUser={username}
          onClose={() => setInviteRoom(null)}
        />
      )}
    </aside>
  )
}

const S = {
  sidebar: { width: 220, background: 'var(--surface)', borderRight: '1px solid var(--line)',
    display: 'flex', flexDirection: 'column', flexShrink: 0 },
  top: { padding: '16px 14px 12px', borderBottom: '1px solid var(--line)' },
  brand: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  brandMark: { width: 24, height: 24, background: 'var(--purple)', borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, color: '#fff' },
  brandName: { fontWeight: 700, fontSize: 14 },
  whoami: { display: 'flex', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 },
  me: { fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--mono)', flex: 1,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  logoutBtn: { background: 'none', border: 'none', color: 'var(--text-ghost)',
    cursor: 'pointer', fontSize: 14, padding: '2px 4px', lineHeight: 1 },
  tabs: { display: 'flex', borderBottom: '1px solid var(--line)' },
  tab: { flex: 1, padding: '9px 0', background: 'none', border: 'none',
    color: 'var(--text-ghost)', fontFamily: 'var(--font)', fontWeight: 500,
    fontSize: 12, cursor: 'pointer', transition: 'color 0.15s' },
  tabOn: { color: 'var(--text)', borderBottom: '2px solid var(--purple)' },
  body: { flex: 1, overflowY: 'auto', padding: '10px 8px' },
  section: { fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.8px', color: 'var(--text-ghost)', padding: '8px 6px 4px',
    fontFamily: 'var(--mono)' },
  roomRow: { display: 'flex', alignItems: 'center', gap: 2 },
  item: { flex: 1, display: 'flex', alignItems: 'center', gap: 7, padding: '7px 8px',
    background: 'none', border: 'none', borderRadius: 6, color: 'var(--text-dim)',
    fontFamily: 'var(--font)', fontSize: 13, cursor: 'pointer', textAlign: 'left',
    transition: 'all 0.12s', minWidth: 0 },
  itemOn: { background: 'var(--purple-faint)', color: 'var(--purple-soft)' },
  inviteIcon: { flexShrink: 0, width: 22, height: 22, background: 'none', border: 'none',
    borderRadius: 5, color: 'var(--text-ghost)', fontSize: 16, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.12s', lineHeight: 1 },
  hash: { color: 'var(--text-ghost)', fontSize: 12 },
  onlineDot: { width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 },
  empty: { fontSize: 12, color: 'var(--text-ghost)', fontFamily: 'var(--mono)', padding: '6px 8px' },
  newRoomRow: { display: 'flex', gap: 4, padding: '4px 2px' },
  newRoomInput: { flex: 1, background: 'var(--bg)', border: '1px solid var(--line)',
    borderRadius: 6, padding: '7px 9px', color: 'var(--text)', fontFamily: 'var(--mono)',
    fontSize: 12, outline: 'none', minWidth: 0 },
  newRoomBtn: { flexShrink: 0, width: 30, background: 'var(--purple)', border: 'none',
    borderRadius: 6, color: '#fff', fontWeight: 700, cursor: 'pointer' }
}
