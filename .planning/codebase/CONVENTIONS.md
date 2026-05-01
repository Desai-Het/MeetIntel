# Coding Conventions - MeetIntel

## General Principles
- **Modularity**: Business logic must reside in `app/services/`, not in routes.
- **Resilience**: All external API calls (especially Gemini) must use `tenacity` for retries.
- **Graceful Degradation**: Always provide a fallback (like `get_demo_fallback_data`) for core features.

## Python Style
- **Naming**: `snake_case` for functions/variables, `PascalCase` for classes.
- **Type Hinting**: Use type hints for service function signatures (e.g., `text: str -> dict`).
- **Docstrings**: While sparse in the current state, future code should prioritize Google-style docstrings.

## Web & API
- **Responses**: Always return JSON with a `success: boolean` flag and appropriate data/error keys.
- **Status Codes**:
  - `200 OK`: Successful operation.
  - `400 Bad Request`: Validation errors or missing input.
  - `500 Internal Server Error`: Unhandled exceptions or API failures.
- **Routing**: Use Flask Blueprints to group related functionality.

## AI Extraction
- **Prompting**: Use `textwrap.dedent` for multi-line prompts to maintain readability.
- **Examples**: Always provide `ExampleData` to `langextract` to ensure high accuracy.
- **Consistency**: Use exact text from inputs for extraction to avoid hallucination.

## Development Workflow
- **GSD Integration**: Use `gsd-` commands for planning and executing changes.
- **Planning First**: Update `.planning/` before significant architectural changes.
- **Ephemeral Data**: Use `/tmp` or `test_output/` for temporary files to ensure compatibility with serverless environments (Vercel).
