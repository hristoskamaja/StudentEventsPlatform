package mk.ukim.finki.studenteventsbackend.dto.event;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import mk.ukim.finki.studenteventsbackend.model.enumeration.EventCategory;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EventCreateDto(
        @NotBlank String title,
        String description,
        @NotNull EventCategory category,
        @NotBlank String location,
        @NotNull LocalDateTime startTime,
        @NotNull LocalDateTime endTime,
        @PositiveOrZero Integer maxCapacity,
        String imageUrl,
        @DecimalMin(value = "0.00", inclusive = true) BigDecimal price
) {}
