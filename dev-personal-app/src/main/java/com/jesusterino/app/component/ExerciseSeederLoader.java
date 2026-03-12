package com.jesusterino.app.component;

import com.jesusterino.app.model.Exercise;
import com.jesusterino.app.repository.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExerciseSeederLoader {

    private final ExerciseRepository exerciseRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedExercises() {
        boolean needsSeeding = false;
        
        if (exerciseRepository.count() == 0) {
            needsSeeding = true;
        } else {
            // Re-seed si los nombres están en inglés (para la migración a español)
            boolean hasEnglish = exerciseRepository.findAll().stream()
                    .anyMatch(e -> e.getName().equals("Bench Press (Barbell)"));
            if (hasEnglish) {
                try {
                    List<Exercise> all = exerciseRepository.findAll();
                    // Solo borramos los que sean del sistema
                    all.removeIf(e -> e.getCreatedBy() != null);
                    exerciseRepository.deleteAll(all);
                    needsSeeding = true;
                    log.info("Deleted old English system exercises.");
                } catch(Exception e) {
                    log.warn("Could not delete old exercises. They might be in use by a routine. Exception: " + e.getMessage());
                    // No hacemos return, pero las traducciones no se aplicarán a los id viejos.
                }
            }
        }

        if (!needsSeeding) {
            log.info("Exercises already exist in the database (or couldn't be reset). Skipping seeder.");
            return;
        }

        log.info("Starting Exercise Seeder (Spanish)...");

        List<Exercise> exercisesToSave = new ArrayList<>();

        // PECHO
        exercisesToSave.add(buildExercise("Press de Banca (Barra)", "Pecho", "Tríceps, Hombros", "Barra"));
        exercisesToSave.add(buildExercise("Press de Banca Inclinado", "Pecho", "Tríceps, Hombros", "Barra"));
        exercisesToSave.add(buildExercise("Press de Banca Declinado", "Pecho", "Tríceps, Hombros", "Barra"));
        exercisesToSave.add(buildExercise("Press con Mancuernas", "Pecho", "Tríceps, Hombros", "Mancuerna"));
        exercisesToSave.add(buildExercise("Aperturas con Mancuernas", "Pecho", null, "Mancuerna"));
        exercisesToSave.add(buildExercise("Cruces en Polea", "Pecho", null, "Polea"));
        exercisesToSave.add(buildExercise("Flexiones", "Pecho", "Tríceps, Core", "Peso Corporal"));
        exercisesToSave.add(buildExercise("Press de Pecho en Máquina", "Pecho", "Tríceps", "Máquina"));

        // ESPALDA
        exercisesToSave.add(buildExercise("Peso Muerto", "Espalda", "Glúteos, Isquios, Core", "Barra"));
        exercisesToSave.add(buildExercise("Peso Muerto Rumano", "Espalda", "Isquios, Glúteos", "Barra"));
        exercisesToSave.add(buildExercise("Remo con Barra", "Espalda", "Bíceps", "Barra"));
        exercisesToSave.add(buildExercise("Remo con Mancuerna a una mano", "Espalda", "Bíceps", "Mancuerna"));
        exercisesToSave.add(buildExercise("Jalón al Pecho", "Espalda", "Bíceps", "Polea"));
        exercisesToSave.add(buildExercise("Dominadas", "Espalda", "Bíceps", "Peso Corporal"));
        exercisesToSave.add(buildExercise("Remo en Polea Baja", "Espalda", "Bíceps", "Polea"));
        exercisesToSave.add(buildExercise("Remo en Punta (T-Bar)", "Espalda", "Bíceps", "Máquina"));

        // PIERNAS / CUADRICEPS
        exercisesToSave.add(buildExercise("Sentadilla Trasera", "Piernas", "Glúteos, Core", "Barra"));
        exercisesToSave.add(buildExercise("Sentadilla Frontal", "Piernas", "Glúteos, Core", "Barra"));
        exercisesToSave.add(buildExercise("Prensa de Piernas", "Piernas", "Glúteos", "Máquina"));
        exercisesToSave.add(buildExercise("Zancadas (Lunges)", "Piernas", "Glúteos", "Mancuerna"));
        exercisesToSave.add(buildExercise("Sentadilla Búlgara", "Piernas", "Glúteos", "Mancuerna"));
        exercisesToSave.add(buildExercise("Extensión de Cuádriceps", "Piernas", null, "Máquina"));

        // ISQUIOS Y GLUTEOS
        exercisesToSave.add(buildExercise("Curl de Isquios", "Piernas", null, "Máquina"));
        exercisesToSave.add(buildExercise("Puente de Glúteo", "Glúteos", "Isquios", "Peso Corporal"));
        exercisesToSave.add(buildExercise("Hip Thrust", "Glúteos", "Isquios", "Barra"));
        exercisesToSave.add(buildExercise("Buenos Días", "Espalda", "Isquios", "Barra"));

        // GEMELOS
        exercisesToSave.add(buildExercise("Elevación de Talones de Pie", "Gemelos", null, "Máquina"));
        exercisesToSave.add(buildExercise("Elevación de Talones Sentado", "Gemelos", null, "Máquina"));

        // HOMBROS
        exercisesToSave.add(buildExercise("Press Militar (Barra)", "Hombros", "Tríceps, Core", "Barra"));
        exercisesToSave.add(buildExercise("Press de Hombros con Mancuernas", "Hombros", "Tríceps", "Mancuerna"));
        exercisesToSave.add(buildExercise("Elevaciones Laterales", "Hombros", null, "Mancuerna"));
        exercisesToSave.add(buildExercise("Elevaciones Frontales", "Hombros", null, "Mancuerna"));
        exercisesToSave.add(buildExercise("Pájaros (Reverse Fly)", "Hombros", "Espalda", "Máquina"));
        exercisesToSave.add(buildExercise("Press Arnold", "Hombros", "Tríceps", "Mancuerna"));

        // BICEPS
        exercisesToSave.add(buildExercise("Curl con Barra", "Bíceps", null, "Barra"));
        exercisesToSave.add(buildExercise("Curl con Mancuernas", "Bíceps", null, "Mancuerna"));
        exercisesToSave.add(buildExercise("Curl Martillo", "Bíceps", "Antebrazos", "Mancuerna"));
        exercisesToSave.add(buildExercise("Curl Predicador", "Bíceps", null, "Máquina"));
        exercisesToSave.add(buildExercise("Curl en Polea", "Bíceps", null, "Polea"));

        // TRICEPS
        exercisesToSave.add(buildExercise("Extensión de Tríceps en Polea", "Tríceps", null, "Polea"));
        exercisesToSave.add(buildExercise("Extensión de Tríceps Tras Nuca", "Tríceps", null, "Mancuerna"));
        exercisesToSave.add(buildExercise("Rompecráneos (Skull Crushers)", "Tríceps", null, "Barra"));
        exercisesToSave.add(buildExercise("Fondos en Paralelas", "Tríceps", "Pecho", "Peso Corporal"));

        // CORE
        exercisesToSave.add(buildExercise("Plancha Abdominal", "Core", "Hombros", "Peso Corporal"));
        exercisesToSave.add(buildExercise("Elevación de Piernas Colgado", "Core", null, "Peso Corporal"));
        exercisesToSave.add(buildExercise("Giro Ruso", "Core", null, "Peso Corporal"));
        exercisesToSave.add(buildExercise("Abdominales (Sit-Ups)", "Core", null, "Peso Corporal"));
        exercisesToSave.add(buildExercise("Leñador en Polea", "Core", "Hombros", "Polea"));

        // ESPALDA BAJA Y OTROS
        exercisesToSave.add(buildExercise("Paseo del Granjero", "Core", "Antebrazos, Hombros", "Mancuerna"));
        exercisesToSave.add(buildExercise("Extensiones de Espalda", "Espalda", "Glúteos", "Máquina"));
        exercisesToSave.add(buildExercise("Swing con Pesa Rusa", "Cuerpo Completo", "Glúteos, Hombros", "Pesa Rusa"));
        exercisesToSave.add(buildExercise("Máquina de Remo", "Cardio", "Espalda, Piernas", "Máquina"));
        exercisesToSave.add(buildExercise("Cinta de Correr", "Cardio", "Piernas", "Máquina"));
        exercisesToSave.add(buildExercise("Face Pull en Polea", "Hombros", "Espalda", "Polea"));
        exercisesToSave.add(buildExercise("Encogimientos de Hombros", "Hombros", "Espalda", "Barra"));

        exerciseRepository.saveAll(exercisesToSave);
        log.info("Successfully seeded {} exercises (Spanish).", exercisesToSave.size());
    }

    private Exercise buildExercise(String name, String primaryMuscle, String secondaryMuscles, String equipment) {
        return Exercise.builder()
                .name(name)
                .primaryMuscle(primaryMuscle)
                .secondaryMuscles(secondaryMuscles)
                .equipment(equipment)
                .defaultRestSeconds(90) // Defaulting to 1.5 minutes
                .createdBy(null) // Global / System exercise
                .createdAt(LocalDateTime.now())
                .build();
    }
}
