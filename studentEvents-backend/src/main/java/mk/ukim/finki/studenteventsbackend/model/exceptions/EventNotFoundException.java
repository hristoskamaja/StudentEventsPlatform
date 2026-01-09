package mk.ukim.finki.studenteventsbackend.model.exceptions;


import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.NOT_FOUND)
public class EventNotFoundException extends RuntimeException {

    public EventNotFoundException(Long id) {
        super(String.format("Event with id: %d is not found", id));
    }
}
