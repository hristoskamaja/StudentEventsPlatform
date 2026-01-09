package mk.ukim.finki.studenteventsbackend.service.domain;

import mk.ukim.finki.studenteventsbackend.model.domain.Registration;

import java.util.List;

public interface RegistrationService {
    Registration register(Long eventId, String studentSub);

    void cancel(Long eventId, String studentSub);

    List<Registration> myRegistrations(String studentSub);

    List<Registration> forEvent(Long eventId);
}
