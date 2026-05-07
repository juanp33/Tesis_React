# ⚖️ AI Assistant for Lawyers — Frontend

React + TypeScript web client for the [AI Assistant for Lawyers](https://github.com/juanp33/PythonTesis) project. Provides the user interface for uploading legal documents and audio recordings, running AI-powered queries against them, and exporting results as Word or PDF files.

> **Companion frontend** to the [`PythonTesis`](https://github.com/juanp33/PythonTesis) FastAPI backend. Thesis project — Instituto CEI (2025–2026).

![React](https://img.shields.io/badge/React-19-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?style=flat&logo=vite&logoColor=white)
![Status](https://img.shields.io/badge/status-in%20development-yellow)

---

## 🎯 What it does

The frontend lets legal professionals interact with the AI assistant through a clean web UI:

- **Authenticated access** with JWT-based login.
- **Upload PDFs** (digital or scanned) and trigger backend processing with OCR fallback.
- **Upload audio files** for transcription and speaker diarization.
- **Ask natural-language questions** about the processed documents using OpenAI models.
- **Export results** as `.docx` or `.pdf` files generated client-side, ready to share with colleagues.
- **Multiple views/routes**: separate sections for documents, audio, queries, and exports.

---

## 🛠️ Tech stack

**Core**
- [React 19](https://react.dev/) — UI library.
- [TypeScript 5.8](https://www.typescriptlang.org/) — Static typing across the codebase.
- [Vite 6](https://vitejs.dev/) — Build tool with instant HMR.

**Routing & data**
- [react-router-dom 7](https://reactrouter.com/) — Client-side routing.
- [Axios](https://axios-http.com/) — HTTP client for the backend API.
- [jwt-decode](https://github.com/auth0/jwt-decode) — JWT parsing for auth state.

**Document export (client-side)**
- [docx](https://docx.js.org/) — Generate `.docx` files entirely in the browser.
- [jsPDF](https://github.com/parallax/jsPDF) — Generate `.pdf` files in the browser.

**Tooling**
- ESLint with `typescript-eslint` and `react-hooks` plugins for code quality.

---

## 🏗️ How it connects to the backend

```
┌─────────────────────────────┐         ┌─────────────────────────────┐
│  Tesis_React (this repo)    │  HTTP   │  PythonTesis (backend)      │
│  React + TypeScript + Vite  │ ──────► │  FastAPI + OpenAI + OCR     │
│                             │  JSON   │                             │
│  - Login form               │ ◄────── │  - JWT auth                 │
│  - PDF/audio upload UI      │         │  - PDF/audio processing     │
│  - Query interface          │         │  - GPT integration          │
│  - .docx / .pdf export      │         │                             │
└─────────────────────────────┘         └─────────────────────────────┘
```

The backend handles all heavy processing (OCR, transcription, AI calls). The frontend handles UX, auth state, and client-side document generation — keeping the user's exported files private (they never leave their browser when generated locally).

---

## 🚀 Running locally

### Requirements
- Node.js 20+
- The [backend](https://github.com/juanp33/PythonTesis) running locally on `http://localhost:8000` (or update the API URL via `.env`).

### Setup

```bash
git clone https://github.com/juanp33/Tesis_React.git
cd Tesis_React

# Install dependencies
npm install

# Create env file
echo "VITE_API_URL=http://localhost:8000" > .env

# Run dev server
npm run dev
```

Open http://localhost:5173

### Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and bundle for production |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint over the codebase |

---

## 📁 Project structure

```
Tesis_React/
├── public/               # Static assets (favicon, etc.)
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route-level views
│   ├── services/         # API clients (axios)
│   ├── hooks/            # Custom React hooks (auth, fetching)
│   ├── utils/            # Helpers (JWT, file export, formatting)
│   ├── App.tsx           # Root component + routing
│   └── main.tsx          # Vite entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🧠 Notable technical decisions

### Client-side document export
Generating `.docx` and `.pdf` files directly in the browser (via `docx` and `jsPDF`) instead of asking the backend to do it has a key benefit for legal contexts: **the formatted exports never leave the user's machine**. Sensitive content stays local.

### JWT auth with `jwt-decode`
The login flow stores the JWT and uses `jwt-decode` to read the expiration claim client-side. This avoids making a request to validate the token on every page render — instead, expired tokens trigger an automatic logout and redirect to login.

### Strict TypeScript
The project uses `strict` mode and `noUnusedLocals`/`noUnusedParameters` to catch issues at compile time. Combined with `typescript-eslint`, it pushes the codebase toward fewer runtime surprises.

### Vite over CRA
Vite was chosen over Create React App for instant HMR (changes show up in <100ms) and significantly faster production builds. CRA is also officially deprecated as of 2025.

---

## 🗺️ Roadmap

- [x] Login screen with JWT auth
- [x] PDF upload UI and processing flow
- [x] Audio upload UI
- [ ] Audio transcription view with diarization
- [ ] Query interface (natural-language Q&A)
- [ ] `.docx` / `.pdf` client-side export
- [ ] User document history view
- [ ] Responsive design polish
- [ ] Deployment to Vercel/Netlify

---

## 🔗 Related

- 🔧 **Backend**: [juanp33/PythonTesis](https://github.com/juanp33/PythonTesis) — FastAPI server, OCR, audio processing, and OpenAI integration.

---

## 👤 Author

**Juan Pintos** — Software Developer, Software Analysis and Development student (Instituto CEI)

- 💼 [LinkedIn](https://www.linkedin.com/in/juan-pintos-bb6b1b20b/)
- 🐙 [GitHub](https://github.com/juanp33)
- 📧 33juanpintos33@gmail.com
- 🌎 Maldonado, Uruguay

---

## 📜 License

Academic project. Reach out if you'd like to collaborate.
