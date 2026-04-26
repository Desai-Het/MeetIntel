# Coding Conventions

## Python Style
- **Indentation:** 4 spaces (standard PEP 8).
- **Naming:**
  - Functions/Variables: `snake_case`.
  - Constants: `UPPER_SNAKE_CASE` (e.g., `PROMPT`).
  - Classes: `PascalCase`.
- **Typing:** Use of type hints is present in newer service functions (e.g., `def run_extraction(text: str) -> dict`).

## Patterns & Practices
- **Resilience:** Use of `tenacity` for retrying flaky API calls (OpenAI/Gemini).
- **Fallbacks:** Demo-mode fallback logic for core services (`get_demo_fallback_data`) when APIs fail.
- **Service Separation:** Business logic is isolated from web routes into dedicated service classes/modules.
- **Configuration:** central `app/config.py` using `python-dotenv` for environment variable loading.

## Error Handling
- Routes use `try-except` blocks to return JSON error responses with appropriate HTTP status codes (400 for bad input, 500 for service failures).
- Services use `try-except` to handle specific API failures and provide debug logging.

## AI Prompt Management
- Prompts are stored as large text block constants within the service files.
- Example-based prompting (few-shot) is used for extraction reliability.
