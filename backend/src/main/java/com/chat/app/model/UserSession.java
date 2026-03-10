package com.chat.app.model;

import lombok.*;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSession {
    private String username;
    private String sessionId;
    private boolean online;
    private long connectedAt;

    @Builder.Default
    private Set<String> rooms = ConcurrentHashMap.newKeySet();
}
