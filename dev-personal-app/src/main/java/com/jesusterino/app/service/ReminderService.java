package com.jesusterino.app.service;

import com.jesusterino.app.dto.ReminderDTO;
import com.jesusterino.app.model.Reminder;
import com.jesusterino.app.model.User;
import com.jesusterino.app.repository.ReminderRepository;
import com.jesusterino.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReminderService {

    private final ReminderRepository reminderRepository;
    private final UserRepository userRepository;

    public List<ReminderDTO> getReminders(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return reminderRepository.findByUser(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ReminderDTO addReminder(String username, ReminderDTO dto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Reminder reminder = Reminder.builder()
                .text(dto.getText())
                .color(dto.getColor())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .allDay(dto.isAllDay())
                .user(user)
                .build();

        return convertToDTO(reminderRepository.save(reminder));
    }

    public void deleteReminder(Long id) {
        reminderRepository.deleteById(id);
    }

    private ReminderDTO convertToDTO(Reminder reminder) {
        return ReminderDTO.builder()
                .id(reminder.getId())
                .text(reminder.getText())
                .color(reminder.getColor())
                .startTime(reminder.getStartTime())
                .endTime(reminder.getEndTime())
                .allDay(reminder.isAllDay())
                .build();
    }
}
