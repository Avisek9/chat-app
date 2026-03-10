package com.chat.app.controller;

import com.chat.app.service.ChatUserDetailsService;
import com.chat.app.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final ChatUserDetailsService userDetailsService;
    private final RoomService roomService;

    // Called on page load to check if the user is already logged in
    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserDetails user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        // Restore rooms the user belongs to
        var rooms = roomService.getRoomsForUser(user.getUsername())
                .stream().map(r -> r.getName()).toList();
        return ResponseEntity.ok(Map.of("username", user.getUsername(), "rooms", rooms));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        if (username == null || username.isBlank() || password == null || password.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Username and password required"));
        if (username.length() < 2 || username.length() > 20)
            return ResponseEntity.badRequest().body(Map.of("error", "Username must be 2-20 characters"));
        if (!username.matches("[a-zA-Z0-9_]+"))
            return ResponseEntity.badRequest().body(Map.of("error", "Letters, numbers, underscores only"));
        if (password.length() < 4)
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 4 characters"));

        try {
            userDetailsService.register(username, password);
            return ResponseEntity.ok(Map.of("message", "Registered. You can now log in."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
