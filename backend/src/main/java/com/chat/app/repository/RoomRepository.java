package com.chat.app.repository;

import com.chat.app.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, String> {

    @Query("SELECT r FROM Room r WHERE :username MEMBER OF r.members")
    List<Room> findRoomsByMember(@Param("username") String username);
}
