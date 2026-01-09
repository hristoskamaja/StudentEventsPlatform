package mk.ukim.finki.studenteventsbackend.dto.event;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import mk.ukim.finki.studenteventsbackend.model.enumeration.EventCategory;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EventSummaryDto(
        Long id,
        @NotBlank String title,
        @NotNull EventCategory category,
        @NotBlank String location,
        @NotNull LocalDateTime startTime,
        @NotNull LocalDateTime endTime,
        String createdBy,
        String imageUrl,
        Integer maxCapacity,
        Integer availableSeats,
        BigDecimal price
) {}
