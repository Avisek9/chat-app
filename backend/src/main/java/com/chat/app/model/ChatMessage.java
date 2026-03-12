package com.chat.app.model;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private MessageType type;
    private String sender;
    private String recipient;   
    private String room;        
    private String content;
    private long timestamp;
    private String messageId;   
}
