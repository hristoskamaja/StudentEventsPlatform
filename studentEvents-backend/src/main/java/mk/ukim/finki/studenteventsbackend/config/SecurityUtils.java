package mk.ukim.finki.studenteventsbackend.config;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

public final class SecurityUtils {

    private SecurityUtils() {}

    private static Jwt getJwt() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        if (a instanceof JwtAuthenticationToken jat) return jat.getToken();
        return null;
    }

    public static String userId() {
        Jwt jwt = getJwt();
        return jwt != null ? jwt.getClaimAsString("sub") : "dev-user";
    }

    public static String username() {
        Jwt jwt = getJwt();
        if (jwt == null) return "dev-user";
        String u = jwt.getClaimAsString("preferred_username");
        if (u == null || u.isBlank()) u = jwt.getClaimAsString("email");
        if (u == null || u.isBlank()) u = jwt.getClaimAsString("sub");
        return u;
    }

    public static boolean hasRole(String role) {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        if (a == null) return false;
        for (GrantedAuthority ga : a.getAuthorities()) {
            String auth = ga.getAuthority();
            if (auth.equals(role) || auth.equals("ROLE_" + role)) return true;
        }
        return false;
    }
}
