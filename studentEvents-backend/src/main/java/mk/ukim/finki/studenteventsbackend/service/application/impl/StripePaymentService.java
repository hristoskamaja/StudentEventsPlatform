package mk.ukim.finki.studenteventsbackend.service.application.impl;

import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import mk.ukim.finki.studenteventsbackend.config.StripeProperties;
import mk.ukim.finki.studenteventsbackend.dto.payment.CheckoutSessionDto;
import mk.ukim.finki.studenteventsbackend.dto.registration.MyRegistrationDto;
import mk.ukim.finki.studenteventsbackend.dto.mapper.EventMapper;
import mk.ukim.finki.studenteventsbackend.model.domain.Event;
import mk.ukim.finki.studenteventsbackend.model.domain.Registration;
import mk.ukim.finki.studenteventsbackend.model.enumeration.RegistrationStatus;
import mk.ukim.finki.studenteventsbackend.repository.EventRepository;
import mk.ukim.finki.studenteventsbackend.repository.RegistrationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class StripePaymentService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final EventMapper eventMapper;
    private final StripeProperties props;

    @Transactional
    public CheckoutSessionDto createCheckout(Long eventId, String userId, String username) {
        Event e = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        BigDecimal price = e.getPrice();
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event is free (no payment required)");
        }

        Registration reg = registrationRepository
                .findByEventIdAndUserIdAndStatus(eventId, userId, RegistrationStatus.ACTIVE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "You must register before paying"));

        if (reg.isPaid()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already paid");
        }

        long unitAmount = price.movePointRight(2).longValueExact();

        try {
            String successUrl = props.successUrl();
            if (!successUrl.contains("{CHECKOUT_SESSION_ID}")) {
                String sep = successUrl.contains("?") ? "&" : "?";
                successUrl = successUrl + sep + "session_id={CHECKOUT_SESSION_ID}";
            }

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(successUrl)
                    .setCancelUrl(props.cancelUrl())
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setQuantity(1L)
                                    .setPriceData(
                                            SessionCreateParams.LineItem.PriceData.builder()
                                                    .setCurrency("mkd") // остави така за сега
                                                    .setUnitAmount(unitAmount)
                                                    .setProductData(
                                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName(e.getTitle())
                                                                    .setDescription(e.getLocation())
                                                                    .build()
                                                    )
                                                    .build()
                                    )
                                    .build()
                    )
                    .putMetadata("eventId", String.valueOf(e.getId()))
                    .putMetadata("userId", userId == null ? "" : userId)
                    .putMetadata("username", username == null ? "" : username)
                    .build();

            Session session = Session.create(params);

            reg.setStripeSessionId(session.getId());
            reg.setUsername(username);
            registrationRepository.save(reg);

            return new CheckoutSessionDto(session.getId(), session.getUrl());

        } catch (StripeException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Stripe error: " + ex.getMessage());
        }
    }

    @Transactional
    public MyRegistrationDto confirmPaid(String sessionId, String userId) {
        if (sessionId == null || sessionId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing session_id");
        }

        try {
            Session session = Session.retrieve(sessionId);

            String paymentStatus = session.getPaymentStatus(); // "paid" ако е платено
            if (!"paid".equalsIgnoreCase(paymentStatus)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment not completed");
            }

            Registration reg = registrationRepository.findByStripeSessionId(sessionId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration not found for session"));

            if (userId != null && !userId.equals(reg.getUserId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
            }

            if (!reg.isPaid()) {
                reg.setPaid(true);
                reg.setPaidAt(Instant.now());
                registrationRepository.save(reg);
            }

            return new MyRegistrationDto(
                    reg.getId(),
                    eventMapper.toSummaryDto(reg.getEvent()),
                    reg.getStatus(),
                    reg.isPaid(),
                    reg.getPaidAt()
            );

        } catch (StripeException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Stripe error: " + ex.getMessage());
        }
    }
}
