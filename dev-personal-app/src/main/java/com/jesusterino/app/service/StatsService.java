package com.jesusterino.app.service;

import com.jesusterino.app.dto.DailyWorkoutSnapshotDTO;
import com.jesusterino.app.model.DailyWorkoutSnapshot;
import com.jesusterino.app.model.SetEntry;
import com.jesusterino.app.model.User;
import com.jesusterino.app.model.WorkoutSession;
import com.jesusterino.app.repository.DailyWorkoutSnapshotRepository;
import com.jesusterino.app.repository.UserRepository;
import com.jesusterino.app.repository.WorkoutSessionRepository;
import com.jesusterino.app.repository.SetEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StatsService {

    private final DailyWorkoutSnapshotRepository snapshotRepository;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final SetEntryRepository setEntryRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DailyWorkoutSnapshotDTO getDailySnapshot(String username, LocalDate date) {
        return snapshotRepository.findByUserUsernameAndDate(username, date)
                .map(this::mapToDTO)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<DailyWorkoutSnapshotDTO> getRangeSnapshots(String username, LocalDate from, LocalDate to) {
        return snapshotRepository.findByUserUsernameAndDateBetween(username, from, to)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    /**
     * Executes exactly at 00:00 Europe/Madrid time.
     * Looks at the *previous day's* workout sessions and aggregates them into a snapshot.
     */
    @Scheduled(cron = "0 0 0 * * *", zone = "Europe/Madrid")
    @Transactional
    public void generateDailySnapshotsJob() {
        LocalDate yesterday = LocalDate.now(ZoneId.of("Europe/Madrid")).minusDays(1);
        log.info("Starting Daily Gym Snapshot Generation Job for date: {}", yesterday);

        List<User> users = userRepository.findAll();
        for (User user : users) {
            try {
                processSnapshotForUser(user, yesterday);
            } catch (Exception e) {
                log.error("Error generating snapshot for user {}", user.getUsername(), e);
            }
        }
        log.info("Finished Daily Gym Snapshot Generation Job.");
    }

    @Transactional
    public void processSnapshotForUser(User user, LocalDate date) {
        // Skip if snapshot already generated to keep job idempotent
        Optional<DailyWorkoutSnapshot> existing = snapshotRepository.findByUserUsernameAndDate(user.getUsername(), date);
        if (existing.isPresent()) {
            return;
        }

        // Get all finished sessions for that day
        List<WorkoutSession> sessions = workoutSessionRepository.findByUserUsernameAndFinishedAtIsNotNullAndDate(user.getUsername(), date);
        
        if (sessions.isEmpty()) {
            return; // No sessions, no snapshot needed
        }

        int totalSets = 0;
        int totalReps = 0;
        BigDecimal totalVolume = BigDecimal.ZERO;
        
        // Use a set to count unique exercises hit today across all sessions
        java.util.HashSet<Long> uniqueExercises = new java.util.HashSet<>();

        for (WorkoutSession session : sessions) {
            List<SetEntry> sets = setEntryRepository.findByWorkoutSessionId(session.getId());
            for (SetEntry set : sets) {
                uniqueExercises.add(set.getExercise().getId());
                totalSets++;
                totalReps += set.getReps();
                
                if (set.getWeightKg() != null && set.getWeightKg().compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal volumeForSet = set.getWeightKg().multiply(new BigDecimal(set.getReps()));
                    totalVolume = totalVolume.add(volumeForSet);
                }
            }
        }

        // Create and save snapshot
        DailyWorkoutSnapshot snapshot = DailyWorkoutSnapshot.builder()
                .user(user)
                .date(date)
                .totalExercises(uniqueExercises.size())
                .totalSets(totalSets)
                .totalReps(totalReps)
                .totalVolumeKg(totalVolume)
                .jsonDetails("{\"sessionsCount\":" + sessions.size() + "}") // Basic details
                .build();

        snapshotRepository.save(snapshot);
        log.debug("Saved workout snapshot for user {} on date {}", user.getUsername(), date);
    }

    private DailyWorkoutSnapshotDTO mapToDTO(DailyWorkoutSnapshot snapshot) {
        return DailyWorkoutSnapshotDTO.builder()
                .id(snapshot.getId())
                .userId(snapshot.getUser().getId())
                .date(snapshot.getDate())
                .totalExercises(snapshot.getTotalExercises())
                .totalSets(snapshot.getTotalSets())
                .totalReps(snapshot.getTotalReps())
                .totalVolumeKg(snapshot.getTotalVolumeKg())
                .jsonDetails(snapshot.getJsonDetails())
                .build();
    }
}
