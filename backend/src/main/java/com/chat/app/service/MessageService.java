package com.chat.app.service;

import com.chat.app.model.ChatMessage;
import com.chat.app.model.MessageEntity;
import com.chat.app.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;

    @Value("${app.chat.history-size:50}")
    private int historySize;

    @Transactional
    public ChatMessage saveMessage(ChatMessage message) {
        MessageEntity entity = MessageEntity.from(message);
        MessageEntity saved = messageRepository.save(entity);
        // Return message with DB-generated ID
        message.setMessageId(saved.getId());
        return message;
    }

    @Transactional(readOnly = true)
    public List<ChatMessage> getRoomHistory(String room) {
        List<MessageEntity> entities = messageRepository.findRecentByRoom(
                room, PageRequest.of(0, historySize)
        );
        // Reverse so oldest messages appear first in chat
        Collections.reverse(entities);
        return entities.stream()
                .map(MessageEntity::toChatMessage)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChatMessage> getDMHistory(String userA, String userB) {
        List<MessageEntity> entities = messageRepository.findRecentDMs(
                userA, userB, PageRequest.of(0, historySize)
        );
        Collections.reverse(entities);
        return entities.stream()
                .map(MessageEntity::toChatMessage)
                .collect(Collectors.toList());
    }
}
