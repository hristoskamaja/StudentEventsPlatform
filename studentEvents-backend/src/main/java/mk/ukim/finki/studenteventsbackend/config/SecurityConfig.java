package mk.ukim.finki.studenteventsbackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            @Value("${app.security.client-id:events-web}") String clientId
    ) throws Exception {

        JwtAuthenticationConverter jwtAuthConverter = new JwtAuthenticationConverter();
        jwtAuthConverter.setJwtGrantedAuthoritiesConverter(new KeycloakJwtAuthConverter(clientId));

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth

                        // swagger/health public
                        .requestMatchers(
                                "/actuator/health",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // Events public read
                        .requestMatchers(HttpMethod.GET, "/api/events/**").permitAll()

                        // Registrations (only logged in - any role)
                        .requestMatchers(HttpMethod.GET, "/api/registrations/**").hasAnyRole("STUDENT", "ORGANIZER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/registrations").hasAnyRole("STUDENT", "ORGANIZER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/registrations/**").hasAnyRole("STUDENT", "ORGANIZER", "ADMIN")

                        // Events manage (admin/organizer)
                        .requestMatchers(HttpMethod.POST, "/api/events/**").hasAnyRole("ADMIN", "ORGANIZER")
                        .requestMatchers(HttpMethod.PUT, "/api/events/**").hasAnyRole("ADMIN", "ORGANIZER")
                        .requestMatchers(HttpMethod.DELETE, "/api/events/**").hasAnyRole("ADMIN", "ORGANIZER")


                        // Reviews
                        .requestMatchers(HttpMethod.GET, "/api/reviews/*/mine").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/reviews/**").hasRole("STUDENT")

                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/payments/**")
                        .hasRole("STUDENT")


                        // admin-only endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter))
                );

        return http.build();
    }
}
