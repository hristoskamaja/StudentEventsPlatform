package mk.ukim.finki.studenteventsbackend.service.application;

import mk.ukim.finki.studenteventsbackend.dto.registration.MyRegistrationDto;

import java.util.List;
import java.util.Optional;

public interface RegistrationService {
    MyRegistrationDto register(Long eventId);

    void cancel(Long registrationId);

    List<MyRegistrationDto> myRegistrations();

    Optional<MyRegistrationDto> myRegistrationForEvent(Long eventId);
}
