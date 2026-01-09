package mk.ukim.finki.studenteventsbackend.model.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import mk.ukim.finki.studenteventsbackend.model.enumeration.EventCategory;

import java.time.*;
import java.util.ArrayList;
import java.util.List;
import java.math.BigDecimal;

@Entity
@Data
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;


    @Column(length = 4000)
    private String description;


    @Enumerated(EnumType.STRING)
    @NotNull
    private EventCategory eventCategory;


    @NotBlank
    private String location;


    @NotNull
    private LocalDateTime startTime;


    @NotNull
    private LocalDateTime endTime;


    private Integer maxCapacity;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "event", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Registration> registrations = new ArrayList<>();

    @Column(name = "created_by_sub", nullable = true)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY) // клиентот не смее да го поставува
    private String createdBySub;

    @Column(length = 512)
    private String imageUrl;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews = new ArrayList<>();

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

}