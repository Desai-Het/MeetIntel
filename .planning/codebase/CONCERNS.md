# Areas of Concern

## Technical Debt
- **Missing Test Suite:** No automated tests for core logic or endpoints. This makes refactoring risky as there is no safety net for regressions.
- **Minimal Documentation:** Many functions lack docstrings or detailed inline comments, increasing the cognitive load for new developers.
- **Hardcoded File Paths:** Some parts of the code (e.g., `extraction_service.py`) use conditional paths (`/tmp` vs `test_output`) which might vary between environments in unexpected ways. This should be abstracted into the configuration.

## Risks & Security
- **API Key Exposure:** `.env` file contains sensitive keys. While included in `.gitignore`, care must be taken during deployments to ensure these aren't accidentally exposed.
- **Cost & Latency:** Heavy reliance on external LLM APIs (OpenAI, Gemini) introduces external dependency risks, latency overhead, and potential costs that scale with usage.
- **Large Transcripts:** The `max_char_buffer=8000` limit in `extraction_service.py` might truncate long meeting transcripts, leading to significant data loss for long sessions.

## Fragile Areas
- **AI Extraction Consistency:** LLM outputs can be non-deterministic. Changes to prompts or models might break the structure expected by `_parse_extractions`, leading to runtime errors.
- **Email Delivery:** Relies on a single Gmail account and SMTP. This is prone to rate-limiting or authentication failures, especially with Google's changing policies on "less secure apps" and App Passwords.
- **Session Management:** Storing raw extraction data and summaries in `flask.session` might hit cookie size limits (4KB) if the meeting data is large, unless a server-side session backend is configured.
- **Concurrency:** The current extraction flow is synchronous; multiple large requests could block the gunicorn workers if not managed carefully.
