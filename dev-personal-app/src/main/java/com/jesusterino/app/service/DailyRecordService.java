package com.jesusterino.app.service;

import com.jesusterino.app.dto.DailyRecordDTO;
import com.jesusterino.app.model.DailyRecord;
import com.jesusterino.app.model.Habit;
import com.jesusterino.app.model.User;
import com.jesusterino.app.repository.DailyRecordRepository;
import com.jesusterino.app.repository.HabitRepository;
import com.jesusterino.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DailyRecordService {

        private final DailyRecordRepository dailyRecordRepository;
        private final HabitRepository habitRepository;
        private final UserRepository userRepository;

        @Transactional(readOnly = true)
        public DailyRecordDTO getTodayRecord(String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

                return dailyRecordRepository.findByDateAndUser(LocalDate.now(), user)
                                .map(this::mapToDTO)
                                .orElse(DailyRecordDTO.builder()
                                                .date(LocalDate.now())
                                                .journalText("")
                                                .completedHabitIds(java.util.Set.of())
                                                .build());
        }

        @Transactional(readOnly = true)
        public List<DailyRecordDTO> getHistory(String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

                return dailyRecordRepository.findAllByUserOrderByDateDesc(user)
                                .stream()
                                .map(this::mapToDTO)
                                .toList();
        }

        @Transactional
        public DailyRecordDTO finalizeDay(String username, DailyRecordDTO dto) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

                LocalDate today = dto.getDate() != null ? dto.getDate() : LocalDate.now();

                // Save or update today's record
                DailyRecord record = dailyRecordRepository.findByDateAndUser(today, user)
                                .orElse(new DailyRecord());

                record.setDate(today);
                record.setUser(user);
                record.setJournalText(dto.getJournalText());

                if (dto.getCompletedHabitIds() != null) {
                        record.setCompletedHabitIds(new java.util.HashSet<>(dto.getCompletedHabitIds()));
                }

                DailyRecord savedRecord = dailyRecordRepository.save(record);

                // Reset all habits for this user for the next day
                List<Habit> allUserHabits = habitRepository.findByUser(user);
                for (Habit habit : allUserHabits) {
                        habit.setCompleted(false);
                }
                habitRepository.saveAll(allUserHabits);

                return mapToDTO(savedRecord);
        }

        private DailyRecordDTO mapToDTO(DailyRecord doc) {
                return DailyRecordDTO.builder()
                                .id(doc.getId())
                                .date(doc.getDate())
                                .journalText(doc.getJournalText())
                                .completedHabitIds(doc.getCompletedHabitIds())
                                .build();
        }
}
