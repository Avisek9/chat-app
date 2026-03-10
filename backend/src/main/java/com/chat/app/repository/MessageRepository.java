package com.chat.app.repository;

import com.chat.app.model.MessageEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<MessageEntity, String> {

    // Fetch recent room messages ordered oldest-first for display
    @Query("""
        SELECT m FROM MessageEntity m
        WHERE m.room = :room
        ORDER BY m.timestamp DESC
        """)
    List<MessageEntity> findRecentByRoom(@Param("room") String room, Pageable pageable);

    // Fetch DM history between two users (order doesn't matter for the query — we sort after)
    @Query("""
        SELECT m FROM MessageEntity m
        WHERE m.type = 'PRIVATE'
          AND ((m.sender = :userA AND m.recipient = :userB)
            OR (m.sender = :userB AND m.recipient = :userA))
        ORDER BY m.timestamp DESC
        """)
    List<MessageEntity> findRecentDMs(@Param("userA") String userA,
                                      @Param("userB") String userB,
                                      Pageable pageable);
}
