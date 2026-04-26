# Technology Stack

## Core Technologies
- **Language:** Python 3.10+ (Recommended based on package requirements)
- **Framework:** Flask 3.1.0 (Modern WSGI Web Framework)
- **Deployment:** Vercel (Serverless Functions)
- **Production Server:** Gunicorn 23.0.0 (Pre-fork worker model)
- **WSGI Interface:** Werkzeug 3.1.3 (WSGI utility library for Flask)

## AI & NLP
- **OpenAI API:** Primary engine for text analysis and summarization (v1.63.2). Used for complex reasoning tasks.
- **Google Generative AI (Gemini):** Used via `google-generativeai` (v0.8.4) as a high-performance LLM backend.
- **langextract:** Direct integration for structured data extraction from conversation transcripts (v1.1.1).

## Utilities & Services
- **SMTP Agent:** Gmail SMTP for reliable delivery of meeting summaries.
- **Environment Management:** `python-dotenv` (v1.0.1) for secure local configuration.
- **HTTP Client:** `requests` (v2.32.3) for interfacing with external REST APIs.
- **Resilience:** `tenacity` used for implementing exponential backoff on flaky API calls.

## Key Files & Configuration
- `requirements.txt`: Manages the strictly versioned dependency graph.
- `.env`: Segregates secrets and environment-specific configs (API keys, SMTP).
- `app/config.py`: Centralizes access to environment variables via a configuration class.
- `vercel.json`: Defines routing and build configuration for the Vercel platform.
- `run.py`: Standard entry point for booting the development server.
- `vercel_app.py`: Shims the Flask app for compatibility with Vercel's serverless environment.
