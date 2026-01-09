package mk.ukim.finki.studenteventsbackend.model.exceptions;

public class CapacityFullException extends RuntimeException {

    public CapacityFullException(Long eventId) {
        super(String.format("Capacity for the event with the id %d is full", eventId));
    }
}