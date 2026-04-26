# System Architecture

## Design Pattern
The application follows a **Modular Flask Application** structure with an **Application Factory** pattern.

- **Frontend:** Server-side rendered templates using Jinja2 (`templates/`).
- **Backend:** Flask Blueprint-based routing (`app/routes.py`).
- **Service Layer:** Business logic is encapsulated in `app/services/` to keep routes clean.
- **Utility Layer:** Reusable helper functions in `app/utils/`.

## Core Logic Flow
1. **Input:** User provides a transcript via file upload or text area (`/analyze`).
2. **Extraction:** `extraction_service.py` processes the text to identify speakers, action items, and key points.
3. **Summarization:** `summary_service.py` generates participant-specific summaries based on extracted data.
4. **Delivery:** `email_service.py` sends the generated summaries to recipients via SMTP.

## Entry Points
- **Local:** `run.py` (Starts Flask dev server).
- **Production (Vercel):** `vercel_app.py` (Entry point for Vercel functions).
- **Main Blueprint:** Defined in `app/routes.py` and registered in `app/__init__.py`.

## Data Management
- **Session:** Temporary storage of extraction results and summaries (`flask.session`).
- **Export:** `app/utils/exporter.py` handles result formatting (e.g., JSON export).
