package mk.ukim.finki.studenteventsbackend.service.domain.impl;

import mk.ukim.finki.studenteventsbackend.model.domain.Event;
import mk.ukim.finki.studenteventsbackend.model.domain.Registration;
import mk.ukim.finki.studenteventsbackend.model.enumeration.RegistrationStatus;
import mk.ukim.finki.studenteventsbackend.model.exceptions.ActiveRegistrationNotFoundException;
import mk.ukim.finki.studenteventsbackend.model.exceptions.AlreadyRegisteredException;
import mk.ukim.finki.studenteventsbackend.model.exceptions.CapacityFullException;
import mk.ukim.finki.studenteventsbackend.model.exceptions.EventNotFoundException;
import mk.ukim.finki.studenteventsbackend.repository.EventRepository;
import mk.ukim.finki.studenteventsbackend.repository.RegistrationRepository;
import mk.ukim.finki.studenteventsbackend.service.domain.RegistrationService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RegistrationServiceImpl implements RegistrationService {
    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;

    public RegistrationServiceImpl(RegistrationRepository registrationRepository, EventRepository eventRepository) {
        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
    }

    @Override
    public Registration register(Long eventId, String studentSub) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));


        if (registrationRepository.existsByEventIdAndUserIdAndStatus(
                eventId, studentSub, RegistrationStatus.ACTIVE)) {
            throw new AlreadyRegisteredException(eventId, studentSub);
        }

        if (event.getMaxCapacity() != null) {
            long used = registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.ACTIVE);
            if (used >= event.getMaxCapacity()) {
                throw new CapacityFullException(eventId);
            }
        }

        Registration r = new Registration();
        r.setEvent(event);
        r.setUserId(studentSub);
        r.setStatus(RegistrationStatus.ACTIVE);
        return registrationRepository.save(r);
    }

    @Override
    public void cancel(Long eventId, String studentSub) {
        Registration reg = registrationRepository.findByEventIdAndUserIdAndStatus(
                eventId, studentSub, RegistrationStatus.ACTIVE
        ).orElseThrow(() -> new ActiveRegistrationNotFoundException(studentSub));

        reg.setStatus(RegistrationStatus.CANCELED);
        registrationRepository.save(reg);
    }

    @Override
    public List<Registration> myRegistrations(String studentSub) {
        return registrationRepository.findAllByUserIdOrderByRegisteredAtDesc(studentSub);
    }

    @Override
    public List<Registration> forEvent(Long eventId) {
        return registrationRepository.findAllByEventId(eventId);
    }
}
