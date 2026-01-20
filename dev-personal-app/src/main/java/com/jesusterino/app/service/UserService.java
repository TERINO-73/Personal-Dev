package com.jesusterino.app.service;

import com.jesusterino.app.dto.UserDTO;
import com.jesusterino.app.model.User;
import com.jesusterino.app.model.UserRole;
import com.jesusterino.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // CREATE
    public User createUser(UserDTO userDTO) {
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .username(userDTO.getUsername())
                .email(userDTO.getEmail())
                .password(passwordEncoder.encode(userDTO.getPassword()))
                .role(UserRole.USER)
                .build();

        return userRepository.save(user);
    }

    // READ ALL
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // READ BY ID
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // UPDATE
    public User updateUser(Long id, UserDTO userDTO) {
        User user = getUserById(id);

        if (!user.getUsername().equals(userDTO.getUsername())
                && userRepository.existsByUsername(userDTO.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (!user.getEmail().equals(userDTO.getEmail())
                && userRepository.existsByEmail(userDTO.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }

        return userRepository.save(user);
    }

    // DELETE
    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }
}
