package mk.ukim.finki.studenteventsbackend.web;

import mk.ukim.finki.studenteventsbackend.dto.ticket.TicketDto;
import mk.ukim.finki.studenteventsbackend.model.domain.Registration;
import mk.ukim.finki.studenteventsbackend.repository.RegistrationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final RegistrationRepository registrationRepository;

    public TicketController(RegistrationRepository registrationRepository) {
        this.registrationRepository = registrationRepository;
    }

    @GetMapping("/{registrationId}")
    public TicketDto ticket(@PathVariable Long registrationId,
                            JwtAuthenticationToken auth) {

        Registration r = registrationRepository.findByIdWithEvent(registrationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        String sub = auth.getToken().getSubject();
        String preferredUsername = auth.getToken().getClaimAsString("preferred_username");
        String nameFallback = auth.getName();

        boolean mine =
                (r.getUserId() != null && (
                        r.getUserId().equals(sub) ||
                                r.getUserId().equalsIgnoreCase(nameFallback)
                ))
                        ||
                        (r.getUsername() != null && (
                                r.getUsername().equalsIgnoreCase(preferredUsername) ||
                                        r.getUsername().equalsIgnoreCase(nameFallback)
                        ));

        if (!mine) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your ticket");
        }

        String qrValue = "REG:" + r.getId()
                + "|EV:" + r.getEvent().getId()
                + "|U:" + (r.getUsername() != null ? r.getUsername() : r.getUserId());

        return new TicketDto(
                r.getId(),
                r.getEvent().getId(),
                r.getEvent().getTitle(),
                r.getUsername(),
                qrValue
        );
    }
}
