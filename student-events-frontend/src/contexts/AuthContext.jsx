import keycloak from "keycloak-js/lib/keycloak.js";

export { default as AuthProvider, useAuth } from "../providers/AuthProvider.jsx";

const logout = () => {
    keycloak.logout({
        redirectUri: window.location.origin, // после одјава оди на /
    });
};