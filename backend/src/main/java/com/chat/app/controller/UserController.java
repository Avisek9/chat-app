package com.chat.app.controller;

import com.chat.app.model.ChatMessage;
import com.chat.app.service.MessageService;
import com.chat.app.service.UserSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserSessionService userSessionService;
    private final MessageService messageService;

    @GetMapping("/users/online")
    public ResponseEntity<List<String>> getOnlineUsers() {
        return ResponseEntity.ok(userSessionService.getOnlineUsers());
    }

    @GetMapping("/history/room/{room}")
    public ResponseEntity<List<ChatMessage>> getRoomHistory(@PathVariable String room) {
        return ResponseEntity.ok(messageService.getRoomHistory(room));
    }

    @GetMapping("/history/dm")
    public ResponseEntity<List<ChatMessage>> getDMHistory(@RequestParam String userA,
                                                          @RequestParam String userB) {
        return ResponseEntity.ok(messageService.getDMHistory(userA, userB));
    }
}
