
# Keycloak realm import (campus-events)

This folder contains a preconfigured Keycloak realm for the Student Events app.

- Realm: `campus-events`
- Client: `events-web` (public SPA)
- Roles (realm-level): `STUDENT`, `ORGANIZER`, `ADMIN`
- Registration enabled: Yes

## How to run with Docker Compose

1) Ensure your backend `application.properties` contains:
```
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8081/realms/campus-events
app.security.client-id=events-web
```

2) Ensure your frontend `.env` contains:
```
VITE_KEYCLOAK_URL=http://localhost:8081
VITE_KEYCLOAK_REALM=campus-events
VITE_KEYCLOAK_CLIENT=events-web
VITE_API_URL=http://localhost:8080
```

3) Place this folder somewhere accessible (for example, at the root of your backend project) and update your `docker-compose.yml` Keycloak service to mount and import the realm:

```yaml
  keycloak:
    image: quay.io/keycloak/keycloak:24.0
    container_name: events-keycloak
    command: ["start-dev", "--http-port=8080", "--import-realm"]
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    volumes:
      - ./keycloak-import:/opt/keycloak/data/import
    ports:
      - "8081:8080"
    depends_on:
      db:
        condition: service_healthy
```

4) Start services:
```
docker compose up -d keycloak
```

5) Verify the realm exists:
```
curl http://localhost:8081/realms/campus-events/.well-known/openid-configuration
```

You should **not** see `{"error":"Realm does not exist"}` anymore.

## Create initial users (optional)

- Open Keycloak Admin console: http://localhost:8081/
- Login with `admin` / `admin`
- Go to *campus-events → Users → Add user* and enable *Email Verified*.
- Set temporary password and *Set Password* → *Temporary: OFF*.
- Assign *Role Mappings* with one of `STUDENT`, `ORGANIZER`, `ADMIN`.

## Frontend login

The frontend is already wired to redirect to Keycloak if unauthenticated. If you visit the app in the browser, it will redirect to Keycloak’s login automatically and come back with a token.
