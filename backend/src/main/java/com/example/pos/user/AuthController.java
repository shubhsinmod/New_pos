package com.example.pos.user;

import com.example.pos.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username and password are required.");
        }

        User user = userRepository.findByUsername(username.trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password."));

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is deactivated. Please contact admin.");
        }

        // Verify password with BCrypt
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password.");
        }

        String token = jwtUtil.generateToken(user);
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", toUserDto(user));
        return response;
    }

    @GetMapping("/me")
    public Map<String, Object> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid authorization token.");
        }
        String token = authHeader.substring(7).trim();
        String username = jwtUtil.extractUsername(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
        return toUserDto(user);
    }

    @GetMapping("/users")
    public List<Map<String, Object>> getAllUsers(@RequestParam(required = false) Long outletId) {
        List<User> list = (outletId != null)
                ? userRepository.findByOutletIdOrderByCreatedAtDesc(outletId)
                : userRepository.findAllByOrderByCreatedAtDesc();
        return list.stream()
                .map(this::toUserDto)
                .toList();
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createUser(@RequestBody Map<String, Object> request) {
        String username = (String) request.get("username");
        String password = (String) request.get("password");
        String fullName = (String) request.get("fullName");
        String role = (String) request.get("role");

        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required.");
        }
        if (password == null || password.length() < 4) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 4 characters.");
        }
        if (userRepository.existsByUsername(username.trim().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists: " + username);
        }

        User user = new User();
        user.setUsername(username.trim().toLowerCase());
        // Encrypt password with BCrypt
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(fullName != null && !fullName.isBlank() ? fullName : username);
        user.setRole(role != null ? role.toUpperCase() : "CASHIER");
        user.setEmail((String) request.get("email"));
        user.setPhone((String) request.get("phone"));
        user.setOutletName((String) request.get("outletName"));
        if (request.containsKey("outletId") && request.get("outletId") != null) {
            user.setOutletId(((Number) request.get("outletId")).longValue());
        }
        user.setActive(request.containsKey("active") ? (Boolean) request.get("active") : true);
        user.setCreatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        return toUserDto(saved);
    }

    @PutMapping("/users/{id}")
    public Map<String, Object> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));

        if (request.containsKey("fullName")) user.setFullName((String) request.get("fullName"));
        if (request.containsKey("role")) user.setRole(((String) request.get("role")).toUpperCase());
        if (request.containsKey("email")) user.setEmail((String) request.get("email"));
        if (request.containsKey("phone")) user.setPhone((String) request.get("phone"));
        if (request.containsKey("outletName")) user.setOutletName((String) request.get("outletName"));
        if (request.containsKey("active")) user.setActive((Boolean) request.get("active"));
        if (request.containsKey("outletId") && request.get("outletId") != null) {
            user.setOutletId(((Number) request.get("outletId")).longValue());
        }

        // If password is updated, re-encrypt with BCrypt
        if (request.containsKey("password")) {
            String newPassword = (String) request.get("password");
            if (newPassword != null && !newPassword.isBlank()) {
                user.setPassword(passwordEncoder.encode(newPassword));
            }
        }

        User updated = userRepository.save(user);
        return toUserDto(updated);
    }

    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));
        if ("superadmin".equalsIgnoreCase(user.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot delete master superadmin account.");
        }
        userRepository.delete(user);
    }

    private Map<String, Object> toUserDto(User user) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", user.getId());
        dto.put("username", user.getUsername());
        dto.put("fullName", user.getFullName());
        dto.put("role", user.getRole());
        dto.put("email", user.getEmail());
        dto.put("phone", user.getPhone());
        dto.put("outletId", user.getOutletId());
        dto.put("outletName", user.getOutletName());
        dto.put("active", user.getActive());
        dto.put("createdAt", user.getCreatedAt());
        return dto;
    }
}
