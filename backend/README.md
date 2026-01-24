# EasePath Backend

Spring Boot REST API with MongoDB.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 21 | Runtime |
| Spring Boot | 3.3.4 | Framework |
| MongoDB | Latest | Database |
| Maven | 3.9+ | Build Tool |

## Dependencies

### Core
- `spring-boot-starter-web` - REST API
- `spring-boot-starter-data-mongodb` - MongoDB persistence
- `spring-boot-starter-webflux` - Reactive WebClient for AI calls
- `spring-boot-starter-validation` - Request validation

### Integrations
- `spring-boot-starter-mail` - Email via Resend SMTP
- `google-api-client` - Google OAuth verification
- `jsoup` - Web scraping
- `pdfbox` - PDF parsing

### Dev Tools
- `spring-boot-devtools` - Hot reload
- `spring-boot-docker-compose` - Auto-start Docker containers
- `spring-dotenv` - Load .env files

## Setup

### 1. Prerequisites

- Java 21
- Maven 3.9+
- Docker Desktop (for MongoDB)

### 2. Environment Variables

Create `.env` in `/backend`:

```env
RESEND_API_KEY=re_your_api_key
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
EASEPATH_AI_API_KEY=your_gemini_or_openai_key
```

### 3. Run the Application

```bash
cd backend
mvn spring-boot:run
```

> MongoDB starts automatically via Docker Compose support.

API runs at: http://localhost:8080

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/apply` | Start auto-apply job search |
| POST | `/api/resume/upload` | Upload resume PDF |
| GET | `/api/resume/score` | Get AI resume score |
| PUT | `/api/extension/profile` | Update user profile |
| GET | `/api/extension/profile` | Get user profile |

## Build for Production

```bash
mvn clean package -DskipTests
java -jar target/easepath-backend-0.0.1-SNAPSHOT.jar
```

## Docker Build

```bash
docker build -t easepath-backend .
docker run -p 8080:8080 easepath-backend
```
