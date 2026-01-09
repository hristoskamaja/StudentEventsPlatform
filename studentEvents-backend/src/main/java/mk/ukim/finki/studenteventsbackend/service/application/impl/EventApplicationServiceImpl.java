package mk.ukim.finki.studenteventsbackend.service.application.impl;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.studenteventsbackend.config.SecurityUtils;
import mk.ukim.finki.studenteventsbackend.dto.event.EventCreateDto;
import mk.ukim.finki.studenteventsbackend.dto.event.EventDetailsDto;
import mk.ukim.finki.studenteventsbackend.dto.event.EventSummaryDto;
import mk.ukim.finki.studenteventsbackend.dto.event.EventUpdateDto;
import mk.ukim.finki.studenteventsbackend.dto.mapper.EventMapper;
import mk.ukim.finki.studenteventsbackend.model.domain.Event;
import mk.ukim.finki.studenteventsbackend.model.enumeration.RegistrationStatus;
import mk.ukim.finki.studenteventsbackend.repository.EventRepository;
import mk.ukim.finki.studenteventsbackend.repository.RegistrationRepository;
import mk.ukim.finki.studenteventsbackend.service.application.EventApplicationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventApplicationServiceImpl implements EventApplicationService {

    private final EventRepository eventRepository;
    private final EventMapper eventMapper;
    private final RegistrationRepository registrationRepository;

    @Override
    public List<EventSummaryDto> findAll() {
        return eventRepository.findAll().stream().map(e -> {
            Integer left = availableSeats(e);
            return new EventSummaryDto(
                    e.getId(),
                    e.getTitle(),
                    e.getEventCategory(),
                    e.getLocation(),
                    e.getStartTime(),
                    e.getEndTime(),
                    e.getCreatedBy(),
                    e.getImageUrl(),
                    e.getMaxCapacity(),
                    left,
                    e.getPrice()
            );
        }).toList();
    }

    @Override
    public EventDetailsDto findOne(Long id) {
        Event e = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        long active = activeCount(e);
        Integer left = availableSeats(e);

        return new EventDetailsDto(
                e.getId(),
                e.getTitle(),
                e.getDescription(),
                e.getEventCategory(),
                e.getLocation(),
                e.getStartTime(),
                e.getEndTime(),
                e.getMaxCapacity(),
                e.getCreatedBy(),
                e.getCreatedAt(),
                e.getImageUrl(),
                left,
                active,
                e.getPrice()
        );
    }

    @Override
    public EventDetailsDto create(EventCreateDto dto, String ignored) {
        Event e = eventMapper.toEntity(dto);
        e.setId(null);
        e.setCreatedAt(Instant.now());
        e.setCreatedBy(SecurityUtils.username());

        if (e.getPrice() != null && e.getPrice().signum() <= 0) {
            e.setPrice(null);
        }

        Event saved = eventRepository.save(e);
        return findOne(saved.getId());
    }

    @Override
    public EventDetailsDto update(Long id, EventUpdateDto dto) {
        Event e = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        ensureCanManage(e);
        eventMapper.updateEntity(dto, e);

        if (e.getPrice() != null && e.getPrice().signum() <= 0) {
            e.setPrice(null);
        }

        Event saved = eventRepository.save(e);
        return findOne(saved.getId());
    }

    @Override
    public void delete(Long id) {
        Event e = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        ensureCanManage(e);
        eventRepository.delete(e);
    }

    private void ensureCanManage(Event e) {
        if (SecurityUtils.hasRole("ADMIN")) return;
        String u = SecurityUtils.username();
        if (u == null || e.getCreatedBy() == null || !e.getCreatedBy().equals(u)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to modify this event");
        }
    }

    private long activeCount(Event e) {
        return registrationRepository.countByEventIdAndStatus(e.getId(), RegistrationStatus.ACTIVE);
    }

    private Integer availableSeats(Event e) {
        Integer max = e.getMaxCapacity();
        if (max == null || max <= 0) return null;
        long active = activeCount(e);
        return (int) Math.max(0, max - active);
    }
}
