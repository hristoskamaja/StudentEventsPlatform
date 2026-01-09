package mk.ukim.finki.studenteventsbackend.service.application.impl;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.studenteventsbackend.model.domain.Event;
import mk.ukim.finki.studenteventsbackend.model.domain.Review;
import mk.ukim.finki.studenteventsbackend.repository.EventRepository;
import mk.ukim.finki.studenteventsbackend.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl {

    private final ReviewRepository reviewRepository;
    private final EventRepository eventRepository;

    @Transactional
    public Review add(Long eventId, String username, int rating, String comment) {
        if (reviewRepository.existsByEvent_IdAndStudentUsername(eventId, username)) {
            throw new IllegalStateException("Веќе имаш оставено оцена за овој настан.");
        }

        Event ev = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Настанот не постои"));

        Review r = Review.builder()
                .event(ev)
                .studentUsername(username)
                .rating(rating)
                .comment(comment)
                .build();

        return reviewRepository.save(r);
    }

    public List<Review> forEvent(Long eventId) {
        return reviewRepository.findAllByEvent_IdOrderByCreatedAtDesc(eventId);
    }

    public double average(Long eventId) {
        return Optional.ofNullable(reviewRepository.avgForEvent(eventId)).orElse(0.0);
    }

    public Optional<Review> mineForEvent(Long eventId, String username) {
        return reviewRepository.findByEvent_IdAndStudentUsername(eventId, username);
    }
}
