package mk.ukim.finki.studenteventsbackend.dto.registration;

import mk.ukim.finki.studenteventsbackend.model.enumeration.RegistrationStatus;

import java.time.Instant;

public record RegistrationViewDto(
        Long id,
        Long eventId,
        String studentSub,
        RegistrationStatus status,
        Instant registeredAt
) {}
