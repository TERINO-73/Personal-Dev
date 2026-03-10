package com.jesusterino.app.service;

import com.jesusterino.app.dto.ObjectiveDTO;
import com.jesusterino.app.dto.SubtaskDTO;
import com.jesusterino.app.dto.BookDTO;
import com.jesusterino.app.model.*;
import com.jesusterino.app.repository.ObjectiveRepository;
import com.jesusterino.app.repository.UserRepository;
import com.jesusterino.app.repository.BookRepository;
import com.jesusterino.app.repository.SubtaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ObjectiveService {

        private final ObjectiveRepository objectiveRepository;
        private final UserRepository userRepository;
        private final BookRepository bookRepository;
        private final SubtaskRepository subtaskRepository; // Added SubtaskRepository field

        @Transactional(readOnly = true)
        public List<ObjectiveDTO> getObjectivesByUsername(String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

                return objectiveRepository.findByUser(user).stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        @Transactional
        public ObjectiveDTO addObjective(String username, ObjectiveDTO dto) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

                Objective objective = Objective.builder()
                                .title(dto.getTitle())
                                .description(dto.getDescription())
                                .type(dto.getType())
                                .status(ObjectiveStatus.PENDING)
                                .deadline(dto.getDeadline())
                                .currentPage(dto.getCurrentPage())
                                .totalPages(dto.getTotalPages())
                                .user(user)
                                .build();

                // Manejar subtasks iniciales
                if (dto.getSubtasks() != null) {
                        dto.getSubtasks().forEach(s -> {
                                Subtask subtask = Subtask.builder()
                                                .title(s.getTitle())
                                                .status(s.getStatus() != null ? s.getStatus() : SubtaskStatus.PENDING)
                                                .objective(objective)
                                                .build();
                                objective.addSubtask(subtask);
                        });
                }

                // Manejar libros iniciales (si vienen en el DTO)
                if (dto.getBooks() != null) {
                        dto.getBooks().forEach(b -> {
                                Book book = Book.builder()
                                                .title(b.getTitle())
                                                .description(b.getDescription())
                                                .currentPage(b.getCurrentPage() != null ? b.getCurrentPage() : 0)
                                                .totalPages(b.getTotalPages() != null ? b.getTotalPages() : 100)
                                                .completed(false)
                                                .objective(objective)
                                                .build();
                                objective.addBook(book);
                        });
                }

                return convertToDTO(objectiveRepository.save(objective));
        }

        @Transactional
        public ObjectiveDTO updateBookProgress(Long bookId, Integer currentPage) {
                Book book = bookRepository.findById(bookId)
                                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));

                book.setCurrentPage(currentPage);
                if (currentPage >= book.getTotalPages()) {
                        book.setCompleted(true);
                } else {
                        book.setCompleted(false);
                }

                bookRepository.save(book);
                return convertToDTO(book.getObjective());
        }

        @Transactional
        public ObjectiveDTO updateObjective(Long id, ObjectiveDTO dto) {
                Objective objective = objectiveRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Objetivo no encontrado"));

                objective.setTitle(dto.getTitle());
                objective.setDescription(dto.getDescription());
                objective.setType(dto.getType());
                if (dto.getStatus() != null) {
                        objective.setStatus(dto.getStatus());
                }
                objective.setDeadline(dto.getDeadline());
                objective.setCurrentPage(dto.getCurrentPage());
                objective.setTotalPages(dto.getTotalPages());

                // Actualizar subtasks
                objective.getSubtasks().clear();
                if (dto.getSubtasks() != null) {
                        dto.getSubtasks().forEach(s -> {
                                Subtask subtask = Subtask.builder()
                                                .title(s.getTitle())
                                                .status(s.getStatus() != null ? s.getStatus() : SubtaskStatus.PENDING)
                                                .objective(objective)
                                                .build();
                                objective.addSubtask(subtask);
                        });
                }

                // Actualizar libros
                objective.getBooks().clear();
                if (dto.getBooks() != null) {
                        dto.getBooks().forEach(b -> {
                                Book book = Book.builder()
                                                .title(b.getTitle())
                                                .description(b.getDescription())
                                                .currentPage(b.getCurrentPage() != null ? b.getCurrentPage() : 0)
                                                .totalPages(b.getTotalPages() != null ? b.getTotalPages() : 100)
                                                .completed(b.isCompleted())
                                                .objective(objective)
                                                .build();
                                objective.addBook(book);
                        });
                }

                return convertToDTO(objectiveRepository.save(objective));
        }

        @Transactional
        public void deleteObjective(Long id) {
                objectiveRepository.deleteById(id);
        }

        @Transactional
        public ObjectiveDTO updateSubtaskStatus(Long subtaskId, SubtaskStatus status) {
                Subtask subtask = subtaskRepository.findById(subtaskId)
                                .orElseThrow(() -> new RuntimeException("Subtarea no encontrada"));
                subtask.setStatus(status);
                subtaskRepository.save(subtask);
                return convertToDTO(subtask.getObjective());
        }

        private ObjectiveDTO convertToDTO(Objective objective) {
                return ObjectiveDTO.builder()
                                .id(objective.getId())
                                .title(objective.getTitle())
                                .description(objective.getDescription())
                                .type(objective.getType())
                                .status(objective.getStatus())
                                .deadline(objective.getDeadline())
                                .currentPage(objective.getCurrentPage())
                                .totalPages(objective.getTotalPages())
                                .subtasks(objective.getSubtasks().stream()
                                                .map(s -> new SubtaskDTO(s.getId(), s.getTitle(), s.getStatus()))
                                                .collect(Collectors.toList()))
                                .books(objective.getBooks().stream()
                                                .map(b -> new BookDTO(b.getId(), b.getTitle(), b.getDescription(),
                                                                b.getCurrentPage(), b.getTotalPages(), b.isCompleted()))
                                                .collect(Collectors.toList()))
                                .build();
        }
}
