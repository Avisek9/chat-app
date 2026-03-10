package com.chat.app.service;

import com.chat.app.model.Room;
import com.chat.app.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;

    @Transactional
    public Room getOrCreate(String roomName, String createdBy) {
        return roomRepository.findById(roomName).orElseGet(() -> {
            Room room = Room.builder()
                    .name(roomName)
                    .createdBy(createdBy)
                    .createdAt(Instant.now().toEpochMilli())
                    .build();
            room.addMember(createdBy);
            return roomRepository.save(room);
        });
    }

    @Transactional
    public Room joinRoom(String roomName, String username) {
        Room room = roomRepository.findById(roomName)
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + roomName));
        room.addMember(username);
        return roomRepository.save(room);
    }

    @Transactional
    public Room inviteUser(String roomName, String invitedBy, String targetUsername) {
        Room room = roomRepository.findById(roomName)
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + roomName));

        if (!room.isMember(invitedBy)) {
            throw new SecurityException("You are not a member of this room");
        }
        room.addMember(targetUsername);
        return roomRepository.save(room);
    }

    @Transactional(readOnly = true)
    public Optional<Room> findRoom(String roomName) {
        return roomRepository.findById(roomName);
    }

    @Transactional(readOnly = true)
    public List<Room> getRoomsForUser(String username) {
        return roomRepository.findRoomsByMember(username);
    }

    @Transactional(readOnly = true)
    public List<String> getMembers(String roomName) {
        return roomRepository.findById(roomName)
                .map(r -> r.getMembers().stream().sorted().toList())
                .orElse(List.of());
    }
}
