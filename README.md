# ⚖️ AI Assistant for Lawyers

AI-powered assistant designed to help legal professionals process, analyze, and query legal documents and hearing audio. Combines text extraction from PDFs (including scanned ones via OCR), audio transcription with speaker diarization, and language models to deliver context-aware answers about the content.

> **Thesis project** for the Software Analysis and Development program — Instituto CEI (2025–2026).

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white)
![Status](https://img.shields.io/badge/status-in%20development-yellow)

---

## 🎯 Problem it solves

Lawyers handle large volumes of legal documentation (briefs, rulings, judgments) and audio recordings (hearings, interviews, statements). Processing this material manually is slow, repetitive, and error-prone. This assistant automates tasks that normally take hours:

- Extract text from **native and scanned PDFs** (with automatic OCR fallback).
- **Transcribe audio** from hearings or interviews, identifying who is speaking at each moment.
- Allow **natural-language queries** over the processed content using OpenAI models.
- Generate **output PDFs** with summaries, formatted transcripts, or structured answers.

---

## 🛠️ Tech stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — Modern async web framework with automatic OpenAPI docs.
- [Uvicorn](https://www.uvicorn.org/) — Production-grade ASGI server.
- [Pydantic](https://docs.pydantic.dev/) — Data validation and serialization.

**Document processing**
- [PyPDF2](https://pypdf2.readthedocs.io/) — Text extraction from digital PDFs.
- [OCRmyPDF](https://ocrmypdf.readthedocs.io/) — Automatic OCR for scanned PDFs.
- [FPDF](https://pyfpdf.github.io/fpdf2/) — Output PDF generation.

**Audio processing**
- [pyannote.audio](https://github.com/pyannote/pyannote-audio) — Speaker diarization (detect how many speakers there are and when each one is talking).
- [pydub](https://github.com/jiaaro/pydub) — Audio manipulation and format conversion.

**AI / NLP**
- [OpenAI API](https://platform.openai.com/) — Transcription (Whisper) and answer generation (GPT).

**Other**
- `python-multipart` — File uploads in FastAPI endpoints.
- `aiofiles` — Async I/O to keep the event loop unblocked.
- `Pillow` — Image manipulation (OCR preprocessing).

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Client                                                  │
│  (Web frontend / Postman / Swagger UI)                  │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (multipart upload)
                       ▼
┌─────────────────────────────────────────────────────────┐
│  FastAPI                                                 │
│  ─ REST endpoints                                       │
│  ─ Pydantic validation                                  │
│  ─ Async upload handling                                │
└──────────────────────┬──────────────────────────────────┘
                       │
       ┌───────────────┼─────────────────┐
       ▼               ▼                 ▼
  ┌─────────┐    ┌──────────┐    ┌──────────────┐
  │  PDF    │    │  Audio   │    │   Queries    │
  │ ─PyPDF2 │    │ ─pydub   │    │ ─OpenAI GPT  │
  │ ─OCR    │    │ ─Whisper │    │              │
  │         │    │ ─Diariz. │    │              │
  └─────────┘    └──────────┘    └──────────────┘
       │               │                 │
       └───────────────┴─────────────────┘
                       ▼
              ┌─────────────────┐
              │ Output: text /  │
              │ PDF / JSON      │
              └─────────────────┘
```

---

## 🚀 Running it locally

### Requirements
- Python 3.11+
- Tesseract OCR (for `ocrmypdf`):
  - Windows: `choco install tesseract`
  - Linux: `sudo apt install tesseract-ocr`
  - Mac: `brew install tesseract`
- FFmpeg (for `pydub`):
  - Windows: `choco install ffmpeg`
  - Linux: `sudo apt install ffmpeg`
  - Mac: `brew install ffmpeg`

### Setup

```bash
git clone https://github.com/juanp33/PythonTesis.git
cd PythonTesis

# Create virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # Windows
# source .venv/bin/activate     # Linux/Mac

# Install dependencies
pip install -r requirements.txt
```

### Configure environment variables

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=sk-your-api-key-here
HUGGINGFACE_TOKEN=hf_your-token-here   # Required for pyannote.audio
```

> 🔑 Get your OpenAI API key at https://platform.openai.com/api-keys  
> 🔑 Get your HuggingFace token at https://huggingface.co/settings/tokens (free)

### Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

Interactive API docs: http://localhost:8000/docs

---

## 📡 Main endpoints

> *Replace this section with the actual endpoints from your project. This is an example of the expected format:*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/pdf/upload` | Upload a PDF and extract text (with OCR if scanned) |
| `POST` | `/api/audio/transcribe` | Upload audio and get back a transcript with speaker diarization |
| `POST` | `/api/chat/ask` | Ask a natural-language question about the processed documents |
| `GET` | `/api/documents` | List processed documents |

---

## 📁 Project structure

```
PythonTesis/
├── app/                  # FastAPI application code
│   ├── main.py           # Entry point
│   ├── routers/          # REST endpoints grouped by domain
│   ├── services/         # Business logic (PDF, audio, AI)
│   └── models/           # Pydantic models
├── data/
│   └── pdfs/             # Processed PDFs (not committed)
├── pdfs/                 # Sample input PDFs
├── requirements.txt
└── README.md
```

---

## 🧠 Notable technical decisions

### OCR as automatic fallback
PyPDF2 only extracts text from native digital PDFs. When a PDF is a scanned image (common with older legal documents), PyPDF2 returns an empty string. The system detects this case and triggers `ocrmypdf` automatically, keeping the API uniform: the client uploads a PDF and gets text back, without caring which engine was used.

### Combined diarization + transcription
Whisper transcribes but doesn't identify speakers. `pyannote.audio` identifies speakers but doesn't transcribe. Combining the two yields output formatted like:

```
[00:00:12 - 00:00:34] SPEAKER_1: Can you confirm your full name?
[00:00:35 - 00:00:48] SPEAKER_2: Yes, my name is...
```

### Async FastAPI
Uploads and OpenAI calls are I/O-bound operations that benefit from async. FastAPI handles them without blocking the event loop, supporting multiple concurrent uploads with a single process.

---

## 🗺️ Roadmap

- [x] Base setup with FastAPI
- [x] Text extraction from native PDFs
- [x] Automatic OCR for scanned PDFs
- [ ] Audio transcription with Whisper
- [ ] Speaker diarization
- [ ] OpenAI GPT query endpoint
- [ ] PDF report generation
- [ ] Web frontend (next phase)
- [ ] Automated tests
- [ ] Deployment to Railway/Render

---

## 🔒 Privacy and sensitive data

This project handles legal documents that may contain highly sensitive information. Considerations taken:

- Uploaded PDFs and audio files are **not stored permanently** in production.
- OpenAI calls use the direct API (no training on user data, per [OpenAI's terms](https://openai.com/policies/api-data-usage-policies)).
- For real-world deployments, on-premise solutions (local models with [Ollama](https://ollama.com/) or similar) should be evaluated for clients with strict confidentiality requirements.

---

## 👤 Author

**Juan Pintos** — Software Developer, Software Analysis and Development student (Instituto CEI)

- 💼 [LinkedIn](https://www.linkedin.com/in/juan-pintos-bb6b1b20b/)
- 🐙 [GitHub](https://github.com/juanp33)
- 📧 33juanpintos33@gmail.com
- 🌎 Maldonado, Uruguay

---

## 📜 License

Academic project. If you're interested in collaborating or using it as a base for something, reach out — happy to chat.
