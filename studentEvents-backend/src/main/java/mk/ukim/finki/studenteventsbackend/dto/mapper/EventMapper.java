package mk.ukim.finki.studenteventsbackend.dto.mapper;

import mk.ukim.finki.studenteventsbackend.dto.event.*;
import mk.ukim.finki.studenteventsbackend.model.domain.Event;
import org.springframework.stereotype.Component;

@Component
public class EventMapper {

    public Event toEntity(EventCreateDto dto) {
        Event e = new Event();
        e.setTitle(dto.title());
        e.setDescription(dto.description());
        e.setEventCategory(dto.category());
        e.setLocation(dto.location());
        e.setStartTime(dto.startTime());
        e.setEndTime(dto.endTime());
        e.setMaxCapacity(dto.maxCapacity());
        e.setImageUrl(dto.imageUrl());
        e.setPrice(dto.price());
        return e;
    }

    public void updateEntity(EventUpdateDto dto, Event e) {
        e.setTitle(dto.title());
        e.setDescription(dto.description());
        e.setEventCategory(dto.category());
        e.setLocation(dto.location());
        e.setStartTime(dto.startTime());
        e.setEndTime(dto.endTime());
        e.setMaxCapacity(dto.maxCapacity());
        e.setImageUrl(dto.imageUrl());
        e.setPrice(dto.price());
    }

    public EventDetailsDto toDetailsDto(Event e) {
        return new EventDetailsDto(
                e.getId(),
                e.getTitle(),
                e.getDescription(),
                e.getEventCategory(),
                e.getLocation(),
                e.getStartTime(),
                e.getEndTime(),
                e.getMaxCapacity(),
                e.getCreatedBy(),
                e.getCreatedAt(),
                e.getImageUrl(),
                null,
                null,
                e.getPrice()
        );
    }

    public EventSummaryDto toSummaryDto(Event e) {
        return new EventSummaryDto(
                e.getId(),
                e.getTitle(),
                e.getEventCategory(),
                e.getLocation(),
                e.getStartTime(),
                e.getEndTime(),
                e.getCreatedBy(),
                e.getImageUrl(),
                e.getMaxCapacity(),
                null,
                e.getPrice()
        );
    }
}
