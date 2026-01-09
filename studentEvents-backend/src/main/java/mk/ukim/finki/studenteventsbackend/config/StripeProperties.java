package mk.ukim.finki.studenteventsbackend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "stripe")
public record StripeProperties(
        String secretKey,
        String successUrl,
        String cancelUrl
) {}
