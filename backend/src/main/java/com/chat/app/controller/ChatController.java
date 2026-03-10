package com.chat.app.controller;

import com.chat.app.model.ChatMessage;
import com.chat.app.model.MessageType;
import com.chat.app.service.MessageService;
import com.chat.app.service.UserSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

import java.time.Instant;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessageSendingOperations messagingTemplate;
    private final UserSessionService userSessionService;
    private final MessageService messageService;

    @MessageMapping("/room/{roomName}/send")
    public void sendRoomMessage(@DestinationVariable String roomName,
                                @Payload ChatMessage message,
                                SimpMessageHeaderAccessor headerAccessor) {
        message.setType(MessageType.CHAT);
        message.setRoom(roomName);
        message.setTimestamp(Instant.now().toEpochMilli());
        ChatMessage saved = messageService.saveMessage(message);
        log.info("[{}] {}: {}", roomName, saved.getSender(), saved.getContent());
        messagingTemplate.convertAndSend("/topic/room/" + roomName, saved);
    }

    @MessageMapping("/room/{roomName}/join")
    public void joinRoom(@DestinationVariable String roomName,
                         @Payload ChatMessage message,
                         SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        userSessionService.joinRoom(sessionId, roomName);
        ChatMessage joinMessage = ChatMessage.builder()
                .type(MessageType.JOIN)
                .sender(message.getSender())
                .room(roomName)
                .content(message.getSender() + " joined the room")
                .timestamp(Instant.now().toEpochMilli())
                .build();
        log.info("[{}] {} joined", roomName, message.getSender());
        messagingTemplate.convertAndSend("/topic/room/" + roomName, joinMessage);
    }

    @MessageMapping("/room/{roomName}/leave")
    public void leaveRoom(@DestinationVariable String roomName,
                          @Payload ChatMessage message,
                          SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        userSessionService.leaveRoom(sessionId, roomName);
        ChatMessage leaveMessage = ChatMessage.builder()
                .type(MessageType.LEAVE)
                .sender(message.getSender())
                .room(roomName)
                .content(message.getSender() + " left the room")
                .timestamp(Instant.now().toEpochMilli())
                .build();
        log.info("[{}] {} left", roomName, message.getSender());
        messagingTemplate.convertAndSend("/topic/room/" + roomName, leaveMessage);
    }

    @MessageMapping("/room/{roomName}/typing")
    public void typingInRoom(@DestinationVariable String roomName,
                             @Payload ChatMessage message) {
        message.setType(MessageType.TYPING);
        message.setRoom(roomName);
        message.setTimestamp(Instant.now().toEpochMilli());
        messagingTemplate.convertAndSend("/topic/room/" + roomName + "/typing", message);
    }

    @MessageMapping("/private/send")
    public void sendPrivateMessage(@Payload ChatMessage message) {
        message.setType(MessageType.PRIVATE);
        message.setTimestamp(Instant.now().toEpochMilli());
        ChatMessage saved = messageService.saveMessage(message);
        messagingTemplate.convertAndSendToUser(saved.getRecipient(), "/queue/private", saved);
        messagingTemplate.convertAndSendToUser(saved.getSender(), "/queue/private", saved);
        log.info("[DM] {} -> {}: {}", saved.getSender(), saved.getRecipient(), saved.getContent());
    }

    @MessageMapping("/private/typing")
    public void typingPrivate(@Payload ChatMessage message) {
        message.setType(MessageType.TYPING);
        message.setTimestamp(Instant.now().toEpochMilli());
        messagingTemplate.convertAndSendToUser(message.getRecipient(), "/queue/typing", message);
    }
}
