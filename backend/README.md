# TripNest - Spring Boot 3 API (Java 21)

Production-grade RESTful API backend for **TripNest**, built with Java 21, Spring Boot 3.3.4, Spring Security, JWT authentication, Google OAuth2 login, and PostgreSQL persistence.

---

## 🏛 System Architecture

```
           ┌──────────────────────┐
           │      TripNest UI     │
           │ React + Vite +       │
           │ Tailwind CSS         │
           └──────────┬───────────┘
                      │
                REST / Axios
                      │
                      ▼
           ┌──────────────────────┐
           │   Spring Boot API    │
           │      Java 21         │
           │ Spring Security      │
           │ JWT + Google OAuth   │
           └───────┬───────┬──────┘
                   │       │
        ┌──────────┘       └──────────┐
        ▼                             ▼
┌────────────────┐            ┌─────────────────┐
│   PostgreSQL   │            │   Google OAuth  │
│     tripnest   │            │     Login       │
└────────────────┘            └─────────────────┘
```

---

## 🚀 Key Technologies & Stack

| Component | Technology | Version / Notes |
| :--- | :--- | :--- |
| **Language** | Java | **Java 21 LTS** (Records, Virtual Threads ready, Pattern Matching) |
| **Framework** | Spring Boot | **3.3.4** |
| **Security** | Spring Security 6 | Stateless JWT + Google OAuth2 Client + BCrypt |
| **Database** | PostgreSQL | Port `5432`, database `tripnest` |
| **ORM / Data** | Spring Data JPA / Hibernate | Automatic entity mappings & migration scripts |
| **Token Auth** | JJWT | `io.jsonwebtoken:jjwt:0.12.5` (HMAC-SHA256) |
| **Build Tool** | Apache Maven | Maven 3.9+ |
| **Containers** | Docker & Docker Compose | Multi-stage Eclipse Temurin Java 21 JRE image |

---

## 📦 Directory Structure

```
backend/
├── pom.xml                               # Maven project dependencies
├── Dockerfile                            # Multi-stage Java 21 container image
├── docker-compose.yml                    # PostgreSQL + Spring Boot container orchestration
├── README.md                             # Documentation & Setup guide
└── src/
    └── main/
        ├── java/com/tripnest/
        │   ├── TripNestApplication.java   # Spring Boot entry point
        │   ├── config/                   # Spring Security, JWT & OAuth2 Filters
        │   │   ├── SecurityConfig.java
        │   │   ├── JwtService.java
        │   │   ├── JwtAuthenticationFilter.java
        │   │   ├── OAuth2AuthenticationSuccessHandler.java
        │   │   ├── CustomUserDetailsService.java
        │   │   └── CorsConfig.java
        │   ├── controller/               # REST Endpoints
        │   │   ├── AuthController.java
        │   │   ├── TripController.java
        │   │   ├── ReviewController.java
        │   │   └── DestinationController.java
        │   ├── dto/                      # Data Transfer Objects
        │   ├── model/                    # JPA Entities
        │   │   ├── User.java
        │   │   ├── Trip.java
        │   │   ├── ItineraryDay.java
        │   │   ├── Activity.java
        │   │   ├── Expense.java
        │   │   ├── Review.java
        │   │   └── Destination.java
        │   ├── repository/               # Spring Data JPA Repositories
        │   └── service/                  # Business Logic Services
        └── resources/
            ├── application.yml           # Configuration & DataSource
            ├── schema.sql                # PostgreSQL DDL
            └── data.sql                  # PostgreSQL Initial Seed Data
```

---

## 🏃 Quick Start: Run Locally

### Option 1: Using Docker Compose (Fastest)

Launch both PostgreSQL (`tripnest`) and Spring Boot API with a single command:

```bash
cd backend
docker compose up --build
```

The Spring Boot backend will be available at:
`http://localhost:8080/api`

### Option 2: Running PostgreSQL in Docker + Spring Boot via Maven

1. **Start PostgreSQL database:**
   ```bash
   docker run --name tripnest-db \
     -e POSTGRES_DB=tripnest \
     -e POSTGRES_USER=tripnest \
     -e POSTGRES_PASSWORD=tripnest_secure_2026 \
     -p 5432:5432 -d postgres:16-alpine
   ```

2. **Run Spring Boot:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. **Verify Health:**
   ```bash
   curl http://localhost:8080/api/destinations
   ```

---

## 🔑 Google OAuth2 Configuration

To enable real Google Sign-In with Google Cloud Platform:
1. Open the [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Add Authorized Redirect URI:
   `http://localhost:8080/login/oauth2/code/google`
4. Set environment variables:
   ```bash
   export GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   export GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

---

## 🛡 API Endpoints Summary

- **POST `/api/auth/login`**: Authenticate with email and password -> returns JWT token
- **POST `/api/auth/register`**: Register new traveler profile
- **POST `/api/auth/google`**: Client-side Google OAuth token exchange
- **GET `/api/auth/me`**: Get current user profile (requires `Bearer <JWT>`)
- **GET `/api/trips`**: Get authenticated user's travel journeys
- **POST `/api/trips`**: Create a new adventure
- **GET `/api/destinations`**: Search & filter travel destinations
- **GET `/api/reviews`**: Get community traveler reviews & rating summary
- **POST `/api/reviews`**: Submit rating and review with sub-scores
- **POST `/api/reviews/{id}/helpful`**: Upvote review helpfulness
