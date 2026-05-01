# Technology Stack - MeetIntel

## Core Backend
- **Language**: Python 3.10+
- **Framework**: Flask (Application Factory pattern)
- **Environment Management**: `python-dotenv`
- **Concurrency**: `max_workers` in `langextract` for parallel processing

## AI & NLP
- **Extraction Engine**: `langextract` (lx) - A high-level abstraction for LLM-based entity extraction.
- **Models**: 
  - `gemini-1.5-flash-latest` (Production extraction)
  - `gemini-2.5-flash` (Referenced in advanced test scripts)
- **Resilience**: `tenacity` for exponential backoff and retries on API failures.

## Frontend
- **Templating**: Jinja2 (Flask default)
- **UI Framework**: Vanilla HTML/CSS/JS (with some custom visualization from `langextract`)
- **Assets**: Managed in `/static` and `/templates`

## Infrastructure & Deployment
- **Platform**: Vercel (configured via `vercel.json` and `vercel_app.py`)
- **Storage**: Ephemeral (`/tmp` on Vercel, `test_output/` locally)
- **Session**: Flask client-side sessions

## Key Dependencies
- `flask`: Web server
- `langextract`: AI extraction and visualization
- `tenacity`: Retry logic
- `python-dotenv`: Environment variable management
