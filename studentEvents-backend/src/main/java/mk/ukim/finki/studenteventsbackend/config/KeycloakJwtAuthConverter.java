package mk.ukim.finki.studenteventsbackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Extracts roles from Keycloak access token:
 * - realm_access.roles           → ROLE_*
 * - resource_access[clientId].roles → ROLE_*
 */
public class KeycloakJwtAuthConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    private final String clientId;

    public KeycloakJwtAuthConverter(@Value("${app.security.client-id:events-web}") String clientId) {
        this.clientId = clientId;
    }

    @Override
    @SuppressWarnings("unchecked")
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        // realm roles
        Set<String> realmRoles = Optional.ofNullable((Map<String, Object>) jwt.getClaim("realm_access"))
                .map(m -> (Collection<String>) m.get("roles"))
                .map(HashSet::new)
                .orElseGet(HashSet::new);

        // client roles
        Set<String> clientRoles = Optional.ofNullable((Map<String, Object>) jwt.getClaim("resource_access"))
                .map(m -> (Map<String, Object>) m.get(clientId))
                .map(m -> (Collection<String>) m.get("roles"))
                .map(HashSet::new)
                .orElseGet(HashSet::new);

        // union → ROLE_*
        return Stream.concat(realmRoles.stream(), clientRoles.stream())
                .distinct()
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
