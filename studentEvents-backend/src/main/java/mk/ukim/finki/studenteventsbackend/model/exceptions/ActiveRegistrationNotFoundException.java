package mk.ukim.finki.studenteventsbackend.model.exceptions;

public class ActiveRegistrationNotFoundException extends RuntimeException {

    public ActiveRegistrationNotFoundException(String studentSub) {
        super(String.format("User with username: %s is not found", studentSub));
    }
}
