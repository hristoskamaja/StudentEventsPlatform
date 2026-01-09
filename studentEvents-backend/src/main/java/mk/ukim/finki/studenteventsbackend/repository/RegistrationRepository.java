package mk.ukim.finki.studenteventsbackend.repository;

import mk.ukim.finki.studenteventsbackend.model.domain.Registration;
import mk.ukim.finki.studenteventsbackend.model.enumeration.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    long countByEventIdAndStatus(Long eventId, RegistrationStatus status);

    boolean existsByEventIdAndUserIdAndStatus(Long eventId, String userId, RegistrationStatus status);

    Optional<Registration> findByEventIdAndUserIdAndStatus(Long eventId, String userId, RegistrationStatus status);

    List<Registration> findAllByUserIdOrderByRegisteredAtDesc(String userId);

    List<Registration> findAllByEventId(Long eventId);

    Optional<Registration> findByEventIdAndUserId(Long eventId, String userId);

    List<Registration> findAllByUserIdAndStatusOrderByRegisteredAtDesc(String userId, RegistrationStatus status);

    Optional<Registration> findByStripeSessionId(String stripeSessionId);


    @Query("""
        select r from Registration r
        join fetch r.event e
        where r.id = :id
    """)
    Optional<Registration> findByIdWithEvent(@Param("id") Long id);

}
