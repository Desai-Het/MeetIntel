# Architecture - MeetIntel

## System Overview
MeetIntel is a modular Flask application designed for meeting intelligence. It follows a **Service-Oriented Architecture** pattern where the web layer is decoupled from the business logic.

## Key Layers

### 1. Web Layer (`app/routes.py`)
- **Blueprints**: Uses Flask Blueprints (`main_bp`) for modular routing.
- **Controllers**: Handles request parsing (file uploads or text input), session management, and JSON response formatting.
- **Endpoints**:
  - `/analyze`: Primary entry point for transcript processing.
  - `/summarize`: Generates participant-specific insights.
  - `/send-emails`: Orchestrates the distribution of summaries.

### 2. Service Layer (`app/services/`)
- **Extraction Service**: Interfaces with `langextract` and Gemini to perform structured entity extraction (speakers, topics, decisions). Implements demo fallback logic.
- **Summary Service**: Processes extracted data into human-readable participant summaries.
- **Email Service**: Handles communication with recipients.

### 3. Utility Layer (`app/utils/`)
- Contains helper functions for data transformation and validation.

### 4. Configuration (`app/config.py`)
- Centralized configuration using a `Config` class, loading from environment variables.

## Design Patterns
- **Application Factory**: `create_app()` in `app/__init__.py` allows for flexible configuration and easier testing.
- **Retry Pattern**: Uses `tenacity` decorators to wrap brittle API calls, improving system robustness.
- **Demo Fallback**: Implements a "Graceful Degradation" strategy where hardcoded demo data is returned if the AI service is unavailable.

## Data Flow
1. **Input**: User uploads a transcript via the frontend.
2. **Analysis**: `extraction_service` sends text to Gemini via `langextract`.
3. **Storage**: Results are saved to `/tmp` (as JSONL) and stored in the Flask session.
4. **Visualization**: `langextract.visualize` generates interactive HTML for the results page.
5. **Summarization**: `summary_service` aggregates data for each speaker.
6. **Delivery**: `email_service` sends the final output to participants.
