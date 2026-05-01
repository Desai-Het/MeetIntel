# Concerns & Technical Debt - MeetIntel

## Critical Concerns

### 1. API Rate Limiting & Reliability
- **Issue**: The Gemini API can be brittle or hit rate limits during peak usage.
- **Mitigation**: `tenacity` retries and `get_demo_fallback_data` are implemented, but a more robust queuing system might be needed for high-volume usage.

### 2. State Management
- **Issue**: Relying on Flask sessions for large extraction results can hit cookie size limits (4KB).
- **Debt**: Current implementation filters `visualization_html` out of the session, but very long transcripts could still cause issues. A database (Redis/Postgres) would be a more stable solution.

### 3. Deployment constraints
- **Issue**: Vercel's serverless functions have a 10s timeout on the Hobby tier.
- **Risk**: Large transcripts processed by `langextract` might exceed this limit.

## Technical Debt

### 1. Test Coverage
- **Debt**: Zero formal unit or integration tests.
- **Impact**: High risk of regressions during refactoring.

### 2. File I/O
- **Debt**: Hardcoded `/tmp` and `test_output` paths.
- **Impact**: Makes the code less portable across different environments without manual configuration.

### 3. Security
- **Debt**: `app.secret_key` is loaded from config, but there's no clear rotation strategy or CSRF protection on the `/send-emails` endpoint beyond standard session checks.

### 4. Code Duplication
- **Debt**: `advance.py` and `basic.py` contain duplicate prompt logic that differs slightly from `extraction_service.py`.
- **Impact**: Divergence in behavior between development/testing and production.
