import { useEffect, useRef, useCallback, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function useWebSocket({ username, onMessage, onOnlineUsers, onPrivateMessage, onTyping, onInvite }) {
  const clientRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const subscribedRooms = useRef(new Set())

  useEffect(() => {
    if (!username) return

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 3000,
      onConnect: () => {
        setConnected(true)

        client.subscribe('/topic/online-users', (msg) => {
          onOnlineUsers?.(JSON.parse(msg.body))
        })

        client.subscribe('/user/queue/private', (msg) => {
          onPrivateMessage?.(JSON.parse(msg.body))
        })

        client.subscribe('/user/queue/typing', (msg) => {
          onTyping?.(JSON.parse(msg.body))
        })

        // Room invite notifications
        client.subscribe('/user/queue/invites', (msg) => {
          onInvite?.(JSON.parse(msg.body))
        })
      },
      onDisconnect: () => setConnected(false),
      onStompError: (frame) => console.error('STOMP error', frame),
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
      subscribedRooms.current.clear()
    }
  }, [username])

  const joinRoom = useCallback((roomName) => {
    const client = clientRef.current
    if (!client?.connected || subscribedRooms.current.has(roomName)) return

    subscribedRooms.current.add(roomName)

    client.subscribe(`/topic/room/${roomName}`, (msg) => {
      onMessage?.(JSON.parse(msg.body))
    })

    client.subscribe(`/topic/room/${roomName}/typing`, (msg) => {
      onTyping?.(JSON.parse(msg.body))
    })

    client.publish({
      destination: `/app/room/${roomName}/join`,
      body: JSON.stringify({ sender: username, room: roomName })
    })
  }, [username, onMessage, onTyping])

  const leaveRoom = useCallback((roomName) => {
    const client = clientRef.current
    if (!client?.connected) return
    subscribedRooms.current.delete(roomName)
    client.publish({
      destination: `/app/room/${roomName}/leave`,
      body: JSON.stringify({ sender: username, room: roomName })
    })
  }, [username])

  const sendRoomMessage = useCallback((roomName, content) => {
    clientRef.current?.publish({
      destination: `/app/room/${roomName}/send`,
      body: JSON.stringify({ sender: username, room: roomName, content })
    })
  }, [username])

  const sendPrivateMessage = useCallback((recipient, content) => {
    clientRef.current?.publish({
      destination: `/app/private/send`,
      body: JSON.stringify({ sender: username, recipient, content })
    })
  }, [username])

  const sendTypingRoom = useCallback((roomName) => {
    clientRef.current?.publish({
      destination: `/app/room/${roomName}/typing`,
      body: JSON.stringify({ sender: username, room: roomName })
    })
  }, [username])

  const sendTypingPrivate = useCallback((recipient) => {
    clientRef.current?.publish({
      destination: `/app/private/typing`,
      body: JSON.stringify({ sender: username, recipient })
    })
  }, [username])

  return { connected, joinRoom, leaveRoom, sendRoomMessage, sendPrivateMessage, sendTypingRoom, sendTypingPrivate }
}
