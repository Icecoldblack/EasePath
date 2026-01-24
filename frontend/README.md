# EasePath Frontend

React + TypeScript web app with Vite bundler.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3 | UI Framework |
| TypeScript | 5.4 | Type Safety |
| Vite | 5.4 | Build Tool |
| Tailwind CSS | 4.1 | Styling |
| React Router | 6.26 | Routing |

## Dependencies

### Core
- `react` / `react-dom` - UI framework
- `react-router-dom` - Client-side routing
- `axios` - HTTP client
- `@react-oauth/google` - Google OAuth login
- `jwt-decode` - JWT parsing

### Styling & Animation
- `tailwindcss` - Utility-first CSS
- `gsap` / `@gsap/react` - Animations
- `motion` (Framer Motion) - React animations
- `ogl` - WebGL graphics

### Utilities
- `jspdf` - PDF generation

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Create `.env` file:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Run Development Server

```bash
npm run dev
```

App runs at: http://localhost:5173

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Build for Production

```bash
npm run build
```

Output goes to `dist/` folder.
