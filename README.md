# EasePath Job Application Assistant

EasePath is a Full Stack project (React frontend + Spring Boot backend) that helps job seekers track activity and experiment with automated job applications. The frontend gives authenticated users a dashboard, resume preview, and an "Auto Apply" form, while the backend exposes REST endpoints that currently simulate scraping job boards, handles resume/user DTOs, and centralizes future AI integrations.

## Features
- **Dashboard snapshots** with quick stats for weekly applications, interviews, and AI credit usage.
- **Auto Apply workflow** that collects job keywords, job board URLs, target application counts, resume summaries, and optional PDF/DOC resumes (validated and Base64 encoded before sending to the API).
- **Google OAuth sign-in** on the landing page so users authenticate with their Gmail accounts before accessing dashboard tools (no SQL database required).
- **Job Application API** (`POST /api/apply`) that logs the request, scrapes job listings with Jsoup, simulates AI filtering, and emails users when manual prompts are detected.
- **AI scoring filter** that calls an AI scoring service (or a built-in heuristic fallback) to rank jobs before attempting auto applications.
- **Resume & user sample endpoints** for mocking data (`/api/resumes`, `/api/resumes/sample`, `/api/users`, `/api/users/sample`).
- **Extensible architecture** with placeholder hooks for AI services (configured via `easepath.ai.api-key`) and SMTP notifications via Spring Mail.

## Tech Stack
- **Frontend:** React 18, TypeScript, Vite, React Router, @react-oauth/google (future integration), Axios, custom AuthContext.
- **Styling:** CSS modules per page/component, dark UI system.
- **Backend:** Java 21, Spring Boot 3.3, Spring Web, Validation, Spring Mail, Jsoup for scraping, Maven build.

## Repository Layout
```
E_Resume/
├── backend/                    # Spring Boot API
│   ├── pom.xml
│   └── src/main/java/com/easepath/backend/
│       ├── controller/         # JobApplication, Resume, User controllers
│       ├── dto/                # JobApplicationRequest, ResumeDto, UserDto
│       └── service/impl/       # Business logic placeholders + Jsoup scraping
├── frontend/                   # React + Vite client
│   ├── src/components          # Navbar, ProtectedRoute, etc.
│   └── src/pages               # Home, Dashboard, AutoApply, Settings
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Java 21 (matching `pom.xml`) and Maven 3.9+
- SMTP credentials (for Spring Mail) if you plan to send emails

### 1. Clone
```bash
git clone <repo-url>
cd E_Resume
```

### 2. Backend Setup (`/backend`)
1. Copy `src/main/resources/application.properties` to a safe location and inject your secrets. Fields to update:
   ```properties
   spring.mail.username=your-email@gmail.com
   spring.mail.password=your-app-password
   easepath.ai.api-key=YOUR_AI_SERVICE_KEY
   easepath.ai.score-endpoint=https://api.easepath.ai/v1/score
   spring.data.mongodb.uri=${EASEPATH_MONGODB_URI:mongodb://localhost:27017/easepath}
   ```
   > `application.properties` is gitignored so secrets stay local.
2. If you are using MongoDB Atlas or a remote cluster, export `EASEPATH_MONGODB_URI` (and optionally `EASEPATH_MONGODB_DB`) before starting Spring Boot so the backend can persist parsed resumes.
3. Install dependencies & run:
   ```bash
   mvn spring-boot:run
   ```
3. API defaults to `http://localhost:8080`.

### 3. Frontend Setup (`/frontend`)
1. Create a `.env` (or `.env.local`) file and add your Google OAuth client ID:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```
2. Install dependencies (include Google OAuth package):
   ```bash
   npm install
   npm install @react-oauth/google@latest
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Vite serves the app at `http://localhost:5173` (proxying to the backend via relative `/api/...` calls).

5. Install Login Background animations:
   ``` StarBorder
   npx jsrepo add https://reactbits.dev/ts/default/Animations/StarBorder
   ```
   ``` Auroua
   npx jsrepo add https://reactbits.dev/ts/default/Backgrounds/Aurora
   ```
   ```GridMotion
   npx jsrepo add https://reactbits.dev/ts/default/Backgrounds/GridMotion
   ```
   ```Split text
   npx jsrepo add https://reactbits.dev/ts/default/TextAnimations/SplitText
   ```
#### NPM scripts
| Command        | Description |
| -------------- | ----------- |
| `npm run dev`  | Launches the Vite development server with hot reloading. |
| `npm run build`| Produces a production bundle in `dist/`. |
| `npm run preview` | Serves the build output locally to verify production artifacts. |
| `npm run lint` | Runs ESLint (`@typescript-eslint`) on `src/` to enforce coding standards. |

## API Quick Reference
| Method | Endpoint                | Description |
| ------ | ----------------------- | ----------- |
| POST   | `/api/apply`            | Starts the placeholder auto-apply routine using `JobApplicationRequest` payload (job filters, resume summary/file, preferences). |
| POST   | `/api/resumes`          | Persists a parsed resume to MongoDB and extracts quick keywords for later querying. |
| GET    | `/api/resumes/sample`   | Returns the most recent stored resume, falling back to a mock response for UI testing. |
| POST   | `/api/users`            | Accepts a `UserDto` and echoes it back. |
| GET    | `/api/users/sample`     | Returns a sample user profile. |

`JobApplicationRequest` expects:
```json
{
  "jobTitle": "Software Engineering Intern",
  "jobBoardUrl": "https://www.linkedin.com/jobs",
  "applicationCount": 5,
  "resumeSummary": "Recent CS grad with ...",
  "resumeFileName": "resume.pdf",
  "resumeFileData": "<base64>",
  "preferredCompanies": ["Google", "Stripe"],
  "jobPreference": "full-time",
  "salaryRange": "$70k - $90k",
  "lookingForInternships": false
}
```

## Development Notes
- `JobApplicationServiceImpl` now consults `AiScoringService`, which calls the configurable AI endpoint via Spring WebClient. If the endpoint/key is missing it falls back to keyword-based heuristics so local development still works.
- Spring Mail is wired but `mailSender.send()` is commented out until credentials are ready.
- Authentication is handled with Google OAuth via `@react-oauth/google` (see `HomePage` and `main.tsx`). The resulting credential can be exchanged with your backend if you later enforce token verification.
- `vite.config.ts` proxies `/api` to `http://localhost:8080` during development. If you change backend ports, update the proxy block and restart `npm run dev`.

## Roadmap Ideas
1. Replace placeholder AI calls with a real LLM integration using `easepath.ai.api-key`.
2. Enable real email delivery and add customizable notification templates.
3. Flesh out the dashboard metrics using real backend/AI scoring data.
4. Persist resumes/applications in a storage layer (NoSQL/Firestore/etc.) once data requirements solidify.
