# Student Events Platform

## Project Description
Student Events Platform is a full-stack web application that enables browsing, creation, and registration for student events such as workshops, lectures, meetups, and conferences.

The application is developed as part of the courses **Electronic and Mobile Commerce** and **Web Design** and serves as a practical implementation of a complete web application, combining frontend and backend functionalities.
---

##  Technologies Used
- Frontend: React (Vite), JavaScript (JSX), CSS
- Backend: Spring Boot, Java, REST API
- Authentication: Keycloak
- Database: PostgreSQL
- Payments: Stripe
- Infrastructure: Docker, Docker Compose
- Version Control: Git, GitHub

---

## Functionalities
- View list of available student events  
- View detailed event information  
- User authentication and authorization (Keycloak)  
- Role-based access control
- Event registration with capacity control
- Online payment for events using Stripe  
- QR code ticket generation after successful payment  
- QR ticket validation at event entry  
- Ability to leave comments for completed events  
- Ability to rate completed events  
---

## Screenshots
Application screenshots are available in the `screenshots/` directory.

---

## Running the Application
### Requirements
- Node.js
- Java 17+
- Docker & Docker Compose

### Start Backend & Frontend

From the backend directory:
```bash
docker-compose up -d
./mvnw spring-boot:run
```

From the frontend directory:
```bash
cd student-events-frontend
npm install
npm run dev
```
Frontend will be available at:
http://localhost:5174
