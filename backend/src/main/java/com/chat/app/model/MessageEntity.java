package com.chat.app.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "messages", indexes = {
    @Index(name = "idx_room", columnList = "room"),
    @Index(name = "idx_dm_participants", columnList = "sender, recipient")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageType type;

    @Column(nullable = false)
    private String sender;

    // null for room messages
    private String recipient;

    // null for DMs
    private String room;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(nullable = false)
    private long timestamp;

    // ── Helpers ──────────────────────────────────────────────────────────────

    public ChatMessage toChatMessage() {
        return ChatMessage.builder()
                .messageId(this.id)
                .type(this.type)
                .sender(this.sender)
                .recipient(this.recipient)
                .room(this.room)
                .content(this.content)
                .timestamp(this.timestamp)
                .build();
    }

    public static MessageEntity from(ChatMessage msg) {
        return MessageEntity.builder()
                .type(msg.getType())
                .sender(msg.getSender())
                .recipient(msg.getRecipient())
                .room(msg.getRoom())
                .content(msg.getContent())
                .timestamp(msg.getTimestamp())
                .build();
    }
}
