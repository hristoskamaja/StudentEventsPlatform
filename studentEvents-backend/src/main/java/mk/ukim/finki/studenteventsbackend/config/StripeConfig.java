package mk.ukim.finki.studenteventsbackend.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(StripeProperties.class)
public class StripeConfig {

    private final StripeProperties props;

    @PostConstruct
    public void init() {
        Stripe.apiKey = props.secretKey();
    }
}
