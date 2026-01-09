package mk.ukim.finki.studenteventsbackend.service.domain.impl;

import mk.ukim.finki.studenteventsbackend.model.domain.Event;
import mk.ukim.finki.studenteventsbackend.model.exceptions.EventNotFoundException;
import mk.ukim.finki.studenteventsbackend.repository.EventRepository;
import mk.ukim.finki.studenteventsbackend.service.domain.EventService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;

    public EventServiceImpl(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }


    @Override
    public List<Event> findAll() {
        return eventRepository.findAll();
    }

    @Override
    public Optional<Event> findById(Long id) {
        return eventRepository.findById(id);
    }

    @Override
    public Event create(Event event) {
        return eventRepository.save(event);
    }

    @Override
    public Event update(Long id, Event event) {
        return eventRepository.findById(id)
                .map(db -> {
                    event.setId(db.getId());
                    return eventRepository.save(event);
                })
                .orElseThrow(() -> new EventNotFoundException(id));
    }

    @Override
    public void delete(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new EventNotFoundException(id);
        }

        eventRepository.deleteById(id);
    }
}
