package com.jesusterino.app.service;

import com.jesusterino.app.model.Habit;
import com.jesusterino.app.model.User;
import com.jesusterino.app.repository.HabitRepository;
import com.jesusterino.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskSchedulerService {

    private final UserRepository userRepository;
    private final HabitRepository habitRepository;
    private final DailyRecordService dailyRecordService;

    /**
     * Finaliza el día automáticamente a las 00:00
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void autoFinalizeDay() {
        log.info("Iniciando finalización automática del día...");
        List<User> users = userRepository.findAll();

        for (User user : users) {
            try {
                // Obtenemos los hábitos diarios completados hoy por el usuario
                List<Habit> dailyHabits = habitRepository.findByUser(user).stream()
                        .filter(h -> "daily".equals(h.getType()))
                        .toList();

                List<Integer> completedIds = dailyHabits.stream()
                        .filter(Habit::isCompleted)
                        .map(h -> h.getId().intValue())
                        .toList();

                // Creamos el record diario para ayer (ya que acaba de pasar la media noche)
                com.jesusterino.app.dto.DailyRecordDTO recordDTO = com.jesusterino.app.dto.DailyRecordDTO.builder()
                        .date(LocalDate.now().minusDays(1))
                        .journalText("Finalización automática")
                        .completedHabitIds(completedIds.stream()
                                .filter(java.util.Objects::nonNull)
                                .map(Long::valueOf)
                                .collect(java.util.stream.Collectors.toSet()))
                        .build();

                dailyRecordService.finalizeDay(user.getUsername(), recordDTO);

                // Reseteamos los hábitos diarios para el nuevo día
                dailyHabits.forEach(h -> h.setCompleted(false));
                habitRepository.saveAll(dailyHabits);

            } catch (Exception e) {
                log.error("Error al finalizar día automáticamente para usuario {}: {}", user.getUsername(),
                        e.getMessage());
            }
        }
    }

    /**
     * Resetea hábitos semanales los lunes a las 00:00
     */
    @Scheduled(cron = "0 0 0 * * MON")
    @Transactional
    public void resetWeeklyHabits() {
        log.info("Reseteando hábitos semanales...");
        List<Habit> weeklyHabits = habitRepository.findAll().stream()
                .filter(h -> "weekly".equals(h.getType()))
                .toList();

        weeklyHabits.forEach(h -> {
            h.setCurrentCount(0);
            h.setCompleted(false);
        });

        habitRepository.saveAll(weeklyHabits);
    }

    /**
     * Resetea hábitos mensuales el día 1 de cada mes a las 00:00
     */
    @Scheduled(cron = "0 0 0 1 * *")
    @Transactional
    public void resetMonthlyHabits() {
        log.info("Reseteando hábitos mensuales...");
        List<Habit> monthlyHabits = habitRepository.findAll().stream()
                .filter(h -> "monthly".equals(h.getType()))
                .toList();

        monthlyHabits.forEach(h -> {
            h.setCurrentCount(0);
            h.setCompleted(false);
        });

        habitRepository.saveAll(monthlyHabits);
    }
}
