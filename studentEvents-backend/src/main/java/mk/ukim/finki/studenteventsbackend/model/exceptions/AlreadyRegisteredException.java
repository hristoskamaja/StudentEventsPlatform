package mk.ukim.finki.studenteventsbackend.model.exceptions;

public class AlreadyRegisteredException extends RuntimeException {

    public AlreadyRegisteredException(Long eventId, String studentSub) {
        super(String.format("User with username: %s already registered for the event %d", studentSub, eventId));
    }
}

