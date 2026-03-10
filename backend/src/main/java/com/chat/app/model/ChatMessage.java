package com.chat.app.model;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private MessageType type;
    private String sender;
    private String recipient;   // For DMs
    private String room;        // For room messages
    private String content;
    private long timestamp;
    private String messageId;   // Unique ID for read receipts
}
