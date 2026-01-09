package mk.ukim.finki.studenteventsbackend.web;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.studenteventsbackend.dto.registration.MyRegistrationDto;
import mk.ukim.finki.studenteventsbackend.dto.registration.RegisterRequest;
import mk.ukim.finki.studenteventsbackend.service.application.RegistrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @GetMapping("/mine")
    @PreAuthorize("isAuthenticated()")
    public List<MyRegistrationDto> mine() {
        return registrationService.myRegistrations();
    }

    @GetMapping("/by-event/{eventId}/mine")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> byEventMine(@PathVariable Long eventId) {
        return registrationService.myRegistrationForEvent(eventId)
                .<Map<String,Object>>map(dto -> Map.of("registered", true, "registration", dto))
                .orElseGet(() -> Map.of("registered", false));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MyRegistrationDto> register(@RequestBody RegisterRequest req) {
        MyRegistrationDto saved = registrationService.register(req.eventId());
        return ResponseEntity.created(URI.create("/api/registrations/" + saved.id())).body(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        registrationService.cancel(id);
        return ResponseEntity.noContent().build();
    }
}
