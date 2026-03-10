package com.chat.app.config;

import com.chat.app.model.ChatMessage;
import com.chat.app.model.MessageType;
import com.chat.app.service.UserSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messagingTemplate;
    private final UserSessionService userSessionService;

    @EventListener
    public void onConnect(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = accessor.getUser();
        if (principal == null) return;

        String username = principal.getName();
        String sessionId = accessor.getSessionId();

        userSessionService.connect(sessionId, username);
        log.info("Connected: {} (session {})", username, sessionId);

        // Tell everyone the updated list
        messagingTemplate.convertAndSend("/topic/online-users", userSessionService.getOnlineUsers());
    }

    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();

        userSessionService.getUserBySession(sessionId).ifPresent(username -> {
            log.info("Disconnected: {} (session {})", username, sessionId);

            // Send leave messages to all rooms the user was in
            userSessionService.getUserRooms(username).forEach(room -> {
                ChatMessage leave = ChatMessage.builder()
                        .type(MessageType.LEAVE)
                        .sender(username)
                        .room(room)
                        .content(username + " left")
                        .timestamp(Instant.now().toEpochMilli())
                        .build();
                messagingTemplate.convertAndSend("/topic/room/" + room, leave);
            });

            userSessionService.disconnect(sessionId);
            messagingTemplate.convertAndSend("/topic/online-users", userSessionService.getOnlineUsers());
        });
    }
}
