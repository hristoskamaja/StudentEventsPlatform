package mk.ukim.finki.studenteventsbackend.web;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.studenteventsbackend.dto.payment.CheckoutSessionDto;
import mk.ukim.finki.studenteventsbackend.dto.registration.MyRegistrationDto;
import mk.ukim.finki.studenteventsbackend.service.application.impl.StripePaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final StripePaymentService stripePaymentService;

    @PostMapping("/checkout/{eventId}")
    public ResponseEntity<CheckoutSessionDto> checkout(@PathVariable Long eventId,
                                                       @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt.getSubject(); // sub
        String username = jwt.getClaimAsString("preferred_username");
        if (username == null) username = userId;

        return ResponseEntity.ok(stripePaymentService.createCheckout(eventId, userId, username));
    }

    @PostMapping("/confirm")
    public ResponseEntity<MyRegistrationDto> confirm(@RequestParam("session_id") String sessionId,
                                                     @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return ResponseEntity.ok(stripePaymentService.confirmPaid(sessionId, userId));
    }
}
