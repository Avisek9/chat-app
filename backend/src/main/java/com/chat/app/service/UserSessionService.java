package com.chat.app.service;

import com.chat.app.model.UserSession;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;


@Service
public class UserSessionService {


    private final Map<String, UserSession> sessions = new ConcurrentHashMap<>();

    public void connect(String stompSessionId, String username) {
        UserSession session = UserSession.builder()
                .username(username)
                .sessionId(stompSessionId)
                .online(true)
                .connectedAt(Instant.now().toEpochMilli())
                .build();
        sessions.put(stompSessionId, session);
    }

    public void disconnect(String stompSessionId) {
        sessions.remove(stompSessionId);
    }

    public Optional<String> getUserBySession(String stompSessionId) {
        return Optional.ofNullable(sessions.get(stompSessionId))
                .map(UserSession::getUsername);
    }

    public List<String> getOnlineUsers() {
        return sessions.values().stream()
                .map(UserSession::getUsername)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public void joinRoom(String stompSessionId, String room) {
        UserSession s = sessions.get(stompSessionId);
        if (s != null) s.getRooms().add(room);
    }

    public void leaveRoom(String stompSessionId, String room) {
        UserSession s = sessions.get(stompSessionId);
        if (s != null) s.getRooms().remove(room);
    }

    public Set<String> getUserRooms(String username) {
        return sessions.values().stream()
                .filter(s -> s.getUsername().equals(username))
                .findFirst()
                .map(UserSession::getRooms)
                .orElse(Collections.emptySet());
    }
}
