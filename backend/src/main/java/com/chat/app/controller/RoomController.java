package com.chat.app.controller;

import com.chat.app.model.ChatMessage;
import com.chat.app.model.MessageType;
import com.chat.app.model.Room;
import com.chat.app.service.RoomService;
import com.chat.app.service.UserSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final UserSessionService userSessionService;
    private final SimpMessageSendingOperations messagingTemplate;

    // Create or join a room
    @PostMapping("/join")
    public ResponseEntity<?> joinRoom(@RequestBody Map<String, String> body,
                                      @AuthenticationPrincipal UserDetails user) {
        String roomName = body.get("room");
        if (roomName == null || roomName.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Room name required"));

        String clean = roomName.toLowerCase().replaceAll("[^a-z0-9-]", "-");
        Room room = roomService.getOrCreate(clean, user.getUsername());
        return ResponseEntity.ok(Map.of(
                "room", room.getName(),
                "members", room.getMembers(),
                "createdBy", room.getCreatedBy()
        ));
    }

    // Get members of a room
    @GetMapping("/{room}/members")
    public ResponseEntity<?> getMembers(@PathVariable String room,
                                        @AuthenticationPrincipal UserDetails user) {
        List<String> members = roomService.getMembers(room);
        return ResponseEntity.ok(Map.of("members", members));
    }

    // Invite a user to a room — sends them a WebSocket notification too
    @PostMapping("/{room}/invite")
    public ResponseEntity<?> inviteUser(@PathVariable String room,
                                        @RequestBody Map<String, String> body,
                                        @AuthenticationPrincipal UserDetails inviter) {
        String targetUsername = body.get("username");
        if (targetUsername == null || targetUsername.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Target username required"));

        // Check invitee is actually online
        if (!userSessionService.getOnlineUsers().contains(targetUsername)) {
            return ResponseEntity.badRequest().body(Map.of("error", targetUsername + " is not online"));
        }

        try {
            roomService.inviteUser(room, inviter.getUsername(), targetUsername);
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }

        // Push a real-time invite notification to the target user
        ChatMessage invite = ChatMessage.builder()
                .type(MessageType.INVITE)
                .sender(inviter.getUsername())
                .recipient(targetUsername)
                .room(room)
                .content(inviter.getUsername() + " invited you to #" + room)
                .timestamp(Instant.now().toEpochMilli())
                .build();

        messagingTemplate.convertAndSendToUser(targetUsername, "/queue/invites", invite);

        return ResponseEntity.ok(Map.of("message", targetUsername + " invited to #" + room));
    }

    // Get all rooms the current user is a member of
    @GetMapping("/mine")
    public ResponseEntity<?> myRooms(@AuthenticationPrincipal UserDetails user) {
        List<String> rooms = roomService.getRoomsForUser(user.getUsername())
                .stream().map(Room::getName).toList();
        return ResponseEntity.ok(Map.of("rooms", rooms));
    }
}
