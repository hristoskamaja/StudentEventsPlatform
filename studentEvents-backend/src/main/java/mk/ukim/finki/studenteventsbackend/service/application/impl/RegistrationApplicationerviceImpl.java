package mk.ukim.finki.studenteventsbackend.service.application.impl;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.studenteventsbackend.config.SecurityUtils;
import mk.ukim.finki.studenteventsbackend.dto.event.EventSummaryDto;
import mk.ukim.finki.studenteventsbackend.dto.mapper.EventMapper;
import mk.ukim.finki.studenteventsbackend.dto.registration.MyRegistrationDto;
import mk.ukim.finki.studenteventsbackend.model.domain.Event;
import mk.ukim.finki.studenteventsbackend.model.domain.Registration;
import mk.ukim.finki.studenteventsbackend.model.enumeration.RegistrationStatus;
import mk.ukim.finki.studenteventsbackend.repository.EventRepository;
import mk.ukim.finki.studenteventsbackend.repository.RegistrationRepository;
import mk.ukim.finki.studenteventsbackend.service.application.RegistrationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.springframework.http.HttpStatus.*;

@Service
@RequiredArgsConstructor
public class RegistrationApplicationerviceImpl implements RegistrationService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final EventMapper eventMapper;

    private Event findAndLock(Long eventId) {
        return eventRepository.lockById(eventId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Event not found"));
    }

    private MyRegistrationDto toDto(Registration r) {
        EventSummaryDto ev = eventMapper.toSummaryDto(r.getEvent());
        return new MyRegistrationDto(
                r.getId(),
                ev,
                r.getStatus(),
                r.isPaid(),
                r.getPaidAt()
        );
    }

    @Transactional
    @Override
    public MyRegistrationDto register(Long eventId) {
        String uid = SecurityUtils.userId();     // sub
        String uname = SecurityUtils.username(); // preferred_username/email/sub

        Event e = findAndLock(eventId);

        Registration existing = registrationRepository.findByEventIdAndUserId(e.getId(), uid).orElse(null);

        if (existing != null && existing.getStatus() == RegistrationStatus.ACTIVE) {
            throw new ResponseStatusException(CONFLICT, "Already registered for this event");
        }

        Integer max = e.getMaxCapacity();
        if (max != null && max > 0) {
            long active = registrationRepository.countByEventIdAndStatus(e.getId(), RegistrationStatus.ACTIVE);
            if (active >= max) throw new ResponseStatusException(BAD_REQUEST, "Event is full");
        }

        Registration saved;

        if (existing != null) {
            existing.setStatus(RegistrationStatus.ACTIVE);
            existing.setUsername(uname);
            saved = registrationRepository.save(existing);
        } else {
            Registration r = new Registration();
            r.setEvent(e);
            r.setUserId(uid);
            r.setUsername(uname);
            r.setStatus(RegistrationStatus.ACTIVE);
            r.setPaid(false);
            saved = registrationRepository.save(r);
        }

        return toDto(saved);
    }

    @Transactional
    @Override
    public void cancel(Long registrationId) {
        String uid = SecurityUtils.userId();

        Registration r = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Registration not found"));

        boolean isOwner = r.getUserId().equals(uid);
        boolean isAdmin = SecurityUtils.hasRole("ADMIN");
        if (!isOwner && !isAdmin) throw new ResponseStatusException(FORBIDDEN, "Forbidden");

        r.setStatus(RegistrationStatus.CANCELED);
        registrationRepository.save(r);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MyRegistrationDto> myRegistrations() {
        String uid = SecurityUtils.userId();
        return registrationRepository
                .findAllByUserIdAndStatusOrderByRegisteredAtDesc(uid, RegistrationStatus.ACTIVE)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<MyRegistrationDto> myRegistrationForEvent(Long eventId) {
        String uid = SecurityUtils.userId();
        return registrationRepository.findByEventIdAndUserIdAndStatus(eventId, uid, RegistrationStatus.ACTIVE)
                .map(this::toDto);
    }
}
