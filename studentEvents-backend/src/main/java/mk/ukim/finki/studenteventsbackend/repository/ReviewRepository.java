package mk.ukim.finki.studenteventsbackend.repository;

import mk.ukim.finki.studenteventsbackend.model.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findAllByEvent_IdOrderByCreatedAtDesc(Long eventId);

    Optional<Review> findByEvent_IdAndStudentUsername(Long eventId, String username);

    boolean existsByEvent_IdAndStudentUsername(Long eventId, String username);

    @Query("select coalesce(avg(r.rating), 0) from Review r where r.event.id = :eventId")
    Double avgForEvent(@Param("eventId") Long eventId);
}
