package com.buildasset.monolith.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class MonolithExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<?> validation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getDefaultMessage()).collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(Map.of("timestamp", Instant.now().toString(),
            "status", 400, "error", "Validation Error", "message", message, "path", request.getRequestURI()));
    }
    @ExceptionHandler(Exception.class)
    ResponseEntity<?> other(Exception ex, HttpServletRequest request) {
        HttpStatus status = ex.getClass().getSimpleName().contains("NotFound") ? HttpStatus.NOT_FOUND :
            ex.getClass().getSimpleName().contains("BadRequest") ? HttpStatus.BAD_REQUEST : HttpStatus.INTERNAL_SERVER_ERROR;
        return ResponseEntity.status(status).body(Map.of("timestamp", Instant.now().toString(),
            "status", status.value(), "error", status.getReasonPhrase(),
            "message", ex.getMessage() == null ? status.getReasonPhrase() : ex.getMessage(),
            "path", request.getRequestURI()));
    }
}