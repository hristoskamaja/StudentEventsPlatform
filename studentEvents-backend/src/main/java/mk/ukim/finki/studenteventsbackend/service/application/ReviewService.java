package mk.ukim.finki.studenteventsbackend.service.application;


import mk.ukim.finki.studenteventsbackend.model.domain.Review;

import java.util.List;

public interface ReviewService {
    Review addReview(Long eventId, String studentUsername, int rating, String comment);

    List<Review> getReviewsForEvent(Long eventId);

    double getAverageRatingForEvent(Long eventId);
}
