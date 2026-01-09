package mk.ukim.finki.studenteventsbackend.web;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.studenteventsbackend.model.domain.Review;
import mk.ukim.finki.studenteventsbackend.service.application.impl.ReviewServiceImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewServiceImpl reviewService;

    @PostMapping("/{eventId}")
    public ResponseEntity<?> add(@PathVariable Long eventId,
                                 @RequestParam int rating,
                                 @RequestParam(required = false) String comment,
                                 @AuthenticationPrincipal Jwt jwt) {

        if (jwt == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthenticated"));
        }

        String username = jwt.getClaimAsString("preferred_username");

        try {
            Review saved = reviewService.add(eventId, username, rating, comment);
            return ResponseEntity.ok(saved);
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(409).body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/{eventId}")
    public List<Review> list(@PathVariable Long eventId) {
        return reviewService.forEvent(eventId);
    }

    @GetMapping("/{eventId}/average")
    public double average(@PathVariable Long eventId) {
        return reviewService.average(eventId);
    }

    @GetMapping("/{eventId}/mine")
    public ResponseEntity<?> mine(@PathVariable Long eventId,
                                  @AuthenticationPrincipal Jwt jwt) {

        if (jwt == null) return ResponseEntity.status(401).build();

        String username = jwt.getClaimAsString("preferred_username");
        return reviewService.mineForEvent(eventId, username)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
}
