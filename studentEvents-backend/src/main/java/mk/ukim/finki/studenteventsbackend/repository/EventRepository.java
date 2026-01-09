package mk.ukim.finki.studenteventsbackend.repository;

import jakarta.persistence.LockModeType;
import mk.ukim.finki.studenteventsbackend.model.domain.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findAllByCreatedBySub(String createdBySub);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Event e where e.id = :id")
    java.util.Optional<mk.ukim.finki.studenteventsbackend.model.domain.Event> lockById(@Param("id") Long id);
}
