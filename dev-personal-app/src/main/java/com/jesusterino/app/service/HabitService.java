package com.jesusterino.app.service;

import com.jesusterino.app.dto.HabitDTO;
import com.jesusterino.app.model.Habit;
import com.jesusterino.app.model.User;
import com.jesusterino.app.repository.HabitRepository;
import com.jesusterino.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HabitService {

    private final HabitRepository habitRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<HabitDTO> getHabitsByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return habitRepository.findByUser(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public HabitDTO addHabit(String username, HabitDTO habitDTO) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Habit habit = Habit.builder()
                .name(habitDTO.getName())
                .type(habitDTO.getType())
                .targetCount(habitDTO.getTargetCount() != null ? habitDTO.getTargetCount() : 1)
                .currentCount(0)
                .completed(false)
                .user(user)
                .build();

        return convertToDTO(habitRepository.save(habit));
    }

    @Transactional
    public HabitDTO toggleHabit(Long habitId) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Hábito no encontrado"));

        if ("daily".equals(habit.getType())) {
            habit.setCompleted(!habit.isCompleted());
        } else {
            // Para semanal o mensual, incrementamos el contador
            int nextCount = (habit.getCurrentCount() != null ? habit.getCurrentCount() : 0) + 1;
            habit.setCurrentCount(nextCount);

            if (habit.getTargetCount() != null && nextCount >= habit.getTargetCount()) {
                habit.setCompleted(true);
            }
        }

        return convertToDTO(habitRepository.save(habit));
    }

    @Transactional
    public void deleteHabit(Long habitId) {
        habitRepository.deleteById(habitId);
    }

    private HabitDTO convertToDTO(Habit habit) {
        return HabitDTO.builder()
                .id(habit.getId())
                .name(habit.getName())
                .type(habit.getType())
                .targetCount(habit.getTargetCount())
                .currentCount(habit.getCurrentCount())
                .completed(habit.isCompleted())
                .build();
    }

}
