package mk.ukim.finki.studenteventsbackend.web;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.studenteventsbackend.dto.event.EventCreateDto;
import mk.ukim.finki.studenteventsbackend.dto.event.EventDetailsDto;
import mk.ukim.finki.studenteventsbackend.dto.event.EventSummaryDto;
import mk.ukim.finki.studenteventsbackend.dto.event.EventUpdateDto;
import mk.ukim.finki.studenteventsbackend.service.application.EventApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.security.oauth2.jwt.Jwt;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Validated
public class EventController {

    private final EventApplicationService eventApplicationService;

    @GetMapping
    public List<EventSummaryDto> findAll() {
        return eventApplicationService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDetailsDto> findOne(@PathVariable Long id) {
        return ResponseEntity.ok(eventApplicationService.findOne(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @PostMapping("/create")
    public ResponseEntity<EventDetailsDto> create(@Valid @RequestBody EventCreateDto dto,
                                                  @AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getClaimAsString("preferred_username");
        if (username == null) username = jwt.getSubject();

        EventDetailsDto saved = eventApplicationService.create(dto, username);
        return ResponseEntity.created(URI.create("/api/events/" + saved.id())).body(saved);
    }

    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @PutMapping("/update/{id}")
    public ResponseEntity<EventDetailsDto> update(@PathVariable Long id,
                                                  @Valid @RequestBody EventUpdateDto dto) {
        return ResponseEntity.ok(eventApplicationService.update(id, dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        eventApplicationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
