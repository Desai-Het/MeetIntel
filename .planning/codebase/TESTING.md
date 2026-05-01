# Testing Strategy - MeetIntel

## Current State
The project currently relies on **Manual Verification** and **Experimental Scripts** rather than a formal test suite.

## Verification Methods

### 1. Experimental Runners
- **`basic.py`**: A lightweight script to test `langextract` functionality on small strings.
- **`advance.py`**: A complex runner that processes full literary works (e.g., Romeo & Juliet from Project Gutenberg) to stress-test the extraction logic.

### 2. Manual UAT
- Running `python run.py` and manually uploading transcripts to verify the Flask routes and frontend visualization.
- Verification of JSON payloads via browser dev tools.

### 3. Output Inspection
- Checking `test_output/` for generated `.jsonl` files and `.html` visualizations.

## Identified Gaps
- **Unit Tests**: No `pytest` or `unittest` suite for individual services.
- **Integration Tests**: No automated testing for the end-to-end flow from `/analyze` to `/send-emails`.
- **Mocking**: External APIs (Gemini) are not currently mocked, leading to reliance on the demo fallback during local testing without keys.

## Future Recommendations
1. Implement `pytest` for `app/services/summary_service.py` (logic is deterministic).
2. Create mocks for `langextract` to test `extraction_service.py` without hitting API limits.
3. Add a `conftest.py` to handle Flask app context for route testing.
