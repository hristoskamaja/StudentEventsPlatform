package mk.ukim.finki.studenteventsbackend.dto.registration;

import mk.ukim.finki.studenteventsbackend.dto.event.EventSummaryDto;
import mk.ukim.finki.studenteventsbackend.model.enumeration.RegistrationStatus;

import java.time.Instant;

public record MyRegistrationDto(
        Long id,
        EventSummaryDto event,
        RegistrationStatus status,
        boolean paid,
        Instant paidAt
) {}
