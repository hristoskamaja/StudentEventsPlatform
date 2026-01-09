package mk.ukim.finki.studenteventsbackend.model.domain;

import jakarta.persistence.*;
import lombok.Data;
import mk.ukim.finki.studenteventsbackend.model.enumeration.RegistrationStatus;

import java.time.Instant;

@Entity
@Data
@Table(
        name = "registrations",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_event_user",
                columnNames = {"event_id", "user_id"}
        )
)
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "user_id", nullable = false, length = 128)
    private String userId;

    @Column(name = "username", length = 128)
    private String username;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegistrationStatus status = RegistrationStatus.ACTIVE;

    @Column(name = "registered_at", nullable = false)
    private Instant registeredAt = Instant.now();

    @Column(name = "paid", nullable = false)
    private boolean paid = false;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "stripe_session_id", length = 255)
    private String stripeSessionId;
}
