import { useEffect, useMemo, useRef, useState } from "react";
import Keycloak from "keycloak-js";
import { AuthContext } from "../contexts/AuthContext";
import { setAuthToken } from "../axios/client";

export default function AuthProvider({ children }) {
    const [ready, setReady] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    const kcRef = useRef(null);
    if (!kcRef.current) {
        kcRef.current = new Keycloak({
            url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8081",
            realm: import.meta.env.VITE_KEYCLOAK_REALM || "campus-events",
            clientId: import.meta.env.VITE_KEYCLOAK_CLIENT || "events-web",
        });
    }
    const kc = kcRef.current;

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const ok = await kc.init({
                    onLoad: "check-sso",
                    pkceMethod: 'S256'
                });

                if (!mounted) return;
                setAuthenticated(ok);

                if (ok) {
                    const profile = await kc.loadUserProfile().catch(() => null);
                    const parsed = parseJwt(kc.token);

                    const realmRoles = parsed?.realm_access?.roles ?? [];
                    const clientId = kc.clientId || (import.meta.env.VITE_KEYCLOAK_CLIENT || "events-web");
                    const clientRoles = parsed?.resource_access?.[clientId]?.roles ?? [];

                    const allRoles = new Set([
                        ...realmRoles,
                        ...clientRoles,
                        ...realmRoles.map((r) => "ROLE_" + r),
                        ...clientRoles.map((r) => "ROLE_" + r),
                    ]);

                    const username = parsed?.preferred_username ?? profile?.username ?? null;

                    setUser({
                        username,
                        sub: parsed?.sub ?? null,
                        email: profile?.email ?? parsed?.email ?? null,
                        roles: allRoles,
                    });

                    setAuthToken(kc.token);
                } else {
                    setUser(null);
                    setAuthToken(null);
                }
            } catch (e) {
                console.error("Keycloak init failed", e);
                setUser(null);
                setAuthToken(null);
            } finally {
                if (mounted) setReady(true);
            }
        })();

        kc.onTokenExpired = () => {
            kc.updateToken(30)
                .then(() => kc.token && setAuthToken(kc.token))
                .catch(() => kc.login());
        };

        return () => {
            mounted = false;
            kc.onTokenExpired = undefined;
        };
    }, [kc]);

    const hasRole = (r) => user?.roles?.has(r) || user?.roles?.has("ROLE_" + r);

    const value = useMemo(
        () => ({
            keycloak: kc,
            ready,
            authenticated,
            user,
            token: kc?.token ?? null,
            sub: user?.sub ?? null,
            username: user?.username ?? null,
            hasRole,
            login: () => kc.login(),
            logout: () => kc.logout({ redirectUri: window.location.origin + "/" }),
        }),
        [kc, ready, authenticated, user]
    );

    if (!ready) return <div className="container"><p>Loading auth…</p></div>;
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function parseJwt(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
}
