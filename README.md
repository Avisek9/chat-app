# NexChat

A real-time chat application built with Spring Boot and React. Supports multiple rooms, direct messages, typing indicators, and user invites.

![Java](https://img.shields.io/badge/Java-17-orange) ![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-green) ![React](https://img.shields.io/badge/React-18-blue)

---

## Features

- **Authentication** — register/login with Spring Security (HTTP session + BCrypt)
- **Chat Rooms** — create any room, persistent across sessions via H2
- **Invite Users** — invite online users to rooms; they get a real-time notification
- **Direct Messages** — private conversations between any two users
- **Typing Indicators** — shows who's typing in real time, both in rooms and DMs
- **Message History** — last 50 messages loaded from H2 when you open a room or DM
- **Online Presence** — live list of who's connected, updates on join/leave
- **Auto-reconnect** — WebSocket reconnects automatically if the connection drops

---

## Tech Stack

| | |
|---|---|
| Backend | Java 17, Spring Boot 3.2, Spring WebSocket (STOMP), Spring Security, Spring Data JPA |
| Database | H2 (in-memory, can swap for MySQL) |
| Frontend | React 18, Vite, @stomp/stompjs, SockJS |

---

## Getting Started

**Requirements:** Java 17+, Node 18+, Maven

### 1. Start the backend

```bash
cd backend
./mvnw spring-boot:run
```

Runs on `http://localhost:8080`

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`

Open two browser tabs, register two different accounts, and test the chat.

### H2 Console

While the backend is running, you can inspect the database at:

```
http://localhost:8080/h2-console
JDBC URL: jdbc:h2:mem:chatdb
Username: sa
Password: (leave blank)
```

---

## Project Structure

```
chat-app/
├── backend/
│   └── src/main/java/com/chat/app/
│       ├── config/
│       │   ├── SecurityConfig.java        # Spring Security — form login, CSRF, session
│       │   ├── WebSocketConfig.java       # STOMP broker setup
│       │   └── WebSocketEventListener.java
│       ├── controller/
│       │   ├── AuthController.java        # /api/auth/register, /me
│       │   ├── ChatController.java        # WebSocket message handlers
│       │   ├── RoomController.java        # join, invite, members
│       │   └── UserController.java        # online users, message history
│       ├── model/
│       │   ├── AppUser.java               # JPA entity for registered users
│       │   ├── Room.java                  # JPA entity, tracks members
│       │   ├── MessageEntity.java         # persisted chat message
│       │   └── ChatMessage.java           # WebSocket DTO
│       ├── repository/
│       │   ├── UserRepository.java
│       │   ├── RoomRepository.java
│       │   └── MessageRepository.java
│       └── service/
│           ├── ChatUserDetailsService.java  # Spring Security UserDetailsService
│           ├── RoomService.java
│           ├── MessageService.java
│           └── UserSessionService.java      # tracks live WebSocket sessions
│
└── frontend/
    └── src/
        ├── hooks/
        │   └── useWebSocket.js          # STOMP connection, subscriptions
        ├── components/
        │   ├── LoginScreen.jsx          # register + login
        │   ├── Sidebar.jsx              # rooms, DMs, invite button
        │   ├── ChatWindow.jsx           # message feed + input
        │   ├── Message.jsx              # individual message bubble
        │   ├── TypingIndicator.jsx
        │   ├── InviteModal.jsx          # pick users to invite
        │   └── InviteToast.jsx          # incoming invite notification
        └── App.jsx                      # state, routing between views
```

---

## How the WebSocket Routing Works

```
# Room messages
Client  →  /app/room/{room}/send      →  broadcasts to /topic/room/{room}
Client  →  /app/room/{room}/join      →  broadcasts join event
Client  →  /app/room/{room}/typing    →  broadcasts to /topic/room/{room}/typing

# Private messages
Client  →  /app/private/send          →  routes to /user/{recipient}/queue/private
Client  →  /app/private/typing        →  routes to /user/{recipient}/queue/typing

# Invites
Server  →  /user/{username}/queue/invites   (sent after POST /api/rooms/{room}/invite)

# Presence
Server  →  /topic/online-users        (broadcast on connect/disconnect)
```

---

## Switching to MySQL

In `application.properties`, replace the H2 config with:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/chatdb
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
spring.jpa.hibernate.ddl-auto=update
```

And add the MySQL connector to `pom.xml`:

```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```
