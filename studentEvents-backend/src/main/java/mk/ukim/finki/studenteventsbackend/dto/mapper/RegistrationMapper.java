package mk.ukim.finki.studenteventsbackend.dto.mapper;

import mk.ukim.finki.studenteventsbackend.dto.registration.RegistrationViewDto;
import mk.ukim.finki.studenteventsbackend.model.domain.Registration;
import org.springframework.stereotype.Component;

@Component
public class RegistrationMapper {

    public RegistrationViewDto toViewDto(Registration r) {
        return new RegistrationViewDto(
                r.getId(),
                r.getEvent() != null ? r.getEvent().getId() : null,
                r.getUserId(),
                r.getStatus(),
                r.getRegisteredAt()
        );
    }
}
