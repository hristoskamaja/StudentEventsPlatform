package mk.ukim.finki.studenteventsbackend.dto.ticket;

public record TicketDto(
        Long registrationId,
        Long eventId,
        String eventTitle,
        String username,
        String qrValue
) {}
