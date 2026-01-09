package mk.ukim.finki.studenteventsbackend.service.domain;

import mk.ukim.finki.studenteventsbackend.model.domain.Event;

import java.util.List;
import java.util.Optional;

public interface EventService {
    List<Event> findAll();

    Optional<Event> findById(Long id);

    Event create(Event e);

    Event update(Long id, Event e);

    void delete(Long id);
}
