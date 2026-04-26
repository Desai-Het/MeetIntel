# Testing Practices

## Current State
The project currently has **no formal automated unit or integration test suite** (no `tests/` directory found in the root). This represents a significant gap in the development workflow.

## Observed Patterns
- **Manual Verification:** Developers likely run the application locally (`python run.py`) and perform manual end-to-end tests through the web interface.
- **Log-based verification:** The `test_output/` directory contains artifacts like `transcript_extractions.jsonl`. These files serve as a form of manual debugging output to verify the quality of AI extractions.
- **Demo Mode:** The presence of hardcoded demo fallback data (`get_demo_fallback_data` in `extraction_service.py`) suggests that UI development and integration testing often occur against static mocks when external APIs are unavailable or during rapid prototyping.
- **Traceability:** There is limited traceability between specific inputs and their corresponding AI outputs beyond what is manually captured in `test_output`.

## Recommended Testing Strategy
1. **Service Unit Tests:** Implement `pytest` suites for `extraction_service` and `summary_service`. Use `unittest.mock` to simulate OpenAI and Gemini API responses.
2. **Route Integration Tests:** Utilize Flask's `test_client` to verify endpoint routing, session handling, and error response codes.
3. **Prompt Evaluation:** Establish a "Golden Set" of transcripts with expected extractions to measure the performance and consistency of prompting logic as models evolve.
4. **Email Service Mocks:** Test the `email_service` by mocking the `smtplib` connection to ensure correct email construction without sending real messages.
5. **UI Testing:** Basic Selenium or Playwright tests could automate the manual flow of uploading a transcript and navigating to the results page.
