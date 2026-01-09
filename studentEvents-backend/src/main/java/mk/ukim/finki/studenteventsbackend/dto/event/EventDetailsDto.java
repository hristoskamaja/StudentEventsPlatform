package mk.ukim.finki.studenteventsbackend.dto.event;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import mk.ukim.finki.studenteventsbackend.model.enumeration.EventCategory;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

public record EventDetailsDto(
        Long id,
        @NotBlank String title,
        String description,
        @NotNull EventCategory category,
        @NotBlank String location,
        @NotNull LocalDateTime startTime,
        @NotNull LocalDateTime endTime,
        Integer maxCapacity,
        String createdBy,
        Instant createdAt,
        String imageUrl,
        Integer availableSeats,
        Long registeredCount,
        BigDecimal price
) {}
