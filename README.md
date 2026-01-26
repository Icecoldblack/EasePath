# EasePath
EasePath is a Full Stack project (React frontend + Spring Boot backend) that helps job seekers track activity and experiment with automated job applications.

## What It Does

- **Dashboard** - Track your job applications, interviews, and success rate
- **Browser Extension** - Auto-fills job application forms on sites like Workday, Greenhouse, Lever
- **Resume Parsing** - Upload your resume to populate your profile automatically
- **AI Scoring** - Gives users a score based on our ATS system that can help with our job search

## Quick Start

### Prerequisites
- Docker Desktop
- Node.js 18+
- Java 21+

### Run with Docker (Recommended)

```bash
# Clone the repo
git clone <repo-url>
cd E_Resume

# Create .env file
echo "RESEND_API_KEY=your_key" >> .env
echo "GOOGLE_CLIENT_ID=your_client_id" >> .env

# Start everything
docker compose up --build
```

**Access:**
- Frontend: http://localhost
- Backend API: http://localhost:8080

### Local Development

See individual READMEs for detailed setup:
- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)

### Extension Setup

1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select `extension/` folder

## Project Structure

```
E_Resume/
├── frontend/          # React + Vite app
├── backend/           # Spring Boot API
├── extension/         # Chrome extension
└── compose.yaml       # Docker orchestration
```

## License

MIT
