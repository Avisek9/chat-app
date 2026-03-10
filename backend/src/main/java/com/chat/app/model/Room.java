package com.chat.app.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "rooms")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    private String name; // room name is the natural key (e.g. "general")

    @Column(nullable = false)
    private String createdBy;

    @Column(nullable = false)
    private long createdAt;

    // Users explicitly invited or who have joined
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "room_members", joinColumns = @JoinColumn(name = "room_name"))
    @Column(name = "username")
    @Builder.Default
    private Set<String> members = new HashSet<>();

    public void addMember(String username) {
        members.add(username);
    }

    public boolean isMember(String username) {
        return members.contains(username);
    }
}
