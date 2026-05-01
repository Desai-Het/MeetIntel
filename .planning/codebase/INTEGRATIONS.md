# Integrations - MeetIntel

## 1. Google Gemini API (via `langextract`)
- **Purpose**: Core entity extraction and intelligent meeting analysis.
- **Provider**: Google AI Studio / Vertex AI.
- **Implementation**: Wrapped by the `langextract` library.
- **Models**: `gemini-1.5-flash-latest`, `gemini-2.5-flash`.

## 2. Vercel
- **Purpose**: Production hosting and serverless deployment.
- **Config**: Managed via `vercel.json`.
- **Constraint**: Filesystem is read-only except for `/tmp`. The app accounts for this in `extraction_service.py`.

## 3. Email Service
- **Purpose**: Distributing summaries to meeting participants.
- **Implementation**: Python `smtplib` or similar (resides in `app/services/email_service.py`).
- **Dependencies**: Requires valid SMTP credentials in `.env`.

## 4. Project Gutenberg
- **Purpose**: Source of large-scale test data for advanced extraction testing.
- **Implementation**: Direct HTTP requests in `advance.py`.

## 5. Flask Session
- **Purpose**: Client-side state management for extraction results.
- **Implementation**: Uses signed cookies.
- **Key Data**: `last_extraction`, `speaker_summaries`.
