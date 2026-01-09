package mk.ukim.finki.studenteventsbackend.dto.payment;

public record CheckoutSessionDto(
        String sessionId,
        String url
) {}
