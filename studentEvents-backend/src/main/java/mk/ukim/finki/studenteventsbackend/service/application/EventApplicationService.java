package mk.ukim.finki.studenteventsbackend.service.application;

import mk.ukim.finki.studenteventsbackend.dto.event.*;

import java.util.List;

public interface EventApplicationService {
    List<EventSummaryDto> findAll();

    EventDetailsDto findOne(Long id);

    EventDetailsDto create(EventCreateDto dto, String createdBy);

    EventDetailsDto update(Long id, EventUpdateDto dto);

    void delete(Long id);
}

