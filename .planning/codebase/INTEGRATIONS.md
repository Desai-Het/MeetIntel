# External Integrations

## AI Providers
### OpenAI
- **Purpose:** Transcription analysis and summarization.
- **Config:** `OPENAI_API_KEY` in `.env`.
- **Usage:** Handled in `app/services/extraction_service.py` and `app/services/summary_service.py`.

### Google Gemini / LangExtract
- **Purpose:** Meeting data extraction and potentially fallback/alternative analysis.
- **Config:** `LANGEXTRACT_API_KEY` (Google API Key format) in `.env`.
- **Usage:** Integration point for specialized extraction logic.

## Communication Services
### Gmail SMTP
- **Purpose:** Sending meeting summaries to participants.
- **Host:** `smtp.gmail.com` (Port 587).
- **Auth:** `EMAIL_USER` and `EMAIL_PASSWORD` (App Password) in `.env`.
- **Implementation:** `app/services/email_service.py`.

## Cloud Platforms
### Vercel
- **Purpose:** Hosting and deployment.
- **Config:** `vercel.json` and `vercel_app.py`.
- **Features:** Serverless functions for Flask routes.
